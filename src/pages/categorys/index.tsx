import { BarsOutlined, DeleteOutlined, EditOutlined, EditTwoTone } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Form, Image, Input, Modal, notification, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import styles from "./categorys.module.scss";
import classNames from "classnames/bind"
import { useForm } from "antd/es/form/Form";
import { categoryState, requestLoadCategorys, requestOrderCategory, requestUpdateCategorys } from "./categorySlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { Category } from "../../submodule/models/category";
import TTCSconfig from "../../submodule/common/config";
import { convertSlug } from "../../utils/slug";
import TinymceEditor from "../../components/TinymceEditor";
import UploadImg from "../../components/UploadImg";
import { PAGE_SIZE } from "../../utils/contraint";
import { DragDropContext, Draggable, Droppable, DropResult, ResponderProvided } from "react-beautiful-dnd";
import { apiUpdateCategory } from "../../api/categoryApi";


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
  const [isEdit, setIsEdit] = useState<boolean>(false);

  var categoryList: Category[] = []
  for (var key in categorys) {
      if (categorys.hasOwnProperty(key)) {
          categoryList.push(categorys[key])
      }
  }

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

  const openCreateModal = () => {
    setIsModalOpen(true);
    setValueEdit(undefined)
    setIsEdit(false)
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
    setValueEdit(undefined)
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
  
  // /**
  //  * 
  //  * @param {import("react-beautiful-dnd").DropResult} result 
  //  * @param {import("react-beautiful-dnd").ResponderProvided} provided 
  //  */
  const handleDropEndCategory = async (result: DropResult, provided: ResponderProvided) => {
    const srcIndex = result.source.index;

    console.log(srcIndex);
    const destIndex = result.destination?.index;
    
    
    if (typeof srcIndex !== "undefined"
        && typeof destIndex !== "undefined"
        ) {
      const newCourses = srcIndex < destIndex
        ? [...categoryList.slice(0, srcIndex), ...categoryList.slice(srcIndex + 1, destIndex + 1), categoryList[srcIndex], ...categoryList.slice(destIndex + 1)]
        : (srcIndex > destIndex
          ? [...categoryList.slice(0, destIndex), categoryList[srcIndex], ...categoryList.slice(destIndex, srcIndex), ...categoryList.slice(srcIndex + 1)]
          : categoryList);
          
        console.log(newCourses);
        const a = (newCourses.map((e, i) => {
         return {
            id: e.id,
            index: i,
            name: e.name,
            status: e.status,
            avatar: e.avatar ,
            des: e.des,
            slug: e.slug
          }
        }));
        console.log(a);
          
        (newCourses.map((e, i) => {
          apiUpdateCategory({
            id: e.id,
            name: e.name,
            index: i,
            status: e.status,
            avatar: e.avatar ,
            des: e.des,
            slug: e.slug
          })
        }));

      dispatch(requestLoadCategorys({
        status: statusCategory
      }))

      // try {
      //   const res = await dispatch(requestOrderCategory({
      //     indexRange : [
      //       {
      //         id : ,
      //         index : srcIndex + 1
      //       },
      //       {
      //           id : ,
      //           index : srcIndex
      //       }
      //   ],
      //   status : 1
      //   }))
      //   unwrapResult(res)
      //   dispatch(requestLoadCategorys({
      //     status: statusCategory
      //   }))
      // } catch (error) {
        
      // }
     
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
              setIsEdit(true)
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
      <Space size='large'>
        <Button
          type="primary"
          onClick={openCreateModal}
        >
          Thêm mới
        </Button>

        <Space size='small'>
          <label style={{ marginLeft: "20px" }}>Chọn trạng thái:</label>
          <Select
            placeholder={'Bộ lọc'}
            style={{ width: 150, marginLeft: "10px" }}
            defaultValue={TTCSconfig.STATUS_PUBLIC}
            options={status}
            onChange={(value) => {
              setStatusCategory(value)
            }}
          />
        </Space>
      </Space>

      <Typography.Title level={3}>Danh sách danh mục: </Typography.Title>

      <DragDropContext onDragEnd={handleDropEndCategory}>
        <Droppable droppableId="list-courses-wrap" >
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>

              <Row className={cx("header_table")}>
                <Col span={2}>STT</Col>
                <Col span={6}>Ảnh</Col>
                <Col span={4}>Tên khóa học</Col>
                <Col span={4}>Đường dẫn</Col>
                <Col span={4}>Trạng thái</Col>
                <Col span={4}>Hành động</Col>
              </Row>
              {/* <div className={cx("header_table")}
              //  style={{display:"flex", alignItems: "center", backgroundColor: "#fafafa", marginBottom:"8px"}}
               >
                <p>STT</p>
                <p>Ảnh</p>
                <p>Tên khóa học</p>
                <p>Đường dẫn</p>
                <p>Trạng thái</p>
                <p>Hành động</p>
              </div> */}
              {categoryList.length? categoryList.sort((a,b) => (a.index - b.index)).map((e, ind) => {
                const id = e?.id;
                const indCategory = e.index
                return <Draggable key={e.id} draggableId={e?.id || ""} index={ind}>
                  {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div id={id} key={ind} style={{display:"flex", alignItems: "center"}}>
                          <BarsOutlined style={{ fontSize: "32px", marginRight: "8px" }} />
                          <Row className={cx("category-item")}>
                            <Col span={2}>
                              <Avatar style={{ fontWeight: "bold", background: "#1990ff", marginLeft:"8px" }} size="large">{ind + 1}</Avatar>
                            </Col >
                            <Col span={6}>
                              <Image src={e.avatar ?? ""} width={150} preview={false} style={{ maxHeight: "80px", overflow: "hidden" }} />
                            </Col>
                            <Col span={4}>
                              {e.name}
                            </Col>
                            <Col span={4}>
                              {e.slug}
                            </Col>
                            <Col span={4}>
                              <Tag color={e.status === TTCSconfig.STATUS_PUBLIC ? 'green' : 'red'}>
                                {status.find(o => o.value === e.status)?.label}
                              </Tag>
                            </Col>
                            <Col span={4}>
                              <Row style={{justifyContent: "center"}}>
                                <Tooltip placement="top" title="Chỉnh sửa">
                                  <Button style={{ marginRight: 8 }} 
                                    onClick={() => {
                                      setIsModalOpen(true)
                                      setValueEdit(e)
                                      setIsEdit(true)
                                    }}
                                  >
                                    <EditOutlined />
                                  </Button>
                                </Tooltip>
                            
                                <Popconfirm
                                  title="Bạn có chắc bạn muốn xóa mục này không?"
                                  cancelText="KHÔNG"
                                  okText="CÓ"
                                  onConfirm={() => {
                                    handleDelete(e)
                                  }}
                                >
                                  <Tooltip placement="top" title="Xóa">
                                    <Button>
                                      <DeleteOutlined />
                                    </Button>
                                  </Tooltip>
                                </Popconfirm>
                              </Row>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    )}
                </Draggable>  
              }):''}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      
      {/* <Table columns={columns} dataSource={datas} loading={loading} pagination={{
        pageSize: PAGE_SIZE
      }} 
      /> */}

      <Modal
        title={`${isEdit ? 'Chỉnh sửa' : 'Tạo'} danh mục`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={`${isEdit ? 'Cập nhật' : 'Tạo'}`}
        cancelText="Hủy"
        width='90%'
        style={{ top: 20 }}
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
                  heightEditor="500px"
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
    </div>
  );
};

export default CategoryPage;
