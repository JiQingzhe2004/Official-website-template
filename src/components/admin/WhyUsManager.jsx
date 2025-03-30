import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title } = Typography;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const WhyUsManager = ({ token, openEditModal, loading, API_URL }) => {
  const [whyUsItems, setWhyUsItems] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 定义表格列
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <ActionButton type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record, 'whyus')}>编辑</ActionButton>
          <Popconfirm
            title="确定要删除这个项目吗?"
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

  // 获取为什么选择我们数据
  const fetchWhyUs = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/whyus/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setWhyUsItems(data.data);
      } else {
        // 使用模拟数据作为备用
        const mockData = [
          { id: 1, title: '专业技术', description: '我们的团队由经验丰富的技术专家组成，掌握最新的技术和行业趋势。' },
          { id: 2, title: '定制解决方案', description: '我们根据客户的具体需求提供量身定制的解决方案，确保最佳效果。' },
          { id: 3, title: '优质服务', description: '我们注重客户体验，提供全程跟踪和售后支持，确保您的满意度。' }
        ];
        setWhyUsItems(mockData);
        Modal.error({
          title: '数据获取失败',
          content: '无法从数据库获取"为什么选择我们"数据，请检查数据库连接或联系管理员',
        });
      }
    } catch (error) {
      console.error('获取为什么选择我们数据失败:', error);
      message.error('获取"为什么选择我们"数据失败，可能是数据库连接问题');
    } finally {
      setLocalLoading(false);
    }
  };

  // 删除项目 - 参考CTAManager实现
  const handleDelete = async (id) => {
    console.log('点击删除按钮，ID:', id);
    
    try {
      setDeleteLoading(id);

      const response = await fetch(`${API_URL}/whyus/${id}`, {
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
        fetchWhyUs();
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除项目数据失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchWhyUs();
  }, [token]);

  return (
    <div>
      <Title level={3}>为什么选择我们</Title>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }} 
        onClick={() => openEditModal(null, 'whyus')}
      >
        添加项目
      </Button>
      <Table 
        columns={columns} 
        dataSource={whyUsItems} 
        rowKey="id" 
        loading={loading || localLoading}
      />
    </div>
  );
};

export default WhyUsManager;
