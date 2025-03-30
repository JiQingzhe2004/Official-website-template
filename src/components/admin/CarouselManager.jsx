import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ensureNumber } from '../../utils/dataValidation';

// 注意: antd v5 兼容性提示
// 1. Menu组件应使用items属性而非children
// 2. Upload组件应使用fileList属性而非value
// 详见: https://u.ant.design/v5-for-19

const { Title } = Typography;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const CarouselManager = ({ token, openEditModal, loading, API_URL }) => {
  const [carousels, setCarousels] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 定义表格列
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '排序', dataIndex: 'order', key: 'order', 
      render: (order, record) => order || '-' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '按钮文本', dataIndex: 'buttonText', key: 'buttonText' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <ActionButton type="primary" icon={<EditOutlined />} onClick={() => openEditModal(record, 'carousel')}>编辑</ActionButton>
          <Popconfirm
            title="确定要删除这个轮播图吗?"
            description="删除后图片将一并清除且不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
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

  // 获取轮播图数据
  const fetchCarousels = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/carousel/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`API返回错误状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 检查图片路径格式并处理order字段
        const processedData = data.data.map(item => {
          return {
            ...item,
            order: ensureNumber(item.order, 0) // 使用辅助函数处理order字段
          };
        });
        
        // 按order字段排序（升序）
        const sortedData = processedData.sort((a, b) => a.order - b.order);
        setCarousels(sortedData);
      } else {
        // 使用模拟数据作为备用
        const mockData = [
          { id: 1, order: 1, title: '现代化互联网信息服务', description: '爱奇吉提供全方位的互联网解决方案，帮助您的企业在数字时代脱颖而出', buttonText: '了解更多', image: 'https://via.placeholder.com/800x400?text=测试轮播图1' },
          { id: 2, order: 2, title: '专业的技术团队', description: '我们拥有经验丰富的技术专家，为您提供最前沿的技术支持和服务', buttonText: '查看服务', image: 'https://via.placeholder.com/800x400?text=测试轮播图2' },
          { id: 3, order: 3, title: '成功案例展示', description: '众多企业选择爱奇吉，我们的解决方案帮助客户实现业务增长和数字化转型', buttonText: '查看案例', image: 'https://via.placeholder.com/800x400?text=测试轮播图3' },
        ];
        setCarousels(mockData);
        Modal.error({
          title: '数据获取失败',
          content: '无法从数据库获取轮播图数据，请检查数据库连接或联系管理员',
        });
      }
    } catch (error) {
      console.error('获取轮播图数据失败:', error);
      message.error(`获取轮播图数据失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  // 删除轮播图和关联图片
  const handleDelete = async (id) => {
    console.log('删除轮播图，ID:', id);
    
    try {
      setDeleteLoading(id);

      // 查找轮播图记录，确保在删除前获取图片路径
      const carouselItem = carousels.find(item => item.id === id);
      if (!carouselItem) {
        throw new Error('找不到要删除的轮播图数据');
      }
      
      console.log('轮播图数据:', carouselItem);
      console.log('图片路径:', carouselItem.image);
      
      // 发送删除请求，包含删除图片的参数
      const response = await fetch(`${API_URL}/carousel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deleteImage: true,
          imagePath: carouselItem.image // 确保传递图片路径
        })
      });

      console.log('删除请求完成，状态码:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `操作失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('删除响应数据:', data);
      
      if (data.success) {
        message.success(data.message || '轮播图删除成功！');
        // 刷新数据列表
        fetchCarousels();
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除轮播图数据失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, [token]);

  return (
    <div>
      <Title level={3}>轮播图管理</Title>
      <Button 
        type="primary" 
        style={{ marginBottom: 16 }} 
        onClick={() => openEditModal(null, 'carousel')}
      >
        添加轮播图
      </Button>
      <Table 
        columns={columns} 
        dataSource={carousels} 
        rowKey="id" 
        loading={loading || localLoading}
      />
    </div>
  );
};

export default CarouselManager;
