import {  ReadOutlined } from '@ant-design/icons';
import { unwrapResult } from '@reduxjs/toolkit';
import { Button, Col, Form, Image, Input, Menu, MenuProps, Modal, notification, Popconfirm, Row, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { ColumnsType } from 'antd/es/table';
import path from 'path';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiLoadTopicsByParentId } from '../../api/topicApi';
import TinymceEditor from '../../components/TinymceEditor';
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import TTCSconfig from '../../submodule/common/config';
import { Topic } from '../../submodule/models/topic';
import { STATUSES } from '../../utils/contraint';
import { requestLoadTopicsByParentId, topicDatailState } from './topicDetailSlice';
import { requestLoadTopics, requestLoadTopicsByIdCourse, topicState } from './topicSlice';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}
const rootSubmenuKeys = ['sub1', 'sub2', 'sub4'];

const CourseDetail = () => {
  const [form] = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const dispatch = useAppDispatch();
  const topicStates = useAppSelector(topicState);
  const topics = topicStates.topics;
  const loading = topicStates.loading;
  const topicDetailStates = useAppSelector(topicDatailState);
  const topicDetails = topicDetailStates.topicDetails;
  const location = useLocation();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [path, setPath] = useState("")
  const [type, setType] = useState<number>(1);
  const [openKeys, setOpenKeys] = useState(['']);
  const [datas, setDatas] = useState<any>();
  const [datasItem, setdatasItem] = useState<any>();

  const statusTopic = [
    {
      value: 1,
      label: "Chương trình học"
    },
    {
      value: 2,
      label: "Đề kiểm tra"
    } 
  ]

  useEffect(() => {
    setPath(location.pathname.split('/')[location.pathname.split('/').length - 1])
    if(path) {
      loadByIdCourse(path, type)
    }
  }, [path, type]);

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    console.log(keys);
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      console.log({key1: keys});
      setOpenKeys(keys);
    } else {
      console.log({key2: keys});
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const loadByIdCourse = async (idCourse: any, type: number) => {
    try {
      const actionResult = await dispatch(requestLoadTopicsByIdCourse({
        idCourse,
        type
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }
  const loadByParentId = async (parentId: any) => {
    try {
      const actionResult = await dispatch(requestLoadTopicsByParentId({
        parentId
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sach danh mục'
      })
    }
  }
  
  const handleOk = () => {}
  const handleCancel = () => {
    setIsModalOpen(false);
    // form.resetFields();
    // descRef?.current?.setContent('')
    // setValueEdit(undefined)
  };

  // useEffect(() => {
  //   if(parentId) {
  //     loadByParentId(parentId)
  //   }
  // }, [parentId]);

  useEffect(() => {
    const data = topics.map((o, i) =>  {
      return getItem(o.name, i, <ReadOutlined />, topicDetails.map((e, v) => (getItem(e.name, v))))
    })
    setDatas(data)
  }, [topics]);

  // const data = topics.map((o, i) =>  {
  //   loadByParentId(o.id)
  //   return getItem(o.name, i, <ReadOutlined />, data)
  // })

  const items: MenuItem[] = datas;

  
  
  return( 
    <div>
      <Row style={{marginBottom: "20px"}}>
        <Space size="small">
          <label style={{ marginLeft: "20px" }}>Chọn phương thức:</label>
          <Select
            placeholder={"Bộ lọc"}
            style={{ width: 200, marginLeft: "10px" }}
            defaultValue={TTCSconfig.STATUS_PUBLIC}
            options={statusTopic}
            onChange={(value) => {
              setType(value)
            }}
          />
        </Space>
      </Row>
      <Row>
        <Col span={5}>
          <Menu
            mode="inline"
            openKeys={openKeys}
            // onClick={onClickChange}
            onOpenChange={onOpenChange}
            style={{ width: "95%", height: "100%" }}
            items={items}
          />
        </Col>

        <Col span={19}>
          <Form
            layout="vertical"
            name="register"
            initialValues={{
              status: 1,
            }}
            form={form}
          >
            <Row gutter={{ xl: 48, md: 16, xs: 0 }}>
              <Col
                xl={16}
                md={16}
                xs={24}
                style={{ borderRight: "0.1px solid #ccc" }}
              >
                <Form.Item className="model-category__formItem" label="Mô tả">
                  <TinymceEditor
                    id="descriptionCategory"
                    key="descriptionCategory"
                    // editorRef={descRef}
                    // value={valueEdit?.des ?? ""}
                    heightEditor="400px"
                  />
                </Form.Item>
              </Col>
              <Col xl={8} md={8} xs={24}>
                <Form.Item
                  name='name'
                  label="Tên bài giảng"
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

                <Form.Item
                  name='file'
                  label="Video URL"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập trường này!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary">Submit</Button>
                </Form.Item>
                
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Modal
        title={`${isEdit ? "Chỉnh sửa" : "Tạo"} bài`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={`${isEdit ? "Cập nhật" : "Tạo"}`}
        cancelText="Hủy"
        width="90%"
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
            <Col
              xl={16}
              md={16}
              xs={24}
              style={{ borderRight: "0.1px solid #ccc" }}
            >
              <Form.Item className="model-category__formItem" label="Mô tả">
                <TinymceEditor
                  id="descriptionCategory"
                  key="descriptionCategory"
                  // editorRef={descRef}
                  // value={valueEdit?.des ?? ""}
                  heightEditor="500px"
                />
              </Form.Item>
            </Col>
            <Col xl={8} md={8} xs={24}>
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập trường này!",
                  },
                ]}
              >
              </Form.Item>

              <Form.Item name="status" label="Trạng thái">
                <Select options={STATUSES} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default CourseDetail