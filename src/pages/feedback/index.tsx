import React, { useEffect, useState } from "react";
import { notification, Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { feedbackState, requestLoadFeedbacks } from "./feedbackSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import moment from "moment";
import { categoryState, requestLoadCategorys, setCategoryInfo } from "../categorys/categorySlice";
import TTCSconfig from "../../submodule/common/config";

interface DataType {
  key: number;
  name: string;
  status: number;
  content: string;
  date: number | null;
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
              {type.toString().toUpperCase()}
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
        <a>Sửa</a>
        <a style={{
          color: "red"
        }}>Xóa</a>
      </Space>
    ),
  },
];

const Feedback = () => {
  const dispatch = useAppDispatch()
  const feedbackStates = useAppSelector(feedbackState)
  const categoryStates = useAppSelector(categoryState)

  useEffect(() => {
    handleLoadFeedbacks()
    loadCategorys(TTCSconfig.STATUS_PUBLIC)
  }, [])

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

  const handleChangeCategoy = (value : string) => {
    const categoryInfo = categoryStates.categorys.find(o => o.id === value)
    dispatch(setCategoryInfo(categoryInfo))
  };

  const handleChangeCourse = () => {

  };

  return (
    <>
      <label>chọn danh mục : </label>
      <Select
        // defaultValue={provinceData[0]}
        placeholder={'Chọn danh mục'}
        value={categoryStates.categoryInfo?.id}
        style={{ width: 200, marginBottom: "20px" }}
        onChange={handleChangeCategoy}
        options={categoryStates.categorys.map(category => ({
          value: category.id || '', 
          label: category.name
        }))}
      />
      <label>chọn khóa học : </label>
      <Select
        style={{ width: 200, marginBottom: "20px", marginLeft: "10px" }}
        // value={secondCity}
        placeholder={'Chọn khóa học'}
        onChange={handleChangeCourse}
        options={[]}
      />
      <Table columns={columns} dataSource={feedbackStates.feedbacks?.map((feedback, index) => ({
        key: index,
        name: feedback.dataUser?.name || '',
        status: feedback.status,
        content: feedback.content,
        date: feedback.createDate || null,
        type: feedback.type,
      }))} />
    </>
  );
};

export default Feedback;
