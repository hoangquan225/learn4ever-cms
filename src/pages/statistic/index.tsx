import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, message, notification, Row, Space, Statistic, Typography } from "antd";
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

const StatisticPage = () => {
  const dispatch = useAppDispatch()
  const statisticStates = useAppSelector(statisticState)
  const [startTime, setStartTime] = useState<moment.Moment | null>(moment())
  const [endTime, setEndTime] = useState<moment.Moment | null>()

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

  return <div className={cx('statistic')}>

    <Typography.Title level={4}>Thống kê :</Typography.Title>

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
};

export default StatisticPage;
