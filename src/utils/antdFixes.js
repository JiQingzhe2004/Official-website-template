/**
 * antd v5 兼容性修复指南
 * 
 * 本文件提供了解决常见的 antd v5 警告和兼容性问题的示例和提示
 */

// 1. Menu 组件 - 使用 items 替代 children
export const menuExampleCorrect = () => {
  // 正确的使用方式
  const items = [
    {
      label: '菜单项1',
      key: 'item-1',
      icon: null,
    },
    {
      label: '菜单项2',
      key: 'item-2',
      children: [
        {
          label: '子菜单项',
          key: 'subitem-1',
        }
      ]
    },
  ];
  
  // 使用示例
  // <Menu items={items} />
};

// 2. Upload 组件 - 使用 fileList 替代 value
export const uploadExampleCorrect = () => {
  // 正确的使用方式
  // const [fileList, setFileList] = useState([]);
  
  // 使用示例
  // <Upload 
  //   fileList={fileList} 
  //   onChange={({ fileList: newFileList }) => setFileList(newFileList)} 
  // />
};

// 3. 确保 React 版本兼容性
export const checkReactCompatibility = () => {
  // antd v5 支持 React 16 ~ 18
  // 如果使用 React 19 或更高版本，可能需要查看 https://u.ant.design/v5-for-19
};

/**
 * 使用说明:
 * 
 * 在组件中引入需要的修复示例:
 * import { menuExampleCorrect } from '../utils/antdFixes';
 * 
 * 然后参考示例修正现有代码
 */
