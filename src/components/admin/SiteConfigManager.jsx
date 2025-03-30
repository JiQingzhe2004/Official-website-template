import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Form, Input, Button, Modal, Popconfirm, message, Spin, Select, Upload, Tabs, Collapse, Badge, Alert, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, SaveOutlined, CheckCircleOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const SiteConfigManager = ({ token, loading: parentLoading, API_URL }) => {
  const [configs, setConfigs] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [requiredConfigs, setRequiredConfigs] = useState({
    home_page: { exists: false, value: null },
    site_description: { exists: false, value: null },
    site_favicon: { exists: false, value: null },
    site_logo: { exists: false, value: null },
    site_name: { exists: false, value: null },
    site_theme: { exists: false, value: null }
  });
  const [quickConfigVisible, setQuickConfigVisible] = useState(false);
  const [quickConfigForm] = Form.useForm();

  const requiredConfigsList = [
    { 
      key: 'home_page', 
      description: '首页slug', 
      type: 'text',
      path: '/',
      defaultValue: 'home',
      tip: '首页的URL路径标识，通常为"home"'
    },
    { 
      key: 'site_description', 
      description: '网站描述', 
      type: 'text',
      path: '/',
      defaultValue: '爱奇吉官方网站',
      tip: '用于SEO和分享链接时显示的网站简短描述'
    },
    { 
      key: 'site_favicon', 
      description: '网站图标路径', 
      type: 'image',
      path: '/',
      defaultValue: '/favicon.ico',
      tip: '浏览器标签页上显示的小图标'
    },
    { 
      key: 'site_logo', 
      description: '网站Logo路径', 
      type: 'image',
      path: '/',
      defaultValue: '/logo.png',
      tip: '网站Logo图片，显示在网站顶部导航栏'
    },
    { 
      key: 'site_name', 
      description: '网站名称', 
      type: 'text',
      path: '/',
      defaultValue: '爱奇吉',
      tip: '网站的名称，用于浏览器标题和各处显示'
    },
    { 
      key: 'site_theme', 
      description: '网站主题', 
      type: 'text',
      path: '/',
      defaultValue: 'light',
      tip: '网站的主题色调，可选值通常为"light"或"dark"'
    }
  ];

  const buildImageUrl = (path) => {
    if (!path) return '';
    // 判断是否为绝对URL
    if (path.startsWith('http')) return path;
    // 处理上传路径
    if (path.startsWith('/uploads/')) {
      return `${path}`;
    } else if (path.startsWith('/')) {
      return `/uploads${path}`;
    } else {
      return `/uploads/${path}`;
    }
  };

  const fetchConfigs = async () => {
    try {
      setLocalLoading(true);
      const apiPaths = [
        `${API_URL}/siteconfig`
      ];
      
      let response;
      let usedPath;
      
      for (const apiPath of apiPaths) {
        try {
          const tempResponse = await fetch(apiPath, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (tempResponse.ok) {
            response = tempResponse;
            usedPath = apiPath;
            break;
          }
        } catch (err) {
          console.error(`路径 ${apiPath} 请求失败:`, err);
        }
      }
      
      if (!response) {
        throw new Error('所有API路径请求均失败');
      }
          
      let data = await response.json();
      let configsArray = [];
      
      if (Array.isArray(data)) {
        configsArray = data;
      } else if (typeof data === 'object' && data !== null) {
        configsArray = Object.entries(data).map(([key, details]) => ({
          key,
          value: details.value,
          description: details.description,
          type: details.type || 'text',
          path: details.path || '/'
        }));
      }
      
      if (configsArray.length > 0) {
        const sortedConfigs = configsArray.sort((a, b) => a.key.localeCompare(b.key));
        setConfigs(sortedConfigs);
        
        const requiredStatus = { ...requiredConfigs };
        requiredConfigsList.forEach(required => {
          const found = configsArray.find(config => config.key === required.key);
          requiredStatus[required.key] = {
            exists: !!found,
            value: found ? found.value : null
          };
        });
        
        setRequiredConfigs(requiredStatus);
      } else {
        setConfigs([]);
        message.info('数据库中没有找到任何网站配置，您可以添加新的配置。');
      }
    } catch (error) {
      console.error('获取网站配置失败:', error);
      message.error('获取网站配置失败: ' + (error.message || '未知错误'));
      loadDefaultConfigs();
    } finally {
      setLocalLoading(false);
    }
  };

  const loadDefaultConfigs = () => {
    const defaultConfigs = requiredConfigsList.map(config => ({
      ...config,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }));
    setConfigs(defaultConfigs);
    const allMissing = Object.keys(requiredConfigs).reduce((acc, key) => {
      acc[key] = { exists: false, value: null };
      return acc;
    }, {});
    setRequiredConfigs(allMissing);
    
    message.warning('无法从服务器获取配置数据，已加载默认配置。保存新配置时将尝试连接服务器。');
  };

  useEffect(() => {
    fetchConfigs();
  }, [token]);

  const addConfig = () => {
    setCurrentConfig(null);
    form.resetFields();
    form.setFieldsValue({ 
      type: 'text',
      path: '/'
    });
    setFileList([]);
    setEditModalVisible(true);
  };

  const editConfig = (record) => {
    setCurrentConfig(record);
    form.setFieldsValue({
      key: record.key,
      value: record.value,
      description: record.description,
      type: record.type || 'text',
      path: record.path || '/'
    });
    if (record.type === 'image' && record.value) {
      setFileList([{
        uid: '-1',
        name: record.key,
        status: 'done',
        url: buildImageUrl(record.value)
      }]);
    } else {
      setFileList([]);
    }
    setEditModalVisible(true);
  };

  const deleteConfig = async (key) => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/siteconfig/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      
      message.success('配置删除成功');
      fetchConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败: ' + error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLocalLoading(true);
      
      if (values.type === 'image' && fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        formData.append('key', values.key);
        formData.append('description', values.description);
        formData.append('path', values.path);
        
        const uploadUrls = [
          `${API_URL}/uploads`,
          `${API_URL}/carousel/upload`,
          `${API_URL}/uploads/config`
        ];
        
        let uploadSuccess = false;
        let errorMessages = [];
        
        for (const uploadUrl of uploadUrls) {
          try {
            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              
              if (uploadResult.success) {
                values.value = uploadResult.filePath || uploadResult.imageUrl;
                uploadSuccess = true;
                break;
              }
            } else {
              const errorText = await uploadResponse.text();
              errorMessages.push(`${uploadUrl}: ${uploadResponse.status} ${errorText}`);
            }
          } catch (err) {
            errorMessages.push(`${uploadUrl}: ${err.message}`);
          }
        }
        
        if (!uploadSuccess) {
          throw new Error(`所有上传尝试均失败: ${errorMessages.join('; ')}`);
        }
      }
      
      if (values.type === 'json' && typeof values.value === 'string') {
        try {
          JSON.parse(values.value);
        } catch (e) {
          throw new Error('JSON格式无效');
        }
      }
      
      const response = await fetch(`${API_URL}/siteconfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      message.success((currentConfig ? '更新' : '创建') + '配置成功');
      setEditModalVisible(false);
      fetchConfigs();
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存失败: ' + error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const getMissingConfigCount = () => {
    return Object.values(requiredConfigs).filter(config => !config.exists).length;
  };

  const renderConfigStatusBadge = (key) => {
    const exists = requiredConfigs[key].exists;
    return exists ? 
      <Badge status="success" text="已配置" /> : 
      <Badge status="error" text="未配置" />;
  };

  const renderConfigValue = (text, record) => {
    if (record.type === 'image' && text) {
      // 确保有效的图片链接
      const imgUrl = buildImageUrl(text);
      return (
        <div onClick={() => {
          setPreviewImage(imgUrl);
          setPreviewVisible(true);
        }}>
          <img 
            src={imgUrl} 
            alt={record.key}
            style={{ maxWidth: '100px', maxHeight: '40px', cursor: 'pointer' }} 
          />
        </div>
      );
    } else if (record.type === 'json') {
      try {
        if (typeof text === 'string') {
          const jsonObj = JSON.parse(text);
          return <pre style={{ maxHeight: '60px', overflow: 'auto' }}>{JSON.stringify(jsonObj, null, 2).substring(0, 100)}...</pre>;
        } else {
          return <pre style={{ maxHeight: '60px', overflow: 'auto' }}>{JSON.stringify(text, null, 2).substring(0, 100)}...</pre>;
        }
      } catch (e) {
        return <Text type="danger">无效的JSON: {String(text).substring(0, 100)}</Text>;
      }
    } else if (record.type === 'html') {
      return <div style={{ maxHeight: '60px', overflow: 'auto' }}><Text code>{String(text).substring(0, 100)}{text.length > 100 ? '...' : ''}</Text></div>;
    } else if (typeof text === 'string' && text.length > 100) {
      return <span>{text.substring(0, 100)}...</span>;
    }
    return <span>{text}</span>;
  };

  const columns = [
    {
      title: '键名',
      dataIndex: 'key',
      key: 'key',
      width: 150,
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      filters: [
        { text: '文本', value: 'text' },
        { text: '图片', value: 'image' },
        { text: 'JSON', value: 'json' },
        { text: 'HTML', value: 'html' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (text) => {
        const typeMappings = {
          'text': '文本',
          'image': '图片',
          'json': 'JSON',
          'html': 'HTML'
        };
        return typeMappings[text] || text;
      }
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: renderConfigValue
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 150,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 80,
      filters: [
        { text: '全局', value: '/' },
        { text: '首页', value: '/home' },
        { text: '关于', value: '/about' }
      ],
      onFilter: (value, record) => record.path === value,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (text) => text ? new Date(text).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <>
          <ActionButton 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => editConfig(record)}
          >
            编辑
          </ActionButton>
          <Popconfirm
            title="确定要删除此配置项吗?"
            description="删除后不可恢复"
            onConfirm={() => deleteConfig(record.key)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const onFinishQuickConfig = async (values) => {
    try {
      setLocalLoading(true);
      const createPromises = [];
      
      for (const configItem of requiredConfigsList) {
        if (!requiredConfigs[configItem.key].exists) {
          const configValue = values[configItem.key] || configItem.defaultValue;
          
          if (configItem.type === 'image' && values[`${configItem.key}_file`] && values[`${configItem.key}_file`][0]) {
            const formData = new FormData();
            formData.append('file', values[`${configItem.key}_file`][0].originFileObj);
            formData.append('key', configItem.key);
            formData.append('description', configItem.description);
            formData.append('path', configItem.path);
            
            const uploadPromise = fetch(`${API_URL}/uploads/config`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            }).then(response => {
              if (!response.ok) throw new Error(`上传${configItem.description}失败`);
              return response.json();
            }).then(data => {
              if (!data.success) throw new Error(data.message);
              return true;
            });
            
            createPromises.push(uploadPromise);
          } else {
            const createPromise = fetch(`${API_URL}/siteconfig`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                key: configItem.key,
                value: configValue,
                description: configItem.description,
                type: configItem.type,
                path: configItem.path
              })
            }).then(response => {
              if (!response.ok) throw new Error(`创建${configItem.description}配置失败`);
              return response.json();
            });
            
            createPromises.push(createPromise);
          }
        }
      }
      
      if (createPromises.length > 0) {
        await Promise.all(createPromises);
        message.success('基础配置项创建完成');
        setQuickConfigVisible(false);
        fetchConfigs();
      } else {
        message.info('所有必需的配置项都已存在');
        setQuickConfigVisible(false);
      }
    } catch (error) {
      console.error('创建基础配置项失败:', error);
      message.error(`创建基础配置项失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>网站配置管理</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="配置项列表" key="1">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                style={{ marginRight: 8 }} 
                onClick={addConfig}
              >
                添加配置项
              </Button>
              <Tooltip title="创建或更新基础配置项">
                <Button 
                  type={getMissingConfigCount() > 0 ? "danger" : "default"}
                  onClick={() => setQuickConfigVisible(true)}
                  icon={<QuestionCircleOutlined />} 
                >
                  基础配置检查
                  {getMissingConfigCount() > 0 && (
                    <Badge 
                      count={getMissingConfigCount()} 
                      size="small" 
                      offset={[5, -5]}
                    />
                  )}
                </Button>
              </Tooltip>
            </div>  
            <Text type="secondary">
              已配置 {configs.length} 项，基础配置缺失 {getMissingConfigCount()} 项
            </Text>
          </div>
          <Spin spinning={parentLoading || localLoading}>
            <Table 
              columns={columns} 
              dataSource={configs}
              rowKey="key"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1300 }}
              size="middle"
              rowClassName={(record) => {
                const isRequired = requiredConfigsList.some(config => config.key === record.key);
                return isRequired ? 'highlight-row' : '';
              }}
            />
          </Spin>
        </TabPane>
        
        <TabPane tab="基础配置概览" key="2">
          <Alert
            message="基础配置项说明"
            description="以下配置项是网站正常运行所需的基础配置，请确保它们已正确配置。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Collapse defaultActiveKey={['1']}>
            <Panel header="网站基础配置" key="1">
              <table className="config-status-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>配置键</th>
                    <th style={{ width: '20%' }}>描述</th>
                    <th style={{ width: '40%' }}>当前值</th>
                    <th style={{ width: '20%' }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {requiredConfigsList.map(config => (
                    <tr key={config.key}>
                      <td><Text code>{config.key}</Text></td>
                      <td>
                        <Tooltip title={config.tip}>
                          <Text>{config.description}</Text>
                          <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                        </Tooltip>
                      </td>
                      <td>
                        {requiredConfigs[config.key].exists ? (
                          config.type === 'image' ? 
                            <img 
                              src={buildImageUrl(requiredConfigs[config.key].value)} 
                              alt={config.key}
                              style={{ maxHeight: '30px' }}
                            /> : 
                            <Text>{requiredConfigs[config.key].value || '-'}</Text>
                        ) : (
                          <Text type="danger">未设置</Text>
                        )}
                      </td>
                      <td>
                        {renderConfigStatusBadge(config.key)}
                      </td>
                    </tr>
                  ))}
                </tbody> 
              </table>
            </Panel>
          </Collapse>
          
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              onClick={() => setQuickConfigVisible(true)} 
              disabled={getMissingConfigCount() === 0}
            >
              一键创建缺失配置
            </Button>
          </div>
        </TabPane>
      </Tabs>
      
      <Modal
        title={currentConfig ? '编辑配置项' : '添加配置项'}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="key"
            label="键名"
            rules={[
              { required: true, message: '请输入键名' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '键名只能包含字母、数字和下划线' }
            ]}
            tooltip="键名是唯一的标识符，只能包含字母、数字和下划线"
          >
            <Input placeholder="请输入键名" readOnly={!!currentConfig} />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="text">文本</Option>
              <Option value="html">HTML</Option>
              <Option value="image">图片</Option>
              <Option value="json">JSON</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'image') {
                return (
                  <Form.Item
                    name="value"
                    label="图片"
                    valuePropName="file"
                  >
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setFileList(fileList)}
                      onPreview={(file) => {
                        setPreviewImage(file.url || file.thumbUrl || buildImageUrl(file.name));
                        setPreviewVisible(true);
                      }}
                      maxCount={1}
                    >
                      {fileList.length >= 1 ? null : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>上传图片</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                );
              }
              
              if (type === 'html' || type === 'json') {
                return (
                  <Form.Item
                    name="value"
                    label="值"
                    rules={[{ required: true, message: '请输入值' }]}
                  >
                    <TextArea 
                      rows={6}    
                      placeholder={`请输入${type === 'html' ? 'HTML' : 'JSON'}内容`} 
                    />
                  </Form.Item>
                );
              }
              
              return (
                <Form.Item
                  name="value"
                  label="值"
                  rules={[{ required: true, message: '请输入值' }]}
                >
                  <Input placeholder="请输入配置值" />
                </Form.Item>
              );
            }}
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input placeholder="请输入配置项的描述" />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '请输入路径' }]}
            tooltip="指定此配置项适用的路径，默认为 / 表示全局"
          >
            <Select defaultValue="/">
              <Option value="/">全局 (/)</Option>
              <Option value="/home">首页 (/home)</Option>
              <Option value="/about">关于我们 (/about)</Option>
              <Option value="/contact">联系我们 (/contact)</Option>
              <Option value="/services">服务 (/services)</Option>
              <Option value="/cases">案例 (/cases)</Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setEditModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={localLoading} icon={<SaveOutlined />}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="图片预览"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      
      <Modal
        title="基础配置创建向导"
        open={quickConfigVisible}
        onCancel={() => setQuickConfigVisible(false)}
        footer={null}
        width={800}
      >
        <Alert
          message="创建基础配置项"
          description="以下是网站所需的基础配置项。已存在的配置不会被修改，只会创建缺失的配置。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={quickConfigForm}
          layout="vertical"
          onFinish={onFinishQuickConfig}
          initialValues={requiredConfigsList.reduce((acc, item) => {
            acc[item.key] = item.defaultValue;
            return acc;
          }, {})}
        >
          {requiredConfigsList.map(config => {
            if (requiredConfigs[config.key].exists) {
              return (
                <Form.Item
                  key={config.key}
                  label={
                    <span>
                      {config.description} ({config.key})
                      <Badge 
                        status="success"
                        text="已配置"
                        style={{ marginLeft: 8 }}
                      />
                    </span>
                  }
                >
                  {config.type === 'image' ? (
                    <img 
                      src={buildImageUrl(requiredConfigs[config.key].value)} 
                      alt={config.key}
                      style={{ maxHeight: '50px' }}
                    />
                  ) : (
                    <Input 
                      value={requiredConfigs[config.key].value} 
                      disabled 
                      addonAfter={<CheckCircleOutlined style={{ color: 'green' }} />}
                    />
                  )}
                </Form.Item>
              );
            }
            
            if (config.type === 'image') {
              return (
                <Form.Item
                  key={config.key}
                  label={
                    <span>
                      {config.description} ({config.key})
                      <Badge 
                        status="error"
                        text="未配置"
                        style={{ marginLeft: 8 }}
                      />
                    </span>
                  }
                  tooltip={config.tip}
                >
                  <Form.Item name={`${config.key}_file`} noStyle>
                    <Upload
                      listType="picture-card"
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setFileList(fileList)}
                      maxCount={1}
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Form.Item>
              );
            }
            
            return (
              <Form.Item
                key={config.key}
                name={config.key}
                label={
                  <span>
                    {config.description} ({config.key})
                    <Badge 
                      status="error"
                      text="未配置" 
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                tooltip={config.tip}
              >
                <Input placeholder={`请输入${config.description}`} />
              </Form.Item>
            );
          })}
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setQuickConfigVisible(false)}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={localLoading} 
              disabled={getMissingConfigCount() === 0}
            >
              创建缺失配置
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <style jsx="true">{`
        .config-status-table th, .config-status-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .highlight-row {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default SiteConfigManager;
