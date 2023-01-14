import {
  Col,
  Dropdown,
  Form,
  Input,
  MenuProps,
  notification,
  Row,
  Select,
  Space,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import { apiGetTopicsByCourse, apiOrderTopic } from "../../api/topicApi";
import TTCSconfig from "../../submodule/common/config";
import styles from "./courseDetail.module.scss";
import classNames from "classnames/bind";
import {
  ClockCircleOutlined,
  DownOutlined,
  FileOutlined,
  FolderOutlined,
  RightOutlined,
} from "@ant-design/icons";
import TinymceEditor from "../../components/TinymceEditor";
import { STATUSES } from "../../utils/contraint";
import { Topic } from "../../submodule/models/topic";
import _ from "lodash"

const cx = classNames.bind(styles);

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
];

const CourseDetail = () => {
  const params = useParams();
  const [dataTopicParent, setDataTopicParent] = useState<any[]>([]);
  const [type, setType] = useState<number>(1);
  const [dataTopicChild, setDataTopicChild] = useState<Topic[]>([]);
  const [indexOpenTopic, setIndexOpenTopic] = useState<number[]>([]);

  const [dataTopicParentList, setdataTopicParentList] = useState<Topic[]>([])


  useEffect(() => {
    console.log(params.slug);
    // call api get topic by id
    loadTopicsByCourse(params.slug, type);
  }, [params.slug, type]);

  useEffect(() => {
    const sortTopics = _.sortBy(dataTopicParent, [(o) => {
      return o.index
    }], ['esc'])
    console.log(sortTopics);
    setdataTopicParentList(sortTopics);
  }, [dataTopicParent]);

  console.log(dataTopicParentList);
  
  const loadTopicsByCourse = async (
    idCourse: string[],
    type: number,
    parentId?: string
  ) => {
    try {
      const res = await apiGetTopicsByCourse({
        idCourse,
        type,
        parentId,
      });
      
      setDataTopicParent(res.data.data.map((o: any[]) => new Topic(o)));
    } catch (error) {
      notification.error({
        message: "không tải được danh sách topic",
      });
    }
  };

  const handleLoadTopicChild = async (
    idCourse: any,
    type: number,
    parentId?: string
  ) => {
    try {
      const res = await apiGetTopicsByCourse({
        idCourse,
        type,
        parentId,
      });
      setDataTopicChild(res.data.data.map((o: any[]) => new Topic(o)));
    } catch (error) {
      notification.error({
        message: "không tải được danh sách topic",
      });
    }
  };


const handleDrapEnd = async (result: any) => {
  const destination = result.destination;
  const source = result.source;
  let dataSource = dataTopicParentList[source.index];
  dataTopicParentList.splice(source.index, 1);
  dataTopicParentList.splice(destination.index, 0, dataSource)
  
  const dataIndex = dataTopicParentList.map((e, i) => ({
    id: e.id || "",
    index: i + 1,
  }));
  console.log(dataTopicParentList);
  console.log(dataIndex);

  try {
    const res = await apiOrderTopic({indexRange: dataIndex})
    loadTopicsByCourse(params.slug, type)
  } catch (error) {
    notification.error({
      message: "lỗi server",
      duration: 1.5
    })
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
          <Row style={{borderBottom: "1px solid #cdcdcd", padding: "20px 0", alignItems: "center  "}}>
            <Col span={4} style={{textAlign:"center"}}><FolderOutlined /></Col>
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
                  <a onClick={(e) => e.preventDefault()}>
                    <button className={cx("dropDown__button")}></button>
                  </a>
                </Dropdown>
            </Col>
          </Row>
          
          <Row>
            <div style={{ height: '80vh', overflow: 'auto', width: "100%"}}>
              <DragDropContext onDragEnd={handleDrapEnd}>
                <Droppable droppableId="listTopic">
                  {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {dataTopicParentList?.length
                        ? dataTopicParentList?.map((e, i) => {
                          return (
                            <Draggable
                              key={e?.id}
                              draggableId={e?.id || ""}
                              index={i}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div
                                    id={e?.id}
                                    key={i}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "10px 0",
                                      borderBottom: "1px solid #cdcdcd",
                                    }}
                                  >
                                    <Col span={4} style={{textAlign:"center"}}><FileOutlined /></Col>
                                    <Col span={12} >{e.name}</Col>
                                    <Col 
                                      span={4} 
                                      style={{
                                        textAlign:"center",
                                        width: "30px",
                                        height: "30px",
                                        lineHeight: "2"
                                      }}
                                    >
                                      {true ? <RightOutlined style={{cursor: "pointer"}}/>: <DownOutlined style={{cursor: "pointer"}}/>}
                                    </Col>
                                    <Col span={4}>  
                                      <Dropdown 
                                        menu={{ items }} 
                                        trigger={['click']} 
                                        placement="bottomRight"
                                      >
                                        <a onClick={(e) => e.preventDefault()}>
                                          <button className={cx("dropDown__button")}></button>
                                        </a>
                                      </Dropdown>
                                    </Col>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        }): ""}
                      </div>
                    )
                  }
                </Droppable>
              </DragDropContext>
            </div>
          </Row>
        </Col>

        {/* <Col span={6}>
          <Row
            style={{
              borderBottom: "1px solid #cdcdcd",
              padding: "20px 0",
              alignItems: "center  ",
            }}
          >
            <Col span={4} style={{ textAlign: "center" }}>
              <FolderOutlined />
            </Col>
            <Col span={16}>
              <div
                style={{
                  flexGrow: "1",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "18px",
                }}
              >
                Course Name
              </div>
            </Col>
            <Col span={4}>
              <Dropdown
                menu={{ items }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <button className={cx("dropDown__button")}></button>
                </a>
              </Dropdown>
            </Col>
          </Row>

          <div style={{ height: "80vh", overflow: "auto", width: "100%" }}>
            {dataTopicParent.length ? (
              dataTopicParent.map((o, i) => (
                <>
                  <Row
                    style={{
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #cdcdcd",
                    }}
                  >
                    <Col span={4} style={{ textAlign: "center" }}>
                      <FileOutlined />
                    </Col>
                    <Col span={12}>{o.name}</Col>
                    <Col
                      span={4}
                      style={{
                        textAlign: "center",
                        width: "30px",
                        height: "30px",
                        lineHeight: "2",
                      }}
                    >
                      {indexOpenTopic.find((o) => o === i + 1) ? (
                        <DownOutlined
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const indexPrev = indexOpenTopic.filter(
                              (o) => o !== i + 1
                            );
                            setIndexOpenTopic(indexPrev);
                            handleLoadTopicChild(o.idCourse, type, o._id);
                          }}
                        />
                      ) : (
                        <RightOutlined
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setIndexOpenTopic([...indexOpenTopic, i + 1]);
                            handleLoadTopicChild(o.idCourse, type, o._id);
                          }}
                        />
                      )}
                    </Col>
                    <Col span={4}>
                      <Dropdown
                        menu={{ items }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <a onClick={(e) => e.preventDefault()}>
                          <button className={cx("dropDown__button")}></button>
                        </a>
                      </Dropdown>
                    </Col>
                  </Row>
                  {dataTopicChild?.length > 0 &&
                    dataTopicChild?.map(
                      (dataTopic, ind) =>
                        indexOpenTopic.find((o) => o === i + 1) && (
                          <div>
                            <Row
                              style={{
                                alignItems: "center",
                                padding: "10px 0",
                                borderBottom: "1px solid #cdcdcd",
                                marginLeft: "20px",
                                cursor: 'pointer'
                              }}
                            >
                              <Col span={4} style={{ marginLeft: "8px" }}>
                                <FileOutlined />
                              </Col>
                              <Col span={18}>{dataTopic.name}</Col>
                            </Row>
                          </div>
                        )
                    )}
                </>
              ))
            ) : (
              <></>
            )}
          </div>
        </Col> */}

        <Col span={18} style={{ backgroundColor: "#f7f7f7" }}>
          <Form
            layout="vertical"
            name="register"
            initialValues={{
              status: 1,
            }}
            style={{ marginTop: "20px" }}
          >
            <Row gutter={{ xl: 48, md: 16, xs: 0 }}>
              <Col xl={8} md={8} xs={24}>
                <Form.Item
                  name="name"
                  label="Tên bài"
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
                  name="linkDocument"
                  label="Link bài giảng"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập trường này!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="linkVideo"
                  label="Video URL"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập trường này!",
                    },
                  ]}
                >
                  <Input onChange={() => {}} />
                </Form.Item>

                <Form.Item
                  name="lengthVideo"
                  label="Độ dài Video"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập trường này!",
                    },
                  ]}
                >
                  <Input readOnly suffix={<ClockCircleOutlined />} />
                </Form.Item>
              </Col>

              <Col
                xl={16}
                md={16}
                xs={24}
                style={{ borderRight: "0.1px solid #ccc" }}
              >
                <Form.Item label="Mô tả ngắn">
                  <TinymceEditor
                    id="descriptionShortTopic"
                    key="descriptionShortTopic"
                    // editorRef={descRef}
                    // value={valueEdit?.des ?? ""}
                    heightEditor="250px"
                  />
                </Form.Item>

                <Form.Item label="Mô tả">
                  <TinymceEditor
                    id="descriptionTopic"
                    key="descriptionTopic"
                    // editorRef={descRef}
                    // value={valueEdit?.des ?? ""}
                    heightEditor="250px"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

const TopicDetail = () => {
  return (
    <Droppable droppableId="list">
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          <Draggable
            // key={e?._id}
            draggableId={""}
            index={Math.random()}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Row>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <FileOutlined />
                  </Col>
                  <Col span={12}>test</Col>
                </Row>
              </div>
            )}
          </Draggable>
        </div>
      )}
    </Droppable>
  );
};

export default CourseDetail;
