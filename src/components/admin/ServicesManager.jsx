import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import * as AntIcons from '@ant-design/icons';
import styled from 'styled-components';

const { Title } = Typography;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const IconPreview = styled.span`
  font-size: 20px;
  display: flex;
  align-items: center;
`;

const ServicesManager = ({ token, openEditModal, loading, API_URL }) => {
  const [services, setServices] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 获取图标组件函数 - 支持动态加载任何Ant Design图标
  const getIconComponent = (iconName) => {
    // 检查图标名称是否存在于AntIcons中
    if (iconName && AntIcons[iconName]) {
      const IconComponent = AntIcons[iconName];
      return <IconComponent />;
    }
    
    // 如果没有找到图标，则返回默认图标
    return <AntIcons.AppstoreOutlined />;
  };
  
  // 定义表格列
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '图标', 
      dataIndex: 'icon', 
      key: 'icon',
      render: (icon) => (
        <IconPreview>
          {getIconComponent(icon)}
          <span style={{ marginLeft: '8px', fontSize: '14px' }}>{icon}</span>
        </IconPreview>
      )
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <ActionButton type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record, 'services')}>编辑</ActionButton>
          <Popconfirm
            title="确定要删除这个服务吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <ActionButton 
              danger 
              icon={<DeleteOutlined />} 
              loading={deleteLoading && deleteLoading === record.id}
            >
              删除
            </ActionButton>
          </Popconfirm>
        </>
      ),
    },
  ];

  // 获取服务数据
  const fetchServices = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/services/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      } else {
        // 使用模拟数据作为备用
        const mockData = [
          { id: 1, title: '网站开发', icon: 'GlobalOutlined', description: '提供响应式网站设计与开发，确保在各种设备上都有出色的用户体验。' },
          { id: 2, title: '应用程序开发', icon: 'RocketOutlined', description: '开发高性能的移动应用和桌面应用，满足您的业务需求。' },
          { id: 3, title: '技术咨询', icon: 'ToolOutlined', description: '提供专业的技术咨询服务，帮助您制定最佳的技术战略和解决方案。' },
          { id: 4, title: '团队协作', icon: 'TeamOutlined', description: '与您的团队紧密合作，确保项目按时交付并达到预期目标。' }
        ];
        setServices(mockData);
        Modal.error({
          title: '数据获取失败',
          content: '无法从数据库获取服务数据，请检查数据库连接或联系管理员',
        });
      }
    } catch (error) {
      console.error('获取服务数据失败:', error);
      message.error('获取服务数据失败，可能是数据库连接问题');
    } finally {
      setLocalLoading(false);
    }
  };

  // 删除服务 - 参考CTAManager实现
  const handleDelete = async (id) => {
    console.log('点击删除按钮，ID:', id);
    
    try {
      setDeleteLoading(id);
      
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `操作失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success('删除成功！');
        fetchServices();
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除服务数据失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  return (
    <div>
      <Title level={3}>服务管理</Title>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }} 
        onClick={() => openEditModal(null, 'services')}
      >
        添加服务
      </Button>
      <Table 
        columns={columns} 
        dataSource={services} 
        rowKey="id" 
        loading={loading || localLoading}
      />
    </div>
  );
};

export default ServicesManager;
