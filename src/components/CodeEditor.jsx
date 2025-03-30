// ...existing code...

// 查找并修改使用了boolean值的jsx属性
// 例如将：
// <SomeComponent jsx={true} />
// 修改为：
// <SomeComponent jsx="true" />

return (
  <Editor
    // ...existing code...
    jsx="true" // 修改这里，如果原来是jsx={true}
    // ...existing code...
  />
);

// ...existing code...
