import { CloudUploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import styles from "./categorys.module.scss";
import classNames from "classnames/bind"
import { useForm } from "antd/es/form/Form";


const cx = classNames.bind(styles);
interface DataType {
  key: string;
  stt: number;
  name: string;
  slug: string;
  status: string[];
}

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const Category = () => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter.value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const data: DataType[] = [];

  for (let i = 1; i <= 12; i++) {
    data.push({
      key: `${i}`,
      stt: i,
      name: `Lớp ${i}`,
      slug: `lop-${i}`,
      status: ["công khai"],
    });
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(value => {
        console.log({ value });
        setIsModalOpen(false);
        form.resetFields()
      })
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const confirm = () => {
    message.success('Click on Yes');
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Đường dẫn",
      dataIndex: "slug",
      key: "slug",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (_, { status }) => (
        <>
          {status.map((tag) => {
            let color = "";
            if (tag === "công khai") {
              color = "green";
            } else {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip placement="top" title="Chỉnh sửa">
            <Button>
              <EditOutlined />
            </Button>
          </Tooltip>

          <Popconfirm
            title="Bạn có chắc bạn muốn xóa mục này không?"
            onConfirm={confirm}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip placement="top" title="Xóa">
              <Button>
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{
          marginBottom: "10px",
        }}
        onClick={showModal}
      >
        Thêm mới
      </Button>
      
      <Select
        placeholder={'Bộ lọc'}
        style={{ width: 150, marginLeft: "20px" }}
        options={[
          {
            value: 2,
            label: 'Tất cả'
          },
          {
            value: 1,
            label: 'công khai'
          },
          {
            value: 0,
            label: 'riêng tư'
          },
        ]} 
      />

      <Modal title="Tạo danh mục" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Lưu" cancelText="Hủy">
        <Form
          layout="vertical"
          name="register"
          initialValues={{
            status: 1,
          }}
          form={form}
        >
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              <Form.Item
                name='name'
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
              <Form.Item
                name='slug'
                label="Đường dẫn"
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
              <Form.Item name='status' label="Trạng thái">
                <Select options={[
                  {
                    value: 1,
                    label: 'công khai'
                  },
                  {
                    value: 0,
                    label: 'riêng tư'
                  }
                ]} />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={24}>
              <Form.Item name ='avatar' label="Avatar danh mục">
                <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                  <Upload.Dragger name="files" action="/upload.do" listType="picture" className={cx("avatar__upload")}>
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
                  </Upload.Dragger>
                </Form.Item>
              </Form.Item>
            </Col>
            
          </Row>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Category;
