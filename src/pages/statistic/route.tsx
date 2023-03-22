import { BarChartOutlined } from "@ant-design/icons";
import { lazy } from "react";

const route = {
  path: "/statistic",
  label: "Thống kê",
  icon: <BarChartOutlined />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;
