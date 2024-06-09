import { ArrowDownOutlined, ArrowUpOutlined, CarryOutOutlined, CheckOutlined, FormOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, notification, Row, Select, Space, Statistic, Switch, Tree, TreeDataNode, Typography } from "antd";
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
import { requestLoadStatistic, statisticState } from "./statisticSlice";
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
import { STATUSES } from "../../utils/contraint";

const cx = classNames.bind(styles);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const treeData: TreeDataNode[] = [
  {
    title: 'parent 1',
    key: '0-0',
    icon: <CarryOutOutlined />,
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        icon: <CarryOutOutlined />
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        icon: <CarryOutOutlined />,
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        icon: <CarryOutOutlined />
      },
    ],
  },
  {
    title: 'parent 2',
    key: '0-1',
    icon: <CarryOutOutlined />,
    children: [
      {
        title: 'parent 2-0',
        key: '0-1-0',
        icon: <CarryOutOutlined />,
      },
    ],
  },
];


const StatisticPage = () => {
  const dispatch = useAppDispatch()
  const statisticStates = useAppSelector(statisticState)
  const [startTime, setStartTime] = useState<moment.Moment | null>(moment())
  const [endTime, setEndTime] = useState<moment.Moment | null>(moment())
  const [showLine, setShowLine] = useState<boolean>(true);
  const [showLeafIcon, setShowLeafIcon] = useState<React.ReactNode>(true);

  const { RangePicker } = DatePicker;

  useEffect(() => {
    handleLoadStatistic(startTime?.startOf('month').valueOf())
  }, [])

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

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    console.log('selected', selectedKeys, info);
    if (info.node.children) {
      console.log('This is a parent node');
    } else {
      console.log('This is a child node');
    }
  };

  return <div className={cx('statistic')}>
    <div>
      <Typography.Title level={4}>Thống kê người dùng:</Typography.Title>

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
          Check
        </button>
      </Space>

      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Lượt đăng kí"
              value={statisticStates.numResult?.numRegiter}
              valueStyle={{ color: datasetLabel['numRegiter'].color }}
              prefix={<BiUserCheck />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Lượt truy cập"
              value={statisticStates.numResult?.numLogin}
              valueStyle={{ color: datasetLabel['numLogin'].color }}
              prefix={<ImAccessibility />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
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
    </div>

    <div style={{borderTop: "1px solid"}}>
      <Typography.Title level={4}>Thống kê luyện tập:</Typography.Title>
      <Space direction="horizontal" style={{ marginBottom: 20 }}>
        <Space>
          <label>Từ ngày - Đến ngày</label>
          <RangePicker />
        </Space>
        <Space size="small">
          <label style={{ marginLeft: "20px" }}>Chọn trạng thái:</label>
          <Select
            placeholder={"Bộ lọc"}
            style={{ width: 150, marginLeft: "10px" }}
            defaultValue={TTCSconfig.STATUS_PUBLIC}
            options={STATUSES}
            onChange={(value) => {
            }}
          />
        </Space>
      </Space>
      <div>
      <button className={cx("Button")}>
          Thống kê
        </button>
      </div>
      <div>
        <Tree
          showLine={true}
          defaultExpandedKeys={['0-0-0']}
          onSelect={onSelect}
          treeData={treeData}
        />
      </div>
    </div>
  </div>
};

export default StatisticPage;
