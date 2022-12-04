import { BulbOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/COURSES",
  label: "Khóa học",
  icon: <BulbOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
