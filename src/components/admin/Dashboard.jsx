import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const Dashboard = () => {
  return (
    <div>
      <Title level={3}>控制面板</Title>
      <Text>欢迎使用爱奇吉内容管理系统，您可以在这里管理网站的各项内容。</Text>
    </div>
  );
};

export default Dashboard;
