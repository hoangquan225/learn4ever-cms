import { FormOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/course/chi-tiet-khoa-hoc/*",
  label: "Chi tiết khóa học",
  icon: <FormOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
