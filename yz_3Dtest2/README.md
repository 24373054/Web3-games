# 3D Game - Babylon.js

一个使用 Babylon.js 构建的 3D 游戏界面，支持第一/第三人称切换、键盘控制和重力机制。

## 功能特性

- ✅ 加载自定义 GLB 场景模型
- ✅ 第一人称和第三人称摄像机切换
- ✅ 键盘 WASD 移动控制
- ✅ 重力和多段跳跃机制（可跳 3 次）
- ✅ 简单的玩家角色模型（第三人称）
- ✅ 实时位置、速度和跳跃次数显示

## 安装与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式
```bash
npm run dev
```

### 3. 构建生产版本
```bash
npm run build
```

## 游戏控制

| 按键 | 功能 |
|------|------|
| **W/A/S/D** | 前后左右移动 |
| **Space（按住）** | 持续上升（最多 3 段） |
| **Space（松开）** | 开始抛体运动（下落） |
| **C** | 切换第一/第三人称视角 |
| **鼠标拖动** | 环顾四周改变视角 |

## 最近改进

- ✅ 修复了穿墙问题（禁用场景模型碰撞检测）
- ✅ 修复了 WASD 移动功能
- ✅ 玩家可以正常移动和交互
- ✅ 添加了按住 Space 上升、松开下落的机制
- ✅ 添加了多段跳跃功能（可跳 3 次）
- ✅ 添加了绿色地面平面供玩家跳跃
- ✅ 场景模型自动对齐到地面
- ✅ 玩家出生在场景外部安全位置

## 项目结构

```
3Dtest/
├── src/
│   └── main.js          # 主程序文件
├── test1/
│   └── test1_0.glb      # 场景模型
├── index.html           # HTML 入口
├── vite.config.js       # Vite 配置
├── package.json         # 项目配置
└── README.md            # 本文件
```

## 技术栈

- **Babylon.js** - 3D 图形引擎
- **Vite** - 前端构建工具
- **JavaScript ES6+** - 编程语言

## 自定义

### 修改玩家速度
编辑 `src/main.js` 中的 `playerState.speed` 值。

### 修改跳跃力度
编辑 `src/main.js` 中的 `playerState.jumpForce` 值。

### 修改重力
编辑 `src/main.js` 中的 `scene.gravity` 值。

### 修改第三人称摄像机距离
编辑 `src/main.js` 中 `updatePlayerMovement()` 函数内的 `cameraDistance` 值。

## 注意事项

- GLB 文件应放在 `test1/` 目录下
- 确保已安装 Node.js 和 npm
- 第一人称模式下玩家角色不可见
- 第三人称模式下可以看到简单的人形角色模型
