import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Tabs, List, Space, Popconfirm } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import IconSelector from './IconSelector';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  margin-bottom: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SocialMediaItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const FooterManager = ({ token, loading, API_URL }) => {
  const [form] = Form.useForm();
  const [localLoading, setLocalLoading] = useState(false);
  const [socialMedia, setSocialMedia] = useState([]);
  const [saveResults, setSaveResults] = useState({ success: false, items: [] });
  const [showResults, setShowResults] = useState(false);
  const [copyrightPrefix, setCopyrightPrefix] = useState(`© ${new Date().getFullYear()} `);

  useEffect(() => {
    fetchFooterConfig();
  }, []);

  // 获取底部配置
  const fetchFooterConfig = async () => {
    try {
      setLocalLoading(true);
      const response = await fetch(`${API_URL}/footer/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`获取失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        // 提取基本配置并设置表单字段
        const basicConfig = {
          company_name: data.data.company_name || '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）',
          company_description: data.data.company_description || '专注于互联网信息服务的科技公司',
          contact_phone: data.data.contact_phone || '+86 (10) 1234-5678',
          contact_email: data.data.contact_email || 'info@aiqiji.com',
          // 提取版权信息，移除年份前缀
          copyright_content: data.data.copyright 
            ? data.data.copyright.replace(/^© \d{4} /, '') 
            : '郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有',
          icp: data.data.icp || '豫ICP备2023020388号-2',
          icp_link: data.data.icp_link || 'https://beian.miit.gov.cn/'
        };
        
        form.setFieldsValue(basicConfig);
        
        // 处理社交媒体数据
        if (data.data.social_media) {
          try {
            const socialMediaData = typeof data.data.social_media === 'string' 
              ? JSON.parse(data.data.social_media) 
              : data.data.social_media;
            
            if (Array.isArray(socialMediaData)) {
              setSocialMedia(socialMediaData);
            } else {
              // 兼容旧数据格式（对象格式转为数组格式）
              const convertedData = Object.entries(socialMediaData).map(([name, value], index) => ({
                id: index + 1,
                name,
                link: value,
                icon: name // 使用name作为默认图标名称
              }));
              setSocialMedia(convertedData);
            }
          } catch (e) {
            console.error('解析社交媒体数据失败:', e);
            setSocialMedia([]);
          }
        } else {
          // 默认社交媒体项
          setSocialMedia([
            { id: 1, name: '微信', icon: 'wechat', link: 'aiqiji_weixin' },
            { id: 2, name: '微博', icon: 'weibo', link: 'aiqiji_weibo' },
            { id: 3, name: '知乎', icon: 'zhihu', link: 'aiqiji' }
          ]);
        }
      } else {
        console.log("加载默认配置");
        // 设置默认值
        form.setFieldsValue({
          company_name: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）',
          company_description: '专注于互联网信息服务的科技公司',
          contact_phone: '+86 (10) 1234-5678',
          contact_email: 'info@aiqiji.com',
          copyright_content: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有',
          icp: '豫ICP备2023020388号-2',
          icp_link: 'https://beian.miit.gov.cn/'
        });
        setSocialMedia([
          { id: 1, name: '微信', icon: 'wechat', link: 'aiqiji_weixin' },
          { id: 2, name: '微博', icon: 'weibo', link: 'aiqiji_weibo' },
          { id: 3, name: '知乎', icon: 'zhihu', link: 'aiqiji' }
        ]);
      }
    } catch (error) {
      console.error('获取底部配置失败:', error);
      message.error('获取底部配置失败，已加载默认内容');
      // 即使出错也设置默认值确保表单可用
      form.setFieldsValue({
        company_name: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙）',
        company_description: '专注于互联网信息服务的科技公司',
        contact_phone: '+86 (10) 1234-5678',
        contact_email: 'info@aiqiji.com',
        copyright_content: '郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有',
        icp: '豫ICP备2023020388号-2',
        icp_link: 'https://beian.miit.gov.cn/'
      });
      setSocialMedia([
        { id: 1, name: '微信', icon: 'wechat', link: 'aiqiji_weixin' },
        { id: 2, name: '微博', icon: 'weibo', link: 'aiqiji_weibo' },
        { id: 3, name: '知乎', icon: 'zhihu', link: 'aiqiji' }
      ]);
    } finally {
      setLocalLoading(false);
    }
  };

  // 添加社交媒体项
  const addSocialMediaItem = () => {
    const newItem = {
      id: Date.now(), // 使用时间戳作为临时id
      name: '',
      icon: 'link',
      link: ''
    };
    setSocialMedia([...socialMedia, newItem]);
  };

  // 删除社交媒体项
  const removeSocialMediaItem = (id) => {
    setSocialMedia(socialMedia.filter(item => item.id !== id));
  };

  // 更新社交媒体项
  const updateSocialMediaItem = (id, field, value) => {
    setSocialMedia(socialMedia.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 保存底部配置
  const saveFooterConfig = async (values) => {
    try {
      setLocalLoading(true);
      
      // 验证社交媒体项
      const validSocialMedia = socialMedia.filter(item => item.name && item.link);
      if (validSocialMedia.length < socialMedia.length) {
        message.warning('部分社交媒体项未填写完整，将被忽略');
      }
      
      // 处理版权声明，自动添加年份前缀
      const fullCopyright = `© ${new Date().getFullYear()} ${values.copyright_content}`;
      
      // 准备要保存的数据
      const dataToSave = {
        ...values,
        copyright: fullCopyright, // 使用完整版权信息替换原来的字段
        social_media: JSON.stringify(validSocialMedia)
      };
      
      // 删除临时字段，避免保存到数据库
      delete dataToSave.copyright_content;
      
      // 记录更改项
      const savedItems = [
        '公司信息',
        '联系方式',
        `社交媒体 (${validSocialMedia.length}项)`,
        '版权与备案信息'
      ];
      
      const response = await fetch(`${API_URL}/footer/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSaveResults({
          success: true,
          items: savedItems
        });
        setShowResults(true);
        message.success('底部配置保存成功');
      } else {
        message.error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存底部配置失败:', error);
      message.error(`保存失败: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>底部内容管理</Title>
      {showResults && saveResults.success && (
        <Card style={{ marginBottom: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Text strong>保存成功！已更新以下内容：</Text>
          <ul>
            {saveResults.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <Button type="link" onClick={() => setShowResults(false)}>关闭</Button>
        </Card>
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={saveFooterConfig}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <StyledCard title="公司信息">
              <FormSection>
                <Form.Item
                  name="company_name"
                  label="公司名称"
                  rules={[{ required: true, message: '请输入公司名称' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="company_description"
                  label="公司描述"
                >
                  <Input />
                </Form.Item>
              </FormSection>
            </StyledCard>

            <StyledCard title="联系信息">
              <FormSection>
                <Form.Item
                  name="contact_phone"
                  label="联系电话"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="contact_email"
                  label="联系邮箱"
                  rules={[
                    {
                      type: 'email',
                      message: '请输入有效的邮箱地址',
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
              </FormSection>
            </StyledCard>
          </TabPane>

          <TabPane tab="社交媒体" key="2">
            <StyledCard 
              title="社交媒体链接" 
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={addSocialMediaItem}
                >
                  添加
                </Button>
              }
            >
              {socialMedia.map(item => (
                <SocialMediaItem key={item.id}>
                  <Space style={{ width: '100%' }}>
                    <IconSelector 
                      value={item.icon}
                      onChange={(value) => updateSocialMediaItem(item.id, 'icon', value)}
                      style={{ width: 120 }}
                    />
                    <Input
                      placeholder="名称"
                      value={item.name}
                      onChange={(e) => updateSocialMediaItem(item.id, 'name', e.target.value)}
                      style={{ width: 120 }}
                    />
                    <Input
                      placeholder="链接或ID"
                      value={item.link}
                      onChange={(e) => updateSocialMediaItem(item.id, 'link', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Popconfirm
                      title="确定要删除此项吗？"
                      onConfirm={() => removeSocialMediaItem(item.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        danger 
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                </SocialMediaItem>
              ))}
              {socialMedia.length === 0 && (
                <Text type="secondary">暂无社交媒体，请点击"添加"按钮添加</Text>
              )}
            </StyledCard>
          </TabPane>

          <TabPane tab="版权与备案" key="3">
            <StyledCard title="版权信息">
              <FormSection>
                <div style={{ marginBottom: '16px' }}>
                  <Text>版权前缀：</Text>
                  <Text strong>{copyrightPrefix}</Text>
                  <Text type="secondary"> (自动更新为当前年份)</Text>
                </div>
                <Form.Item
                  name="copyright_content"
                  label="版权声明内容"
                  rules={[{ required: true, message: '请输入版权信息' }]}
                >
                  <Input placeholder="公司名称及版权说明，如：郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有" />
                </Form.Item>
                <Text type="secondary">系统会自动在前面添加"© 当前年份 "，您只需填写后面的内容</Text>
              </FormSection>
            </StyledCard>

            <StyledCard title="备案信息">
              <FormSection>
                <Form.Item
                  name="icp"
                  label="ICP备案号"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="icp_link"
                  label="ICP备案链接"
                  help="通常为 https://beian.miit.gov.cn/"
                >
                  <Input disabled />
                </Form.Item>
                <Text type="secondary">备案链接固定为工信部网站，无需修改</Text>
              </FormSection>
            </StyledCard>
          </TabPane>
        </Tabs>

        <Divider />
        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={localLoading}
          >
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FooterManager;
