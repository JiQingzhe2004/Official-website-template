import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { checkAndRefreshToken } from './utils/axiosConfig';

// 导入组件
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isValid = await checkAndRefreshToken();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('认证检查出错:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  if (isLoading) {
    return <LoadingScreen message="验证身份..." />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // 用于跟踪应用状态
  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    // 在应用启动时检查令牌有效性
    const initApp = async () => {
      try {
        await checkAndRefreshToken();
      } catch (error) {
        console.error('初始令牌检查失败:', error);
      } finally {
        setAppReady(true);
      }
    };
    
    initApp();
  }, []);
  
  if (!appReady) {
    return <LoadingScreen message="应用加载中..." />;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        {/* 其他受保护的路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
