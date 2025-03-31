import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Row, Col, Form, Input, Button, Typography, Card, Divider, message, Spin, Result } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, GlobalOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
// 引入IconPark的Tiktok图标
import { Tiktok } from '@icon-park/react';
import AMapLoader from '@amap/amap-jsapi-loader';
import DebugPanel from '../components/DebugPanel'; // 导入调试面板组件

// 尝试导入配置文件，如果失败则使用默认配置
let captchaConfig;
try {
  captchaConfig = require('../../server/config/captcha').default;
} catch (error) {
  console.warn('无法加载验证码配置文件，使用默认配置');
  captchaConfig = {
    appId: '190331080' // 默认AppID
  };
}

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
`;

const ContactTitle = styled(Title)`
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem !important;
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #1890ff, #36cfc9);
  }
`;

const ContactCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: #1890ff;
  margin-bottom: 1rem;
  text-align: center;
`;

const FormContainer = styled.div`
  background-color: #f0f7ff;
  padding: 3rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 3rem;
  position: relative;
`;

const StyledForm = styled(Form)`
  .ant-form-item-label > label {
    font-weight: 500;
  }
  .ant-input, .ant-input-textarea {
    border-radius: 4px;
  }
  .ant-btn-primary {
    height: 45px;
    font-size: 1rem;
  }
`;

const SpinContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
`;

const MapContainer = styled.div`
  height: 400px;
  background-color: #f0f7ff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 地图组件
