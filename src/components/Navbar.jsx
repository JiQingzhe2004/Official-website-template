import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { MenuOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { API_URL, STATIC_URL } from '../../config';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1890ff;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  span {
    background: linear-gradient(45deg, #1890ff, #36cfc9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-left: 10px; /* 添加间距，让logo和文字之间有空隙 */
  }
`;

const LogoImage = styled.img`
  height: 40px;
  max-width: 150px;
  object-fit: contain;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
    width: 70%;
    height: 100vh;
    flex-direction: column;
    justify-content: center;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    z-index: 1001;
  }
`;

const NavLink = styled(Link)`
  margin: 0 1rem;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: color 0.3s ease;
  
  &:hover {
    color: #1890ff;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: #1890ff;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
    font-size: 1.2rem;
    padding: 0.8rem 2rem;
    width: 100%;
    text-align: center;
    border-bottom: 1px solid #eaeaea;
    
    &:last-child {
      border-bottom: none;
    }
    
    &::after {
      bottom: -2px;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 998;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  z-index: 999;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
`;

const Navbar = ({ siteConfig: propsSiteConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState({
    logo: propsSiteConfig?.logo || null,
    title: propsSiteConfig?.title || '爱奇吉'
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 获取网站配置信息
  useEffect(() => {
    const fetchSiteConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/siteconfig`);
        if (response.ok) {
          const data = await response.json();
          
          // 根据返回的数据格式进行适当的处理
          let config = {
            logo: null,
            title: '爱奇吉',
            description: '爱奇吉是一家专注于互联网信息服务的科技公司，提供现代化的网络解决方案。'
          };
          
          // 检查数据是否为对象
          if (data && typeof data === 'object') {
            // 处理API返回的对象格式（每个键对应的是一个包含value的对象）
            const siteLogo = data.site_logo?.value;
            const siteName = data.site_name?.value;
            const siteDescription = data.site_description?.value;
            const siteFavicon = data.site_favicon?.value;
            
            config = {
              // 确保logo是字符串或null
              logo: siteLogo && typeof siteLogo === 'string' ? siteLogo : null,
              title: siteName && typeof siteName === 'string' ? siteName : '爱奇吉',
              description: siteDescription && typeof siteDescription === 'string' ? siteDescription : '爱奇吉是一家专注于互联网信息服务的科技公司，提供现代化的网络解决方案。',
              favicon: siteFavicon && typeof siteFavicon === 'string' ? siteFavicon : '/favicon.ico'
            };
            
            // 更新页面标题和描述
            document.getElementById('page-title').innerText = config.title;
            document.title = config.title;
            
            document.getElementById('page-description').content = config.description;
            
            // 更新网站图标
            if (config.favicon) {
              const faviconUrl = config.favicon.startsWith('http') 
                ? config.favicon 
                : `${STATIC_URL}/uploads/${config.favicon.replace(/^\//, '')}`;
              document.getElementById('favicon').href = faviconUrl;
            }
          }
          
          setSiteConfig(config);
        } else {
          console.error('API请求失败状态码:', response.status);
        }
      } catch (error) {
        console.error('获取网站配置失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteConfig();
  }, []); // 不要把siteConfig放在依赖数组中

  // 当props中的siteConfig变化时更新，避免依赖于内部state
  useEffect(() => {
    if (propsSiteConfig?.logo || propsSiteConfig?.title) {
      setSiteConfig(prevConfig => ({
        logo: propsSiteConfig.logo && typeof propsSiteConfig.logo === 'string' ? propsSiteConfig.logo : prevConfig.logo,
        title: propsSiteConfig.title && typeof propsSiteConfig.title === 'string' ? propsSiteConfig.title : prevConfig.title
      }));
    }
  }, [propsSiteConfig]); // 移除siteConfig依赖

  // 获取菜单项数据
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/menuitems?position=top`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            const sortedData = data.data.sort((a, b) => a.order - b.order);
            setMenuItems(sortedData);
          } else {
            console.error('获取菜单项失败:', data.message);
            setDefaultMenuItems();
          }
        } else {
          console.error('API请求失败:', response.status);
          setDefaultMenuItems();
        }
      } catch (error) {
        console.error('获取导航菜单数据失败:', error);
        setDefaultMenuItems();
      } finally {
        setLoading(false);
      }
    };

    const setDefaultMenuItems = () => {
      setMenuItems([
        { id: 1, title: '首页', path: '/', position: 'top', order: 1 },
        { id: 2, title: '服务', path: '/services', position: 'top', order: 2 },
        { id: 3, title: '关于我们', path: '/about', position: 'top', order: 3 },
        { id: 4, title: '成功案例', path: '/cases', position: 'top', order: 4 },
        { id: 5, title: '联系我们', path: '/contact', position: 'top', order: 5 }
      ]);
    };

    fetchMenuItems();
  }, []);

  // 滚动效果
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 构建logo URL
  const getLogoUrl = () => {
    if (!siteConfig.logo || typeof siteConfig.logo !== 'string') return null;
    
    // 如果logo是完整URL则直接返回
    if (siteConfig.logo.startsWith('http')) {
      return siteConfig.logo;
    }
    
    // 根据服务器静态文件配置构建正确的URL
    if (siteConfig.logo.startsWith('/uploads/')) {
      return `${STATIC_URL}${siteConfig.logo}`;
    } else if (siteConfig.logo.startsWith('/')) {
      return `${STATIC_URL}/uploads${siteConfig.logo}`;
    } else {
      return `${STATIC_URL}/uploads/${siteConfig.logo}`;
    }
  };

  // 安全地获取标题文本
  const getSiteTitle = () => {
    return typeof siteConfig.title === 'string' ? siteConfig.title : '爱奇吉';
  };

  return (
    <>
      <NavContainer style={{ 
        backgroundColor: scrolled ? '#fff' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <Logo to="/">
          {getLogoUrl() && (
            <LogoImage src={getLogoUrl()} alt={getSiteTitle()} />
          )}
          <span>{getSiteTitle()}</span>
        </Logo>
        
        <MobileMenuButton onClick={toggleMenu}>
          <MenuOutlined />
        </MobileMenuButton>
        
        <NavLinks $isOpen={isOpen}>
          <CloseButton onClick={toggleMenu}>
            <CloseOutlined />
          </CloseButton>
          
          {loading ? (
            <LoadingContainer>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </LoadingContainer>
          ) : (
            menuItems.map(item => (
              <NavLink 
                key={item.id} 
                to={item.path} 
                onClick={() => setIsOpen(false)}
              >
                {item.title}
              </NavLink>
            ))
          )}
        </NavLinks>
      </NavContainer>
      
      <Overlay $isOpen={isOpen} onClick={toggleMenu} />
    </>
  );
};

export default Navbar;