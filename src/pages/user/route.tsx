import { FaUser } from "react-icons/fa";
import { lazy } from "react";

const route = {
  path: "/user",
  label: "Người dùng",
  icon: <FaUser />,
  exact: true,
  public: true,
  component: lazy(() => import(".")),
};

export default route;