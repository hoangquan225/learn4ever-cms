import { MailOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/chatbot",
  label: "Chat",
  icon: <MailOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
