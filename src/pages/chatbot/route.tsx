import { FileOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/chatbot",
  label: "Chat bot",
  icon: <FileOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
