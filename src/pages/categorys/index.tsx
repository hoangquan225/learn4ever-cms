import { CloudUploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, notification, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import styles from "./categorys.module.scss";
import classNames from "classnames/bind"
import { useForm } from "antd/es/form/Form";
import { categoryState, requestLoadCategorys, requestUpdateCategorys } from "./categorySlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { Category } from "../../submodule/models/category";
import TTCSconfig from "../../submodule/common/config";
import { convertSlug } from "../../utils/slug";
import TinymceEditor from "../../components/TinymceEditor";
import UploadImg from "../../components/UploadImg";


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
  const descRef = useRef<any>();
  const dispatch = useAppDispatch();
  const categoryStates = useAppSelector(categoryState)
  const categorys = categoryStates.categorys;
  const loading = categoryStates.loading;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datas, setDatas] = useState<DataType[]>([]);
  const [dataUpload, setDataupload] = useState<string | null>()
  const [valueEdit, setValueEdit] = useState<Category | undefined>();
  const [statusCategory, setStatusCategory] = useState<number>(TTCSconfig.STATUS_PUBLIC);

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
    loadCategorys(TTCSconfig.STATUS_PUBLIC)
  }, [])

  useEffect(() => {
    setDatas(categorys?.map(o => convertDataToTable(o)))
  }, [categorys])

  useEffect(() => {
    if (valueEdit) {
      const { name, slug, status, des, index } = valueEdit
      form.setFieldsValue({ name, slug, status })
      descRef?.current?.setContent(des)
    }
  }, [valueEdit])

  useEffect(() => {
    loadCategorys(statusCategory)
  }, [statusCategory])

  const loadCategorys = async (status: number) => {
    try {
      const actionResult = await dispatch(requestLoadCategorys({
        status
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
    setValueEdit(undefined)
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
    form.resetFields();
    descRef?.current?.setContent('')
  };

  const handleDelete = async (value: Category) => {
    try {
      const data = await dispatch(requestUpdateCategorys({
        ...value,
        status: TTCSconfig.STATUS_DELETED
      }))
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
  }

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
      dataIndex: "value",
      render: (text: Category, record) => (
        <Space size="middle">
          <Tooltip placement="top" title="Chỉnh sửa">
            <Button onClick={() => {
              setIsModalOpen(true)
              setValueEdit(text)
            }}>
              <EditOutlined />
            </Button>
          </Tooltip>

          <Popconfirm
            title="Bạn có chắc bạn muốn xóa mục này không?"
            onConfirm={() => {
              handleDelete(text)
            }}
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
        defaultValue={TTCSconfig.STATUS_PUBLIC}
        options={status}
        onChange={(value) => {
          setStatusCategory(value)
        }}
      />

      <Modal
        title="Tạo danh mục"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        width='90%'
        maskClosable={false}
      >
        <Form
          layout="vertical"
          name="register"
          initialValues={{
            status: 1,
          }}
          form={form}
        >
          <Row gutter={{ xl: 48, md: 16, xs: 0 }}>
            <Col xl={16} md={16} xs={24} style={{ borderRight: "0.1px solid #ccc" }}>
              <Form.Item className="model-category__formItem" label="Mô tả">
                <TinymceEditor
                  id="descriptionCategory"
                  key="descriptionCategory"
                  editorRef={descRef}
                  value={valueEdit?.des ?? ''}
                  heightEditor="600px"
                />
              </Form.Item>


            </Col>
            <Col xl={8} md={8} xs={24}>
              <Form.Item label={<h3>{'Ảnh danh mục'}</h3>} name="avatar">
                <UploadImg
                  defaultUrl={valueEdit?.avatar}
                  onChangeUrl={(value) => setDataupload(value)}
                />
              </Form.Item>

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
                <Input onChange={(e) => {
                  form.setFieldsValue({ slug: convertSlug(e.target.value) })
                }} />
              </Form.Item>

              <Form.Item name='slug' label="Đường dẫn" rules={[
                {
                  required: true,
                  message: "Vui lòng nhập trường này!",
                },
              ]}
              >
                <Input />
              </Form.Item>

              <Form.Item name='status' label="Trạng thái">
                <Select options={status} />
              </Form.Item>
            </Col>
            
          </Row>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={datas} loading={loading} />
    </div>
  );
};

export default CategoryPage;
