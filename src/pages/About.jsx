import React from 'react';
import styled from 'styled-components';
import { Row, Col, Card, Timeline, Typography, Divider, Avatar, Button } from 'antd';
import { TeamOutlined, HistoryOutlined, TrophyOutlined, HeartOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const AboutHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
`;

const AboutTitle = styled(Title)`
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

const Section = styled.section`
  margin-bottom: 4rem;
  padding: 0 1rem;
`;

const SectionTitle = styled(Title)`
  position: relative;
  margin-bottom: 2rem !important;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #1890ff, #36cfc9);
  }
`;

const TeamMemberCard = styled(Card)`
  text-align: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const AvatarWrapper = styled.div`
  margin-bottom: 1rem;
`;

const ValueCard = styled(Card)`
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
  }
  
  .ant-card-head-title {
    color: white;
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: #1890ff;
  margin-bottom: 1rem;
  text-align: center;
`;

const HistorySection = styled.div`
  background-color: #f0f7ff;
  padding: 4rem 2rem;
  margin: 3rem 0;
`;

const About = () => {
  return (
    <AboutContainer>
      <AboutHeader>
        <AboutTitle level={2}>关于爱奇吉</AboutTitle>
        <Paragraph style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          爱奇吉是一家专注于互联网信息服务的科技公司，致力于为企业提供现代化的网络解决方案，
          帮助企业在数字化转型过程中实现业务增长和创新。
        </Paragraph>
      </AboutHeader>
      
      <Section>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <SectionTitle level={3}>我们的使命</SectionTitle>
            <Paragraph style={{ fontSize: '1.1rem' }}>
              我们的使命是通过创新的技术解决方案，帮助企业实现数字化转型，提升业务效率和竞争力。
              我们相信，技术应该是简单易用的，能够真正解决企业面临的实际问题。
            </Paragraph>
            <Paragraph style={{ fontSize: '1.1rem' }}>
              在爱奇吉，我们不仅仅是技术提供者，更是企业的合作伙伴，与客户一起成长，共同创造价值。
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <img 
              src="hj.png" 
              alt="爱奇吉办公环境" 
              style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }} 
            />
          </Col>
        </Row>
      </Section>
      
      <HistorySection>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <HistoryOutlined style={{ marginRight: '10px' }} />
            发展历程
          </Title>
          
          <Timeline mode="alternate">
            <Timeline.Item color="#1890ff">
              <Title level={4}>2015年</Title>
              <Paragraph>
                爱奇吉成立，开始提供网站开发和移动应用开发服务。
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="#1890ff">
              <Title level={4}>2017年</Title>
              <Paragraph>
                业务扩展至云服务和数据分析领域，团队规模扩大到20人。
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="#1890ff">
              <Title level={4}>2019年</Title>
              <Paragraph>
                获得A轮融资，开始为大型企业提供数字化转型解决方案。
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="#1890ff">
              <Title level={4}>2021年</Title>
              <Paragraph>
                成功服务超过100家企业客户，建立了完善的服务体系和技术团队。
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="#1890ff">
              <Title level={4}>2023年</Title>
              <Paragraph>
                推出AI驱动的智能解决方案，帮助企业实现智能化升级。
              </Paragraph>
            </Timeline.Item>
            <Timeline.Item color="#1890ff">
              <Title level={4}>2024年</Title>
              <Paragraph>
                持续创新，致力于为更多企业提供高质量的互联网信息服务。
              </Paragraph>
            </Timeline.Item>
          </Timeline>
        </div>
      </HistorySection>
      
      <Section>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <TeamOutlined style={{ marginRight: '10px' }} />
          我们的团队
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <TeamMemberCard>
              <AvatarWrapper>
                <Avatar size={100} src="吉庆喆.jpg" />
              </AvatarWrapper>
              <Title level={4}>Forrest | 小吉</Title>
              <Text type="secondary">创始人 & CEO</Text>
              <Divider />
              <Paragraph>
                拥有2年互联网行业经验，曾在多家知名科技公司担任重要职位，
                对数字化转型和技术创新有深刻理解。
              </Paragraph>
            </TeamMemberCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <TeamMemberCard>
              <AvatarWrapper>
                <Avatar size={100} src="俊财.jpg" />
              </AvatarWrapper>
              <Title level={4}>Tsuki | 俊财</Title>
              <Text type="secondary">CTO</Text>
              <Divider />
              <Paragraph>
                技术专家，拥有丰富的系统架构和软件开发经验，
                负责公司技术战略和产品研发。
              </Paragraph>
            </TeamMemberCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <TeamMemberCard>
              <AvatarWrapper>
                <Avatar size={100} src="史乐童.jpg" />
              </AvatarWrapper>
              <Title level={4}>娃哈哈奶盖 | 童</Title>
              <Text type="secondary">COO</Text>
              <Divider />
              <Paragraph>
                运营管理专家，负责公司日常运营和客户服务，
                确保项目高质量交付和客户满意度。
              </Paragraph>
            </TeamMemberCard>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <TeamMemberCard>
              <AvatarWrapper>
                <Avatar size={100} src="王硕.jpg" />
              </AvatarWrapper>
              <Title level={4}>、| 王石页</Title>
              <Text type="secondary">MAN</Text>
              <Divider />
              <Paragraph>
                内部测试人员，负责产品的测试和质量控制，
                确保产品在发布前达到高质量标准。
              </Paragraph>
            </TeamMemberCard>
          </Col>
        </Row>
      </Section>
      
      <Section>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <HeartOutlined style={{ marginRight: '10px' }} />
          我们的价值观
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <ValueCard title="客户至上">
              <IconWrapper>
                <HeartOutlined />
              </IconWrapper>
              <Paragraph>
                我们始终将客户需求放在首位，提供超出期望的服务和解决方案。
              </Paragraph>
            </ValueCard>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <ValueCard title="技术创新">
              <IconWrapper>
                <TrophyOutlined />
              </IconWrapper>
              <Paragraph>
                我们不断学习和探索新技术，保持技术领先，为客户创造更大价值。
              </Paragraph>
            </ValueCard>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <ValueCard title="团队协作">
              <IconWrapper>
                <TeamOutlined />
              </IconWrapper>
              <Paragraph>
                我们相信团队的力量，通过有效协作，共同解决问题，实现目标。
              </Paragraph>
            </ValueCard>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <ValueCard title="诚信负责">
              <IconWrapper>
                <SafetyOutlined />
              </IconWrapper>
              <Paragraph>
                我们恪守诚信原则，对工作负责，对客户负责，对社会负责。
              </Paragraph>
            </ValueCard>
          </Col>
        </Row>
      </Section>
      
      <Divider />
      
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <Title level={3}>加入我们，共创未来</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          我们始终在寻找优秀的人才加入团队，一起创造更大的价值
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          href="/contact" 
          icon={<TeamOutlined />}
          style={{ marginTop: '1rem' }}
        >
          联系我们
        </Button>
      </div>
    </AboutContainer>
  );
};

export default About;