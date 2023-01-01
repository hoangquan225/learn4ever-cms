import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { unwrapResult } from "@reduxjs/toolkit";
import { Button, Col, Form, Input, Modal, notification, Popconfirm, Row, Select, Space, Tag, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import TTCSconfig from "../../submodule/common/config";
import { Tag as Tags } from "../../submodule/models/tag";
import { convertSlug } from "../../utils/slug";
import { categoryState, requestLoadCategorys } from "../categorys/categorySlice";
import { requestLoadTags, requestUpdateTag, tagState } from "./tagSlice";

interface DataType {
  key: string;
  name: string;
  idCategory: string[];
  status: number;
  create: number;
  value: Tags;
}

const TagPage = () => {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const tagStates = useAppSelector(tagState)
  const tags = tagStates.tags;
  const loading = tagStates.loading;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datas, setDatas] = useState<DataType[]>([]);
  const [statusTag, setStatusTag] = useState<number>(TTCSconfig.STATUS_PUBLIC);
  const [valueEdit, setValueEdit] = useState<Tags | undefined>();
  const categoryStates = useAppSelector(categoryState);
  const categorys = categoryStates.categorys;
  
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
    loadTags(TTCSconfig.STATUS_PUBLIC)
  }, [])

  useEffect(() => {
    setDatas(tags?.map(o => convertDataToTable(o)))
  }, [tags])

  useEffect(() => {
    if (valueEdit) {
      const { name, status, idCategory } = valueEdit
      form.setFieldsValue({ name, status, idCategory })
      // descRef?.current?.setContent(des)
    }
  }, [valueEdit])

  useEffect(() => {
    loadTags(statusTag)
  }, [statusTag])

  useEffect(() => {
    loadCategorys();
  }, []);

  const loadCategorys = async () => {
    try {
      const actionResult = await dispatch(
        requestLoadCategorys({
          status: 1,
        })
      );
      const res = unwrapResult(actionResult);
    } catch (error) {
      notification.error({
        message: "không tải được danh sach danh mục",
      });
    }
  };

  const loadTags = async (status: number) => {
    try {
      const actionResult = await dispatch(requestLoadTags({
        status
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }

  const convertDataToTable = (value: Tags) => {
    return {
      key: `${value?.id || Math.random()}`,
      name: value?.name,
      idCategory: value?.idCategory,
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
          const data = await dispatch(requestUpdateTag({
            id: valueEdit?.id,
            ...value,
            // des: descRef?.current?.getContent(),
            // avatar: dataUpload
          }))
          unwrapResult(data)
          dispatch(requestLoadTags({
            status: statusTag
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
    // descRef?.current?.setContent('')
  };

  const handleDelete = async (value: Tags) => {
    try {
      const data = await dispatch(requestUpdateTag({
        ...value,
        status: TTCSconfig.STATUS_DELETED
      }))
      unwrapResult(data)
      dispatch(requestLoadTags({
        status: statusTag
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
      title: "Tên Tag",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Danh mục cha",
      dataIndex: "idCategory",
      key: "idCategory",
      render: (idCategory: string) => (
        <> 
          {categorys.map((o) =>(o.id == idCategory ? o.name : ""))}
        </>
      ),
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
      render: (text: Tags, record) => (
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
          setStatusTag(value)
        }}
      />

      <Modal
        title="Tạo Tag"
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
            <Col xl={8} md={8} xs={24}>
              <Form.Item
                name='name'
                label="Tên Tag"
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

              <Form.Item name='idCategory' label="Danh mục cha">
                <Select options={categorys.map((data) => ({
                  value: data.id,
                  label: data.name,
                }))} />
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
  )
}

export default TagPage;