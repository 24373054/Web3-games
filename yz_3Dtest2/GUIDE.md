# Babylon.js 3D 游戏开发指南

## 📋 项目概述

这是一个完整的 3D 游戏框架，基于 Babylon.js 构建，包含以下核心功能：

- ✅ 第一人称和第三人称摄像机切换
- ✅ 键盘 WASD 移动控制
- ✅ 重力和跳跃机制
- ✅ 自定义玩家角色模型
- ✅ GLB 场景模型加载
- ✅ 实时调试信息显示

---

## 🎮 游戏控制

| 按键 | 功能 |
|------|------|
| **W** | 向前移动 |
| **S** | 向后移动 |
| **A** | 向左移动 |
| **D** | 向右移动 |
| **Space** | 跳跃 |
| **C** | 切换摄像机视角 |
| **鼠标拖动** | 环顾四周 |

---

## 📁 项目结构

```
3Dtest/
├── index.html              # HTML 入口文件
├── src/
│   ├── main.js             # 主游戏逻辑
│   ├── config.js           # 游戏配置参数
│   └── utils.js            # 工具函数库
├── test1/
│   └── test1_0.glb         # 场景模型文件
├── package.json            # 项目配置
├── README.md               # 项目说明
├── QUICKSTART.md           # 快速开始指南
└── GUIDE.md                # 本文件
```

---

## ⚙️ 配置说明

### 修改游戏参数

编辑 `src/main.js` 中的 `playerState` 对象：

```javascript
const playerState = {
    speed: 0.25,           // 移动速度（推荐 0.15-0.35）
    jumpForce: 0.5,        // 跳跃力度（推荐 0.3-0.7）
    playerHeight: 1.8,     // 玩家高度
    playerRadius: 0.3,     // 玩家碰撞半径
};
```

### 修改重力

编辑场景初始化代码：

```javascript
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
// 更大的负值 = 更强的重力
// 例如：-1.5 会让物体下落更快
```

### 修改光源

编辑光源设置：

```javascript
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.8;  // 0-1 之间

const sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3(50, 100, 50), scene);
sunLight.intensity = 0.6;  // 调整阴影效果
```

---

## 🎨 自定义玩家角色

### 修改玩家外观

编辑 `createPlayerCapsule()` 函数中的材质颜色：

```javascript
// 修改身体颜色
const bodyMat = new BABYLON.StandardMaterial('bodyMat', scene);
bodyMat.diffuse = new BABYLON.Color3(0.2, 0.5, 0.8);  // RGB 值 (0-1)

// 修改头部颜色
const headMat = new BABYLON.StandardMaterial('headMat', scene);
headMat.diffuse = new BABYLON.Color3(0.9, 0.7, 0.6);  // 肤色
```

### 常见颜色参考

```javascript
红色:     new BABYLON.Color3(1, 0, 0)
绿色:     new BABYLON.Color3(0, 1, 0)
蓝色:     new BABYLON.Color3(0, 0, 1)
黄色:     new BABYLON.Color3(1, 1, 0)
紫色:     new BABYLON.Color3(1, 0, 1)
青色:     new BABYLON.Color3(0, 1, 1)
白色:     new BABYLON.Color3(1, 1, 1)
黑色:     new BABYLON.Color3(0, 0, 0)
灰色:     new BABYLON.Color3(0.5, 0.5, 0.5)
```

---

## 🔧 高级功能

### 添加新的游戏机制

#### 1. 添加物品收集系统

```javascript
function createCollectible(scene, position) {
    const collectible = BABYLON.MeshBuilder.CreateSphere('collectible', { diameter: 0.5 }, scene);
    collectible.position = position;
    
    const mat = new BABYLON.StandardMaterial('collectibleMat', scene);
    mat.diffuse = new BABYLON.Color3(1, 1, 0);  // 黄色
    mat.emissiveColor = new BABYLON.Color3(1, 1, 0);  // 发光
    collectible.material = mat;
    
    return collectible;
}
```

#### 2. 添加敌人 AI

