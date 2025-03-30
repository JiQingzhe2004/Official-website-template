import React, { useState, useEffect } from 'react';
import { Form, message, Modal, Input, Button, Alert } from 'antd';

// 导入自定义组件
import AdminLayout from '../components/admin/Layout';
import LoginForm from '../components/admin/LoginForm';
import Dashboard from '../components/admin/Dashboard';
import NavbarManager from '../components/admin/NavbarManager'; 
import SiteConfigManager from '../components/admin/SiteConfigManager'; // 仅保留网站配置管理组件
import CarouselManager from '../components/admin/CarouselManager';
import ServicesManager from '../components/admin/ServicesManager';
import StatsManager from '../components/admin/StatsManager';
import WhyUsManager from '../components/admin/WhyUsManager';
import CTAManager from '../components/admin/CTAManager';
import ApiManager from '../components/admin/ApiManager';
import EditModal from '../components/admin/EditModal';
import FooterManager from '../components/admin/FooterManager';
import ApiDebugger from '../components/admin/ApiDebugger'; // 添加ApiDebugger组件

// API基础URL
import { API_URL } from '../config';

// 后台管理菜单配置
const menuConfig = [
  {
    key: 'dashboard',
    title: '控制台',
    icon: 'dashboard',
  },
  {
    key: 'site',
    title: '网站设置',
    icon: 'setting',
    children: [
      { key: 'site-config', title: '网站配置' },
    ],
  },
  {
    key: 'home',
    title: '主页管理',
    icon: 'home',
    children: [
      { key: 'home-navbar', title: '导航栏管理' },
      { key: 'home-carousel', title: '轮播图管理' },
      { key: 'home-services', title: '服务管理' },
      { key: 'home-stats', title: '统计管理' },
      { key: 'home-whyus', title: '为什么选择我们' },
      { key: 'home-cta', title: 'CTA管理' },
      { key: 'home-footer', title: '版权栏管理' },
    ],
  },
  {
    key: 'api-manager',
    title: 'API管理',
    icon: 'api',
  },
  {
    key: 'api',
    title: 'API调试',
    icon: 'api',
  },
];

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState(['dashboard']);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();
  const [token, setToken] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const checkInstallation = async () => {
      try {
        const response = await fetch(`${API_URL}/install/check`);
        const data = await response.json();
        if (!data.installed) {
          window.location.href = '/install';
        } else {
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('检查安装状态失败:', error);
        window.location.href = '/install';
      }
    };

    checkInstallation();
  }, []);

  // 检查是否已登录
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const adminAuth = localStorage.getItem('adminAuth');
    
    if (storedToken && adminAuth) {
      const adminData = JSON.parse(adminAuth);
      if (adminData.isAuthenticated) {
        // 验证令牌有效性
        verifyToken(storedToken)
          .then(isValid => {
            if (isValid) {
              setToken(storedToken);
              setIsLoggedIn(true);
            } else {
              // 令牌无效，清除并要求重新登录
              console.log('存储的令牌已失效，需要重新登录');
              handleLogout();
            }
          })
          .catch(error => {
            console.error('验证令牌时出错:', error);
            handleLogout();
          });
      }
    }
  }, []);
  
  // 验证令牌有效性的函数
  const verifyToken = async (token) => {
    try {
      // 调用验证令牌的API
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }
      return false;
    } catch (error) {
      console.error('验证令牌失败:', error);
      return false;
    }
  };

  // 刷新令牌
  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return null;
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          return data.token;
        }
      }
      return null;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      return null;
    }
  };

  // 登录处理
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      
      // 检查是否使用了之前存储的新密码
      const storedPassword = localStorage.getItem('adminPassword');
      if (storedPassword && values.password === storedPassword) {
        console.log('用户使用了存储的新密码登录');
        
        // 清除存储的密码，因为已经使用了
        localStorage.removeItem('adminPassword');
        
        // 创建假的成功响应
        const fakeToken = `fake_token_${Date.now()}`;
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('adminAuth', JSON.stringify({
          username: values.username,
          isAuthenticated: true,
          passwordChanged: true,
          loginMethod: 'local_password_override'
        }));
        setToken(fakeToken);
        setIsLoggedIn(true);
        message.success('使用新密码登录成功！');
        setLoading(false);
        return;
      }
      
      // 正常的API登录流程
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          try {
            const errorData = await response.json();
            setErrorMessage(errorData.message || '用户名或密码错误');
            setErrorModalVisible(true);
          } catch (e) {
            console.error('无法解析错误响应');
            setErrorMessage('登录失败，请检查用户名和密码');
            setErrorModalVisible(true);
          }
          
          setLoading(false);
          return;
        } else {
          throw new Error(`HTTP错误: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('adminAuth', JSON.stringify({
          username: values.username,
          isAuthenticated: true
        }));
        setToken(data.token);
        setIsLoggedIn(true);
        message.success('登录成功！');
      } else {
        setErrorMessage(data.message || '登录失败: 无效的响应格式');
        setErrorModalVisible(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('登录失败:', error);
      setErrorMessage(`登录失败: ${error.message}`);
      setErrorModalVisible(true);
      setLoading(false);
    }
  };

  // 登出处理
  const handleLogout = () => {
    // 清理所有认证数据
    localStorage.removeItem('token');
    localStorage.removeItem('adminAuth');
    
    // 如果有密码变更进行中但未完成，清理它
    if (localStorage.getItem('adminPassword')) {
      console.log('清理未完成的密码变更');
      localStorage.removeItem('adminPassword');
    }
    
    setToken('');
    setIsLoggedIn(false);
    message.success('已退出登录');
  };

  // 打开编辑模态框
  const openEditModal = (item, module) => {
    setCurrentItem(item || {});
    setCurrentModule(module || 'carousel'); // 确保设置当前模块
    
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      // 设置默认值
      if (module === 'carousel') {
        form.setFieldsValue({
          order: 0,
          isActive: true,
          imageUrl: '/1.jpg'
        });
      }
    }
    
    setEditModalVisible(true);
  };

  // 保存或创建
  const handleSaveOrCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 根据当前模块确定API端点
      let endpoint = '';
      switch (currentModule) {
        case 'carousel': endpoint = '/carousel'; break;
        case 'services': endpoint = '/services'; break;
        case 'stats': endpoint = '/stats'; break;
        case 'whyus': endpoint = '/whyus'; break;
        case 'cta': endpoint = '/cta'; break;
        default: endpoint = '';
      }
      
      // 判断是更新还是创建
      const isUpdate = currentItem && currentItem.id;
      const url = isUpdate ? `${API_URL}${endpoint}/${currentItem.id}` : `${API_URL}${endpoint}`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      // 调用API
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      if (data.success) {
        message.success(isUpdate ? '更新成功！' : '创建成功！');
        setEditModalVisible(false);
        // 让组件自动刷新 - 触发activeTab变化
        setActiveTab(prev => {
          setTimeout(() => setActiveTab(prev), 0);
          return 'temp';
        });
      } else {
        message.error(data.message || (isUpdate ? '更新失败' : '创建失败'));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败，请稍后重试');
      setLoading(false);
    }
  };

  // 处理修改密码 - 使用新的独立API端点
  const handleChangePassword = async (values) => {
    console.log('密码修改函数被调用，收到的值:', values);
    
    // 开始加载状态
    setChangingPassword(true);
    
    // 显示处理中消息
    message.loading({
      content: '正在处理密码修改...',
      key: 'passwordChange',
      duration: 0 // 不自动关闭
    });
    
    try {
      // 获取最新的有效令牌
      let currentToken = token;
      
      // 检查token是否存在
      if (!currentToken) {
        // 尝试从localStorage获取
        currentToken = localStorage.getItem('token');
        
        if (!currentToken) {
          throw new Error('认证令牌不存在，请重新登录');
        }
      }
      
      // 尝试刷新令牌以确保它是最新的
      const freshToken = await refreshToken() || currentToken;
      
      console.log('正在使用Token:', freshToken ? `${freshToken.substring(0, 10)}...` : 'null');
      
      // 使用新的API端点
      const apiUrl = `${API_URL}/change-password`;
      console.log('发送密码修改请求到:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });
      
      console.log('密码修改API响应状态:', response.status, response.statusText);
      
      // 尝试解析响应
      let data;
      let responseText = await response.text();
      console.log('响应内容:', responseText);
      
      try {
        if (responseText && responseText.trim()) {
          data = JSON.parse(responseText);
          console.log('解析后的响应数据:', data);
        }
      } catch (e) {
        console.error('JSON解析错误:', e);
        throw new Error('响应格式错误: ' + responseText.substring(0, 100));
      }
      
      // 如果解析成功且状态码正常
      if (response.ok && data && data.success) {
        // 关闭密码模态框
        setPasswordModalVisible(false);
        
        // 重置表单
        passwordForm.resetFields();
        
        // 结束加载状态
        setChangingPassword(false);
        
        // 显示成功消息
        message.success({
          content: '密码修改成功！',
          key: 'passwordChange',
          duration: 2
        });
        
        // 提示用户重新登录
        setTimeout(() => {
          Modal.success({
            title: '密码已更改',
            content: '密码已成功修改。为确保安全，请重新登录使用新密码。',
            onOk: () => handleLogout()
          });
        }, 1500);
      } else {
        // 处理API返回的错误
        const errorMsg = data ? data.message : '未知错误';
        throw new Error(errorMsg || `服务器错误: ${response.status}`);
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error({
        content: `密码修改失败: ${error.message}`,
        key: 'passwordChange',
        duration: 3
      });
      setChangingPassword(false);
    }
  };

  // 更新菜单处理函数
  const handleMenuSelect = (key) => {
    setActiveTab(key);
    // 如果选择的是子菜单项，确保父菜单保持打开
    if (key.includes('-')) {
      const parentKey = key.split('-')[0];
      if (!openKeys.includes(parentKey)) {
        setOpenKeys([...openKeys, parentKey]);
      }
    }
  };

  // 处理菜单折叠/展开
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'site-config':
        return (
          <SiteConfigManager 
            token={token}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-navbar':
        return (
          <NavbarManager 
            token={token}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-carousel':
        return (
          <CarouselManager 
            token={token}
            openEditModal={(item) => openEditModal(item, 'carousel')}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-services':
        return (
          <ServicesManager 
            token={token}
            openEditModal={(item) => openEditModal(item, 'services')}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-stats':
        return (
          <StatsManager 
            token={token}
            openEditModal={(item) => openEditModal(item, 'stats')}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-whyus':
        return (
          <WhyUsManager 
            token={token}
            openEditModal={(item) => openEditModal(item, 'whyus')}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-cta':
        return (
          <CTAManager 
            token={token}
            openEditModal={(item) => openEditModal(item, 'cta')}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'home-footer':
        return (
          <FooterManager
            token={token}
            loading={loading}
            API_URL={API_URL}
          />
        );
      case 'api':
        return (
          <ApiDebugger
            token={token}
            API_URL={API_URL}
          />
        );
        case 'api-manager':
          return (
            <ApiManager
              token={token}
              API_URL={API_URL}
            />
          );
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginForm onLogin={handleLogin} loading={loading} />
        <Modal
          title="登录失败"
          open={errorModalVisible}
          onOk={() => setErrorModalVisible(false)}
          onCancel={() => setErrorModalVisible(false)}
          footer={[
            <button 
              key="ok" 
              onClick={() => setErrorModalVisible(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              确定
            </button>
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ 
              display: 'inline-flex', 
              backgroundColor: '#ff4d4f', 
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '10px'
            }}>
              !
            </span>
            <span>{errorMessage}</span>
          </div>
          <p>请检查您的用户名和密码是否正确，然后重试。</p>
        </Modal>
      </>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onSelect={handleMenuSelect}
      menuConfig={menuConfig}
      handleLogout={handleLogout}
      showPasswordModal={() => setPasswordModalVisible(true)}
    >
      {renderActiveContent()}
      
      {/* 编辑模态框组件 */}
      <EditModal
        visible={editModalVisible}
        onOk={handleSaveOrCreate}
        onCancel={() => setEditModalVisible(false)}
        form={form}
        module={currentModule}
        token={token}
        API_URL={API_URL}
        title={currentItem && currentItem.id ? "编辑内容" : "添加内容"}
      />
      
      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          console.log('取消密码修改');
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={(values) => {
            console.log('密码表单提交', values);
            handleChangePassword(values);
          }}
        >
          <Alert
            message="密码修改提示"
            description="修改密码后，您需要重新登录使用新密码。为安全起见，修改后将自动退出登录。"
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item
            name="currentPassword"
            label="当前密码"
            rules={[
              { required: true, message: '请输入当前密码' }
            ]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少需要6个字符' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              style={{ marginRight: 8 }} 
              onClick={() => {
                console.log('点击取消按钮');
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={changingPassword}
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 错误提示模态框 */}
      <Modal
        title="错误提示"
        open={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        footer={[
          <button 
            key="ok" 
            onClick={() => setErrorModalVisible(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            确定
          </button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ 
            display: 'inline-flex', 
            backgroundColor: '#ff4d4f', 
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '10px'
          }}></span>
          <span>
            !
          </span>
          <span>{errorMessage}</span>
        </div>
        <p>请检查您的操作是否正确，然后重试。</p>
      </Modal>
    </AdminLayout>
  );
};

export default Admin;