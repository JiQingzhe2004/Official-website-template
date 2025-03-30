import React from 'react';
import styled from 'styled-components';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 100px auto;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
`;

const LoginForm = ({ onLogin, loading }) => {
  return (
    <LoginContainer>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>管理员登录</Title>
      <Form
        name="login"
        onFinish={onLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码！' }]}
        >
          <Input.Password placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </LoginContainer>
  );
};

export default LoginForm;
