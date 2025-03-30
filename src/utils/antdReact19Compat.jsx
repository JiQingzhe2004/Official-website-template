import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import React from 'react';

// 为 React 19 提供 antd v5 兼容性支持
export const AntdReact19Provider = ({ children }) => {
  const cache = React.useMemo(() => createCache(), []);
  
  return (
    <StyleProvider cache={cache}>
      <ConfigProvider>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
};

// SSR 渲染支持（如果需要）
export const getAntdStyles = (cache) => {
  return extractStyle(cache);
};
