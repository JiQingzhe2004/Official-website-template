import React, { useState, useEffect } from 'react';
import { Alert, Button, Space } from 'antd';
import { checkServerHealth } from '../services/apiService';

/**
 * 服务器状态检查组件
 * 用于监测和显示后端服务器的连接状态
 */
const ServerStatusChecker = ({ onStatusChange }) => {
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = async () => {
    setServerStatus('checking');
    
    try {
      const isHealthy = await checkServerHealth();
      const newStatus = isHealthy ? 'online' : 'offline';
      setServerStatus(newStatus);
      setLastChecked(new Date());
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('检查服务器状态时出错:', error);
      setServerStatus('offline');
      
      if (onStatusChange) {
        onStatusChange('offline');
      }
    }
  };

  useEffect(() => {
    // 组件挂载时检查状态
    checkStatus();
    
    // 设置定时检查
    const intervalId = setInterval(checkStatus, 60000); // 每分钟检查一次
    
    return () => clearInterval(intervalId);
  }, []);

  // 根据状态渲染不同的提示
  const renderStatusAlert = () => {
    switch (serverStatus) {
      case 'online':
        return (
          <Alert
            message="服务器连接正常"
            type="success"
            showIcon
            description={`上次检查: ${lastChecked?.toLocaleTimeString()}`}
            style={{ marginBottom: 16 }}
          />
        );
      case 'offline':
        return (
          <Alert
            message="服务器连接异常"
            description="无法连接到后端服务器，请检查服务器状态或网络连接。"
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={checkStatus}>
                重试连接
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        );
      case 'checking':
      default:
        return (
          <Alert
            message="正在检查服务器连接..."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        );
    }
  };

  return <div className="server-status-checker">{renderStatusAlert()}</div>;
};

export default ServerStatusChecker;