```javascript
function createEnemy(scene, position) {
    const enemy = BABYLON.MeshBuilder.CreateBox('enemy', { size: 1 }, scene);
    enemy.position = position;
    
    const mat = new BABYLON.StandardMaterial('enemyMat', scene);
    mat.diffuse = new BABYLON.Color3(1, 0, 0);  // 红色
    enemy.material = mat;
    
    // 简单的 AI 逻辑
    enemy.moveSpeed = 0.1;
    
    return enemy;
}
```

#### 3. 添加音效

```javascript
// 在 HTML 中添加音频元素
// <audio id="jumpSound" src="sounds/jump.mp3"></audio>

function playJumpSound() {
    const sound = document.getElementById('jumpSound');
    sound.currentTime = 0;
    sound.play();
}
```

---

## 🐛 调试技巧

### 启用调试层

在 `main.js` 中添加：

```javascript
// 显示调试层
const debugLayer = scene.debugLayer;
debugLayer.show();
```

### 查看性能信息

```javascript
// 显示 FPS 和性能指标
engine.displayRenderingStats = true;
```

### 控制台日志

```javascript
// 在浏览器控制台查看日志
console.log('玩家位置:', playerCapsule.position);
console.log('摄像机模式:', playerState.isFirstPerson ? '第一人称' : '第三人称');
```

---

## 📊 性能优化

### 1. 减少网格数量

```javascript
// 合并相同材质的网格
result.meshes.forEach(mesh => {
    mesh.checkCollisions = true;
    mesh.receiveShadows = true;
});
```

### 2. 使用 LOD（细节级别）

```javascript
// 为远处的物体使用低多边形版本
const lod = new BABYLON.LODLevel(10, lowPolyMesh);
mesh.addLODLevel(lod);
```

### 3. 启用阴影映射

```javascript
const shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
shadowGenerator.addShadowCaster(playerCapsule);
```

---

## 🌐 部署到网络

### 使用 GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有文件
3. 在 Settings 中启用 GitHub Pages
4. 访问 `https://username.github.io/3Dtest`

### 使用 Netlify

1. 连接 GitHub 仓库
2. 设置构建命令为空（因为不需要构建）
3. 设置发布目录为根目录
4. 自动部署

---

## 📚 学习资源

- **Babylon.js 官方文档**: https://doc.babylonjs.com/
- **Babylon.js Playground**: https://playground.babylonjs.com/
- **WebGL 基础**: https://webglfundamentals.org/
- **3D 数学**: https://learnopengl.com/

---

## 🤝 常见问题

### Q: 如何导入自己的 3D 模型？

A: 将模型文件（.glb、.gltf、.obj 等）放在 `test1/` 目录下，然后修改加载路径：

```javascript
const result = await BABYLON.SceneLoader.ImportMeshAsync(
    '',
    './test1/',
    'your_model.glb',  // 改为你的文件名
    scene
);
```

### Q: 游戏运行很卡，如何优化？

A: 
1. 减少场景中的网格数量
2. 降低纹理分辨率
3. 禁用不必要的阴影
4. 使用 LOD 系统

### Q: 如何添加多个场景？

A: 创建多个场景对象并在需要时切换：

```javascript
const scene1 = new BABYLON.Scene(engine);
const scene2 = new BABYLON.Scene(engine);

// 切换场景
engine.runRenderLoop(() => {
    currentScene.render();
});
```

### Q: 如何保存玩家进度？

A: 使用浏览器的 LocalStorage：

```javascript
// 保存
localStorage.setItem('playerPos', JSON.stringify(playerCapsule.position));

// 加载
const savedPos = JSON.parse(localStorage.getItem('playerPos'));
if (savedPos) {
    playerCapsule.position = BABYLON.Vector3.FromArray(Object.values(savedPos));
}
```

---

## 🎯 下一步建议

1. **添加更多场景** - 创建多个关卡或区域
2. **实现 UI 系统** - 添加菜单、库存、对话框
3. **添加音效** - 背景音乐、脚步声、环境音
4. **优化性能** - 使用 WebWorker、实例化等
5. **多人联网** - 集成 WebSocket 或 Photon
6. **移动端支持** - 添加触摸控制

---

## 📝 许可证

这个项目是开源的，可以自由使用和修改。

祝你开发愉快！🚀
