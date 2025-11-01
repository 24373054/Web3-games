# 物理引擎调试指南

## 问题：显示"移动中"但没有实际移动

### 可能的原因

1. **物理引擎未正确初始化**
2. **速度设置未生效**
3. **摩擦力过大**
4. **物理体处于休眠状态**
5. **相机同步覆盖了物理体位置**

---

## 调试步骤

### 第 1 步：检查是否看到红色球体

重启游戏后，你应该看到：
- ✅ 一个**红色半透明球体**（这是玩家碰撞体）
- 位置应该在场景中央上方

**如果看不到红色球体：**
- 按方向键移动相机视角
- 或者球体可能在地面以下

### 第 2 步：在控制台运行诊断命令

打开浏览器控制台（F12），输入以下命令：

#### 检查物理引擎状态
```javascript
console.log('物理引擎:', window.game.scene.getPhysicsEngine());
console.log('玩家物理体:', window.game.player.body.physicsImpostor);
```

#### 检查玩家位置
```javascript
console.log('玩家位置:', window.game.player.body.position);
```

#### 手动测试物理引擎
```javascript
// 手动设置速度
window.game.player.body.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(5, 0, 0));

// 等待1秒后检查位置
setTimeout(() => {
    console.log('1秒后位置:', window.game.player.body.position);
}, 1000);
```

**预期结果：**
- 红色球体应该向右移动
- 位置的 X 坐标应该增加

**如果球体移动了：** 
- ✅ 物理引擎工作正常
- 问题在于键盘输入到物理引擎的连接

**如果球体没有移动：**
- ❌ 物理引擎有问题
- 查看控制台错误

### 第 3 步：测试跳跃

在控制台输入：
```javascript
window.game.player.body.physicsImpostor.applyImpulse(
    new BABYLON.Vector3(0, 50, 0),
    window.game.player.body.position
);
```

**预期结果：**
- 红色球体应该向上跳
- 然后由于重力落下

**如果没有跳跃：**
- 物理引擎可能没有运行

### 第 4 步：检查速度应用

按住 W 键，然后在控制台输入：
```javascript
window.game.player.body.physicsImpostor.getLinearVelocity();
```

**预期结果：**
```
Vector3 {x: 0, y: -0.x, z: 10}
```

**如果速度是 (0, y, 0)：**
- 速度设置没有生效
- 问题在 Player.update() 中

### 第 5 步：强制移动测试

在控制台输入：
```javascript
// 启动一个持续移动的测试
let testInterval = setInterval(() => {
    const player = window.game.player;
    if (player && player.body && player.body.physicsImpostor) {
        player.body.physicsImpostor.setLinearVelocity(
            new BABYLON.Vector3(5, 0, 0)
        );
        console.log('位置:', player.body.position);
    }
}, 100);

// 5秒后停止测试
setTimeout(() => {
    clearInterval(testInterval);
    console.log('测试结束');
}, 5000);
```

---

## 常见问题和解决方案

### 问题 1: 红色球体在地面以下

**解决方案：**
```javascript
window.game.player.body.position.y = 5;
```

### 问题 2: 球体不受重力影响

**检查：**
```javascript
console.log('重力:', window.game.scene.gravity);
console.log('物理引擎:', window.game.scene.getPhysicsEngine());
```

**解决方案：**
- 刷新页面
- 确保 CANNON 正确加载

### 问题 3: setLinearVelocity 不工作

**可能原因：**
- 物理体处于休眠状态
- 物理体被固定

**解决方案：**
```javascript
// 唤醒物理体
if (window.game.player.body.physicsImpostor.physicsBody) {
    window.game.player.body.physicsImpostor.physicsBody.wakeUp();
    window.game.player.body.physicsImpostor.physicsBody.allowSleep = false;
}
```

### 问题 4: 相机位置覆盖了物理体

**检查顺序：**
在 `Player.update()` 中，应该是：
1. 先应用物理速度
2. 后同步相机位置

**当前代码已经是正确顺序：**
```javascript
// 1. 同步相机到物理体
this.camera.position.x = this.body.position.x;

// 2. 计算移动
// 3. 应用速度
this.body.physicsImpostor.setLinearVelocity(...);
```

---

## 快速修复

### 如果所有测试都失败

在控制台运行这个完整的重置：

```javascript
// 完全重新创建玩家物理体
const player = window.game.player;
const scene = window.game.scene;

// 删除旧的物理体
if (player.body.physicsImpostor) {
    player.body.physicsImpostor.dispose();
}
player.body.dispose();

// 创建新的物理体
player.body = BABYLON.MeshBuilder.CreateSphere(
    'player_new',
    { diameter: 1.6 },
    scene
);
player.body.position = new BABYLON.Vector3(0, 5, 0);

// 添加材质
const mat = new BABYLON.StandardMaterial('playerMat', scene);
mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
mat.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
mat.alpha = 0.5;
player.body.material = mat;

// 添加物理
player.body.physicsImpostor = new BABYLON.PhysicsImpostor(
    player.body,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 10, friction: 0.1, restitution: 0.1 },
    scene
);

// 禁用休眠
if (player.body.physicsImpostor.physicsBody) {
    player.body.physicsImpostor.physicsBody.allowSleep = false;
}

console.log('✅ 玩家物理体已重新创建');

// 测试移动
setTimeout(() => {
    player.body.physicsImpostor.setLinearVelocity(
        new BABYLON.Vector3(5, 0, 0)
    );
    console.log('测试：向右移动');
}, 1000);
```

---

## 预期的正常输出

当你按 W 键时，控制台应该显示：

```
按键按下: w
正在移动: {moveX: 0, moveZ: 10, moveSpeed: 10}
设置速度: Vector3 {x: 0, y: -1.2, z: 10}
实际速度: Vector3 {x: 0, y: -1.2, z: 10}
物体位置: Vector3 {x: 0, y: 2.8, z: 0.5}
```

**位置应该持续变化！**

---

## 下一步

1. **运行上述测试命令**
2. **告诉我结果**：
   - 手动设置速度能否让球体移动？
   - 跳跃测试是否有效？
   - 控制台显示的速度是什么？
   - 位置坐标有变化吗？

这样我就能准确定位问题！

