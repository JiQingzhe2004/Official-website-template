import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, message, Modal, Popconfirm, Form, Input, Select, InputNumber, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const NavbarManager = ({ token, loading, API_URL }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  // 获取菜单项数据
  const fetchMenuItems = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/menuitems?position=top`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`API返回错误状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 按order字段排序
        const sortedData = data.data.sort((a, b) => a.order - b.order);
        setMenuItems(sortedData);
      } else {
        // 使用模拟数据作为备用
        const mockData = [
          { id: 1, title: '首页', path: '/', position: 'top', order: 1 },
          { id: 2, title: '服务', path: '/services', position: 'top', order: 2 },
          { id: 3, title: '关于我们', path: '/about', position: 'top', order: 3 },
          { id: 4, title: '案例展示', path: '/cases', position: 'top', order: 4 },
          { id: 5, title: '联系我们', path: '/contact', position: 'top', order: 5 }
        ];
        setMenuItems(mockData);
        Modal.error({
          title: '数据获取失败',
          content: '无法从数据库获取导航菜单数据，请检查数据库连接或联系管理员',
        });
      }
    } catch (error) {
      console.error('获取导航菜单数据失败:', error);
      message.error('获取导航菜单数据失败，可能是数据库连接问题');
    } finally {
      setLocalLoading(false);
    }
  };

  // 添加菜单项
  const addMenuItem = () => {
    setCurrentItem(null);
    form.resetFields();
    form.setFieldsValue({
      position: 'top',
      order: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.order)) + 1 : 1
    });
    setEditModalVisible(true);
  };

  // 编辑菜单项
  const editMenuItem = (item) => {
    setCurrentItem(item);
    form.setFieldsValue(item);
    setEditModalVisible(true);
  };

  // 删除菜单项
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      
      const response = await fetch(`${API_URL}/menuitems/${id}`, {
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
        fetchMenuItems();
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除菜单项失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 保存菜单项
  const handleSave = async (values) => {
    try {
      setLocalLoading(true);
      
      // 确保position为top
      values.position = 'top';
      
      const isUpdate = currentItem && currentItem.id;
      const url = isUpdate ? `${API_URL}/menuitems/${currentItem.id}` : `${API_URL}/menuitems`;
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `操作失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success(isUpdate ? '更新成功！' : '创建成功！');
        setEditModalVisible(false);
        fetchMenuItems();
      } else {
        throw new Error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存菜单项失败:', error);
      message.error(`保存失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  // 移动菜单项顺序
  const moveMenuItem = async (id, direction) => {
    try {
      setLocalLoading(true);
      
      const itemIndex = menuItems.findIndex(item => item.id === id);
      if (itemIndex === -1) return;
      
      const currentItem = menuItems[itemIndex];
      let targetIndex;
      
      if (direction === 'up') {
        if (itemIndex === 0) return; // 已经是第一个
        targetIndex = itemIndex - 1;
      } else {
        if (itemIndex === menuItems.length - 1) return; // 已经是最后一个
        targetIndex = itemIndex + 1;
      }
      
      const targetItem = menuItems[targetIndex];
      
      // 交换顺序
      const response = await fetch(`${API_URL}/menuitems/swap-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id1: currentItem.id,
          id2: targetItem.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `操作失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success('顺序调整成功！');
        fetchMenuItems();
      } else {
        throw new Error(data.message || '调整顺序失败');
      }
    } catch (error) {
      console.error('调整菜单顺序失败:', error);
      message.error(`调整顺序失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [token]);

  // 定义表格列
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '顺序', dataIndex: 'order', key: 'order', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<SwapOutlined rotate={90} />} 
            onClick={() => moveMenuItem(record.id, 'up')}
            disabled={record.order === 1}
          >
            上移
          </Button>
          <Button 
            icon={<SwapOutlined rotate={-90} />} 
            onClick={() => moveMenuItem(record.id, 'down')}
            disabled={record.order === menuItems.length}
          >
            下移
          </Button>
          <ActionButton type="primary" icon={<EditOutlined />} onClick={() => editMenuItem(record)}>编辑</ActionButton>
          <Popconfirm
            title="确定要删除这个菜单项吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>导航栏管理</Title>
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        在这里管理顶部导航栏的菜单项。您可以添加、编辑、删除和调整顺序。
      </Text>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }} 
        onClick={addMenuItem}
      >
        添加菜单项
      </Button>
      
      <Table 
        columns={columns} 
        dataSource={menuItems} 
        rowKey="id" 
        loading={loading || localLoading}
        pagination={false}
      />
      
      <Modal
        title={currentItem ? "编辑菜单项" : "添加菜单项"}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="title"
            label="菜单标题"
            rules={[{ required: true, message: '请输入菜单标题' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="path"
            label="链接路径"
            rules={[{ required: true, message: '请输入链接路径' }]}
            help="例如：/ 表示首页，/about 表示关于我们页面"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="order"
            label="显示顺序"
            rules={[{ required: true, message: '请输入显示顺序' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          
          <Form.Item
            name="position"
            label="位置"
            initialValue="top"
            hidden
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setEditModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={localLoading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NavbarManager;
