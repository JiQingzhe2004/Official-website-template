import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title } = Typography;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const StatsManager = ({ token, openEditModal, loading, API_URL }) => {
  const [stats, setStats] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 定义表格列
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '数字', dataIndex: 'number', key: 'number' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <ActionButton type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record, 'stats')}>编辑</ActionButton>
          <Popconfirm
            title="确定要删除这个统计数据吗?"
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

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/stats/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        // 使用模拟数据作为备用
        const mockData = [
          { id: 1, number: '100+', title: '成功项目' },
          { id: 2, number: '50+', title: '合作伙伴' },
          { id: 3, number: '10+', title: '行业经验' },
          { id: 4, number: '24/7', title: '技术支持' }
        ];
        setStats(mockData);
        Modal.error({
          title: '数据获取失败',
          content: '无法从数据库获取统计数据，请检查数据库连接或联系管理员',
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败，可能是数据库连接问题');
    } finally {
      setLocalLoading(false);
    }
  };

  // 删除统计数据 - 参考CTAManager实现
  const handleDelete = async (id) => {
    console.log('点击删除按钮，ID:', id);
    
    try {
      setDeleteLoading(id);

      const response = await fetch(`${API_URL}/stats/${id}`, {
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
        fetchStats();
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除统计数据失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return (
    <div>
      <Title level={3}>统计数据管理</Title>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }} 
        onClick={() => openEditModal(null, 'stats')}
      >
        添加统计数据
      </Button>
      <Table 
        columns={columns} 
        dataSource={stats} 
        rowKey="id" 
        loading={loading || localLoading}
      />
    </div>
  );
};

export default StatsManager;
