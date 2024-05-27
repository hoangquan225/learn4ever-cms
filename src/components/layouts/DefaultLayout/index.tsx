import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import routes from "../../../pages/routes";
import classNames from "classnames/bind";
import styles from "./style.module.scss";
import Cookies from "js-cookie";

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
  let location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState(
    location.pathname === "/" || location.pathname === ""
      ? "/category"
      : location.pathname,
  );
  //or simply use const [current, setCurrent] = useState(location.pathname)        

  useEffect(() => {
    if (location) {
      if (current !== location.pathname) {
        setCurrent(location.pathname);
      }
    }
    const path = location.pathname.split('/')
    if(path[1] === "course" && path[2] === "chi-tiet-khoa-hoc") {
      setCollapsed(true)
    }
  }, [location, current]);

  function handleClick(e: any) {
    setCurrent(e.key);
  }

  const items: MenuItem[] = routes
    .filter(({ label }) => label !== "")
    .map(({ path, label, icon }, index) =>
      getItem(label, path, icon, () => {
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
            <button className={cx("admin__logout")} 
              onClick={() => {
                navigate('/dang-nhap')
                Cookies.remove("tokenAdmin");
              }}
            >Log out</button>
          </div>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[current]}
          mode="inline"
          items={items}
          onClick={handleClick}
          selectedKeys={[current]}
        />
      </Sider>
      <Layout className={cx("site-layout")}>
        <Content>
          <div className={cx("site-layout-background")}>{children}</div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "20px" }}>
          learn4ever ©2024 Sản phẩm của HHQ
        </Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutDefault;
