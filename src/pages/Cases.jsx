import React from 'react';
import styled from 'styled-components';
import { Row, Col, Card, Tag, Typography, Divider, Rate, Avatar, Button } from 'antd';
import { 
  ProjectOutlined, 
  UserOutlined, 
  StarOutlined, 
  GlobalOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  MobileOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  BulbOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const CasesContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const CasesHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
`;

const CasesTitle = styled(Title)`
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

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  gap: 0.5rem;
`;

const FilterTag = styled(Tag)`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.25rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CaseCard = styled(Card)`
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

const TagsContainer = styled.div`
  margin: 1rem 0;
`;

const IconContainer = styled.div`
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
  font-size: 80px;
  color: #1890ff;
  overflow: hidden;
`;

const TestimonialCard = styled(Card)`
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TestimonialHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const TestimonialInfo = styled.div`
  margin-left: 1rem;
`;

const StatsSection = styled.div`
  background-color: #f0f7ff;
  padding: 4rem 2rem;
  margin: 3rem 0;
  text-align: center;
`;

const StatItem = styled.div`
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

const Cases = () => {
  // 模拟案例数据
  const caseStudies = [
    {
      id: 1,
      title: '电子商务平台重构',
      icon: <ShoppingCartOutlined />,
      description: '为某知名零售企业重构电子商务平台，提升用户体验和转化率，实现销售额增长30%。',
      tags: ['电子商务', 'React', 'Node.js', 'MongoDB'],
      client: '某知名零售企业',
      year: '2023'
    },
    {
      id: 2,
      title: '企业管理系统开发',
      icon: <AppstoreOutlined />,
      description: '为某制造业企业开发一套综合管理系统，整合人力资源、财务、生产等模块，提高管理效率。',
      tags: ['企业应用', 'Vue', '.NET Core', 'SQL Server'],
      client: '某制造业企业',
      year: '2022'
    },
    {
      id: 3,
      title: '移动应用开发与优化',
      icon: <MobileOutlined />,
      description: '为某金融科技公司开发移动应用，实现用户增长200%，应用评分从3.2提升至4.8。',
      tags: ['移动应用', 'React Native', 'Firebase', 'Redux'],
      client: '某金融科技公司',
      year: '2023'
    },
    {
      id: 4,
      title: '数据分析平台构建',
      icon: <BarChartOutlined />,
      description: '为某教育机构构建数据分析平台，帮助其分析学生学习行为，优化教学内容和方法。',
      tags: ['数据分析', 'Python', 'Django', 'PostgreSQL'],
      client: '某教育机构',
      year: '2022'
    },
    {
      id: 5,
      title: '企业官网与品牌重塑',
      icon: <GlobalOutlined />,
      description: '为某科技企业重新设计官网，提升品牌形象，增加线索转化率40%。',
      tags: ['品牌设计', 'WordPress', 'SEO', 'UI/UX'],
      client: '某科技企业',
      year: '2023'
    },
    {
      id: 6,
      title: '云服务迁移项目',
      icon: <CloudServerOutlined />,
      description: '帮助某传统企业将业务系统迁移至云平台，降低运维成本50%，提高系统可靠性。',
      tags: ['云服务', 'AWS', 'Docker', 'Kubernetes'],
      client: '某传统企业',
      year: '2022'
    }
  ];

  // 模拟客户评价数据
  const testimonials = [
    {
      id: 1,
      name: '张总',
      company: '某零售企业',
      avatar: 'https://via.placeholder.com/100?text=张总',
      rating: 5,
      content: '爱奇吉团队的专业素养和技术能力给我们留下了深刻印象。他们不仅按时完成了项目，还提供了许多创新的解决方案，帮助我们的电商平台销售额提升了30%。'
    },
    {
      id: 2,
      name: '李总',
      company: '某制造业企业',
      avatar: 'https://via.placeholder.com/100?text=李总',
      rating: 5,
      content: '与爱奇吉合作是一次愉快的经历。他们深入了解我们的业务需求，开发的管理系统极大地提高了我们的工作效率，减少了人为错误，为公司节省了大量成本。'
    },
    {
      id: 3,
      name: '王总',
      company: '某金融科技公司',
      avatar: 'https://via.placeholder.com/100?text=王总',
      rating: 4,
      content: '爱奇吉团队在移动应用开发方面展现出了卓越的专业能力。他们不仅关注技术实现，还非常注重用户体验，这使我们的应用获得了用户的高度评价。'
    }
  ];

  return (
    <CasesContainer>
      <CasesHeader>
        <CasesTitle level={2}>成功案例</CasesTitle>
        <Paragraph style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          我们为各行业客户提供了创新的解决方案，帮助他们实现业务增长和数字化转型。
          以下是我们的部分成功案例。
        </Paragraph>
      </CasesHeader>
      
      <FilterContainer>
        <FilterTag color="#1890ff">全部</FilterTag>
        <FilterTag>电子商务</FilterTag>
        <FilterTag>企业应用</FilterTag>
        <FilterTag>移动应用</FilterTag>
        <FilterTag>数据分析</FilterTag>
        <FilterTag>品牌设计</FilterTag>
        <FilterTag>云服务</FilterTag>
      </FilterContainer>
      
      <Row gutter={[24, 24]} style={{ padding: '0 1rem' }}>
        {caseStudies.map(caseStudy => (
          <Col xs={24} sm={12} lg={8} key={caseStudy.id}>
            <CaseCard
              hoverable
              cover={
                <IconContainer>
                  {caseStudy.icon}
                </IconContainer>
              }
            >
              <Meta title={caseStudy.title} description={<Text type="secondary">{caseStudy.client} | {caseStudy.year}</Text>} />
              <Paragraph style={{ margin: '1rem 0' }}>
                {caseStudy.description}
              </Paragraph>
              <TagsContainer>
                {caseStudy.tags.map((tag, index) => (
                  <Tag key={index} color="blue">{tag}</Tag>
                ))}
              </TagsContainer>
              <Button type="primary" size="small" href="#">
                查看详情
              </Button>
            </CaseCard>
          </Col>
        ))}
      </Row>
      
      <StatsSection>
        <Title level={2} style={{ marginBottom: '3rem' }}>我们的成就</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <StatItem>
              <StatNumber>100+</StatNumber>
              <StatTitle>成功项目</StatTitle>
            </StatItem>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatItem>
              <StatNumber>50+</StatNumber>
              <StatTitle>客户好评</StatTitle>
            </StatItem>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatItem>
              <StatNumber>30%</StatNumber>
              <StatTitle>平均业绩提升</StatTitle>
            </StatItem>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatItem>
              <StatNumber>15+</StatNumber>
              <StatTitle>行业覆盖</StatTitle>
            </StatItem>
          </Col>
        </Row>
      </StatsSection>
      
      <div style={{ padding: '0 1rem', marginBottom: '4rem' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <StarOutlined style={{ marginRight: '10px' }} />
          客户评价
        </Title>
        
        <Row gutter={[24, 24]}>
          {testimonials.map(testimonial => (
            <Col xs={24} md={8} key={testimonial.id}>
              <TestimonialCard>
                <TestimonialHeader>
                  <Avatar size={64} src={testimonial.avatar} icon={<UserOutlined />} />
                  <TestimonialInfo>
                    <Title level={4} style={{ margin: 0 }}>{testimonial.name}</Title>
                    <Text type="secondary">{testimonial.company}</Text>
                    <div>
                      <Rate disabled defaultValue={testimonial.rating} />
                    </div>
                  </TestimonialInfo>
                </TestimonialHeader>
                <Paragraph>
                  {testimonial.content}
                </Paragraph>
              </TestimonialCard>
            </Col>
          ))}
        </Row>
      </div>
      
      <Divider />
      
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <Title level={3}>想了解更多案例？</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          联系我们，获取更多详细的成功案例和解决方案
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          href="/contact" 
          icon={<ProjectOutlined />}
          style={{ 
            marginTop: '1.5rem',
            padding: '0 2rem',
            height: '45px',
            fontSize: '16px'
          }}
        >
          立即联系
        </Button>
      </div>
    </CasesContainer>
  );
};

export default Cases;