import React from 'react';
import styled from 'styled-components';
import { Row, Col, Card, Steps, Collapse, Typography, Divider, Button } from 'antd';
import { 
  CodeOutlined, 
  MobileOutlined, 
  CloudOutlined, 
  DatabaseOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const ServicesContainer = styled.div`
  padding: 2rem 0;
  max-width: 1200px;
  margin: 0 auto;
`;

const ServiceHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
`;

const ServiceTitle = styled(Title)`
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

const ServiceCard = styled(Card)`
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }

  .ant-card-cover {
    padding: 1.5rem 1.5rem 0;
    background-color: #f8f9fa;
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: #1890ff;
  text-align: center;
  margin-bottom: 1rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProcessSection = styled.div`
  background-color: #f0f7ff;
  padding: 4rem 2rem;
  margin: 3rem 0;
`;

const FAQSection = styled.div`
  padding: 4rem 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Services = () => {
  return (
    <ServicesContainer>
      <ServiceHeader>
        <ServiceTitle level={2}>我们的服务</ServiceTitle>
        <Paragraph style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          爱奇吉提供全方位的互联网信息服务，从网站开发到移动应用，从云服务到数据分析，
          我们的专业团队将为您提供最优质的解决方案。
        </Paragraph>
      </ServiceHeader>

      <Row gutter={[24, 24]} style={{ padding: '0 1rem' }}>
        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <CodeOutlined />
              </IconWrapper>
            }
            title="网站开发"
          >
            <Paragraph>
              我们提供专业的网站设计与开发服务，包括企业官网、电子商务网站、门户网站等。
              采用响应式设计，确保在各种设备上都有出色的用户体验。
            </Paragraph>
            <ul>
              <li>企业官网设计与开发</li>
              <li>电子商务网站开发</li>
              <li>内容管理系统定制</li>
              <li>网站性能优化</li>
            </ul>
          </ServiceCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <MobileOutlined />
              </IconWrapper>
            }
            title="移动应用开发"
          >
            <Paragraph>
              我们开发高性能、用户友好的移动应用，支持iOS和Android平台，
              帮助企业拓展移动市场，提升用户体验。
            </Paragraph>
            <ul>
              <li>iOS应用开发</li>
              <li>Android应用开发</li>
              <li>跨平台应用开发</li>
              <li>应用界面设计</li>
            </ul>
          </ServiceCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <CloudOutlined />
              </IconWrapper>
            }
            title="云服务解决方案"
          >
            <Paragraph>
              我们提供云计算解决方案，帮助企业实现业务上云，提高系统可靠性和可扩展性，
              降低IT运维成本。
            </Paragraph>
            <ul>
              <li>云迁移服务</li>
              <li>云架构设计</li>
              <li>云安全解决方案</li>
              <li>云资源优化</li>
            </ul>
          </ServiceCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <DatabaseOutlined />
              </IconWrapper>
            }
            title="数据库与大数据服务"
          >
            <Paragraph>
              我们提供数据库设计、优化和大数据分析服务，帮助企业管理和利用数据资产，
              挖掘数据价值，支持决策。
            </Paragraph>
            <ul>
              <li>数据库设计与优化</li>
              <li>大数据平台搭建</li>
              <li>数据分析与挖掘</li>
              <li>数据可视化</li>
            </ul>
          </ServiceCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <SearchOutlined />
              </IconWrapper>
            }
            title="搜索引擎优化(SEO)"
          >
            <Paragraph>
              我们提供专业的SEO服务，帮助您的网站在搜索引擎中获得更好的排名，
              增加网站流量，提高品牌曝光度。
            </Paragraph>
            <ul>
              <li>网站SEO审计</li>
              <li>关键词研究与优化</li>
              <li>内容优化策略</li>
              <li>外链建设</li>
            </ul>
          </ServiceCard>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <ServiceCard
            cover={
              <IconWrapper>
                <SafetyCertificateOutlined />
              </IconWrapper>
            }
            title="网络安全服务"
          >
            <Paragraph>
              我们提供全面的网络安全解决方案，保护您的系统和数据免受威胁，
              确保业务连续性和数据安全。
            </Paragraph>
            <ul>
              <li>安全漏洞评估</li>
              <li>渗透测试</li>
              <li>安全架构设计</li>
              <li>安全意识培训</li>
            </ul>
          </ServiceCard>
        </Col>
      </Row>

      <ProcessSection>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>我们的服务流程</Title>
          
          <Steps direction="vertical" current={-1}>
            <Step 
              title="需求分析" 
              description={
                <div>
                  <Paragraph>
                    我们与您深入沟通，了解您的业务需求、目标和预期，确保我们的解决方案能够满足您的期望。
                  </Paragraph>
                  <Text type="secondary">时长：1-2周</Text>
                </div>
              } 
            />
            <Step 
              title="方案设计" 
              description={
                <div>
                  <Paragraph>
                    基于需求分析，我们的专业团队将设计最适合您的解决方案，包括技术选型、架构设计和实施计划。
                  </Paragraph>
                  <Text type="secondary">时长：1-3周</Text>
                </div>
              } 
            />
            <Step 
              title="开发实施" 
              description={
                <div>
                  <Paragraph>
                    我们的开发团队按照设计方案进行开发实施，采用敏捷开发方法，确保项目按时交付。
                  </Paragraph>
                  <Text type="secondary">时长：根据项目规模而定</Text>
                </div>
              } 
            />
            <Step 
              title="测试与优化" 
              description={
                <div>
                  <Paragraph>
                    我们进行全面的测试，确保解决方案的质量和性能，并根据测试结果进行优化。
                  </Paragraph>
                  <Text type="secondary">时长：1-2周</Text>
                </div>
              } 
            />
            <Step 
              title="部署上线" 
              description={
                <div>
                  <Paragraph>
                    我们协助您将解决方案部署到生产环境，确保平稳上线，并提供必要的培训。
                  </Paragraph>
                  <Text type="secondary">时长：3-5天</Text>
                </div>
              } 
            />
            <Step 
              title="持续支持" 
              description={
                <div>
                  <Paragraph>
                    我们提供持续的技术支持和维护服务，确保解决方案长期稳定运行，并根据需求进行升级和优化。
                  </Paragraph>
                  <Text type="secondary">时长：长期</Text>
                </div>
              } 
            />
          </Steps>
        </div>
      </ProcessSection>

      <FAQSection>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <QuestionCircleOutlined style={{ marginRight: '10px' }} />
          常见问题
        </Title>
        
        <Collapse defaultActiveKey={['1']}>
          <Panel header="你们的服务价格如何计算？" key="1">
            <Paragraph>
              我们的服务价格根据项目的复杂度、规模和时间要求来计算。在项目启动前，我们会进行详细的需求分析，
              然后提供一个透明的报价方案。我们提供固定价格和按时计费两种模式，可以根据您的需求选择最适合的方式。
            </Paragraph>
          </Panel>
          <Panel header="项目开发周期一般是多久？" key="2">
            <Paragraph>
              项目开发周期取决于项目的规模和复杂度。一个简单的网站可能需要2-4周，而复杂的应用系统可能需要3-6个月或更长时间。
              在项目启动前，我们会提供一个详细的时间表，并在开发过程中定期更新进度。
            </Paragraph>
          </Panel>
          <Panel header="你们使用哪些技术和框架？" key="3">
            <Paragraph>
              我们使用最新的技术和框架来开发解决方案，包括但不限于：React、Vue、Angular、Node.js、Python、Java、
              .NET Core、PHP等前后端技术，以及MySQL、PostgreSQL、MongoDB、Redis等数据库技术。
              我们会根据项目需求选择最适合的技术栈。
            </Paragraph>
          </Panel>
          <Panel header="项目完成后是否提供维护服务？" key="4">
            <Paragraph>
              是的，我们提供项目完成后的维护服务。我们提供不同级别的维护方案，包括基础维护、标准维护和高级维护，
              您可以根据需求选择合适的方案。维护服务包括bug修复、安全更新、性能优化和小功能更新等。
            </Paragraph>
          </Panel>
          <Panel header="如何保证项目的质量和安全？" key="5">
            <Paragraph>
              我们有严格的质量控制流程，包括代码审查、自动化测试、性能测试和安全测试等。我们的开发团队遵循行业最佳实践，
              确保代码质量和安全性。此外，我们还定期进行安全审计和漏洞扫描，确保系统的安全性。
            </Paragraph>
          </Panel>
        </Collapse>
      </FAQSection>

      <Divider />

      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <Title level={3}>准备好开始您的项目了吗？</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          联系我们，获取免费咨询和项目评估
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          href="/contact" 
          icon={<CloudOutlined />} 
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
    </ServicesContainer>
  );
};

export default Services;