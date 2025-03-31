import React, { useState } from 'react';
import { Card, Button, Collapse, Typography, Space } from 'antd';
import { BugOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/**
 * 调试面板组件，用于测试API连通性
 */
const DebugPanel = () => {
  const [visible, setVisible] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    setResults([]);

    const endpoints = [
      { name: '健康检查', url: '/api/health-check' },
      { name: '调试端点', url: '/api/debug-endpoints' },
      { name: '邮件路由', url: '/api/debug-mail-route' },
      { name: '测试邮件', url: '/api/test-mail', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method || 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: endpoint.method === 'POST' ? JSON.stringify({ test: true }) : undefined
        });

        let result;
        try {
          result = await response.json();
        } catch (e) {
          result = { error: '无法解析响应', text: await response.text() };
        }

        setResults(prev => [...prev, {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          data: result
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          ok: false,
          error: error.message
        }]);
      }
    }

    setLoading(false);
  };

  if (!visible) {
    return (
      <Button
        type="primary"
        shape="circle"
        icon={<BugOutlined />}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
        onClick={() => setVisible(true)}
      />
    );
  }

  return (
    <Card
      title="API调试面板"
      style={{ position: 'fixed', bottom: 20, right: 20, width: 400, zIndex: 1000 }}
      extra={<Button icon={<CloseOutlined />} onClick={() => setVisible(false)} />}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" loading={loading} onClick={testEndpoints}>
          测试API端点
        </Button>

        {results.length > 0 && (
          <Collapse>
            {results.map((result, index) => (
              <Panel 
                key={index} 
                header={`${result.name} - ${result.ok ? '✅ 成功' : '❌ 失败'}`}
              >
                <Paragraph><Text strong>URL:</Text> {result.url}</Paragraph>
                <Paragraph><Text strong>状态:</Text> {result.status}</Paragraph>
                {result.error && <Paragraph><Text strong>错误:</Text> {result.error}</Paragraph>}
                {result.data && (
                  <Paragraph>
                    <Text strong>数据:</Text>
                    <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </Paragraph>
                )}
              </Panel>
            ))}
          </Collapse>
        )}
      </Space>
    </Card>
  );
};

export default DebugPanel;
