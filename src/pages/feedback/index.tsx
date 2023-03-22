import { useEffect, useState } from "react";
import {
  notification,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  feedbackState,
  requestLoadFeedbacks,
  requestLoadFeedbacksByTypeOrCourse,
} from "./feedbackSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import moment from "moment";
import {
  categoryState,
  requestLoadCategorys,
  setCategoryInfo,
} from "../categorys/categorySlice";
import TTCSconfig from "../../submodule/common/config";
import { feedbackChild } from "../../submodule/utils/contants";
import {
  courseState,
  requestLoadByIdTagAndCategory,
} from "../courses/courseSlice";
import { Button } from "antd/es/radio";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Course } from "../../submodule/models/course";
import { apiLoadCourses } from "../../api/courseApi";
import ModalCreateAndUpdateQuestion from "../../components/ModalCreateAndUpdateQuestion";
import { Question } from "../../submodule/models/question";
import { questionState, setQuestionInfo } from "../../redux/question";
import { apiLoadFeedbacks, apiUpdateFeedback } from "../../api/feedback";

interface DataType {
  id: string | undefined;
  key: number;
  name: string;
  status: number;
  content: string;
  date: number | null;
  idCourse: string | undefined;
  type: number[];
  dataQuestion: Question | null;
  idQuestion: string | undefined;
  idUser: string | undefined;
}

const status = [
  {
    value: 0,
    label: "Đang xử lý",
  },
  {
    value: 1,
    label: "Đã xử lý",
  },
];

