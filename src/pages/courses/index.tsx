import { CloudUploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Modal, notification, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import styles from "./course.module.scss";
import classNames from "classnames/bind"
import { useForm } from "antd/es/form/Form";
import { courseState, requestLoadCourses, requestLoadCoursesByIdCategory, requestUpdateCourse } from "./courseSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import TTCSconfig from "../../submodule/common/config";
import { convertSlug } from "../../utils/slug";
import TinymceEditor from "../../components/TinymceEditor";
import UploadImg from "../../components/UploadImg";
import { Course } from "../../submodule/models/course";
import { categoryState, requestLoadCategorys } from "../categorys/categorySlice";


const cx = classNames.bind(styles);
interface DataType {
  key: string;
  courseName: string;
  slug: string;
  status: number;
  create: number;
  value: Course;
  idCategory: string | undefined;
}

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const CoursePage = () => {
  const [form] = useForm();
  const descRef = useRef<any>();
  const dispatch = useAppDispatch();
  const courseStates = useAppSelector(courseState)
  const courses = courseStates.courses;
  const loading = courseStates.loading;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datas, setDatas] = useState<DataType[]>([]);
  const [dataUpload, setDataupload] = useState<string | null>()
  const [valueEdit, setValueEdit] = useState<Course | undefined>();
  const [statusCourse, setStatusCourse] = useState<number>(TTCSconfig.STATUS_PUBLIC);
  const [idCategorys, setIdCategorys] = useState();

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
    loadCourses(TTCSconfig.STATUS_PUBLIC)
  }, [])

  useEffect(() => {
    setDatas(courses?.map(o => convertDataToTable(o)))
  }, [courses])

  useEffect(() => {
    if (valueEdit) {
      const { courseName, slug, status, des, idCategory } = valueEdit
      form.setFieldsValue({ courseName, slug, status, idCategory })
      descRef?.current?.setContent(des)
    }
  }, [valueEdit])

  // useEffect(() => {
  //   loadCourses(statusCourse)
  // }, [statusCourse])
  
  useEffect(() => {
    loadCategorys();
  }, []);

  useEffect(() => {
    if(idCategorys) {
      loadCoursesByIdCategory(idCategorys, statusCourse );
    }else {
      loadCourses(statusCourse)
    }
  }, [statusCourse, idCategorys]);


  const loadCoursesByIdCategory = async (idCategory: string, status: number) => {
    try {
      const actionResult = await dispatch(requestLoadCoursesByIdCategory({
        idCategory,
        status
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }

  const loadCourses = async (status: number) => {
    try {
      const actionResult = await dispatch(requestLoadCourses({
        status
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }

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

  const convertDataToTable = (value: Course) => {
    return {
      key: `${value?.id || Math.random()}`,
      courseName: value?.courseName,
      slug: value?.slug,
      status: value?.status,
      create: value?.createDate || 0,
      idCategory: value?.idCategory,
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
          const data = await dispatch(requestUpdateCourse({
            id: valueEdit?.id,
            ...value,
            des: descRef?.current?.getContent(),
            avatar: dataUpload
          }))
          console.log(data);
          
          unwrapResult(data)
          dispatch(requestLoadCourses({
            status: statusCourse
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
    setValueEdit(undefined)
  };

  const handleDelete = async (value: Course) => {
    try {
      const data = await dispatch(requestUpdateCourse({
        ...value,
        status: TTCSconfig.STATUS_DELETED
      }))
      unwrapResult(data)
      dispatch(requestLoadCategorys({
        status: statusCourse
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
      title: "Tên khóa học",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Đường dẫn",
      dataIndex: "slug",
      key: "slug",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Danh mục cha",
      dataIndex: "idCategory",
      key: "idCategory",
      render: (idCategory: string) => (
        <>
            {categorys.map((o) =>(o.id === idCategory ? o.name : ""))}
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
      render: (text: Course, record) => (
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
          setStatusCourse(value)
        }}
      />

    <Select
        placeholder={'Bộ lọc'}
        style={{ width: 150, marginLeft: "20px" }}
        // defaultValue={}
        options={categorys.map((data) => ({
          value: data.id,
          label: data.name,
        }))}
        onChange={(value) => {
          setIdCategorys(value)
        }}
      />

      <Modal
        title="Tạo khóa học"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
        width='90%'
        style={{top:20}}
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
              <Form.Item label="Mô tả">
                <TinymceEditor
                  id="descriptionCategory"
                  key="descriptionCategory"
                  editorRef={descRef}
                  value={valueEdit?.des ?? ''}
                  heightEditor="500px"
                />
              </Form.Item>


            </Col>
            <Col xl={8} md={8} xs={24}>
              <Form.Item label={<h3>{'Ảnh khóa học'}</h3>} name="avatar">
                <UploadImg
                  defaultUrl={valueEdit?.avatar}
                  onChangeUrl={(value) => setDataupload(value)}
                />
              </Form.Item>

              <Form.Item
                name='courseName'
                label="Tên khóa học"
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
  );
};

export default CoursePage;
