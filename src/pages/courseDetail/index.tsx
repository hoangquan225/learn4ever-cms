import {
  CaretRightOutlined, FileOutlined,
  FolderOutlined
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
import _ from "lodash";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { apiOrderTopic } from "../../api/topicApi";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import TTCSconfig from "../../submodule/common/config";
import { Topic } from "../../submodule/models/topic";
import styles from "./courseDetail.module.scss";
import { LessonCourse } from "./FCLessonDetail";
import { requestLoadTopicByCourse, requestLoadTopicById, setDataTopic, topicState } from "./topicSlice";

const cx = classNames.bind(styles);

const CourseDetail = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const topicStates = useAppSelector(topicState);
  const [type, setType] = useState<number>(1);
  const [topicParentList, setTopicParentList] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | string[]>([]);
  const [indexActive, setIndexActive] = useState<number>();
  const [indexActiveDataChild, setIndexActiveDataChild] = useState<string>();
  const [isMenu, setIsMenu] = useState<boolean>(false);

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
      disabled: isMenu
    },
    {
      label: "Tạo tiết học",
      key: "1",
      disabled: !isMenu
    },
    {
      label: "Tạo bài tập",
      key: "2",
      disabled: !isMenu
    },
  ];

  useEffect(() => {
    // call api get topic by id
    loadTopicsByCourse(params.slug || '', type);
    dispatch(setDataTopic(null))
  }, [params.slug, type]);

  useEffect(() => {
    // sắp xếp
    const sortTopics = _.sortBy(topicStates.topics, [(o) => {
      return o.index;
    }], ["esc"]
    );
    setTopicParentList(sortTopics);
  }, [topicStates.topics]);

  const loadTopicsByCourse = async (
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
  };

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
    if(topicChild?.length) {
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
                Toán - 1
              </div>
            </Col>
            <Col span={4}>
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <a onClick={(e) => { 
                  setIsMenu(false) 
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
                                              onClick={() => {
                                                setIndexActive(i)
                                                setIndexActiveDataChild(undefined)
                                                dispatch(setDataTopic(topic))
                                              }}
                                            >{topic.name}</Col>
                                            <Col span={4}>
                                              <Dropdown
                                                menu={{ items }}
                                                trigger={['click']}
                                                placement="bottomRight"
                                              >
                                                <a onClick={(e) => { 
                                                  setIsMenu(true) 
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
                                                    backgroundColor: indexActiveDataChild === `${i}:${index}` ? '#caf0ff' : ''
                                                  }}
                                                  onClick={async () => {
                                                    setIndexActive(undefined)
                                                    setIndexActiveDataChild(`${i}:${index}`)
                                                    try {
                                                      const requestResult = await dispatch(requestLoadTopicById({id : topicChild?.id || ''}))
                                                      unwrapResult(requestResult)
                                                    } catch (error) {
                                                      message.error('không load được, lỗi server')
                                                    }
                                                  }}
                                                >
                                                  <Col span={4} style={{ marginLeft: "8px" }}>
                                                    <FileOutlined />
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
          {topicStates.dataTopic && <LessonCourse />}
        </Col>
      </Row >
    </div >
  );
};

export default CourseDetail;
