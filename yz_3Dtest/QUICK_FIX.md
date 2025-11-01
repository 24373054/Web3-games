# 快速修复指南

## 问题：画面黑屏

我已经做了以下修复：

### 1. 增加了光照亮度
- 环境光强度从 0.7 提升到 1.0
- 定向光强度从 0.8 提升到 1.0
- 点光源强度从 0.5 提升到 1.0

### 2. 调整了背景色
- 从几乎全黑 (0.01, 0.01, 0.05) 改为稍亮的深蓝色 (0.05, 0.05, 0.15)

### 3. 优化了相机
- 从 UniversalCamera 改为 FreeCamera
- 位置从 (0, 2, -10) 改为 (0, 5, -15) - 更高更远的视角

### 4. 修复了物理引擎
- 玩家碰撞体从 Capsule 改为 Sphere（Cannon.js兼容性更好）
- 相机不再作为物理体的子对象，而是手动同步位置

### 5. 添加了大量调试信息
- 每个步骤都会在控制台输出日志

## 现在请执行以下步骤：

### 步骤 1: 重启开发服务器

```bash
# 如果服务器还在运行，先停止它（Ctrl+C）
# 然后重新启动
npm run dev
```

### 步骤 2: 打开浏览器

浏览器会自动打开 `http://localhost:3000`

### 步骤 3: 打开开发者工具

按 `F12` 打开控制台

### 步骤 4: 点击"进入瀛州"按钮

### 步骤 5: 检查控制台输出

你应该看到类似这样的输出：

```
main.js 已加载
开始按钮被点击
Canvas 元素: <canvas id="renderCanvas">
初始化游戏...
场景已创建，背景色: {...}
物理引擎已启用
相机已创建，位置: {...}
环境光已创建，强度: 1
定向光已创建
点光源已创建
创建世界环境...
创建地面...
地面已创建
网格线已创建
...
```

### 步骤 6: 查看画面

你现在应该能看到：
- 深蓝色的背景（不是纯黑）
- 青色的网格线（地面）
- 悬浮的彩色立方体
- 不同颜色的几何体（数字生命实体）

## 如果还是黑屏

### 测试 1: 简单测试页面

打开：`http://localhost:3000/simple-test.html`

这个页面只创建一个简单的青色球体。如果你能看到球体，说明 Babylon.js 工作正常。

### 测试 2: CDN 版本测试

打开：`http://localhost:3000/test.html`

这个页面使用 CDN 加载 Babylon.js，测试基本渲染功能。

### 测试 3: 检查 WebGL

在控制台输入：

```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL支持:', gl !== null);
console.log('WebGL版本:', gl ? gl.getParameter(gl.VERSION) : 'N/A');
```

## 常见问题

### Q: 控制台有红色错误

A: 请复制完整的错误信息，这样我才能帮你解决具体问题。

### Q: 没有任何控制台输出

A: 可能是 JavaScript 模块没有加载。检查：
1. 是否正确安装了依赖 (`npm install`)
2. 是否使用现代浏览器（Chrome、Firefox、Edge 最新版）

### Q: 看到 "Failed to fetch" 错误

A: 确保开发服务器正在运行 (`npm run dev`)

### Q: 画面是深蓝色但什么都没有

A: 可能是实体生成失败。在控制台查找"生成实体"相关的日志。

## 手动创建测试对象

如果游戏启动后还是什么都看不到，在控制台输入以下代码手动创建一个测试立方体：

```javascript
const testBox = BABYLON.MeshBuilder.CreateBox('test', {size: 5}, window.game.scene);
testBox.position = new BABYLON.Vector3(0, 3, 0);
const mat = new BABYLON.StandardMaterial('testMat', window.game.scene);
mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
mat.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
testBox.material = mat;
console.log('测试立方体已创建，位置:', testBox.position);
```

如果你能看到一个红色立方体出现，说明渲染是工作的，问题在于其他对象的创建或位置。

## 需要更多帮助？

请告诉我：
1. 控制台的完整输出（特别是错误信息）
2. 你使用的浏览器和版本
3. 操作系统
4. 简单测试页面 (simple-test.html) 是否能正常显示