const Feedback = () => {
  const dispatch = useAppDispatch();
  const feedbackStates = useAppSelector(feedbackState);
  const questionStates = useAppSelector(questionState);
  const categoryStates = useAppSelector(categoryState);
  const courseStates = useAppSelector(courseState);
  const courses = courseStates.courses;
  const [idCourse, setIdCourse] = useState<string>();
  const [type, setType] = useState<string[]>([]);
  const [dataCourse, setDataCourse] = useState<Course[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [isLoad, setIsLoad] = useState<boolean>(false);

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "stt",
      align: "center",
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
        return (
          <Select
            defaultValue={value}
            style={{ width: 140 }}
            onChange={async (value) => {
              hanldeUpdateStatus(value, record);
            }}
            bordered={false}
            // showArrow={false}
            options={[
              {
                value: 0,
                label: <Tag color={"red"}>chưa cập nhật</Tag>,
              },
              {
                value: 1,
                label: <Tag color={"green"}>đã cập nhật</Tag>,
              },
            ]}
          />
        );
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
        <>{dataCourse?.find((o) => o.id === idCourse)?.courseName}</>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
      render(value, record, index) {
        return (
          <i>{value ? moment(value).format("DD/MM/YYYY") : "chưa cập nhật"}</i>
        );
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
                {feedbackChild.find((o) => o.type === type)?.text.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, { dataQuestion }) => (
        <Space size="middle">
          <Tooltip placement="top" title="Chỉnh sửa">
            <Button
              onClick={() => {
                setIsOpen(true);
                setIsEdit(true);
                dispatch(setQuestionInfo(dataQuestion));
              }}
            >
              <EditOutlined />
            </Button>
          </Tooltip>

          <Popconfirm
            placement="topRight"
            title="Bạn có chắc bạn muốn xóa mục này không?"
            onConfirm={() => {
              hanldeUpdateStatus(-1, text);
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

  useEffect(() => {
    loadCategorys(TTCSconfig.STATUS_PUBLIC);
    loadCourses(TTCSconfig.STATUS_PUBLIC);
  }, []);

  // useEffect(() => {
  //     handleLoadFeedbacks(page*10 - 10, 10)
  // }, [page]);

  useEffect(() => {
    setPage(1);
  }, [idCourse, type]);

  useEffect(() => {
    if (type[0] || idCourse) {
      handleChangeTypeAndCourse(
        type || [],
        idCourse || "",
        page * TTCSconfig.LIMIT - TTCSconfig.LIMIT,
        TTCSconfig.LIMIT
      );
    } else {
      handleLoadFeedbacks(
        page * TTCSconfig.LIMIT - TTCSconfig.LIMIT,
        TTCSconfig.LIMIT
      );
    }
  }, [idCourse, type, page]);

  const handleLoadFeedbacks = async (skip?: number, limit?: number) => {
    try {
      const actionResult = await dispatch(
        requestLoadFeedbacks({ skip, limit })
      );
      unwrapResult(actionResult);
    } catch (error) {
      notification.error({
        message: "không tải được danh sách feedback",
        duration: 1.5,
      });
    }
  };

  const loadCourses = async (status: number) => {
    try {
      const res = await apiLoadCourses({ status });
      setDataCourse(res.data.data.map((o: any) => new Course(o)));
    } catch (error) {
      notification.error({
        message: "không tải được danh sach danh mục",
      });
    }
  };

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

  const handleChangeCategoy = async (value: string) => {
    const categoryInfo = categoryStates.categorys.find((o) => o.id === value);
    dispatch(setCategoryInfo(categoryInfo));
    try {
      const actionResult = await dispatch(
        requestLoadByIdTagAndCategory({
          idCategory: categoryInfo?.id || "",
          status: TTCSconfig.STATUS_PUBLIC,
        })
      );
      unwrapResult(actionResult);
    } catch (error) {
      notification.error({
        message: "không tải được danh sách khóa học",
      });
    }
  };

  const handleChangeTypeAndCourse = async (
    type: string[],
    idCourse: string,
    skip?: number,
    limit?: number
  ) => {
    try {
      if (type[0] || idCourse) {
        const actionResult = await dispatch(
          requestLoadFeedbacksByTypeOrCourse({
            type,
            idCourse,
            limit,
            skip,
          })
        );
        unwrapResult(actionResult);
      }
    } catch (error) {
      notification.error({
        message: "không tải được danh sách phản hồi",
      });
    }
  };

  const hanldeUpdateStatus = async (updateStatus: number, feedback: any) => {
    const res = await apiUpdateFeedback({
      ...feedback,
      status: updateStatus,
    });
  };

  const handleUpdatePraticeForTopic = async (question: Question) => {
    try {
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <label>chọn danh mục : </label>
      <Select
        // defaultValue={provinceData[0]}
        placeholder={"Chọn danh mục"}
        value={categoryStates.categoryInfo?.id}
        style={{ width: 150, marginLeft: "10px" }}
        onChange={handleChangeCategoy}
        options={categoryStates.categorys.map((category) => ({
          value: category.id || "",
          label: category.name,
        }))}
      />
      <label style={{ marginLeft: "20px" }}>chọn khóa học : </label>
      <Select
        style={{ width: 150, marginLeft: "10px", marginBottom: "20px" }}
        placeholder={"Chọn khóa học"}
        onChange={(value) => {
          setIdCourse(value);
        }}
        options={
          courses[0]
            ? courses.map((courses) => ({
                value: courses.id || "",
                label: courses.courseName,
              }))
            : []
        }
      />
      <label style={{ marginLeft: "20px" }}>Chọn loại phản hồi: </label>
      <Select
        mode="multiple"
        placeholder={"Bộ lọc"}
        style={{ width: 400, marginLeft: "10px" }}
        onChange={(value) => {
          setType(value);
        }}
        options={feedbackChild.map((feedback) => ({
          value: feedback.type,
          label: feedback.text,
        }))}
        listHeight={128}
      />

      <ModalCreateAndUpdateQuestion
        isEdit={isEdit}
        isOpen={isOpen}
        question={new Question(questionStates.questionInfo)}
        setIsOpen={setIsOpen}
        handleUpdatePraticeForTopic={handleUpdatePraticeForTopic}
        key={questionStates?.questionInfo?.id || ""}
      />

      <Table
        columns={columns}
        dataSource={feedbackStates.feedbacks?.map((feedback, index) => ({
          id: feedback.id,
          key: index,
          name: feedback.dataUser?.name || "",
          status: feedback.status,
          content: feedback.content,
          idCourse: feedback.idCourse || "",
          date: feedback.createDate || null,
          type: feedback.type,
          dataQuestion: feedback.dataQuestion || null,
          idQuestion: feedback.idQuestion || "",
          idUser: feedback.idUser || "",
        }))}
        pagination={{
          total: feedbackStates.count,
          pageSize: TTCSconfig.PAGE_SIZE,
          current: page,
          onChange: (page) => {
            setPage(page);
          },
        }}
      />
    </>
  );
};

export default Feedback;
