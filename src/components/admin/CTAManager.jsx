import React, { useState, useEffect } from 'react';
import { Typography, Form, Input, Button, message, Alert, Space, Spin, Table, Popconfirm, Tag, Switch, Select, InputNumber, Drawer, List, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const CTAManager = ({ token, loading, API_URL }) => {
  const [form] = Form.useForm();
  const [ctaList, setCtaList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [editingCta, setEditingCta] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initializeLoading, setInitializeLoading] = useState(false);
  const [initializeResults, setInitializeResults] = useState([]);
  const [showInitializeDrawer, setShowInitializeDrawer] = useState(false);
  const [charsetModalVisible, setCharsetModalVisible] = useState(false);
  const [charsetForm] = Form.useForm();

  // 获取CTA数据
  const fetchCTA = async (silent = false) => {
    if (!silent) setLocalLoading(true);
    setApiError(null);

    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/cta/all?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`获取数据失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const sortedData = (data.data || []).sort((a, b) => {
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }
          return a.order - b.order;
        });
        setCtaList(sortedData);
        setApiError(null);
      } else {
        throw new Error(data.message || "数据格式错误");
      }
    } catch (error) {
      console.error('获取CTA数据失败:', error.message);
      setApiError("获取CTA数据失败，请稍后再试");
      
      if (ctaList.length === 0) {
        setCtaList([]);
      }
    } finally {
      if (!silent) setLocalLoading(false);
    }
  };

  // 设置活跃的CTA
  const setActiveCTA = async (id) => {
    try {
      setLocalLoading(true);
      
      const response = await fetch(`${API_URL}/cta/setActive/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`操作失败: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success(`已设置为当前使用的CTA`);
        fetchCTA(true);
      } else {
        throw new Error(data.message || '设置失败');
      }
    } catch (error) {
      console.error('设置活跃CTA失败:', error.message);
      message.error(`设置失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  // 初始化CTA表 - 修改为显示字符集选择对话框
  const initializeCTATable = async () => {
    setCharsetModalVisible(true);
    charsetForm.setFieldsValue({
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });
  };

  // 执行带字符集选项的初始化
  const executeInitialization = async (values) => {
    setCharsetModalVisible(false);
    setInitializeLoading(true);
    setInitializeResults([]);
    setShowInitializeDrawer(true);
    
    try {
      const response = await fetch(`${API_URL}/cta/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          charset: values.charset,
          collate: values.collate
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success('CTA表初始化成功');
        
        if (Array.isArray(data.logs)) {
          setInitializeResults(data.logs);
        } else {
          setInitializeResults([
            { status: 'success', message: '✅ 操作成功' },
            { status: 'success', message: `✅ ${data.message}` },
          ]);
        }
        
        fetchCTA(true);
      } else {
        throw new Error(data.message || `操作失败: ${response.status}`);
      }
    } catch (error) {
      console.error('初始化CTA表失败:', error);
      message.error(`初始化失败: ${error.message}`);
      
      setInitializeResults([
        { status: 'error', message: `❌ 初始化失败: ${error.message}` },
        { status: 'warning', message: `⚠️ 可能的原因: 数据库字符集冲突，请尝试联系数据库管理员` },
        { status: 'info', message: `ℹ️ 建议: 检查数据库服务器支持的字符集和排序规则` }
      ]);
    } finally {
      setInitializeLoading(false);
    }
  };

  // 关闭字符集选择对话框
  const closeCharsetModal = () => {
    setCharsetModalVisible(false);
  };

  // 关闭初始化抽屉
  const closeInitializeDrawer = () => {
    setShowInitializeDrawer(false);
  };

  // 创建新CTA
  const createNewCTA = () => {
    setEditingCta(null);
    setIsEditing(true);
    form.resetFields();
    form.setFieldsValue({
      title: '准备好开始您的项目了吗？',
      description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
      buttonText: '立即联系',
      link: '/contact',
      type: 'primary',
      order: 0,
    });
  };

  // 编辑CTA
  const editCTA = (record) => {
    setEditingCta(record);
    setIsEditing(true);
    form.setFieldsValue({
      ...record,
      description: record.description || '',
      link: record.link || '/contact',
      type: record.type || 'primary',
      order: record.order || 0
    });
  };

  // 删除CTA
  const deleteCTA = async (id) => {
    try {
      setLocalLoading(true);

      const response = await fetch(`${API_URL}/cta/${id}`, {
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
        fetchCTA(true);
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除CTA数据失败:', error);
      message.error(`删除失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCTA();
    }
  }, [token]);

  // 保存CTA数据
  const handleSave = async (values) => {
    setLocalLoading(true);
    try {
      let url = `${API_URL}/cta`;
      let method = 'POST';

      if (editingCta && editingCta.id) {
        url = `${API_URL}/cta/${editingCta.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `操作失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        message.success('保存成功！');
        setIsEditing(false);
        fetchCTA(true);
      } else {
        throw new Error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error(`保存失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '按钮文本',
      dataIndex: 'buttonText',
      key: 'buttonText',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        let color = 'blue';
        if (type === 'secondary') color = 'green';
        if (type === 'tertiary') color = 'orange';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.isActive && <Tag color="green">当前使用</Tag>}
          <Switch 
            checkedChildren="启用"
            unCheckedChildren="未用"
            checked={record.isActive} 
            onChange={() => setActiveCTA(record.id)}
          />
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => editCTA(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条CTA吗?"
            disabled={record.isActive}
            onConfirm={() => deleteCTA(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              disabled={record.isActive}
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>CTA管理</Title>

      {apiError && (
        <Alert
          message="获取数据失败"
          description="无法加载CTA数据，请检查网络连接后重试。"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={() => fetchCTA()}>
              重试
            </Button>
          }
        />
      )}

      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={createNewCTA}
        >
          添加CTA
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchCTA()}
          loading={localLoading}
        >
          刷新
        </Button>
        <Button
          type="dashed"
          icon={<ToolOutlined />}
          onClick={initializeCTATable}
          loading={initializeLoading}
        >
          初始化CTA表
        </Button>
      </Space>

      {!isEditing && (
        <>
          <p>注意: 使用开关可以设置当前使用的CTA，将在前台首页显示</p>
          <Table
            columns={columns}
            dataSource={ctaList}
            rowKey="id"
            loading={localLoading}
            pagination={false}
            rowClassName={record => record.isActive ? 'table-row-active' : ''}
          />
        </>
      )}

      {isEditing && (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ max: 500, message: '描述不能超过500个字符' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="buttonText" label="按钮文本" rules={[{ required: true, message: '请输入按钮文本' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="link" label="链接地址" rules={[{ required: true, message: '请输入链接地址' }]}>
              <Input placeholder="例如: /contact 或 https://example.com" />
            </Form.Item>
            <Form.Item name="type" label="按钮类型" rules={[{ required: true }]}>
              <Select>
                <Option value="primary">主要 (Primary)</Option>
                <Option value="secondary">次要 (Secondary)</Option>
                <Option value="tertiary">第三级 (Tertiary)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="order" label="排序顺序" rules={[{ type: 'number', message: '请输入数字' }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || localLoading}
                >
                  保存
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}

      {localLoading && !isEditing && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Spin tip="加载中..." />
        </div>
      )}

      {!apiError && ctaList.length === 0 && !localLoading && !isEditing && (
        <Alert
          message="没有找到CTA数据"
          description="当前数据库中没有CTA记录。点击'添加CTA'按钮创建第一条记录。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {/* 字符集选择对话框 */}
      <Modal
        title="选择数据库字符集"
        open={charsetModalVisible}
        onCancel={closeCharsetModal}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="修复字符集问题"
            description="如遇到字符集冲突，请选择与您的数据库兼容的字符集和排序规则。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form
            form={charsetForm}
            layout="vertical"
            initialValues={{
              charset: 'utf8mb4',
              collate: 'utf8mb4_unicode_ci'
            }}
            onFinish={executeInitialization}
          >
            <Form.Item
              name="charset"
              label="字符集"
              rules={[{ required: true, message: '请选择字符集' }]}
            >
              <Select>
                <Option value="utf8mb4">utf8mb4（推荐，支持所有Unicode字符）</Option>
                <Option value="utf8">utf8（标准，支持基本Unicode字符）</Option>
                <Option value="latin1">latin1（西欧语言）</Option>
                <Option value="gbk">gbk（中文）</Option>
                <Option value="armscii8">armscii8（亚美尼亚）</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="collate"
              label="排序规则"
              rules={[{ required: true, message: '请选择排序规则' }]}
            >
              <Select>
                <Option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci（通用）</Option>
                <Option value="utf8mb4_general_ci">utf8mb4_general_ci（快速）</Option>
                <Option value="utf8_general_ci">utf8_general_ci</Option>
                <Option value="latin1_general_ci">latin1_general_ci</Option>
                <Option value="gbk_chinese_ci">gbk_chinese_ci</Option>
                <Option value="armscii8_bin">armscii8_bin</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  开始初始化
                </Button>
                <Button onClick={closeCharsetModal}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Drawer
        title="CTA表初始化结果"
        placement="right"
        onClose={closeInitializeDrawer}
        open={showInitializeDrawer}
        width={500}
      >
        {initializeLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin tip="正在初始化..." />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text>以下是CTA表初始化过程中的操作日志：</Text>
            </div>
            <List
              dataSource={initializeResults}
              renderItem={item => (
                <List.Item>
                  <Text 
                    type={
                      item.status === 'error' ? 'danger' : 
                      item.status === 'warning' ? 'warning' : 
                      item.status === 'success' ? 'success' : undefined
                    } 
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {item.message}
                  </Text>
                </List.Item>
              )}
            />
            {initializeResults.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={closeInitializeDrawer}>
                  关闭
                </Button>
              </div>
            )}
          </>
        )}
      </Drawer>

      <style jsx>{`
        .table-row-active {
          background-color: #f6ffed;
        }
      `}</style>
    </div>
  );
};

export default CTAManager;