import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageContent = styled.div`
  margin-top: 1.5rem;
`;

/**
 * 动态页面组件，用于渲染自定义页面内容
 * @param {Object} props.page 页面数据对象
 */
const DynamicPage = ({ page }) => {
  if (!page) {
    return <div>页面不存在</div>;
  }

  return (
    <PageContainer>
      <Helmet>
        <title>{page.meta_title || page.title} - 爱奇吉</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
      </Helmet>

      <Title level={1}>{page.title}</Title>
      
      <PageContent 
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </PageContainer>
  );
};

export default DynamicPage;