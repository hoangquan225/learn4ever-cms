import { ClockCircleOutlined, UploadOutlined } from "@ant-design/icons"
import { unwrapResult } from "@reduxjs/toolkit"
import { notification, Radio, Typography, UploadProps } from 'antd'
import { Button, Col, Form, Input, message, Row, Select, Upload } from "antd"
import { useForm } from "antd/es/form/Form"
import classNames from "classnames/bind"
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { apiUploadMultipleVideo } from "../../api/uploadApi"
import TinymceEditor from "../../components/TinymceEditor"
import { useAppDispatch, useAppSelector } from "../../redux/hook"
import { STATUSES } from "../../utils/contraint"
import styles from "./courseDetail.module.scss"
import { requestLoadTopicById, requestUpdateTopic, topicState } from "./topicSlice"

const cx = classNames.bind(styles);

export const LessonCourse = () => {
    const dispatch = useAppDispatch();
    const descRef = useRef<any>();
    const [form] = useForm();
    const topicStates = useAppSelector(topicState);
    const isTopicParent = !topicStates.dataTopic?.parentId
    // const [progress, setProgress] = useState(0);
    const [isUploadVideo, setIsUploadVideo] = useState<number>(1)
    const [urlVideo, setUrlVideo] = useState<string>('')
    const [urlVideoUpload, setUrlVideoUpload] = useState<string>('')
    const [keyUpload, setKeyUpload] = useState<number>(Math.random())

    useEffect(() => {
        setIsUploadVideo(1)
        setKeyUpload(Math.random())
        if (topicStates.dataTopic) {
            form.setFieldsValue({
                name: topicStates.dataTopic?.name,
                status: topicStates.dataTopic?.status,
                timeExam: topicStates.dataTopic?.timeExam
            })
            console.log(topicStates.dataTopic?.video || '');

            setUrlVideo(topicStates.dataTopic?.video || '')
            setUrlVideoUpload(topicStates.dataTopic?.video || '')
        }
    }, [topicStates.dataTopic])

    const props: UploadProps = {
        name: 'files',
        customRequest: async (options) => {
            const { onSuccess = () => { }, onError = () => { }, onProgress, file } = options;
            try {
                const res = await apiUploadMultipleVideo(file)
                console.log({ res });
                const data = res.data[0]
                setUrlVideoUpload(data?.url)
                setUrlVideo(data?.url)
                form.setFieldValue('timeExam', Math.floor(data?.duration))
                onSuccess("oke")
            } catch (error: any) {
                onError(error);
            }

        },
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            console.log({ info });

            if (info.file.status !== 'uploading') {
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        beforeUpload: (file) => {
            console.log({ file });

            const isMp4 = file.type === "video/mp4" || file.type === "video/ogg";
            if (!isMp4) {
                message.error("You can only upload MP4/OGG file!");
            }
            const isLt100M = file.size / 1024 / 1024 < 100; // 100MB
            if (!isLt100M) {
                message.error("Image must smaller than 100MB!");
            }

            if (isMp4 && isLt100M) {
                return true;
            } else {
                return false;
            }
        },
        accept: "video/*",
    };

    const handleRemoveVideo = () => {
        setUrlVideo('')
        setUrlVideoUpload('')
        form.setFieldValue('timeExam', 0)
    }

    const handleUpdateOrCreateTopic = async (value: any) => {
        // console.log({
        //     ...topicStates.dataTopic,
        //     ...value,
        //     des: descRef?.current?.getContent(),
        //     video: urlVideo,
        //     updateDate: moment().valueOf()
        // });

        const video = isUploadVideo === 1 ? urlVideoUpload : urlVideo

        if(!video) {
            message.error('vui lòng upload video')
            return 
        }

        try {
            const actionResult = await dispatch(requestUpdateTopic({
                ...topicStates.dataTopic,
                ...value,
                des: descRef?.current?.getContent(),
                video,
                updateDate: moment().valueOf()
            }))
            const data = unwrapResult(actionResult);
            console.log(data);
            
            message.success('cập nhật thành công')
            data?.status === 0 && dispatch(requestLoadTopicById({id : data?.data?.id}))
        } catch (error) {
            notification.error({
                message: "không tải được danh sach danh mục",
            });
        }

    }

    return (
        <div>
            <Typography.Title level={4}>Sửa bài học {topicStates.dataTopic?.name}</Typography.Title>
            <Form
                layout="vertical"
                name="register"
                form={form}
                onFinish={handleUpdateOrCreateTopic}
            >
                <Row gutter={{ xl: 48, md: 16, xs: 0 }}>
                    <Col xl={8} md={8} xs={24}>
                        <Form.Item
                            name="name"
                            label="Tên bài"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập trường này!",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="status" label="Trạng thái">
                            <Select options={STATUSES} />
                        </Form.Item>

                        {/* <Form.Item
                        name="video"
                        label="Link bài giảng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập trường này!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item> */}

                        {
                            !isTopicParent && (
                                <Form.Item
                                    name="timeExam"
                                    label="Độ dài Video (s)"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập trường này!",
                                        },
                                    ]}

                                >
                                    <Input disabled suffix={<ClockCircleOutlined />} />
                                </Form.Item>
                            )
                        }
                    </Col>

                    <Col
                        xl={16}
                        md={16}
                        xs={24}
                        style={{ borderRight: "0.1px solid #ccc" }}
                    >
                        {/* <Form.Item label="Mô tả ngắn">
                            <TinymceEditor
                                id="descriptionShortTopic"
                                key="descriptionShortTopic"
                                // editorRef={descRef}
                                // value={valueEdit?.des ?? ""}
                                heightEditor="250px"
                            />
                        </Form.Item> */}

                        <Form.Item label="Mô tả">
                            <TinymceEditor
                                id="descriptionTopic"
                                key="descriptionTopic"
                                editorRef={descRef}
                                value={topicStates.dataTopic?.des ?? ""}
                                heightEditor="250px"
                            />
                        </Form.Item>

                        {
                            !isTopicParent && (
                                <div>
                                    <div className={cx('video_study')}>
                                        <p className={cx("require")}>*</p>
                                        Video bài giảng
                                    </div>
                                    <Radio.Group onChange={(e) => {
                                        setIsUploadVideo(e.target.value)
                                    }} value={isUploadVideo}
                                        style={{
                                            marginBottom: 10
                                        }}
                                    >
                                        <Radio value={1}>tải video lên</Radio>
                                        <Radio value={2}>đường dẫn</Radio>
                                    </Radio.Group>
                                    <div>
                                        {
                                            isUploadVideo === 1 && (
                                                <div>
                                                    <Upload {...props} key={keyUpload}>
                                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                                    </Upload>
                                                    {
                                                        urlVideoUpload && (
                                                            <div>
                                                                <video width="340" height="250" controls style={{ margin: '10px 10px 0 0', borderRadius: '4px' }} key={keyUpload}>
                                                                    <source src={urlVideoUpload} />
                                                                    Trình duyệt của bạn không hỗ trợ video này
                                                                </video>
                                                                <div style={{ cursor: 'pointer', color: 'red' }} onClick={handleRemoveVideo}>Xóa video</div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
                                        {
                                            isUploadVideo === 2 && (
                                                <Input
                                                    onChange={(e) => {
                                                        setUrlVideo(e.target.value)
                                                    }}
                                                    value={urlVideo}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </Col>
                </Row>
                <div style={{
                    textAlign: 'right'
                }}>
                    <Button danger>HỦY</Button>
                    <Button type="primary" style={{ marginLeft: 10 }} htmlType="submit">LƯU</Button>
                </div>
            </Form>
        </div>
    )
}