import React from 'react';
import styled from 'styled-components';
import { Layout, Menu, Button, Dropdown } from 'antd';
import { 
  LoginOutlined, 
  DashboardOutlined, 
  PictureOutlined, 
  FileTextOutlined, 
  ToolOutlined, 
  BarChartOutlined, 
  QuestionCircleOutlined, 
  NotificationOutlined, 
  ApiOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  KeyOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

// 样式组件
const AdminContainer = styled.div`
  min-height: 100vh;
`;

const AdminHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1890ff;
`;

const AdminContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  background: #fff;
  min-height: 280px;
  border-radius: 4px;
`;

// 获取菜单图标
const getMenuIcon = (iconName) => {
  switch (iconName) {
    case 'dashboard': return <DashboardOutlined />;
    case 'home': return <HomeOutlined />;
    case 'api': return <ApiOutlined />;
    case 'carousel': return <PictureOutlined />;
    case 'services': return <ToolOutlined />;
    case 'stats': return <BarChartOutlined />;
    case 'whyus': return <QuestionCircleOutlined />;
    case 'cta': return <NotificationOutlined />;
    default: return null;
  }
};

// 渲染菜单项
const renderMenuItems = (items) => {
  return items.map(item => {
    if (item.children) {
      return (
        <SubMenu 
          key={item.key} 
          icon={getMenuIcon(item.icon)}
          title={item.title}
        >
          {renderMenuItems(item.children)}
        </SubMenu>
      );
    }
    return (
      <Menu.Item key={item.key} icon={getMenuIcon(item.icon)}>
        {item.title}
      </Menu.Item>
    );
  });
};

const AdminLayout = ({ 
  children, 
  activeTab, 
  openKeys, 
  onOpenChange, 
  onSelect, 
  menuConfig, 
  handleLogout, 
  showPasswordModal 
}) => {
  // 用户菜单项
  const userMenuItems = [
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: showPasswordModal
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    },
  ];

  return (
    <AdminContainer>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminHeader>
          <Logo>爱奇吉 - 后台管理</Logo>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />} style={{ fontSize: '16px' }}>
              {localStorage.getItem('adminAuth') 
                ? JSON.parse(localStorage.getItem('adminAuth')).username 
                : '管理员'}
            </Button>
          </Dropdown>
        </AdminHeader>
        <Layout>
          <Sider width={200} className="admin-sider">
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              openKeys={openKeys}
              onOpenChange={onOpenChange}
              onClick={({ key }) => onSelect(key)}
              style={{ height: '100%', borderRight: 0 }}
            >
              {renderMenuItems(menuConfig)}
            </Menu>
          </Sider>
          <AdminContent>
            {children}
          </AdminContent>
        </Layout>
      </Layout>
    </AdminContainer>
  );
};

export default AdminLayout;
