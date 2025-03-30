import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Carousel, Row, Col, Card, Button, Typography, Spin } from 'antd';
import { RocketOutlined, ToolOutlined, TeamOutlined, GlobalOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomeContainer = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const CarouselContainer = styled.div`
  margin-bottom: 3rem;
  position: relative;
  width: 100%;
  
  .slick-dots-bottom {
    bottom: 20px;
  }
  
  // 只隐藏默认箭头的箭头图标，不影响整个箭头元素
  .ant-carousel .slick-arrow::before {
    display: none !important;
  }
  
  .ant-carousel {
    width: 100%;
  }
  
  .slick-slide {
    width: 100%;
    box-sizing: border-box;
  }
`;

const ArrowWrapper = styled.div`
  z-index: 100;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  opacity: 0.7;
  transition: all 0.3s ease;
  display: flex !important;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.6);
    opacity: 1;
  }

  // 确保箭头图标居中
  svg {
    display: block;
  }
`;

const CarouselSlide = styled.div`
  height: 500px;
  color: #fff;
  background: ${props => props.imageUrl ? `url(${props.imageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)'};  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  line-height: normal;
  text-align: center;
  position: relative;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const SlideContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  width: 100%;
  margin: 160px auto;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin: 80px auto;
  }
`;

// 轮播图标题和描述
const SlideTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 100%;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.17);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
    padding: 8px 12px;
  }
`;

const SlideDescription = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
  width: 100%;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  text-align: center;
  background-color: rgba(0, 0, 0, 0.17);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const Section = styled.section`
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  color: #333;

  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #1890ff, #36cfc9);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FeatureCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }

  .ant-card-head {
    background: linear-gradient(90deg, #1890ff, #36cfc9);
    color: white;
  }

  .ant-card-head-title {
    color: white;
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: #1890ff;
  margin-bottom: 1rem;
  text-align: center;
`;

const StatsSection = styled.div`
  background-color: #f0f7ff;
  padding: 4rem 2rem;
  margin: 3rem 0;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 2rem;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 1rem;
`;

const StatTitle = styled.div`
  font-size: 1.2rem;
  color: #333;
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 4rem 2rem;
  text-align: center;
  color: white;
  margin-top: 3rem;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

// API基础URL
import { API_URL } from '../config';

const Home = () => {
  const [carousels, setCarousels] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState([]);
  const [whyUs, setWhyUs] = useState([]);
  const [cta, setCta] = useState(null);
  const [loading, setLoading] = useState({
    carousels: true,
    services: true,
    stats: true,
    whyUs: true,
    cta: true
  });

  // 获取轮播图数据
  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        // 实际项目中调用API
        const response = await fetch(`${API_URL}/carousel`);
        const data = await response.json();
        if (data.success) {
          setCarousels(data.data);
        } else {
          // 使用模拟数据作为备用
          setCarousels([
            { id: 1, title: '现代化互联网信息服务', description: '爱奇吉提供全方位的互联网解决方案，帮助您的企业在数字时代脱颖而出', buttonText: '了解更多' },
            { id: 2, title: '专业的技术团队', description: '我们拥有经验丰富的专家，为您提供最前沿的技术支持和服务', buttonText: '查看服务' },
            { id: 3, title: '成功案例展示', description: '众多企业选择爱奇吉，我们的解决方案帮助客户实现业务增长和数字化转型', buttonText: '查看案例' },
          ]);
        }
        setLoading(prev => ({ ...prev, carousels: false }));
      } catch (error) {
        console.error('获取轮播图数据失败:', error);
        setLoading(prev => ({ ...prev, carousels: false }));
      }
    };

    fetchCarousels();
  }, []);

  // 获取服务数据
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // 实际项目中调用API
        const response = await fetch(`${API_URL}/services`);
        const data = await response.json();
        if (data.success) {
          setServices(data.data);
        } else {
          // 使用模拟数据作为备用
          setServices([
            { id: 1, title: '网站开发', icon: 'GlobalOutlined', description: '提供响应式网站设计与开发，确保在各种设备上都有出色的用户体验。' },
            { id: 2, title: '应用程序开发', icon: 'RocketOutlined', description: '开发高性能的移动应用和桌面应用，满足您的业务需求。' },
            { id: 3, title: '技术咨询', icon: 'ToolOutlined', description: '提供专业的技术咨询服务，帮助您制定最佳的技术战略和解决方案。' },
            { id: 4, title: '团队协作', icon: 'TeamOutlined', description: '与您的团队紧密合作，确保项目按时交付并达到预期目标。' },
          ]);
        //
        }
        setLoading(prev => ({ ...prev, services: false }));
      } catch (error) {
        console.error('获取服务数据失败:', error);
        setLoading(prev => ({ ...prev, services: false }));
      }
    };

    fetchServices();
  }, []);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 实际项目中调用API
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          // 使用模拟数据作为备用
          setStats([
            { id: 1, number: '100+', title: '成功项目' },
            { id: 2, number: '50+', title: '合作伙伴' },
            { id: 3, number: '10+', title: '行业经验' },
            { id: 4, number: '24/7', title: '技术支持' },
          ]);
        //
        }
        setLoading(prev => ({ ...prev, stats: false }));
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    fetchStats();
  }, []);

  // 获取为什么选择我们数据
  useEffect(() => {
    const fetchWhyUs = async () => {
      try {
        // 实际项目中调用API
        const response = await fetch(`${API_URL}/whyus`);
        const data = await response.json();
        if (data.success) {
          setWhyUs(data.data);
        } else {
          // 使用模拟数据作为备用
          setWhyUs([
            { id: 1, title: '专业技术', description: '我们的团队由经验丰富的技术专家组成，掌握最新的技术和行业趋势。' },
            { id: 2, title: '定制解决方案', description: '我们根据客户的具体需求提供量身定制的解决方案，确保最佳效果。' },
            { id: 3, title: '优质服务', description: '我们注重客户体验，提供全程跟踪和售后支持，确保您的满意度。' },
          ]);
        //
        }
        setLoading(prev => ({ ...prev, whyUs: false }));
      } catch (error) {
        console.error('获取为什么选择我们数据失败:', error);
        setLoading(prev => ({ ...prev, whyUs: false }));
      }
    };

    fetchWhyUs();
  }, []);

  // 获取CTA数据 - 更新以支持按钮类型
  useEffect(() => {
    const fetchCTA = async () => {
      try {
        setLoading(prev => ({ ...prev, cta: true }));
        
        // 获取当前激活的CTA，添加缓存破坏参数
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/cta/active?_=${timestamp}`);
        
        if (!response.ok) {
          throw new Error(`获取CTA失败: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setCta(data.data);
        } else {
          // 使用模拟数据作为备用
          setCta({
            title: '准备好开始您的项目了吗？',
            description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
            buttonText: '立即联系',
            link: '/contact',
            type: 'primary' // 默认按钮类型
          });
        }
      } catch (error) {
        console.error('获取CTA数据失败:', error);
        // 使用默认值
        setCta({
          title: '准备好开始您的项目了吗？',
          description: '联系我们，获取免费咨询和项目评估，让我们一起实现您的愿景。',
          buttonText: '立即联系',
          link: '/contact',
          type: 'primary' // 默认按钮类型
        });
      } finally {
        setLoading(prev => ({ ...prev, cta: false }));
      }
    };

    fetchCTA();
  }, []);

  // 获取图标组件
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'GlobalOutlined':
        return <GlobalOutlined />;
      case 'RocketOutlined':
        return <RocketOutlined />;
      case 'ToolOutlined':
        return <ToolOutlined />;
      case 'TeamOutlined':
        return <TeamOutlined />;
      default:
        return <GlobalOutlined />;
    }
  };

  // 获取CTA按钮类型样式
  const getCtaButtonProps = (type = 'primary') => {
    switch (type) {
      case 'secondary':
        return { type: "default", ghost: true };
      case 'tertiary':
        return { type: "text", style: { color: 'white', borderColor: 'rgba(255,255,255,0.5)' } };
      case 'primary':
      default:
        return { type: "primary", ghost: true };
    }
  };

  return (
    <HomeContainer>
      <CarouselContainer>
        {loading.carousels ? (
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        ) : (
          <Carousel 
            autoplay 
            effect="fade"
            dots={true}
            arrows={true}
          >
            {carousels.map(item => (
              <CarouselSlide key={item.id} imageUrl={item.imageUrl}>
                <SlideContent>
                  <SlideTitle>{item.title}</SlideTitle>
                  <SlideDescription>
                    {item.description}
                  </SlideDescription>
                  <Button type="primary" size="large" shape="round">
                    {item.buttonText}
                  </Button>
                </SlideContent>
              </CarouselSlide>
            ))}
          </Carousel>
        )}
      </CarouselContainer>

      <Section>
        <SectionTitle>我们的服务</SectionTitle>
        {loading.services ? (
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        ) : (
          <Row gutter={[24, 24]}>
            {services.map(service => (
              <Col xs={24} sm={12} lg={6} key={service.id}>
                <FeatureCard
                  title={service.title}
                  bordered={false}
                >
                  <IconWrapper>
                    {getIconComponent(service.icon)}
                  </IconWrapper>
                  <Paragraph>
                    {service.description}
                  </Paragraph>
                </FeatureCard>
              </Col>
            ))}
          </Row>
        )}
      </Section>

      <StatsSection>
        <Section>
          <SectionTitle>我们的成就</SectionTitle>
          {loading.stats ? (
            <LoadingContainer>
              <Spin size="large" />
            </LoadingContainer>
          ) : (
            <Row gutter={[24, 24]}>
              {stats.map(stat => (
                <Col xs={24} sm={12} lg={6} key={stat.id}>
                  <StatItem>
                    <StatNumber>{stat.number}</StatNumber>
                    <StatTitle>{stat.title}</StatTitle>
                  </StatItem>
                </Col>
              ))}
            </Row>
          )}
        </Section>
      </StatsSection>

      <Section>
        <SectionTitle>为什么选择我们</SectionTitle>
        {loading.whyUs ? (
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        ) : (
          <Row gutter={[24, 24]}>
            {whyUs.map(item => (
              <Col xs={24} md={8} key={item.id}>
                <Title level={4}>{item.title}</Title>
                <Paragraph>
                  {item.description}
                </Paragraph>
              </Col>
            ))}
          </Row>
        )}
      </Section>

      {/* CTA部分 - 更新以支持不同按钮类型 */}
      {!loading.cta && cta ? (
        <CTASection>
          <CTATitle>{cta.title}</CTATitle>
          {cta.description && (
            <CTADescription>
              {cta.description}
            </CTADescription>
          )}
          <Button 
            size="large" 
            shape="round"
            href={cta.link || '/contact'}
            {...getCtaButtonProps(cta.type)}
          >
            {cta.buttonText || '联系我们'}
          </Button>
        </CTASection>
      ) : loading.cta ? (
        <CTASection>
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        </CTASection>
      ) : null}
    </HomeContainer>
  );
};

export default Home;