import {
  DesktopOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import routes from '../../../pages/routes';
import './style.scss';

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  onClick?: Function,
  children?: MenuItem[],
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
  
  const items: MenuItem[] = routes.filter(({label}) => label !== "").map(({ path, label }, index) => (
    getItem(label, index, <DesktopOutlined />, () => { navigate(path) })
  ))

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background">
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Sản phẩm của nhóm 24 - TTCS</Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutDefault;