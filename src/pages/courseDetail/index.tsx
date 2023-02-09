import {
  CaretRightOutlined, FileOutlined,
  FolderOutlined,
  LaptopOutlined,
  ReadOutlined,
  YoutubeOutlined
} from "@ant-design/icons";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  Col,
  Collapse,
  Dropdown, MenuProps,
  message,
  notification,
  Row,
  Select,
  Space
} from "antd";
import classNames from "classnames/bind";
import { unwatchFile } from "fs";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { apiOrderTopic } from "../../api/topicApi";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import TTCSconfig from "../../submodule/common/config";
import { Topic } from "../../submodule/models/topic";
import { courseState, requestLoadCourseById } from "../courses/courseSlice";
import styles from "./courseDetail.module.scss";
import { LessonCourse } from "./FCLessonDetail";
import { requestLoadTopicByCourse, requestLoadTopicById, setDataTopic, topicState } from "./topicSlice";

const cx = classNames.bind(styles);

const CourseDetail = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const topicStates = useAppSelector(topicState);
  const courseStates = useAppSelector(courseState)
  const [type, setType] = useState<number>(1);
  const [topicParentList, setTopicParentList] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | string[]>([]);
  const [indexActive, setIndexActive] = useState<number>();
  const [indexActiveDataChild, setIndexActiveDataChild] = useState<string>();
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false)
  const topicParent = useRef<any>()


  const statusTopic = [
    {
      value: 1,
      label: "Chương trình học",
    },
    {
      value: 2,
      label: "Đề kiểm tra",
    },
  ];

  const items: MenuProps["items"] = [
    {
      label: "Tạo chương học",
      key: "0",
    },
    {
      label: "Tạo tiết học",
      key: "1",
    },
    {
      label: "Tạo bài tập",
      key: "2",
    },
    {
      label: "Tạo tài liệu",
      key: "3",
    },
    {
      label: 'Tạo đề kiểm tra', 
      key: "4"
    }
  ];

  useEffect(() => {
    loadCourseById(params.slug || '')
  }, [])

  useEffect(() => {
    // call api get topic by id
    loadTopicsByCourse(params.slug || '', type);
    dispatch(setDataTopic(new Topic(null)))
  }, [params.slug, type]);

  useEffect(() => {
    // sắp xếp
    const sortTopics = _.sortBy(topicStates.topics, [(o) => {
      return o.index;
    }], ["esc"]
    );
    setTopicParentList(sortTopics);
  }, [topicStates.topics]);

  const loadTopicsByCourse = useCallback(async (
    idCourse: string,
    type: number,
    parentId?: string
  ) => {
    try {
      const result = await dispatch(
        requestLoadTopicByCourse({ idCourse, type, parentId })
      );
      unwrapResult(result);
    } catch (error) {
      notification.error({
        message: "server error!!",
        duration: 1.5,
      });
    }
  }, []);

  const loadCourseById = async (params: string) => {
    try {
      const res = await dispatch(requestLoadCourseById({ id: params }))
      unwrapResult(res)
    } catch (error) {
      notification.error({
        message: "server error!!",
        duration: 1.5,
      });
    }
  }

  const handleDrapEnd = async (result: any) => {
    const destination = result.destination;
    const source = result.source;
    let dataSource = topicParentList[source.index];
    topicParentList.splice(source.index, 1);
    topicParentList.splice(destination.index, 0, dataSource);

    const dataIndex = topicParentList?.map((e, i) => ({
      id: e.id || "",
      index: i + 1,
    }));

    try {
      const res = await apiOrderTopic({ indexRange: dataIndex });
      loadTopicsByCourse(params.slug || '', type);
    } catch (error) {
      notification.error({
        message: "lỗi server",
        duration: 1.5,
      });
    }
  };

  const handleDrapEndTopicChild = async (result: any) => {
    const idTopicChild = result.draggableId;
    const topicParent = topicParentList?.find(topic => topic?.topicChildData?.find(o => o?.id === idTopicChild))
    let topicChild = _.sortBy(topicParent?.topicChildData, [(o) => {
      return o.index;
    }], ["esc"]
    )
    const destination = result.destination;
    const source = result.source;
    if (topicChild?.length) {
      const topicChildCopy = [...topicChild]
      const dataSource = topicChildCopy[source.index];
      topicChildCopy?.splice(source.index, 1);
      topicChildCopy?.splice(destination.index, 0, dataSource);
      topicChild = topicChildCopy
    }

    const dataIndex = topicChild?.map((e, i) => ({
      id: e.id || "",
      index: i + 1,
    }));

    try {
      const res = await apiOrderTopic({ indexRange: dataIndex || [] });
      loadTopicsByCourse(params.slug || '', type);
    } catch (error) {
      notification.error({
        message: "lỗi server",
        duration: 1.5,
      });
    }

  };

  const onClickDropDown = (props: { key: string, parent?: Topic, index?: number }) => {
    const { key, parent, index } = props
    setIndexActiveDataChild(`${index}`)
    setIndexActive(undefined)
    let topicType = 0
    if (key === '1') {
      topicType = TTCSconfig.TYPE_TOPIC_VIDEO
      // dispatch(setDataTopic(new Topic({
      //   type: TTCSconfig.TYPE_LESSON,
      //   topicType: TTCSconfig.TYPE_TOPIC_VIDEO,
      //   parentId: parent?.id,
      //   idCourse: courseStates.courseInfo?.id,
      //   index: (parent?.topicChildData.length || 0) + 1
      // })))
      // setIsOpenEdit(true)
    } else if (key === '2') {
      topicType = TTCSconfig.TYPE_TOPIC_PRATICE
      // dispatch(setDataTopic(new Topic({
      //   type: TTCSconfig.TYPE_LESSON,
      //   topicType: TTCSconfig.TYPE_TOPIC_PRATICE,
      //   parentId: parent?.id,
      //   idCourse: courseStates.courseInfo?.id,
      //   index: (parent?.topicChildData.length || 0) + 1
      // })))
      // setIsOpenEdit(true)
    }else if (key === '3') {
      topicType = TTCSconfig.TYPE_TOPIC_DOCUMENT
    } else if (key === '4') {
      topicType = TTCSconfig.TYPE_TOPIC_EXAM
    } else {
      topicType = TTCSconfig.TYPE_TOPIC_PARENT
    }
    dispatch(setDataTopic(new Topic({
      type,
      topicType,
      parentId: parent?.id || null,
      idCourse: courseStates.courseInfo?.id,
      index: key === '0' ? (topicStates.topics.length || 0) + 1 : (parent?.topicChildData.length || 0) + 1
    })))
    setIsOpenEdit(true)
  };

  const handleClickTopicParent = (topic: Topic, index: number) => {
    setIndexActive(index)
    setIndexActiveDataChild(undefined)
    dispatch(setDataTopic(topic))
    setIsOpenEdit(true)
  }

  const handleClickTopicChild = async (topicChild: Topic, indexActive: string) => {
    setIndexActive(undefined)
    setIndexActiveDataChild(indexActive)
    setIsOpenEdit(true)
    try {
      const requestResult = await dispatch(requestLoadTopicById({ id: topicChild?.id || '' }))
      unwrapResult(requestResult)
    } catch (error) {
      message.error('không load được, lỗi server')
    }
  }

  return (
    <div>
      <Row style={{ marginBottom: "20px" }}>
        <Space size="small">
          <label style={{ marginLeft: "20px" }}>Chọn phương thức:</label>
          <Select
            placeholder={"Bộ lọc"}
            style={{ width: 200, marginLeft: "10px" }}
            defaultValue={TTCSconfig.STATUS_PUBLIC}
            options={statusTopic}
            onChange={(value) => {
              setType(value);
              setIsOpenEdit(false)
              setIndexActive(undefined)
              setIndexActiveDataChild(undefined)
            }}
          />
        </Space>
      </Row>

      <Row gutter={24}>
        <Col span={6}>
          <Row style={{ borderBottom: "1px solid #cdcdcd", padding: "20px 0", alignItems: "center  " }}>
            <Col span={4} style={{ textAlign: "center" }}><FolderOutlined /></Col>
            <Col span={16}>
              <div style={{
                flexGrow: "1",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "18px"
              }}
              >
                {courseStates.courseInfo?.courseName}
              </div>
            </Col>
            <Col span={4}>
              <Dropdown
                menu={{ items: items?.filter(o => o?.key === '0'), onClick: onClickDropDown }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <a onClick={(e) => {
                  return e.preventDefault()
                }}>
                  <button className={cx("dropDown__button")}></button>
                </a>
              </Dropdown>
            </Col>
          </Row>

          <Row>
            <div style={{ height: '80vh', overflow: 'auto', width: "100%" }}>
              <DragDropContext onDragEnd={handleDrapEnd}>
                <Droppable droppableId="listTopic">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <Collapse
                        activeKey={activeTopic}
                        onChange={(key) => {
                          setActiveTopic(key)
                        }}
                        expandIconPosition="end"
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} style={{
                          alignItems: 'center'
                        }} />}
                        collapsible="icon"
                      >
                        {topicParentList?.length > 0 && topicParentList?.map((topic, i) => {
                          return (
                            <Collapse.Panel
                              style={{
                                alignItems: 'center',
                                backgroundColor: i === indexActive ? '#caf0ff' : ''
                              }}
                              header={
                                (
                                  <Draggable
                                    key={topic?.id}
                                    draggableId={topic?.id || ""}
                                    index={i}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <div
                                          id={topic?.id}
                                          key={i}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Col span={20}
                                              onClick={() => handleClickTopicParent(topic, i)}
                                            >{topic.name}</Col>
                                            <Col span={4}>
                                              <Dropdown
                                                menu={{ items: type === TTCSconfig.TYPE_EXAM ? items.filter(o => o?.key === '4') : items.filter(o => o?.key !== '0' && o?.key !== '4'), onClick: ({ key }) => onClickDropDown({ key, parent: topic, index: i }) }}
                                                trigger={['click']}
                                                placement="bottomRight"
                                              >
                                                <a onClick={(e) => {
                                                  return e.preventDefault()
                                                }}>
                                                  <button className={cx("dropDown__button")}></button>
                                                </a>
                                              </Dropdown>
                                            </Col>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              } key={i}
                            >
                              <DragDropContext onDragEnd={handleDrapEndTopicChild}>
                                <Droppable droppableId="listTopicChild">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                    >
                                      {
                                        _.sortBy(topic.topicChildData, [(o) => {
                                          return o.index;
                                        }], ["esc"]
                                        )
                                          .map((topicChild, index) => (
                                            <Draggable
                                              key={topicChild?.id}
                                              draggableId={topicChild?.id || ""}
                                              index={index}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <Row
                                                    style={{
                                                      alignItems: "center",
                                                      padding: "10px 0",
                                                      borderBottom: "1px solid #cdcdcd",
                                                      marginLeft: "20px",
                                                      cursor: "pointer",
                                                      backgroundColor: indexActiveDataChild === `${i}:${index}` ? '#caf0ff' : (topicChild.status === TTCSconfig.STATUS_PRIVATE ? "#fbffca" : "")
                                                    }}
                                                    onClick={() => handleClickTopicChild(topicChild, `${i}:${index}`)}
                                                  >
                                                    <Col span={4} style={{ marginLeft: "8px" }}>
                                                      {
                                                        type === TTCSconfig.TYPE_EXAM ? <LaptopOutlined /> :
                                                        (topicChild.topicType === TTCSconfig.TYPE_TOPIC_VIDEO ? (
                                                          <YoutubeOutlined />
                                                        ) : ( topicChild.topicType === TTCSconfig.TYPE_TOPIC_PRATICE
                                                          ? <LaptopOutlined /> : <ReadOutlined />
                                                        ))
                                                      }
                                                    </Col>
                                                    <Col span={18}>{topicChild.name}</Col>
                                                  </Row>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))
                                      }
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </Collapse.Panel>
                          );
                        })}
                      </Collapse>
                    </div>
                  )
                  }
                </Droppable>
              </DragDropContext>
            </div>
          </Row>
        </Col>

        <Col span={18} style={{ backgroundColor: "#f7f7f7" }}>
          {isOpenEdit && <LessonCourse onloadTopic={loadTopicsByCourse} type={type} setIndexActiveDataChild={setIndexActiveDataChild} setIndexActive={setIndexActive}/>}
        </Col>
      </Row >
    </div >
  );
};

export default CourseDetail;
