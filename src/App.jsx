import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

// 导入页面组件
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Cases from './pages/Cases';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Install from './pages/Install';
import DynamicPage from './pages/DynamicPage';
import DebugPanel from './components/DebugPanel';
import { API_URL } from '../config';

function App() {
  const [customPages, setCustomPages] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  const [loading, setLoading] = useState(false);

  // 获取网站配置
  useEffect(() => {
    const fetchSiteConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/siteconfig`);
        if (response.ok) {
          const data = await response.json();
          
          // 根据返回的数据格式进行适当的处理
          let configObject = {};
          let logo = null;
          let title = '爱奇吉';
          
          // 检查数据是否为数组
          if (Array.isArray(data)) {
            data.forEach(item => {
              configObject[item.key] = item.value;
            });
            
            const logoItem = data.find(item => item.key === 'site_logo');
            const nameItem = data.find(item => item.key === 'site_name');
            logo = logoItem?.value || null;
            title = nameItem?.value || '爱奇吉';
          } 
          // 检查数据是否为对象
          else if (data && typeof data === 'object') {
            configObject = data;
            logo = data.site_logo?.value || null;
            title = data.site_name?.value || '爱奇吉';
          }
          
          setSiteConfig({
            ...configObject,
            logo,
            title
          });
        }
      } catch (error) {
        console.error('获取网站配置失败:', error);
      }
    };

    fetchSiteConfig();
  }, []);

  // 获取自定义页面
  useEffect(() => {
    const fetchCustomPages = async () => {
      try {
        setLoading(true);
        // 使用fetch API替代axios，保持风格统一
        const response = await fetch(`${API_URL}/pages?status=published`);
        if (response.ok) {
          const data = await response.json();
          setCustomPages(data);
        }
      } catch (error) {
        console.error('获取自定义页面失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomPages();
  }, []);

  // 检查URL是否包含debug=true参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      setShowDebug(true);
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar siteConfig={siteConfig} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/install" element={<Install />} />
            <Route path="/debug" element={<DebugPanel />} /> {/* 修改为使用 DebugPanel 组件 */}
            {/* 动态加载自定义页面 */}
            {!loading && customPages.map(page => (
              <Route
                key={page.id}
                path={`/${page.slug}`}
                element={<DynamicPage page={page} />}
              />
            ))}
          </Routes>
        </div>
        <Footer />
        
        {/* 调试面板，可通过URL参数激活或在开发环境中显示 */}
        {(showDebug || process.env.NODE_ENV === 'development') && <DebugPanel />}
      </div>
    </Router>
  );
}

export default App;