const AMapComponent = () => {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    // 加载高德地图
    AMapLoader.load({
      key: 'a535a27fe8b061255608cd4ece8102eb', // 更新后的高德地图API密钥
      securityJsCode: '7c64efe05791c4c2853d99455b1b9d96', // 安全密钥
      version: '2.0',
      plugins: ['AMap.ToolBar', 'AMap.Scale']
    }).then((AMap) => {
      if (mapRef.current) {
        // 创建地图实例
        const map = new AMap.Map(mapRef.current, {
          zoom: 15,
          center: [113.918099, 34.802371], // 替换为你的公司位置坐标
        });

        // 添加标记点
        const marker = new AMap.Marker({
          position: [113.918099, 34.802371], // 替换为你的公司位置坐标
          title: '公司名称'
        });

        map.add(marker);
      }
    }).catch(e => {
      console.error('高德地图加载失败', e);
    });

    return () => {
      // 清理地图实例
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>;
};

// 添加全局标记，记录脚本是否已加载
const isTCaptchaLoaded = () => document.querySelector('script[src="https://ssl.captcha.qq.com/TCaptcha.js"]') !== null;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [captchaTicket, setCaptchaTicket] = useState(''); // 腾讯云验证码票据
  const [captchaRandstr, setCaptchaRandstr] = useState(''); // 腾讯云验证码随机串
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); // 新增：验证中状态

  // 加载腾讯云验证码脚本
  useEffect(() => {
    // 检查脚本是否已存在，避免重复加载
    if (!isTCaptchaLoaded()) {
      const script = document.createElement('script');
      script.src = "https://ssl.captcha.qq.com/TCaptcha.js";
      script.async = true;
      script.id = "tencent-captcha-script"; // 添加ID便于识别
      document.body.appendChild(script);
      
      return () => {
        // 只有在脚本存在时才尝试移除
        const scriptElement = document.getElementById('tencent-captcha-script');
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        }
      };
    }
  }, []); // 确保这个效果只运行一次

  // 显示腾讯云验证码
  const showTencentCaptcha = () => {
    return new Promise((resolve, reject) => {
      if (window.TencentCaptcha) {
        try {
          const captcha = new window.TencentCaptcha(
            captchaConfig.appId,
            (res) => {
              if (res.ret === 0) {
                // 验证成功，确保保存票据和随机串
                setCaptchaTicket(res.ticket);
                setCaptchaRandstr(res.randstr);
                message.success('验证成功');
                resolve({ ticket: res.ticket, randstr: res.randstr });
              } else if (res.ret === 2) {
                message.info('验证已取消，请完成验证后提交');
                reject(new Error('用户取消验证'));
              } else {
                message.error(`验证失败(${res.ret}): ${res.msg || '请重试'}`);
                reject(new Error(`验证失败: ${res.msg || '未知错误'}`));
              }
            }
          );
          captcha.show();
        } catch (error) {
          message.error('验证组件初始化失败，请刷新页面重试');
          reject(error);
        }
      } else {
        message.error('验证组件未加载，请刷新页面重试');
        reject(new Error('验证组件未加载'));
      }
    });
  };

  const onFinish = async (values) => {
    try {
      // 重置错误信息
      setErrorMessage('');
      
      // 检查验证码是否已通过，如果未通过则自动触发验证
      let captchaData = { ticket: captchaTicket, randstr: captchaRandstr };
      if (!captchaTicket || !captchaRandstr) {
        setIsVerifying(true);
        try {
          captchaData = await showTencentCaptcha(); // 等待验证完成，并获取结果
          setIsVerifying(false);
        } catch (error) {
          setIsVerifying(false);
          return; // 退出提交流程
        }
      }
      
      // 确保我们有验证数据
      if (!captchaData.ticket || !captchaData.randstr) {
        message.error('验证码信息无效，请重新验证');
        return;
      }

      setLoading(true);
      
      // 发送数据
      try {
        const response = await fetch('/api/sendMail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            captchaTicket: captchaData.ticket,
            captchaRandstr: captchaData.randstr,
            timestamp: new Date().toISOString(),
            source: '官网联系表单'
          }),
        });
        
        // 获取响应文本
        let responseData = {};
        try {
          const responseText = await response.text();
          
          if (responseText) {
            responseData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error('解析响应失败:', parseError);
        }
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(responseData.message || `服务器错误(${response.status})`);
        }
        
        message.success('您的留言已成功提交，我们会尽快与您联系！');
        setSubmitSuccess(true);
        form.resetFields();
        setCaptchaTicket('');
        setCaptchaRandstr('');
      } catch (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(error.message || '提交失败，请稍后重试');
      message.error('提交失败，请稍后重试或通过其他方式联系我们。');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setCaptchaTicket('');
    setCaptchaRandstr('');
  };

  return (
    <ContactContainer>
      <ContactHeader>
        <ContactTitle level={2}>联系我们</ContactTitle>
        <Paragraph style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          无论您有任何问题或需求，都可以通过以下方式与我们取得联系，我们将尽快回复您。
        </Paragraph>
      </ContactHeader>
      
      <Row gutter={[24, 24]} style={{ padding: '0 1rem', marginBottom: '3rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <ContactCard>
            <IconWrapper>
              <PhoneOutlined />
            </IconWrapper>
            <Title level={4} style={{ textAlign: 'center' }}>电话咨询</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              <a href="tel:+8615670141215">+86 15670141215</a>
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', color: '#666' }}>
              周一至周五: 9:00 - 18:00
            </Paragraph>
          </ContactCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ContactCard>
            <IconWrapper>
              <MailOutlined />
            </IconWrapper>
            <Title level={4} style={{ textAlign: 'center' }}>电子邮件</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              <a href="mailto:jqz1215@qq.com">jqz1215@qq.com</a>
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', color: '#666' }}>
              我们将在24小时内回复您
            </Paragraph>
          </ContactCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ContactCard>
            <IconWrapper>
              {/* 使用IconPark的Tiktok图标替代原来的DouyinIconComponent */}
              <Tiktok theme="outline" size="24" fill="#333"/>
            </IconWrapper>
            <Title level={4} style={{ textAlign: 'center' }}>地址</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              郑州市郑东新区白沙镇河南信息统计职业学院
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', color: '#666' }}>
              邮编: 450000
            </Paragraph>
          </ContactCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <ContactCard>
            <IconWrapper>
              <GlobalOutlined />
            </IconWrapper>
            <Title level={4} style={{ textAlign: 'center' }}>社交媒体</Title>
            <Paragraph style={{ textAlign: 'center' }}>
              关注我们的社交媒体账号
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', color: '#666' }}>
              获取最新动态和资讯
            </Paragraph>
          </ContactCard>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ padding: '0 1rem' }}>
        <Col xs={24} lg={12}>
          <Title level={3}>给我们留言</Title>
          <Paragraph>
            如果您有任何问题、建议或合作意向，请填写以下表单，我们的团队将尽快与您联系。
          </Paragraph>
          <FormContainer>
            {loading && (
              <SpinContainer>
                <Spin size="large" tip="提交中..." />
              </SpinContainer>
            )}
            {submitSuccess ? (
              <Result
                status="success"
                title="留言已成功提交!"
                subTitle="感谢您的留言，我们会尽快回复您。"
                extra={[
                  <Button type="primary" key="new" onClick={handleReset}>
                    提交新的留言
                  </Button>
                ]}
              />
            ) : (
              <StyledForm
                form={form}
                name="contact"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ remember: true }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="姓名"
                      rules={[{ required: true, message: '请输入您的姓名' }]}
                    >
                      <Input placeholder="请输入您的姓名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="电子邮箱"
                      rules={[
                        { required: true, message: '请输入您的电子邮箱' },
                        { type: 'email', message: '请输入有效的电子邮箱' }
                      ]}
                    >
                      <Input placeholder="请输入您的电子邮箱" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="phone"
                  label="电话"
                  rules={[
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', validateTrigger: 'onBlur' }
                  ]}
                >
                  <Input placeholder="请输入您的电话号码（选填）" />
                </Form.Item>
                <Form.Item
                  name="subject"
                  label="主题"
                  rules={[{ required: true, message: '请输入主题' }]}
                >
                  <Input placeholder="请输入主题" />
                </Form.Item>
                <Form.Item
                  name="message"
                  label="留言内容"
                  rules={[{ required: true, message: '请输入留言内容' }]}
                >
                  <TextArea rows={5} placeholder="请输入您的留言内容" />
                </Form.Item>
                
                {/* 修复green is not defined错误 */}
                {captchaTicket && (
                  <Form.Item>
                    <div style={{ marginBottom: 15, color: '#52c41a' }}>
                      <CheckCircleOutlined style={{ marginRight: 8 }} />
                      人机验证已通过
                    </div>
                  </Form.Item>
                )}

                {/* 显示错误信息 */}
                {errorMessage && (
                  <Form.Item>
                    <div style={{ color: 'red', marginBottom: 15 }}>
                      错误: {errorMessage}
                    </div>
                  </Form.Item>
                )}

                <Form.Item>
                  <Button
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading || isVerifying}
                    icon={<SendOutlined />}
                  >
                    {captchaTicket ? '提交留言' : '验证并提交'}
                  </Button>
                </Form.Item>
              </StyledForm>
            )}
          </FormContainer>
        </Col>
        <Col xs={24} lg={12}>
          <Title level={3}>我们的位置</Title>
          <Paragraph>
            欢迎访问我们的办公地点，您可以通过以下地图找到我们。
          </Paragraph>
          <MapContainer>
            <AMapComponent />
          </MapContainer>
          <Card>
            <Title level={4}>交通指南</Title>
            <Paragraph>
              <strong>导航：</strong> 导航至河南省郑州市郑东新区白沙镇河南信息统计职业学院即可。
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Divider />
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <Title level={3}>期待与您合作</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          无论您是寻求技术解决方案，还是希望了解更多关于我们的服务，
          爱奇吉团队都期待着与您沟通交流，共创价值。
        </Paragraph>
      </div>

      {/* 在开发环境中添加调试面板 */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </ContactContainer>
  );
};

export default Contact;