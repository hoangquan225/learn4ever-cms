import { ArrowDownOutlined, ArrowUpOutlined, CarryOutOutlined, CheckOutlined, FormOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, notification, Row, Select, Space, Statistic, Switch, Tabs, Tree, TreeDataNode, Typography } from "antd";
import { Bar } from 'react-chartjs-2';
import classNames from "classnames/bind";
import styles from "./statistic.module.scss"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { requestGetCategoryStatistic, requestLoadStatistic, requestTopicProgressStatistic, statisticState } from "./statisticSlice";
import { useEffect, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import locale from 'antd/es/date-picker/locale/vi_VN';
import moment from "moment";
import DatePicker from "../../components/DatePicker";
import 'moment/locale/vi';
import {BiUserCheck} from 'react-icons/bi'
import {ImAccessibility} from 'react-icons/im'
import {MdFeedback} from 'react-icons/md'
import TTCSconfig from "../../submodule/common/config";
import TabPane from "antd/es/tabs/TabPane";

const cx = classNames.bind(styles);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const STATUSES_CATEGORY = [
  {
    value: -2,
    label: "Tất cả",
  },
  {
    value: TTCSconfig.STATUS_PUBLIC,
    label: "công khai",
  },
  {
    value: TTCSconfig.STATUS_PRIVATE,
    label: "riêng tư",
  }
];

const datasetLabel = {
  ['numRegiter']: {
    label: 'Lượt đăng kí',
    color: '#3F51B5'
  },
  ['numLogin']: {
    label: 'Lượt đăng nhập',
    color: '#F44336'
  },
  ['numFeedback']: {
    label: 'Lượt đánh giá',
    color: '#9C27B0'
  }
}

const StatisticPage = () => {
  const dispatch = useAppDispatch()
  const statisticStates = useAppSelector(statisticState)
  const categories = statisticStates.categories;
  
  const [startTime, setStartTime] = useState<moment.Moment | null>(moment())
  const [endTime, setEndTime] = useState<moment.Moment | null>(moment())
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [status, setStatus] = useState(1);
  const [dateTopicProgress, setDateTopicProgress] = useState<any>([null, null]);
  const [courseId, setCourseId] = useState<any>();
  const [categoryId, setCategoryId] = useState<any>();

  const { RangePicker } = DatePicker;

  useEffect(() => {
    handleLoadStatistic(startTime?.startOf('month').valueOf())
  }, [])

  useEffect(() => {
    handleGetCategoryStatistic(status)
  }, [status])

  const handleDateChange = (value) => {
    setDateTopicProgress(value);
  };

  useEffect(() => {
    setTreeData(categories.map(e => ({
      title: e?.name,
      key: e?.id,
      icon: <CarryOutOutlined />,
      children: e.courses.map(course => ({
        title: course.courseName,
        key: course.id,
        icon: <CarryOutOutlined />,
      }))
    })))
  }, [categories])

  const handleLoadStatistic = async (startTime?: number, endTime?: number) => {
    try {
      const res = await dispatch(requestLoadStatistic({
        endTime,
        startTime
      }))
      unwrapResult(res)
    } catch (error) {
      notification.error({
        message: 'không tải được dữ liệu',
        duration: 1.5
      })
    }
  }

  const handleGetCategoryStatistic = async (status: number) => {
    try {
      const res = await dispatch(requestGetCategoryStatistic({
        status
      }))
      unwrapResult(res)
    } catch (error) {
      notification.error({
        message: 'không tải được dữ liệu',
        duration: 1.5
      })
    }
  }

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    console.log( selectedKeys, info);
    if (info.node.children) {
      if(selectedKeys[0]) {
        setCategoryId(selectedKeys[0])
        setCourseId(null)
      }
    } else {
      if(selectedKeys[0]) {
        setCourseId(selectedKeys[0])
        setCategoryId(null)
      }
    }
  };

  const handleSubmit = async () => {
    if(!courseId && !categoryId) {
      return message.error("Vui lòng chọn danh mục trên cây danh mục")
    }

    const [start, end] = dateTopicProgress;
    try {
      const res = await dispatch(requestTopicProgressStatistic({
        startTime: start?.valueOf(), 
        endTime: end?.valueOf(),
        idCourse: courseId,
        idCategory: categoryId
      }))
      unwrapResult(res)
    } catch (error) {
      notification.error({
        message: 'không tải được dữ liệu',
        duration: 1.5
      })
    }
  };

  return <div className={cx('statistic')}>
    <Tabs defaultActiveKey="1" centered>
      <TabPane tab="Thống kê người dùng" key="1">
        {/* <Typography.Title level={4}>Thống kê người dùng:</Typography.Title> */}
        <Space direction="horizontal" style={{ marginBottom: 20 }}>
          <label>Từ ngày</label>
          <DatePicker format="MM/YYYY" onChange={(value) => {
            setStartTime(value)
          }} value={startTime} picker="month" locale={locale}/>

          <label>Đến ngày</label>
          <DatePicker format="MM/YYYY" onChange={(value) => {
            setEndTime(value)
          }} value = {endTime} picker="month" locale={locale}/>

          <button className={cx("Button")} onClick={() => {
            if(!startTime){
              message.error("vui lòng chọn ngày bắt đầu")
              return
            }
            handleLoadStatistic(startTime?.startOf("month").valueOf(), endTime?.endOf("month").valueOf())
          }}>
            Thống kê
          </button>
        </Space>

        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={false} style={{boxShadow: "1px 10px 10px rgba(0, 0, 0, 0.2)"}}>
              <Statistic
                title="Lượt đăng kí"
                value={statisticStates.numResult?.numRegiter}
                valueStyle={{ color: datasetLabel['numRegiter'].color }}
                prefix={<BiUserCheck />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{boxShadow: "1px 10px 10px rgba(0, 0, 0, 0.2)"}}>
              <Statistic
                title="Lượt truy cập"
                value={statisticStates.numResult?.numLogin}
                valueStyle={{ color: datasetLabel['numLogin'].color }}
                prefix={<ImAccessibility />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{boxShadow: "1px 10px 10px rgba(0, 0, 0, 0.2)"}}>
              <Statistic
                title="Lượt đánh giá"
                value={statisticStates.numResult?.numFeedback}
                valueStyle={{ color: datasetLabel['numFeedback'].color }}
                prefix={<MdFeedback />}
              />
            </Card>
          </Col>
        </Row>

        <div style={{ backgroundColor: '#fff', marginTop: 20 }}>
          <Bar
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Thống kê hàng tháng',
                },
              },
            }}
            data={{
              labels: statisticStates.rangeMonth,
              datasets: statisticStates.statistics.map(statistic => ({
                label: datasetLabel[Object.keys(statistic)[0] as keyof typeof datasetLabel].label,
                data: Object.values(statistic)[0],
                backgroundColor: datasetLabel[Object.keys(statistic)[0] as keyof typeof datasetLabel].color,
              }))
            }}
          />
        </div>
      </TabPane>

      
      <TabPane tab="Thống kê luyện tập" key="2">
        {/* <Typography.Title level={4}>Thống kê luyện tập:</Typography.Title> */}
        <Space direction="horizontal" style={{ marginBottom: 20 }}>
          <Space>
            <label>Từ ngày - Đến ngày</label>
            <RangePicker onChange={handleDateChange}/>
          </Space>
          <Space size="small">
            <label style={{ marginLeft: "20px" }}>Chọn trạng thái:</label>
            <Select
              placeholder={"Bộ lọc"}
              style={{ width: 150, marginLeft: "10px" }}
              defaultValue={TTCSconfig.STATUS_PUBLIC}
              options={STATUSES_CATEGORY}
              onChange={(value) => {
                setStatus(value)
              }}
            />
          </Space>
          <Space size="small">
            <button className={cx("Button")} onClick={() => handleSubmit()}>
                Thống kê
            </button>
          </Space>
        </Space>
        <Row gutter={16}>
          <Col span={4}>
            <Tree
              showLine={true}
              defaultExpandedKeys={['0-0-0']}
              onSelect={onSelect}
              treeData={treeData}
            />
          </Col>
          <Col span={20}>
            <div style={{ backgroundColor: '#fff', marginTop: 20 }}>
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Thống kê hàng tháng',
                    },
                  },
                }}
                data={{
                  labels: Object.keys(statisticStates.dataStatisticTopicProgress),
                  datasets: [
                    {
                      label: 'Số lượng học viên',
                      data: Object.values(statisticStates.dataStatisticTopicProgress),
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ]
                }}
              />
            </div>
          </Col>
        </Row>
      </TabPane>
    </Tabs>
  </div>
};

export default StatisticPage;
