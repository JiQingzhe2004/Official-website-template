import React, { useState } from 'react';
import styled from 'styled-components';
import { Form, Input, Button, Steps, Result, Typography, Card, Spin, Alert, message } from 'antd';
import { CheckCircleOutlined, DatabaseOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Title, Paragraph, Text } = Typography;

const InstallContainer = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
`;

const StepContent = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
`;

import { API_URL } from '../config';

const Install = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dbForm] = Form.useForm();
  const [adminForm] = Form.useForm();
  const [installProgress, setInstallProgress] = useState({
    database: false,
    tables: false,
    admin: false,
    data: false
  });

  // 测试数据库连接
  const testConnection = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/install/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      if (data.success) {
        // 测试通过后立即初始化数据库配置
        const initResponse = await fetch(`${API_URL}/install/init-database`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        const initData = await initResponse.json();
        if (initData.success) {
          setCurrentStep(1);
        } else {
          setError(initData.message || '数据库配置保存失败');
        }
      } else {
        setError(data.message || '数据库连接测试失败');
      }
    } catch (error) {
      setError('无法连接到服务器，请确保服务器正在运行');
      console.error('测试连接失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建管理员账户
  const createAdmin = async (values) => {
    setLoading(true);
    setError(null);
    try {
      // 修正用户数据结构，移除不必要的is_admin字段
      const adminData = {
        username: values.username,
        password: values.password,
        role: 'admin' // 使用正确的role字段
      };
      
      // 创建管理员账户
      const response = await fetch(`${API_URL}/install/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });
      
      const data = await response.json();
      if (data.success) {
        // 创建成功后，尝试登录获取token
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: values.username,
            password: values.password
          })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.token) {
          // 保存token和管理员信息
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('adminAuth', JSON.stringify({
            username: values.username,
            isAuthenticated: true
          }));
          setSuccess(true);
          setCurrentStep(3);
        } else {
          // 创建成功但登录失败的情况
          setSuccess(true);
          setCurrentStep(3);
          message.warning('管理员账户创建成功，但自动登录失败，请完成安装后手动登录');
        }
      } else {
        setError(data.message || '创建管理员账户失败');
      }
    } catch (error) {
      setError('无法连接到服务器，请确保服务器正在运行');
      console.error('创建管理员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  const initializeData = async () => {
    setLoading(true);
    setError(null);
    // 检查是否已安装
    const installCheck = await fetch(`${API_URL}/install/check`);
    const checkData = await installCheck.json();
    if (checkData.installed) {
      setError('系统已安装，请勿重复安装');
      return;
    }
    try {
      // 创建表结构
      setInstallProgress(prev => ({ ...prev, tables: true }));
      
      const tablesResponse = await fetch(`${API_URL}/install/init-tables`, {
        method: 'POST'
      });
      
      const tablesData = await tablesResponse.json();
      if (!tablesData.success) {
        throw new Error(tablesData.message || '创建表结构失败');
      }
      
      // 初始化示例数据
      setInstallProgress(prev => ({ ...prev, data: true }));
      
      const dataResponse = await fetch(`${API_URL}/install/init-data`, {
        method: 'POST'
      });
      
      const data = await dataResponse.json();
      if (!data.success) {
        throw new Error(data.message || '初始化示例数据失败');
      }
      
      // 创建管理员
      setInstallProgress(prev => ({ ...prev, admin: true }));
      
      const adminFormData = adminForm.getFieldsValue();
      const adminResponse = await fetch(`${API_URL}/install/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminFormData.username,
          password: adminFormData.password,
          role: 'admin' // 确保使用正确的role字段
        })
      });
      
      const adminData = await adminResponse.json();
      if (!adminData.success) {
        throw new Error(adminData.message || '创建管理员失败');
      }
      
      // 创建成功后尝试登录获取token
      try {
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: adminFormData.username,
            password: adminFormData.password
          })
        });
        
        const loginData = await loginResponse.json();
        if (loginData.token) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('adminAuth', JSON.stringify({
            username: adminFormData.username,
            isAuthenticated: true
          }));
        }
      } catch (loginError) {
        console.error('自动登录失败:', loginError);
        // 即使登录失败也继续安装流程
      }
      
      setSuccess(true);
      setCurrentStep(3);
    } catch (error) {
      setError(error.message || '安装过程中出现错误');
      console.error('初始化数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '数据库配置',
      content: (
        <StepContent>
          <Card title="数据库连接设置">
            <Form
              form={dbForm}
              layout="vertical"
              onFinish={testConnection}
              initialValues={{
                host: 'localhost',
                port: 3306,
                database: 'aiqiji',
                username: 'root',
                password: ''
              }}
            >
              <Form.Item
                name="host"
                label="数据库主机"
                rules={[{ required: true, message: '请输入数据库主机地址' }]}
              >
                <Input prefix={<DatabaseOutlined />} placeholder="localhost" />
              </Form.Item>
              
              <Form.Item
                name="port"
                label="端口"
                rules={[{ required: true, message: '请输入数据库端口' }]}
              >
                <Input type="number" placeholder="3306" />
              </Form.Item>
              
              <Form.Item
                name="database"
                label="数据库名称"
                rules={[{ required: true, message: '请输入数据库名称' }]}
              >
                <Input placeholder="aiqiji" />
              </Form.Item>
              
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入数据库用户名' }]}
              >
                <Input placeholder="root" />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
              >
                <Input.Password placeholder="数据库密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  测试连接并继续
                </Button>
              </Form.Item>
            </Form>
            
            {error && (
              <Alert
                message="错误"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </StepContent>
      ),
    },
    {
      title: '初始化数据库',
      content: (
        <StepContent>
          <Card title="初始化数据库表结构">
            <Paragraph>
              现在将开始初始化数据库，这将执行以下操作：
            </Paragraph>
            
            <ul>
              <li>
                <Text strong>创建表结构</Text> - {installProgress.tables ? <CheckCircleOutlined style={{ color: 'green' }} /> : <Spin size="small" />}
              </li>
              <li>
                <Text strong>初始化示例数据</Text> - {installProgress.data ? <CheckCircleOutlined style={{ color: 'green' }} /> : <Spin size="small" />}
              </li>
            </ul>
            
            {!loading && !success && (
              <Button type="primary" onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  // 创建表结构
                  setInstallProgress(prev => ({ ...prev, tables: true }));
                  
                  const tablesResponse = await fetch(`${API_URL}/install/init-tables`, {
                    method: 'POST'
                  });
                  
                  const tablesData = await tablesResponse.json();
                  if (!tablesData.success) {
                    throw new Error(tablesData.message || '创建表结构失败');
                  }
                  
                  // 初始化示例数据
                  setInstallProgress(prev => ({ ...prev, data: true }));
                  
                  const dataResponse = await fetch(`${API_URL}/install/init-data`, {
                    method: 'POST'
                  });
                  
                  const data = await dataResponse.json();
                  if (!data.success) {
                    throw new Error(data.message || '初始化示例数据失败');
                  }
                  
                  setCurrentStep(2);
                } catch (error) {
                  setError(error.message || '初始化数据库失败');
                  console.error('初始化数据库失败:', error);
                } finally {
                  setLoading(false);
                }
              }} style={{ marginTop: 16 }}>
                初始化数据库
              </Button>
            )}
            
            {loading && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 16 }}>
                  正在初始化数据库，请稍候...
                </Paragraph>
              </div>
            )}
            
            <Button 
              style={{ marginTop: 16, marginLeft: 8 }} 
              onClick={() => setCurrentStep(0)}
              disabled={loading}
            >
              上一步
            </Button>
            
            {error && (
              <Alert
                message="错误"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </StepContent>
      ),
    },
    {
      title: '管理员设置',
      content: (
        <StepContent>
          <Card title="创建管理员账户">
            <Form
              form={adminForm}
              layout="vertical"
              onFinish={createAdmin}
              initialValues={{
                username: '',
                password: '',
                confirmPassword: ''
              }}
            >
              <Form.Item
                name="username"
                label="管理员用户名"
                rules={[{ required: true, message: '请输入管理员用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="admin" />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="确认密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  创建管理员并完成安装
                </Button>
                <Button 
                  style={{ marginLeft: 8 }} 
                  onClick={() => setCurrentStep(1)}
                >
                  上一步
                </Button>
              </Form.Item>
            </Form>
            
            {loading && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 16 }}>
                  正在安装，请稍候...
                </Paragraph>
              </div>
            )}
            
            {error && (
              <Alert
                message="安装错误"
                description={error}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </StepContent>
      ),
    },
    {
      title: '完成',
      content: (
        <StepContent>
          <Result
            status="success"
            title="安装成功！"
            subTitle={localStorage.getItem('token') 
              ? "爱奇吉网站系统已成功安装，您已登录管理后台" 
              : "爱奇吉网站系统已成功安装，请登录管理后台"}
            extra={[
              <Button type="primary" key="console" href="/admin">
                {localStorage.getItem('token') ? '进入管理后台' : '登录管理后台'}
              </Button>,
              <Button key="home" href="/">
                访问网站首页
              </Button>,
            ]}
          />
        </StepContent>
      ),
    },
  ];

  return (
    <InstallContainer>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
        爱奇吉网站系统安装向导
      </Title>
      
      <Steps current={currentStep}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      
      <div>{steps[currentStep].content}</div>
    </InstallContainer>
  );
};

export default Install;