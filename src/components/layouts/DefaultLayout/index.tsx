import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../../pages/routes";
import classNames from "classnames/bind";
import styles from "./style.module.scss";

const cx = classNames.bind(styles);

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  onClick?: Function,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    label,
    children,
    onClick,
  } as MenuItem;
}

const LayoutDefault = ({ children }: { children?: any }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const items: MenuItem[] = routes
    .filter(({ label }) => label !== "")
    .map(({ path, label, icon }, index) =>
      getItem(label, index, icon, () => {
        navigate(path);
      })
    );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={240}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          zIndex: "5",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className={cx("logo")}>
          <a className={cx("logo__link")} href="#"></a>
        </div>
        <div className={cx("admin__wrapper")}>
          <img
            className={cx("admin__img")}
            src="https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg"
            alt=""
          />
          <div className={cx("admin__text")}>
            <h5 className={cx("admin__name")}>Admin</h5>
            <button className={cx("admin__logout")}>Log out</button>
          </div>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["0"]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout className={cx("site-layout")}>
        <Content style={{ margin: "0 16px" }}>
          <div className={cx("site-layout-background")}>{children}</div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "20px" }}>
          learn4ever ©2022 Sản phẩm của Nhom24_TTCS
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutDefault;
