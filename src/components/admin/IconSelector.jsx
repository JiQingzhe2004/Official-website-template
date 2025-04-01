import React, { useState, useEffect } from 'react';
import { Select, Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';

const { Option } = Select;

// 服务常用图标列表 - 用于快速推荐
const RECOMMENDED_ICONS = [
  'GlobalOutlined',
  'RocketOutlined',
  'ToolOutlined',
  'TeamOutlined',
  'CodeOutlined',
  'CloudOutlined',
  'MobileOutlined',
  'AppstoreOutlined',
  'DesktopOutlined',
  'CustomerServiceOutlined',
  'SafetyOutlined',
  'DatabaseOutlined'
];

const IconSelector = ({ value, onChange, style = {} }) => {
  const [searchValue, setSearchValue] = useState('');
  const [iconList, setIconList] = useState([]);
  
  // 初始化时加载所有图标
  useEffect(() => {
    // 获取所有Outlined图标
    const allIconNames = Object.keys(Icons).filter(name => 
      name.endsWith('Outlined')
    );
    
    // 推荐的图标放在前面
    const sortedIcons = [
      ...RECOMMENDED_ICONS,
      ...allIconNames.filter(name => !RECOMMENDED_ICONS.includes(name))
    ];
    
    setIconList(sortedIcons);
  }, []);
  
  // 当搜索值改变时，筛选图标
  useEffect(() => {
    if (!searchValue) {
      // 重新获取所有图标
      const allIconNames = Object.keys(Icons).filter(name => 
        name.endsWith('Outlined')
      );
      
      // 推荐的图标放在前面
      const sortedIcons = [
        ...RECOMMENDED_ICONS,
        ...allIconNames.filter(name => !RECOMMENDED_ICONS.includes(name))
      ];
      
      setIconList(sortedIcons);
      return;
    }
    
    // 搜索所有图标
    const allIconNames = Object.keys(Icons).filter(name => 
      name.endsWith('Outlined') && 
      name.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    setIconList(allIconNames);
  }, [searchValue]);

  const renderIcon = (iconName) => {
    // 尝试直接使用图标
    const IconComponent = Icons[iconName];
    
    if (IconComponent) {
      return <IconComponent style={{ fontSize: '16px' }} />;
    }
    
    return '?';
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder="选择图标"
      onChange={onChange}
      onSearch={setSearchValue}
      style={{ width: '100%', ...style }}
      optionFilterProp="children"
      optionLabelProp="value"
    >
      {iconList.map(iconName => (
        <Option key={iconName} value={iconName}>
          <Tooltip title={iconName}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>{renderIcon(iconName)}</span>
              {iconName}
            </div>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
};

export default IconSelector;
