import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Layout, Typography, Row, Col, Divider, Spin, Space } from 'antd';
import * as Icons from '@ant-design/icons';
import { API_URL } from '../config'; // 导入统一的API URL配置

const { Text, Link: TypographyLink } = Typography;

const FooterContainer = styled(Layout.Footer)`
  background-color: #f0f2f5;
  padding: 24px 50px;
  text-align: center;
  margin-top: 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterSection = styled.div`
  margin-bottom: 1rem;
`;

const CopyrightText = styled(Text)`
  display: block;
  margin-bottom: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const SocialLink = styled(TypographyLink)`
  margin: 0 8px;
  font-size: 16px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Footer = () => {
  const [loading, setLoading] = useState(true);
  const [footerData, setFooterData] = useState({
    company_name: '爱奇吉',
    company_description: '专注于互联网信息服务的科技公司',
    contact_phone: '+86 (10) 1234-5678',
    contact_email: 'info@aiqiji.com',
    copyright: `© ${new Date().getFullYear()} 郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有`,
    icp: '豫ICP备2023020388号-2',
    icp_link: 'https://beian.miit.gov.cn/',
    social_media: JSON.stringify([
      { id: 1, name: '微信', icon: 'wechat', link: 'aiqiji_weixin' },
      { id: 2, name: '微博', icon: 'weibo', link: 'aiqiji_weibo' },
      { id: 3, name: '知乎', icon: 'zhihu', link: 'aiqiji' }
    ])
  });
  const [socialMediaItems, setSocialMediaItems] = useState([]);

  // 从API加载底部配置
  useEffect(() => {
    const fetchFooterConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/footer/config`); // 使用统一的API_URL
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // 合并默认值和从API获取的数据
            setFooterData(prevData => ({
              ...prevData,
              ...data.data
            }));
            
            // 处理社交媒体数据
            if (data.data.social_media) {
              try {
                const socialMedia = typeof data.data.social_media === 'string' 
                  ? JSON.parse(data.data.social_media) 
                  : data.data.social_media;
                
                if (Array.isArray(socialMedia)) {
                  setSocialMediaItems(socialMedia);
                }
              } catch (e) {
                console.error('解析社交媒体数据失败:', e);
              }
            }
          }
        } else {
          console.error(`请求失败，状态码: ${response.status}`);
        }
      } catch (error) {
        console.error('获取底部配置失败:', error);
        // 错误时继续使用默认值
      } finally {
        setLoading(false);
      }
    };

    fetchFooterConfig();
  }, []);

  // 确保版权年份总是当前年份
  const ensureCurrentYear = (copyright) => {
    // 如果没有版权信息，生成一个默认的
    if (!copyright) {
      return `© ${new Date().getFullYear()} 郑州市爱奇吉互联网信息服务合伙企业（普通合伙） 版权所有`;
    }
    
    // 如果已有版权信息，但不是以年份开头的格式，添加前缀
    if (!copyright.match(/^© \d{4}/)) {
      return `© ${new Date().getFullYear()} ${copyright}`;
    }
    
    // 更新已有版权信息中的年份为当前年份
    return copyright.replace(/© \d{4}/, `© ${new Date().getFullYear()}`);
  };

  // 渲染社交媒体图标
  const renderSocialIcon = (iconName) => {
    try {
      // 尝试不同的图标变种
      const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
      const IconComponent = 
        Icons[`${capitalized}Outlined`] || 
        Icons[`${capitalized}Filled`] || 
        Icons[`${capitalized}TwoTone`];
      
      if (IconComponent) {
        return <IconComponent style={{ fontSize: '20px', marginRight: '5px' }} />;
      }
    } catch (e) {
      console.error('渲染图标失败:', e);
    }
    
    return null;
  };

  // 生成社交媒体链接
  const getSocialLink = (item) => {
    const { name, link, icon } = item;
    
    // 根据不同平台生成对应的链接
    switch (icon.toLowerCase()) {
      case 'wechat':
        return `https://weixin.qq.com/r/${link}`;
      case 'weibo':
        return `https://weibo.com/${link}`;
      case 'zhihu':
        return `https://zhihu.com/people/${link}`;
      case 'github':
        return `https://github.com/${link}`;
      case 'twitter':
        return `https://twitter.com/${link}`;
      case 'facebook':
        return `https://facebook.com/${link}`;
      case 'instagram':
        return `https://instagram.com/${link}`;
      default:
        // 如果链接本身是完整URL，则直接使用
        return link.startsWith('http') ? link : `https://${link}`;
    }
  };

  if (loading) {
    return (
      <FooterContainer>
        <LoadingContainer>
          <Spin tip="加载中..." />
        </LoadingContainer>
      </FooterContainer>
    );
  }
  
  return (
    <FooterContainer>
      <FooterContent>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <FooterSection>
              <Text strong style={{ fontSize: '16px' }}>{footerData.company_name || '爱奇吉'}</Text>
              <Divider style={{ margin: '12px 0' }} />
              <Text>{footerData.company_description || '专注于互联网信息服务的科技公司'}</Text>
            </FooterSection>
          </Col>
          <Col xs={24} md={8}>
            <FooterSection>
              <Text strong style={{ fontSize: '16px' }}>联系我们</Text>
              <Divider style={{ margin: '12px 0' }} />
              <Text>电话: {footerData.contact_phone || '+86 (10) 1234-5678'}</Text><br />
              <Text>邮箱: {footerData.contact_email || 'info@aiqiji.com'}</Text>
            </FooterSection>
          </Col>
          <Col xs={24} md={8}>
            <FooterSection>
              <Text strong style={{ fontSize: '16px' }}>关注我们</Text>
              <Divider style={{ margin: '12px 0' }} />
              <Space size="middle" wrap>
                {socialMediaItems.length > 0 ? (
                  socialMediaItems.map((item, index) => (
                    <SocialLink 
                      key={index} 
                      href={getSocialLink(item)} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {renderSocialIcon(item.icon)}{item.name}
                    </SocialLink>
                  ))
                ) : (
                  <>
                    <SocialLink href="https://weixin.qq.com" target="_blank">微信</SocialLink>
                    <SocialLink href="https://weibo.com" target="_blank">微博</SocialLink>
                    <SocialLink href="https://zhihu.com" target="_blank">知乎</SocialLink>
                  </>
                )}
              </Space>
            </FooterSection>
          </Col>
        </Row>
        
        <Divider style={{ margin: '24px 0 16px' }} />
        
        <CopyrightText>
          {ensureCurrentYear(footerData.copyright)}
        </CopyrightText>
        <CopyrightText>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            {footerData.icp || '豫ICP备2023020388号-2'}
          </a>
        </CopyrightText>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;