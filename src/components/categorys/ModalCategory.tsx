import { CloudUploadOutlined } from "@ant-design/icons";
import { Col, Form, Input, Modal, Row, Select, Upload } from "antd";
import { useState } from "react";
import styles from "./categorys.module.scss";
import classNames from "classnames/bind"


const cx = classNames.bind(styles);

const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};


const ModalCategory = () => {

    const onFinish = (values: any) => {
        console.log("Received values of form: ", values);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
    //     <Button
    //     type="primary"
    //     style={{
    //       marginBottom: "10px",
    //     }}
    //     onClick={showModal}
    //   >
    //     Thêm mới
    //   </Button>

        <Modal title="Tạo danh mục" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <Form
                layout="vertical"
                name="register"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <Form.Item
                            label="Tên danh mục"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập trường này!",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={12}>
                        <Form.Item label="Đường dẫn">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={12}>
                        <Form.Item label="Trạng thái">
                            <Select defaultValue="public">
                                <Select.Option value="public">Công khai</Select.Option>
                                <Select.Option value="private">Riêng tư</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col className="gutter-row" span={24}>
                        <Form.Item label="Avatar danh mục">
                            <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                                <Upload.Dragger name="files" action="/upload.do" className={cx("avatar__upload")}>
                                    <p className="ant-upload-drag-icon">
                                        <CloudUploadOutlined />
                                    </p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                </Upload.Dragger>
                            </Form.Item>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}