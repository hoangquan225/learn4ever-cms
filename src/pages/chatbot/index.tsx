import styles from "./chatbot.module.scss";
import classNames from "classnames/bind";
import Sider from "antd/es/layout/Sider";
import { Avatar, Button, Input, Layout, List, Upload, notification } from "antd";
import { Content } from "antd/es/layout/layout";
import { FaLink, FaTelegramPlane } from "react-icons/fa";
import { UploadOutlined } from "@ant-design/icons";
import { apiUploadExcel } from "../../api/uploadApi";
import readXlsxFile from "read-excel-file";
import {  useState } from "react";
import { createQuestionByExcel } from "../../api/question";
import TTCSconfig from "../../submodule/common/config";

const cx = classNames.bind(styles);

const friends = [
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Quan",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Hung",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Son",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Ha",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Tan",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Duy",
  },

  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Quang",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Huy",
  },
  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Truong",
  },

  {
    src: "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg",
    title: "Dang",
  },
];

const messages = [
  {
    desc: "co cong viec gi khong a",
    isMe: true,
  },
  {
    desc: "chinh sua cac bai hoc di nhe",
    isMe: false,
  },
  {
    desc: "xem cac danh gia va cap nhat luon",
    isMe: false,
  },
  {
    desc: "da oke sep",
    isMe: true,
  },
  {
    desc: "co cong viec gi khong a",
    isMe: true,
  },
  {
    desc: "chinh sua cac bai hoc di nhe",
    isMe: false,
  },
  {
    desc: "xem cac danh gia va cap nhat luon",
    isMe: false,
  },
  {
    desc: "da oke sep",
    isMe: true,
  },
];

const ChatBot = () => {
  const [listQuestionInsert, setListQuestionInsert] = useState<any>()

  const handleFileUpload = (file: any) => {
    readXlsxFile(file)
      .then((rows) => {
        const questions = convertToObjectArray(rows);
        setListQuestionInsert(questions);
      })
      .catch((error) => {
        console.error('Lỗi khi đọc tệp Excel:', error);
      });
  };

  const convertToObjectArray = (array: any) => {
    const headers = array[0]; 
    const data = array.slice(1);
    const objectArray = data.map((row) => {
      const obj = {};
      obj["question"] = row[0];
      obj["hint"] = row[1]; 
      obj["answer"] = [];
      for (let i = 2; i < row.length; i++) {
        if (row[i] !== null) {
          obj["answer"].push({ [`answer${i - 2}`]: row[i].toString()});
        }
      }
      return obj;
    });
    return objectArray;
  };

  const uploadQs = async () => {
    try {
      const res = await createQuestionByExcel({ questions: listQuestionInsert, idTopic: "66409ff6d5f81fbcfc207793", isDelete: false});
      if (res.status === TTCSconfig.STATUS_SUCCESS) {
        notification.success({
          message: "Upload thành công",
          duration: 1.5,
        });
      } else {
        notification.success({
          message: "Upload thất bại",
          duration: 1.5,
        });
      }
    } catch (error) {
      console.log(error);
    }
  } 

  return (
    <div className={cx("chatbot")}>
      <Upload
        customRequest={async (options) => {
            const { onSuccess = () => {}, onError = () => {}, file } = options;
            try {
                // const res = await apiUploadExcel(file)
                // onError(res.data);
                handleFileUpload(file)
            } catch (error:any) {
                onError(error);
            }
        }}
        maxCount={1}
        beforeUpload={(file) => {
            // const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            // if (!isJpgOrPng) {
            //     message.error("You can only upload JPG/PNG file!");
            // }
            // const isLt2M = file.size / 1024 / 1024 < 2;
            // if (!isLt2M) {
            //     message.error("Image must smaller than 2MB!");
            // }
            // if (isJpgOrPng && isLt2M) {
            //     return true;
            // } else {
            //     return false;
            // }
        }}
        showUploadList={false}
        accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>

      <Button onClick={uploadQs}>Upload qs</Button>

      <Layout className={cx("chatbot__wrapper")}>
        <Sider collapsedWidth="0" width={320} className={cx("chatbot__sider")}>
          <div className={cx("chatbot__sider--top")}>
            <span className={cx("chatbot__sider--title")}>Chat</span>
            <Input.Search
              placeholder="Tìm kiếm bạn bè"
              style={{ marginBottom: 8 }}
              className={cx("chatbot__sider--search")}
            />
          </div>
          <List
            className={cx("chatbot__friends--list")}
            dataSource={friends}
            renderItem={(item) => (
              <List.Item className={cx("chatbot__friends--item")}>
                <List.Item.Meta
                  className={cx("chatbot__friends--item-meta")}
                  avatar={<Avatar src={item.src} />}
                  title={item.title}
                />
              </List.Item>
            )}
          />
        </Sider>
        <Content className={cx("chatbot__inner")}>
          <div className={cx("chatbot__msg--info")}>
            <img
              src="https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg"
              alt="avatar"
              className={cx("chatbot__msg--info-img")}
            />
            <span className={cx("chatbot__msg--info-name")}>Quan</span>
          </div>
          <List
            className={cx("chatbot__msg--list")}
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                className={cx("chatbot__message", {
                  "chatbot__message--user": message.isMe === true,
                  "chatbot__message--bot": message.isMe === false,
                })}
              >
                <List.Item.Meta
                  // title={item.isMe ? null : item.name}
                  description={message.desc}
                />
              </List.Item>
            )}
            size="large"
            itemLayout="horizontal"
            style={{ overflow: "auto", height: "71vh" }}
          />
          <div className={cx("chatbot__msg--action")}>
            <FaLink className={cx("chatbot__msg--action-icon")} />
            <Input.TextArea
              className={cx("chatbot__msg--input")}
              rows={1}
              placeholder="Aa"
              autoSize={{ minRows: 1, maxRows: 5 }}
              // onPressEnter={handleSendMessage}
              // value={message}
              // onChange={handleChangeMessage}
            />
            <FaTelegramPlane className={cx("chatbot__msg--action-icon")} />
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default ChatBot;
