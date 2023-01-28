import { ClockCircleOutlined } from "@ant-design/icons"
import { Col, Form, Input, Row, Select } from "antd"
import { useForm } from "antd/es/form/Form"
import { useEffect, useRef } from "react"
import TinymceEditor from "../../components/TinymceEditor"
import { useAppSelector } from "../../redux/hook"
import { STATUSES } from "../../utils/contraint"
import { topicState } from "./topicSlice"

export const LessonCourse = () => {
    const descRef = useRef<any>();
    const [form] = useForm();
    const topicStates = useAppSelector(topicState);
    const isTopicParent = !topicStates.dataTopic?.parentId

    useEffect(() => {
        if (topicStates.dataTopic) {
            form.setFieldsValue({
                name: topicStates.dataTopic?.name,
                status: topicStates.dataTopic?.status,
                video: topicStates.dataTopic?.video,
            })
        }
    }, [topicStates.dataTopic])

    return (
        <Form
            layout="vertical"
            name="register"
            form={form}
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
                                name="video"
                                label="Video URL"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập trường này!",
                                    },
                                ]}
                            >
                                <Input onChange={() => { }} />
                            </Form.Item>
                        )
                    }

                    {
                        !isTopicParent && (
                            <Form.Item
                                name="timeVideo"
                                label="Độ dài Video"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập trường này!",
                                    },
                                ]}
                            >
                                <Input suffix={<ClockCircleOutlined />} />
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
                </Col>
            </Row>
        </Form>
    )
}