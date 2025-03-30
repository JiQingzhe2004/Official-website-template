import React, { useState } from 'react';
import { Card, Button, Input, Table, Typography, Space, Divider, Alert, Spin } from 'antd';
import { SendOutlined, BugOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ApiDebugger = ({ API_URL, token }) => {
  const [endpoint, setEndpoint] = useState('/siteconfig');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState(JSON.stringify({ 
    'Authorization': `Bearer ${token}`
  }, null, 2));
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const url = `${API_URL}${endpoint}`;
      
      const options = {
        method,
        headers: JSON.parse(headers)
      };
      
      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
      }
      
      console.log(`发送 ${method} 请求到 ${url}`);
      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = '无效的JSON响应';
      }
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        time: endTime - startTime,
        headers: Object.fromEntries([...response.headers.entries()])
      });
    } catch (err) {
      console.error('API请求失败:', err);
      setError(`请求失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>API调试工具</Title>
      <Paragraph>
        使用此工具直接测试API端点，帮助排除路由和权限问题。
      </Paragraph>
      
      <Card title="请求参数" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>方法:</Text>
            <Space>
              {['GET', 'POST', 'PUT', 'DELETE'].map(m => (
                <Button 
                  key={m} 
                  type={method === m ? 'primary' : 'default'}
                  onClick={() => setMethod(m)}
                >
                  {m}
                </Button>
              ))}
            </Space>
          </div>
          
          <div>
            <Text strong>端点:</Text>
            <Input
              addonBefore={API_URL}
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              style={{ width: '100%' }}
            />
            <Text type="secondary">例如: /siteconfig/all</Text>
          </div>
          
          <div>
            <Text strong>请求头:</Text>
            <TextArea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
            />
            <Text type="secondary">JSON格式</Text>
          </div>
          
          {(method === 'POST' || method === 'PUT') && (
            <div>
              <Text strong>请求体:</Text>
              <TextArea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
              <Text type="secondary">JSON格式</Text>
            </div>
          )}
          
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={sendRequest}
            loading={loading}
          >
            发送请求
          </Button>
        </Space>
      </Card>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="请求中..." />
        </div>
      )}
      
      {error && (
        <Alert
          message="请求出错"
          description={error}
          type="error"
          showIcon
        />
      )}
      
      {response && (
        <Card title="响应结果" style={{ marginBottom: 16 }}>
          <div>
            <Text strong>状态: </Text>
            <Text 
              type={response.status >= 200 && response.status < 300 ? 'success' : 'danger'}
            >
              {response.status} {response.statusText}
            </Text>
          </div>
          
          <div>
            <Text strong>响应时间: </Text>
            <Text>{response.time} ms</Text>
          </div>
          
          <Divider orientation="left">响应头</Divider>
          <TextArea
            value={JSON.stringify(response.headers, null, 2)}
            readOnly
            rows={4}
          />
          
          <Divider orientation="left">响应体</Divider>
          <TextArea
            value={typeof response.data === 'object' ? 
              JSON.stringify(response.data, null, 2) : 
              String(response.data)
            }
            readOnly
            rows={10}
          />
        </Card>
      )}
      
      <Card title="常用API端点">
        <Table 
          columns={[
            { title: '路径', dataIndex: 'path', key: 'path' },
            { title: '描述', dataIndex: 'desc', key: 'desc' },
            { 
              title: '操作', 
              key: 'action', 
              render: (_, record) => (
                <Button 
                  type="link" 
                  onClick={() => {
                    setEndpoint(record.path);
                    setMethod(record.method || 'GET');
                    if (record.body) setBody(JSON.stringify(record.body));
                  }}
                >
                  使用
                </Button>
              )
            }
          ]}
          dataSource={[
            { key: '1', path: '/siteconfig', desc: '获取所有配置(对象格式)', method: 'GET' },
            { key: '2', path: '/siteconfig/all', desc: '获取所有配置(数组格式)', method: 'GET' },
            { key: '3', path: '/siteconfig/home_page', desc: '获取指定配置', method: 'GET' },
            { key: '4', path: '/debug-endpoint', desc: '调试端点', method: 'GET' },
            { key: '5', path: '/siteconfig', desc: '创建/更新配置', method: 'POST', body: { key: 'test_key', value: 'test_value', description: '测试配置', type: 'text', path: '/' } }
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ApiDebugger;
