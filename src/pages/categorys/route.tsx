import { FileOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/CATEGORY",
  label: "Danh mục",
  icon: <FileOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
