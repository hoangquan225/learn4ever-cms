import { CloudUploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, notification, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import styles from "./categorys.module.scss";
import classNames from "classnames/bind"
import { useForm } from "antd/es/form/Form";
import { async } from "q";
import { apiLoadCategorys, apiUpdateCategory } from "../../api/categoryApi";
import { categoryState, requestLoadCategorys } from "./categorySlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { Category } from "../../submodule/models/category";
import TTCSconfig from "../../submodule/common/config";


const cx = classNames.bind(styles);
interface DataType {
  key: string;
  name: string;
  slug: string;
  status: number;
  create: number;
  value: Category;
}

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const CategoryPage = () => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const categoryStates = useAppSelector(categoryState)
  const categorys = categoryStates.categorys;
  const loading = categoryStates.loading;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datas, setDatas] = useState<DataType[]>([]);

  const status = [
    {
      value: TTCSconfig.STATUS_PUBLIC,
      label: 'công khai'
    }, {
      value: TTCSconfig.STATUS_PRIVATE,
      label: 'riêng tư'
    }, {
      value: TTCSconfig.STATUS_DELETED,
      label: 'đã xóa'
    }
  ]

  useEffect(() => {
    loadCategorys()
  }, [])

  useEffect(() => {
    if (categorys.length) {
      setDatas(categorys.map(o => convertDataToTable(o)))
    }
  }, [categorys])

  const loadCategorys = async () => {
    try {
      const actionResult = await dispatch(requestLoadCategorys({
        status: 1
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }

  const convertDataToTable = (value: Category) => {
    return {
      key: `${value?.id || Math.random()}`,
      name: value?.name,
      slug: value?.slug,
      status: value?.status,
      create: value?.createDate || 0,
      value: value
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(async (value) => {
        try {
          const data = await dispatch(requestUpdateCategorys({
            id: valueEdit?.id,
            ...value,
            des: descRef?.current?.getContent(),
            avatar: dataUpload
          }))
          console.log(data);

          unwrapResult(data)
          dispatch(requestLoadCategorys({
            status: statusCategory
          }))
        } catch (error) {
          notification.error({
            message: 'cập nhật không được',
            duration: 1.5
          })
        }
        handleCancel();
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
      key: "stt",
      align: 'center',
      render: (text, record, index) => index + 1,
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
      render: (text: number) => (
        <>
          <Tag color={text === TTCSconfig.STATUS_PUBLIC ? 'green' : 'red'}>
            {status.find(o => o.value === text)?.label}
          </Tag>
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
              <Form.Item name='avatar' label="Avatar danh mục">
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

      <Table columns={columns} dataSource={datas} loading={loading}/>
    </div>
  );
};

export default CategoryPage;
