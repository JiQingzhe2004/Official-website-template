import React, { useState } from 'react';
import { Typography, Card, Button, message, Space, Spin, Table, Tabs } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ApiManager = ({ token, API_URL }) => {
  const [loading, setLoading] = useState(false);
  const [apiConfig] = useState({
    baseUrl: API_URL,
  });
  const [testResults, setTestResults] = useState([]);

  const testApiConnection = async () => {
    try {
      setLoading(true);
      setTestResults([]);
      
      const endpointsToTest = [
        { name: '轮播图', path: '/carousel' },
        { name: '服务', path: '/services' },
        { name: '统计数据', path: '/stats' },
        { name: '为什么选择我们', path: '/whyus' },
        { name: 'CTA', path: '/cta' },
        { name: '网站配置', path: '/siteconfig' },
        { name: '底部配置', path: '/footer/config' },
        { name: '菜单项', path: '/menuitems' },
        { name: '页面', path: '/pages' },
        { 
          name: '文件上传API', 
          path: '/uploads/test', 
          method: 'GET', 
          note: '检查文件上传服务是否正常' 
        }
      ];
      
      const results = [];
      
      for (const endpoint of endpointsToTest) {
        try {
          const startTime = Date.now();
          const headers = {};
          if (endpoint.path.includes('/status/db') || endpoint.path.includes('/uploads/test')) {
            headers.Authorization = `Bearer ${token}`;
          }
          
          const response = await fetch(`${apiConfig.baseUrl}${endpoint.path}`, { 
            method: endpoint.method || 'GET',
            headers 
          });
          const responseTime = Date.now() - startTime;
          
          const result = {
            name: endpoint.name,
            endpoint: endpoint.path,
            status: response.status,
            responseTime: `${responseTime}ms`,
            success: response.ok,
            note: endpoint.note
          };
          
          results.push(result);
        } catch (error) {
          results.push({
            name: endpoint.name,
            endpoint: endpoint.path,
            status: 'Error',
            responseTime: '-',
            success: false,
            error: error.message,
            note: endpoint.note
          });
        }
      }
      
      setTestResults(results);
      message.success('API测试完成');
    } catch (error) {
      console.error("API测试失败:", error);
      message.error(`测试失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testResultColumns = [
    { title: '接口名称', dataIndex: 'name', key: 'name' },
    { title: '接口路径', dataIndex: 'endpoint', key: 'endpoint' },
    { 
      title: '状态码', 
      dataIndex: 'status', 
      key: 'status',
      render: (text, record) => (
        <span style={{ color: record.success ? 'green' : 'red' }}>
          {text}
        </span>
      )
    },
    { title: '响应时间', dataIndex: 'responseTime', key: 'responseTime' },
    { 
      title: '状态', 
      key: 'success',
      render: (_, record) => (
        <span style={{ color: record.success ? 'green' : 'red' }}>
          {record.success ? '成功' : '失败'}
          {record.error && ` - ${record.error}`}
        </span>
      )
    }
  ];

  return (
    <div>
      <Title level={3}>API管理</Title>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="API测试" key="1">
          <Card title="接口测试" style={{ marginBottom: 16 }}>
            <Paragraph>
              点击下方按钮测试API连接情况，将测试所有接口的可用性和响应时间。
            </Paragraph>
            <Button
              type="primary"
              icon={<ApiOutlined />}
              onClick={testApiConnection}
              loading={loading}
              style={{ marginBottom: 16 }}
            >
              测试API连接
            </Button>
            {testResults.length > 0 && (
              <Table
                dataSource={testResults}
                columns={testResultColumns}
                rowKey="endpoint"
                pagination={false}
              />
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="API文档" key="2">
          <Card>
            <Paragraph>
              <Title level={4}>API文档</Title>
              <p>以下是本系统的主要API端点:</p>
              <ul>
                <li><strong>/api/auth</strong> - 认证相关接口</li>
                <li><strong>/api/carousel</strong> - 获取轮播图数据</li>
                <li><strong>/api/services</strong> - 获取服务数据</li>
                <li><strong>/api/stats</strong> - 获取统计数据</li>
                <li><strong>/api/whyus</strong> - 获取"为什么选择我们"数据</li>
                <li><strong>/api/cta</strong> - 获取CTA数据</li>
                <li><strong>/api/cta/active</strong> - 获取当前激活的CTA</li>
                <li><strong>/api/siteconfig</strong> - 获取网站配置</li>
                <li><strong>/api/uploads/config</strong> - 上传配置图片（POST）</li>
                <li><strong>/api/footer/config</strong> - 获取底部配置</li>
                <li><strong>/api/menuitems</strong> - 获取菜单项</li>
                <li><strong>/api/pages</strong> - 获取页面数据</li>
                <li><strong>/api/status</strong> - 获取系统状态</li>
                <li><strong>/api/status/db</strong> - 获取数据库状态（需要认证）</li>
              </ul>
              <p>所有管理API都需要在请求头中包含JWT令牌:</p>
              <pre>Authorization: Bearer {'{你的JWT令牌}'}</pre>
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
      
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Spin tip="处理中..." />
        </div>
      )}
    </div>
  );
};

export default ApiManager;