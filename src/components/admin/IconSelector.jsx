import React, { useState, useEffect } from 'react';
import { Select, Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';

const { Option } = Select;

// 常用图标列表
const COMMON_ICONS = [
  'wechat', 'weibo', 'twitter', 'facebook', 'instagram', 'youtube', 
  'linkedin', 'github', 'gitlab', 'google', 'apple', 'android', 
  'windows', 'zhihu', 'qq', 'link', 'global'
];

const IconSelector = ({ value, onChange, style = {} }) => {
  const [searchValue, setSearchValue] = useState('');
  const [iconList, setIconList] = useState(COMMON_ICONS);
  
  // 当搜索值改变时，筛选图标
  useEffect(() => {
    if (!searchValue) {
      setIconList(COMMON_ICONS);
      return;
    }
    
    const allIconNames = Object.keys(Icons).filter(name => 
      name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone')
    );
    
    const filteredIcons = allIconNames
      .filter(name => name.toLowerCase().includes(searchValue.toLowerCase()))
      .map(name => name.replace(/Outlined|Filled|TwoTone$/, '').toLowerCase());
    
    setIconList([...new Set([...filteredIcons])]);
  }, [searchValue]);

  const renderIcon = (iconName) => {
    // 尝试不同的图标变种
    const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const IconComponent = 
      Icons[`${capitalized}Outlined`] || 
      Icons[`${capitalized}Filled`] || 
      Icons[`${capitalized}TwoTone`];
    
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
      style={{ width: 150, ...style }}
      filterOption={false}
    >
      {iconList.map(iconName => (
        <Option key={iconName} value={iconName}>
          <Tooltip title={iconName}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>{renderIcon(iconName)}</span>
              <span>{iconName}</span>
            </div>
          </Tooltip>
        </Option>
      ))}
    </Select>
  );
};

export default IconSelector;
