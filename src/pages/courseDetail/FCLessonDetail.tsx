import { ClockCircleOutlined, DeleteOutlined, EditOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons"
import { unwrapResult } from "@reduxjs/toolkit"
import { Collapse, Modal, notification, Popconfirm, Radio, Space, Switch, Tooltip, Typography, UploadFile, UploadProps } from 'antd'
import { Button, Col, Form, Input, message, Row, Select, Upload } from "antd"
import { useForm } from "antd/es/form/Form"
import classNames from "classnames/bind"
import moment from "moment"
import { memo, useEffect, useRef, useState } from "react"
import { apiUploadMultipleVideo } from "../../api/uploadApi"
import ModalCreateAndUpdateQuestion from "../../components/ModalCreateAndUpdateQuestion"
import TinymceEditor from "../../components/TinymceEditor"
import { useAppDispatch, useAppSelector } from "../../redux/hook"
import { questionState, requestLoadQuestionsByIdTopic, setQuestionInfo, setQuestions } from "../../redux/question"
import TTCSconfig from "../../submodule/common/config"
import { Question } from "../../submodule/models/question"
import { answers } from "../../submodule/utils/contants"
import { STATUSES } from "../../utils/contraint"
import { courseState } from "../courses/courseSlice"
import styles from "./courseDetail.module.scss"
import { requestLoadTopicById, requestUpdateTopic, topicState } from "./topicSlice"
import { FaSync } from "react-icons/fa"
import { Topic } from "../../submodule/models/topic"
import { apiDeleteQuestion, createQuestionByExcel } from "../../api/question"
import readXlsxFile from "read-excel-file";

const cx = classNames.bind(styles);

const labelColapseLesson = { 
    [TTCSconfig.TYPE_TOPIC_VIDEO]: "Thông tin bài học", 
    [TTCSconfig.TYPE_TOPIC_PRATICE]: "Thông tin bài tập", 
    [TTCSconfig.TYPE_TOPIC_DOCUMENT]: "Thông tin tài liệu",
    [TTCSconfig.TYPE_TOPIC_EXAM]: "Thông tin đề kiểm tra",
}

export const LessonCourse = memo((prop: {
    onloadTopic?: (idCourse: string, type: number, parentId?: string) => Promise<void>,
    type?: number,
    setIndexActiveDataChild?: React.Dispatch<React.SetStateAction<string | undefined>>
    setIndexActive?: React.Dispatch<React.SetStateAction<number | undefined>>
}) => {
    const { onloadTopic = () => { }, type = 0, setIndexActiveDataChild = () => { }, setIndexActive = () => { } } = prop
    const dispatch = useAppDispatch();
    const descRef = useRef<any>();
    const refVideo = useRef<any>();
    const [form] = useForm();
    const topicStates = useAppSelector(topicState);
    const courseStates = useAppSelector(courseState);
    const questionStates = useAppSelector(questionState)

    // const [progress, setProgress] = useState(0);
    const isTopicParent = !topicStates.dataTopic?.parentId
    const [isUploadVideo, setIsUploadVideo] = useState<number>(1)
    const [urlVideo, setUrlVideo] = useState<string>('')
    const [urlVideoUpload, setUrlVideoUpload] = useState<string>('')
    const [keyUpload, setKeyUpload] = useState<number>(Math.random())
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const topicType = topicStates.dataTopic?.topicType
    const [listQuestionInsert, setListQuestionInsert] = useState<any>()
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // config exam in video 
    const [isPraticeInVideo, setIsPraticeInVideo] = useState<boolean>(false)

    // time practive in video 
    const [timePratice, setTimePratice] = useState<number>(0);

    useEffect(() => {
        setIsUploadVideo(1)
        setKeyUpload(Math.random())
        if (topicStates.dataTopic) {
            form.setFieldsValue({
                name: topicStates.dataTopic?.name,
                status: topicStates.dataTopic?.status,
                timeExam: topicStates.dataTopic?.timeExam,
                numQuestion: topicStates.dataTopic?.numQuestion,
            })
            setUrlVideo(topicStates.dataTopic?.video || '')
            setUrlVideoUpload(topicStates.dataTopic?.video || '')
        }
        if (topicStates.dataTopic?.id && topicType === TTCSconfig.TYPE_TOPIC_PRATICE || topicStates.dataTopic?.type === TTCSconfig.TYPE_EXAM) {
            if(topicStates.dataTopic?.id) {
                handleLoadQuestionByIdtopic(topicStates.dataTopic?.id || '', TTCSconfig.STATUS_PUBLIC)
            }
        } else if (topicStates.dataTopic?.id && topicType === TTCSconfig.TYPE_TOPIC_VIDEO) {
            // video 
            if (topicStates.dataTopic.timePracticeInVideo?.length) {
                setIsPraticeInVideo(true)
                setTimePratice(topicStates.dataTopic.timePracticeInVideo[0].time)
                dispatch(setQuestions(topicStates.dataTopic.timePracticeInVideo[0].questionData))
            } else {
                setIsPraticeInVideo(false)
                setTimePratice(0)
                dispatch(setQuestions([]))
            }
        } else {
            dispatch(setQuestions([]))
        }
    }, [topicStates.dataTopic])

    const props: UploadProps = {
        name: 'files',
        customRequest: async (options) => {
            const { onSuccess = () => { }, onError = () => { }, onProgress, file } = options;
            try {
                const res = await apiUploadMultipleVideo(file)
                const data = res.data[0]
                setUrlVideoUpload(data?.url)
                setUrlVideo(data?.url)
                form.setFieldValue('timeExam', Math.floor(data?.duration))
                onSuccess(data?.url)
            } catch (error: any) {
                onError(error);
            }

        },
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        beforeUpload: (file) => {
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
        const video = isUploadVideo === 1 ? urlVideoUpload : urlVideo

        if (!video && topicType === TTCSconfig.TYPE_TOPIC_VIDEO) {
            message.error('vui lòng upload video')
            return
        }

        try {
            const actionResult = await dispatch(requestUpdateTopic({
                ...topicStates.dataTopic,
                ...value,
                des: descRef?.current?.getContent(),
                video,
                timePracticeInVideo: topicStates.dataTopic?.timePracticeInVideo?.length ? [{
                    ...topicStates.dataTopic?.timePracticeInVideo[0],
                    time: timePratice 
                }] : [],
                updateDate: moment().valueOf()
            }))
            const data = unwrapResult(actionResult);
            onloadTopic(courseStates.courseInfo?.id || '', type)
            setIndexActiveDataChild(prev => {
                return `${prev}:${data?.data?.index - 1}`
            })
            setIndexActive(data?.data?.index - 1)
            message.success('cập nhật thành công')
            data?.status === 0 && dispatch(requestLoadTopicById({ id: data?.data?.id }))
        } catch (error) {
            notification.error({
                message: "không tải được danh sach danh mục",
            });
        }
    }

    const handleUpdatePraticeForTopic = async (question: Question) => {
        let timePracticeInVideo: {
            time?: number;
            totalQuestion?: number;
            idQuestion?: string[];
        } = {}

        if(!isEdit) {
            timePracticeInVideo = {
                time: timePratice,
                totalQuestion: topicStates.dataTopic?.timePracticeInVideo?.length ? topicStates.dataTopic?.timePracticeInVideo[0]?.totalQuestion + 1 : 1,
                idQuestion: topicStates.dataTopic?.timePracticeInVideo?.length ? [question.id || '', ...topicStates.dataTopic?.timePracticeInVideo[0]?.idQuestion] : [question.id || '']
            }
        } else {
            timePracticeInVideo = topicStates.dataTopic?.timePracticeInVideo?.[0] || {};
        }

        try {
            const actionResult = await dispatch(requestUpdateTopic(new Topic({
                ...topicStates.dataTopic,
                timePracticeInVideo: [timePracticeInVideo],
                updateDate: moment().valueOf()
            })))
            const data = unwrapResult(actionResult);
            handleClickTopicChild(topicStates.dataTopic?.id || '')
            // onloadTopic(courseStates.courseInfo?.id || '', type)
            // dispatch(setQuestions(data.data.topicStates.dataTopic.timePracticeInVideo[0].questionData))
        } catch (error) {
            console.log(error);
        }
    }

    const handleClickTopicChild = async (id: string) => {
        try {
            const requestResult = await dispatch(requestLoadTopicById({ id }))
            unwrapResult(requestResult)
        } catch (error) {
            message.error('không load được, lỗi server')
        }
    }

    const handleLoadQuestionByIdtopic = async (idTopic: string, status: number) => {
        try {
            const res = await dispatch(requestLoadQuestionsByIdTopic({
                idTopic,
                status
            }))
            unwrapResult(res)
        } catch (error) {
            notification.error({
                message: 'server error!!',
                duration: 1.5
            })
        }
    }

    const handleChangeCollapse = async (key: string | string[]) => {

    };

    const handleDeleteQuetions = async (id: string) => {
        try {
            const res = await apiDeleteQuestion({ id })
            handleLoadQuestionByIdtopic(topicStates.dataTopic?.id || '', TTCSconfig.STATUS_PUBLIC)
        } catch (error) {
            notification.error({
                message: 'server error!!',
                duration: 1.5
            })
        }
    };

    const handleAsyncTime = () => {
        setTimePratice(Math.floor(refVideo.current.currentTime))
    }

    const itemQuestionView = (props: { question: Question }) => {
        const { question } = props
        return (
            <div>
                <div className={cx('question_number')}>
                    Câu hỏi {question.index}
                    <Button
                        className={cx('question_action')}
                        icon={<EditOutlined color="#52c41a" />}
                        onClick={() => {
                            dispatch(setQuestionInfo(question))
                            setIsOpen(true)
                            setIsEdit(true)
                        }}
                    />
                    <Popconfirm
                        placement="top"
                        title="Bạn có chắc bạn muốn xóa câu hỏi này không?"
                        onConfirm={() => {
                            handleDeleteQuetions(question.id || "");
                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip placement="top" title="Xóa">
                            <Button icon={<DeleteOutlined color="#52c41a" />} />
                        </Tooltip>
                    </Popconfirm>
                </div>
                <div style={{ fontWeight: 500 }}>Đề bài :</div>
                <div style={{ fontSize: "16px", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: question.question }} />
                <div className={cx('question_answers')}>
                    {
                        question.answer.map(item => {
                            return (
                                <p style={{
                                    color: item.isResult ? 'red' : ''
                                }}>{answers[item.index]}.{" "}
                                    <div className={cx('text_answer')} dangerouslySetInnerHTML={{ __html: item.text }} />
                                </p>
                            )
                        })
                    }
                </div>
                <p style={{
                    color: !question.hint ? 'rgb(250, 173, 20)' : ''
                }}>giải thích :
                    {question.hint ? <div dangerouslySetInnerHTML={{ __html: question.hint }} /> : ' chưa cập nhật'}
                </p>
            </div>
        )
    }

    const renderInfoTopic = () => {
        return (
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
                            !isTopicParent && topicType !== TTCSconfig.TYPE_TOPIC_DOCUMENT && (
                                <Form.Item
                                    name="timeExam"
                                    label={topicType === TTCSconfig.TYPE_TOPIC_VIDEO ? "Độ dài Video (s)" : "Thời gian làm bài (p)"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập trường này!",
                                        },
                                    ]}

                                >
                                    <Input disabled={topicType === TTCSconfig.TYPE_TOPIC_VIDEO} suffix={<ClockCircleOutlined />} />
                                </Form.Item>
                            )
                        }

                        {
                            !isTopicParent && topicType === TTCSconfig.TYPE_TOPIC_EXAM && (
                                <Form.Item
                                    name="numQuestion"
                                    label={"Số câu hỏi"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập trường này!",
                                        },
                                    ]}

                                >
                                    <Input />
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
                                key={keyUpload}
                                editorRef={descRef}
                                value={topicStates.dataTopic?.des ?? ""}
                                heightEditor={topicType === TTCSconfig.TYPE_TOPIC_DOCUMENT ? "500px" : "250px"}
                            />
                        </Form.Item>

                        {
                            !isTopicParent && topicType === TTCSconfig.TYPE_TOPIC_VIDEO && (
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
                                                                <video ref={refVideo} width="340" height="250" controls style={{ margin: '10px 10px 0 0', borderRadius: '4px' }} key={keyUpload}>
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
                                    {
                                        topicStates.dataTopic?.id && (
                                            <>
                                                <div style={{
                                                    marginTop: 10
                                                }}>Có bài tập khi xem video : </div>
                                                <Switch checked={!!isPraticeInVideo} onChange={(checked: boolean) => {
                                                    setIsPraticeInVideo(checked)
                                                }} />
                                            </>
                                        )
                                    }
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
        )
    }

    const handleConvertFileUpload = (file: any) => {
        readXlsxFile(file)
            .then((rows) => {
                const questions = convertToObjectArray(rows);
                setListQuestionInsert(questions);
                console.log({questions});
            })
            .catch((error) => {
                console.error('Lỗi khi đọc tệp Excel:', error);
            });
    };

    const convertToObjectArray = (array: any) => {
        const headers = array[0]; 
        const data = array.slice(1);
        const objectArray = data.map((row) => {
          const obj = {};
          obj["question"] = row[0];
          obj["hint"] = row[1]; 
          obj["answer"] = [];
          for (let i = 2; i < row.length; i++) {
            if (row[i] !== null) {
              obj["answer"].push({ [`answer${i - 2}`]: row[i].toString()});
            }
          }
          return obj;
        });
        return objectArray;
      };

    const handleRemoveFileExcel = (file: any) => {
        const newFileList = fileList.filter(f => f.uid !== file.uid);
        setFileList(newFileList);
        setListQuestionInsert([]);
    }

    const uploadManyQuestion = async (isDelete: boolean) => {
        try {
            const res = await createQuestionByExcel({ questions: listQuestionInsert, idTopic: topicStates.dataTopic?.id || '', isDelete});
            console.log(res);
            if (res.data.status === TTCSconfig.STATUS_SUCCESS) {
                notification.success({
                message: "Upload thành công",
                duration: 1.5,
                });
                handleLoadQuestionByIdtopic(topicStates.dataTopic?.id || '', TTCSconfig.STATUS_PUBLIC)
                setListQuestionInsert([]); 
                setFileList([]); 
            } else {
                notification.success({
                message: "Upload thất bại",
                duration: 1.5,
                });
            }
        } catch (error) {
          console.log(error);
        }
    }

    return (
        <div>
            <Typography.Title level={4}>
                {
                    topicStates.dataTopic?.id
                        ? (topicType === TTCSconfig.TYPE_TOPIC_VIDEO
                            ? 'Sửa bài học'
                            : (topicType === TTCSconfig.TYPE_TOPIC_PRATICE ? 'Sửa bài tập' : 'Sửa tài liệu'))
                        : (topicType === TTCSconfig.TYPE_TOPIC_VIDEO
                            ? 'Tạo bài học'
                            : (topicType === TTCSconfig.TYPE_TOPIC_PRATICE ? 'Tạo bài tập' : 'Tạo tài liệu'))
                }
                {` ${topicStates.dataTopic?.name}`}
            </Typography.Title>
            {
                topicType === TTCSconfig.TYPE_TOPIC_PRATICE || topicType === TTCSconfig.TYPE_TOPIC_VIDEO || topicStates.dataTopic?.type === TTCSconfig.TYPE_EXAM ? (
                    <>
                        <Collapse defaultActiveKey={topicType === TTCSconfig.TYPE_TOPIC_VIDEO ? ['1'] : ['2']} onChange={handleChangeCollapse}>
                            <Collapse.Panel header=
                                {topicType && labelColapseLesson[topicType]} key="1">
                                {renderInfoTopic()}
                            </Collapse.Panel>
                            {topicStates.dataTopic?.id && (topicType === TTCSconfig.TYPE_TOPIC_PRATICE || isPraticeInVideo || (!isTopicParent && topicStates.dataTopic?.type === TTCSconfig.TYPE_EXAM)) && (
                                <Collapse.Panel header="Danh sách câu hỏi" key="2">
                                    <Typography.Title level={5} style={{ margin: 0, marginBottom: 10, borderBottom: '1px solid' }}>Danh sách câu hỏi</Typography.Title>
                                    <Button type="primary" onClick={() => {
                                        setIsEdit(false)
                                        setIsOpen(true)
                                        dispatch(setQuestionInfo(null))
                                    }}
                                        style={{
                                            marginBottom: 10
                                        }}
                                    >Tạo câu hỏi</Button>
                                    <Space style={{
                                            margin: "0 16px"
                                        }}>
                                        <Upload
                                            customRequest={async (options) => {
                                                const { onSuccess = () => {}, onError = () => {}, file } = options;
                                                try {
                                                    // const res = await apiUploadExcel(file)
                                                    // onError(res.data);
                                                    handleConvertFileUpload(file)
                                                    onSuccess("ok");
                                                } catch (error:any) {
                                                    onError(error);
                                                }
                                            }}
                                            fileList={fileList}
                                            maxCount={1}
                                            beforeUpload={(file) => {
                                                const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                                if (!isExcel) {
                                                message.error("You can only upload Excel file (xlsx)!");
                                                }
                                                const isLt2M = file.size / 1024 / 1024 < 2;
                                                if (!isLt2M) {
                                                    message.error("File must smaller than 2MB!");
                                                }
                                                setFileList([file]);
                                                if (isExcel && isLt2M) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            }}
                                            // showUploadList={false}
                                            accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                            onRemove={handleRemoveFileExcel} 
                                        >
                                            <Button type="primary" icon={<UploadOutlined />}>Upload questions using Excel</Button>
                                        </Upload>
                                    </Space>

                                    {listQuestionInsert?.length > 0 && <Popconfirm
                                        placement="top"
                                        title="Bạn muốn xóa câu hỏi cũ không?"
                                        okText="Có"
                                        cancelText="Không"
                                        onCancel={() => uploadManyQuestion(false)}
                                        onConfirm={() => uploadManyQuestion(true)}
                                    >
                                        <Button type="primary" >Upload Question</Button>
                                    </Popconfirm>}
                                    
                                    {
                                        topicType === TTCSconfig.TYPE_TOPIC_VIDEO && (
                                            <Space direction="horizontal">
                                                <label htmlFor="timePractice">Tại thời điểm (s)</label>
                                                <input id="timePractice" value={timePratice} onChange={(e) => {
                                                    if (Number(e.target.value) >= 0) {
                                                        setTimePratice(Number(e.target.value))
                                                    } else {
                                                        setTimePratice(1)
                                                    }
                                                }} />
                                                <Tooltip title="Thời điểm hiện tại"><Button icon={<FaSync />} type='primary' onClick={handleAsyncTime} /></Tooltip>
                                            </Space>
                                        )
                                    }
                                    {
                                        questionStates.loading ? (
                                            <LoadingOutlined />
                                        ) : (
                                            questionStates.questions.length ? (
                                                questionStates.questions.map(question => itemQuestionView({ question }))
                                            ) : (
                                                <div>không có dữ liệu</div>
                                            )
                                        )
                                    }
                                </Collapse.Panel>
                            )}
                        </Collapse>
                        <ModalCreateAndUpdateQuestion
                            isEdit={isEdit}
                            isOpen={isOpen}
                            question={new Question(questionStates?.questionInfo)}
                            setIsOpen={setIsOpen}
                            handleUpdatePraticeForTopic={handleUpdatePraticeForTopic}
                            key={questionStates?.questionInfo?.id || ''}
                        />
                    </>
                ) : (
                    <div>
                        {renderInfoTopic()}
                    </div>
                )
            }
        </div>
    )
})