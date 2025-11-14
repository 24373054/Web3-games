# 快速开始

## 项目已准备就绪！

### 启动方式

#### 方式 1：使用 Python HTTP 服务器（推荐）
```bash
cd C:\Users\23157\CODE\Web3\3Dtest
python -m http.server 5173
```

然后在浏览器中打开：`http://localhost:5173`

#### 方式 2：使用 npm
```bash
npm start
```

### 功能说明

#### 游戏控制
- **W/A/S/D** - 前后左右移动
- **Space** - 跳跃
- **C** - 切换第一人称/第三人称视角
- **鼠标** - 环顾四周（拖动鼠标改变视角）

#### 游戏特性
✅ 已加载你的 GLB 场景模型（test1_0.glb）
✅ 完整的重力和跳跃机制
✅ 第一人称视角 - 沉浸式体验
✅ 第三人称视角 - 可以看到玩家角色模型
✅ 实时显示位置、速度、FPS 等信息

### 项目结构

```
3Dtest/
├── index.html              # 主页面
├── src/
│   └── main.js             # 游戏逻辑
├── test1/
│   └── test1_0.glb         # 你的场景模型
├── package.json            # 项目配置
└── README.md               # 详细文档
```

### 自定义参数

编辑 `src/main.js` 中的以下参数：

```javascript
playerState.speed = 0.3;        // 移动速度（增大值移动更快）
playerState.jumpForce = 0.6;    // 跳跃力度（增大值跳得更高）
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);  // 重力强度
```

### 常见问题

**Q: 场景模型没有显示？**
A: 检查浏览器控制台（F12）查看错误信息。确保 test1_0.glb 文件在 test1/ 目录下。

**Q: 移动很卡顿？**
A: 这可能是 GLB 模型过于复杂。尝试优化模型或降低场景复杂度。

**Q: 如何修改玩家角色外观？**
A: 编辑 `createPlayerCapsule()` 函数中的颜色和形状参数。

### 下一步

- 添加更多游戏机制（攻击、收集物品等）
- 优化场景加载和渲染性能
- 添加音效和背景音乐
- 实现多人联网功能

祝你开发愉快！🎮
