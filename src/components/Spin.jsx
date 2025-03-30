import React from 'react';
import { Spin as AntdSpin } from 'antd';

/**
 * Spin组件的包装器，确保在使用tip时正确设置spinning属性
 * 解决 "tip only work in nest or fullscreen pattern" 警告
 */
const Spin = ({ tip, children, ...props }) => {
  // 如果提供了tip但没有设置spinning，则默认设置spinning为true
  const spinningProps = tip && props.spinning === undefined ? { spinning: true } : {};
  
  return (
    <AntdSpin tip={tip} {...props} {...spinningProps}>
      {children}
    </AntdSpin>
  );
};

export default Spin;
