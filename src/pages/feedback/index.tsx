import React, { useState } from "react";
import { Select, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  key: string;
  name: string;
  status: number;
  content: string;
  date: number;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
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
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
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
        <a>Xem</a>
        <a>Xóa</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    status: 32,
    content: "New York No. 1 Lake Park",
    date: 25,
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "John Brown",
    status: 32,
    content: "New York No. 1 Lake Park",
    date: 23,
    tags: ["nice", "developer"],
  },
  {
    key: "3",
    name: "John Brown",
    status: 32,
    content: "New York No. 1 Lake Park",
    date: 23,
    tags: ["nice", "developer"],
  },
];

const provinceData = ["Lop1", "Lop2"];
const cityData = {
  Lop1: ["Toan", "Van", "Anh"],
  Lop2: ["Ly", "Hoa", "Sinh"],
};

type CityName = keyof typeof cityData;

const Feedback = () => {
  const [cities, setCities] = useState(cityData[provinceData[0] as CityName]);
  const [secondCity, setSecondCity] = useState(
    cityData[provinceData[0] as CityName][0]
  );

  const handleProvinceChange = (value: CityName) => {
    setCities(cityData[value]);
    setSecondCity(cityData[value][0]);
  };

  const onSecondCityChange = (value: CityName) => {
    setSecondCity(value);
  };

  // console.log(typeof provinceData[0]);

  return (
    <>
      <Select
        // defaultValue={provinceData[0]}
        placeholder={'Chọn danh mục'}
        style={{ width: 200, marginBottom: "20px" }}
        onChange={handleProvinceChange}
        options={provinceData.map((province) => ({
          label: province,
          value: province,
        }))}
      />
      <Select
        style={{ width: 200, marginBottom: "20px",  marginLeft: "10px"  }}
        // value={secondCity}
        placeholder={'Chọn khóa học'}
        onChange={onSecondCityChange}
        options={cities.map((city) => ({ label: city, value: city }))}
      />
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default Feedback;
