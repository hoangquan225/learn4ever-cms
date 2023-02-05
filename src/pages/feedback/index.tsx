import React, { useEffect, useState } from "react";
import { notification, Popconfirm, Select, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { feedbackState, requestLoadFeedbacks, requestLoadFeedbacksByIdCourse, requestLoadFeedbacksByTypeOrCourse } from "./feedbackSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import moment from "moment";
import { categoryState, requestLoadCategorys, setCategoryInfo } from "../categorys/categorySlice";
import TTCSconfig from "../../submodule/common/config";
import { feedbackChild } from "../../submodule/utils/contants";
import { courseState, requestLoadByIdTagAndCategory } from "../courses/courseSlice";
import { Button } from "antd/es/radio";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

interface DataType {
  key: number;
  name: string;
  status: number;
  content: string;
  date: number | null;
  idCourse: string | undefined;
  type: number[];
}

const status = [
  {
    value : 0, 
    label: 'Đang xử lý'
  },
  {
    value : 1, 
    label: 'Đã xử lý'
  },
]


const Feedback = () => {
  const dispatch = useAppDispatch()
  const feedbackStates = useAppSelector(feedbackState)
  const categoryStates = useAppSelector(categoryState)
  const courseStates = useAppSelector(courseState)
  const courses = courseStates.courses;
  const [idCourse, setIdCourse] = useState<string>();
  const [type, setType] = useState<string[]>([]);

  
const columns: ColumnsType<DataType> = [
  {
    title: "STT",
    key: "stt",
    align: 'center',
    render: (text, record, index) => index + 1,
  },
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render(value, record, index) {
      return <Tag color={value === 0 ? "red" : "green"}><i>{status.find(o => o.value === value)?.label || 'chưa cập nhật'}</i></Tag>
    },
  },
  {
    title: "Nội dung",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "Tên khóa học",
    dataIndex: "idCourse",
    key: "idCourse",
    render: (idCourse: string) => (
      <>
        {courses?.map((o) =>(o.id === idCourse ? o.courseName : ""))}
      </>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "date",
    key: "date",
    render(value, record, index) {
      return <i>{value ? moment(value).format("DD/MM/YYYY") : 'chưa cập nhật'}</i>
    },
  },
  {
    title: "Loại feedback",
    key: "type",
    dataIndex: "type",
    render: (_, { type }) => (
      <>
        {type.map((type, index) => {
          return (
            <Tag color={"geekblue"} key={index}>
              {feedbackChild.find(o => o.type === type)?.text.toUpperCase()}
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
          <Button >
            <EditOutlined />
          </Button>
        </Tooltip>

        <Popconfirm
          placement="topRight"
          title="Bạn có chắc bạn muốn xóa mục này không?"
          // onConfirm={() => {
          //   handleDelete(text)
          // }}
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

  useEffect(() => {
    handleLoadFeedbacks()
    loadCategorys(TTCSconfig.STATUS_PUBLIC)
  }, [])

  useEffect(() => {
    if(type[0] || idCourse) {
      handleChangeTypeAndCourse(type || [], idCourse || "")
    }else {
      handleLoadFeedbacks()
    }
  }, [idCourse, type])

  const handleLoadFeedbacks = async () => {
    try {
      const actionResult = await dispatch(requestLoadFeedbacks())
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sách feedback', 
        duration: 1.5
      })
    }
  }

  const loadCategorys = async (status: number) => {
    try {
      const actionResult = await dispatch(
        requestLoadCategorys({
          status,
        })
      );
      unwrapResult(actionResult);
    } catch (error) {
      notification.error({
        message: "không tải được danh sach danh mục",
      });
    }
  };

  const handleChangeCategoy = async (value : string) => {
    const categoryInfo = categoryStates.categorys.find(o => o.id === value)
    dispatch(setCategoryInfo(categoryInfo))
    try {
      const actionResult = await dispatch(requestLoadByIdTagAndCategory({
        idCategory: categoryInfo?.id  || "",
        status: TTCSconfig.STATUS_PUBLIC
      }))
      unwrapResult(actionResult)
    } catch (error) {
      notification.error({
        message: 'không tải được danh sách khóa học'
      })
    }
  };

  // const handleChangeCourse = async (idCourse : string) => {
  //   try {
  //     const actionResult = await dispatch(requestLoadFeedbacksByIdCourse({
  //       idCourse
  //     }))
  //     unwrapResult(actionResult)
  //   } catch (error) {
  //     notification.error({
  //       message: 'không tải được danh sách phản hồi'
  //     })
  //   }
  // };

  const handleChangeTypeAndCourse = async (type: string[], idCourse: string) => {
    try {
      if(type[0] || idCourse) {
        const actionResult = await dispatch(requestLoadFeedbacksByTypeOrCourse({
          type, 
          idCourse: idCourse
        }))
        unwrapResult(actionResult)
      }else{
        handleLoadFeedbacks()
      }
    } catch (error) {
      notification.error({
        message: 'không tải được danh sách phản hồi'
      })
    }
  }

  return (
    <>
      <label>chọn danh mục : </label>
      <Select
        // defaultValue={provinceData[0]}
        placeholder={'Chọn danh mục'}
        value={categoryStates.categoryInfo?.id}
        style={{ width: 150, marginLeft: "10px" }}
        onChange={handleChangeCategoy}
        options={categoryStates.categorys.map(category => ({
          value: category.id || '', 
          label: category.name
        }))}
      />
      <label style={{ marginLeft: "20px" }}>chọn khóa học : </label>
      <Select
        style={{ width: 150, marginLeft: "10px" , marginBottom: "20px"}}
        // value={secondCity}
        placeholder={'Chọn khóa học'}
        onChange={(value) => {
          setIdCourse(value)
        }}
        options={
          courses[0] ? courses.map(courses => ({
            value: courses.id || '', 
            label: courses.courseName
        })) :[]}
      />
      <label style={{ marginLeft: "20px" }}>Chọn loại phản hồi: </label>
      <Select
        mode="multiple" 
        placeholder={'Bộ lọc'}
        style={{ width: 400, marginLeft: "10px" }}
        onChange={(value) => {
          setType(value)
        }}
        options={feedbackChild.map(feedback => ({
          value: feedback.type, 
          label: feedback.text
        }))}
        listHeight={128}
      />
      <Table columns={columns} dataSource={feedbackStates.feedbacks?.map((feedback, index) => ({
        key: index,
        name: feedback.dataUser?.name || '',
        status: feedback.status,
        content: feedback.content,
        idCourse: feedback.idCourse || '',
        date: feedback.createDate || null,
        type: feedback.type,
      }))} />
    </>
  );
};

export default Feedback;
