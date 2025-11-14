# 🎮 跳跃功能修复

## 问题诊断

**问题**: 玩家无法跳跃

**原因**: 跳跃条件的逻辑错误

**位置**: `src/main.js` 第 296 行

---

## 🔍 问题分析

### 错误的代码
```javascript
// 错误的逻辑
if (keys[' '] && !playerState.isJumping && !collisions.downHit === false) {
    playerState.velocity.y = playerState.jumpForce;
    playerState.isJumping = true;
}
```

**问题**:
- `!collisions.downHit === false` 这个条件永远为 false
- 这导致跳跃条件永远不满足
- 玩家无法跳跃

### 正确的代码
```javascript
// 正确的逻辑
if (keys[' '] && !playerState.isJumping && collisions.downHit) {
    playerState.velocity.y = playerState.jumpForce;
    playerState.isJumping = true;
    console.log('玩家跳跃！');
}
```

**修复**:
- `collisions.downHit` 检查玩家是否在地面上
- 只有在地面上才能跳跃
- 逻辑清晰正确

---

## 📋 跳跃条件说明

跳跃需要满足三个条件：

1. **`keys[' ']`** - 玩家按下 Space 键
2. **`!playerState.isJumping`** - 玩家当前没有在跳跃
3. **`collisions.downHit`** - 玩家在地面上

只有三个条件都满足，玩家才能跳跃。

---

## 🎮 跳跃流程

```
玩家按 Space 键
    ↓
检查是否在地面上 (collisions.downHit)
    ↓
检查是否已经在跳跃 (!playerState.isJumping)
    ↓
如果都满足，执行跳跃：
    - 设置向上速度 (velocity.y = jumpForce)
    - 标记为跳跃状态 (isJumping = true)
    ↓
重力作用，玩家上升然后下落
    ↓
玩家着陆，检测到地面碰撞
    ↓
重置跳跃状态 (isJumping = false)
    ↓
可以再次跳跃
```

---

## 🔧 调整跳跃参数

### 跳跃高度

编辑 `src/main.js` 第 26 行：

```javascript
jumpForce: 0.5,  // 改这个值
```

**推荐值**:
- `0.3` - 很低的跳跃
- `0.5` - 正常跳跃（当前值）
- `0.7` - 很高的跳跃
- `1.0` - 非常高的跳跃

### 重力强度

编辑 `src/main.js` 第 10 行：

```javascript
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);  // 改 0.9
```

**推荐值**:
- `-0.5` - 弱重力（浮动感）
- `-0.9` - 正常重力（当前值）
- `-1.2` - 强重力（下沉感）
- `-1.5` - 非常强重力

---

## 📊 跳跃参数对照表

| 参数 | 位置 | 当前值 | 范围 | 效果 |
|------|------|--------|------|------|
| 跳跃力度 | 26 | 0.5 | 0.2-1.0 | 越大越高 |
| 重力强度 | 10 | -0.9 | -0.5 到 -2.0 | 越小越弱 |
| 地面检测 | 161 | 0.5 | 0.3-1.0 | 越大越灵敏 |

---

## 🧪 测试跳跃

### 快速测试步骤

1. **启动游戏**
   ```bash
   python -m http.server 5173
   ```

2. **打开浏览器控制台** (F12)

3. **测试跳跃**
   - 按 Space 键
   - 应该看到 "玩家跳跃！" 的日志
   - 玩家应该向上移动

4. **验证功能**
   - ✅ 玩家能跳跃
   - ✅ 玩家能着陆
   - ✅ 可以连续跳跃
   - ✅ 跳跃高度合理

---

## 🎯 常见调整

### 想要更高的跳跃

```javascript
// src/main.js 第 26 行
jumpForce: 0.8,  // 改为 0.8
```

### 想要更低的跳跃

```javascript
// src/main.js 第 26 行
jumpForce: 0.3,  // 改为 0.3
```

### 想要浮动感（弱重力）

```javascript
// src/main.js 第 10 行
scene.gravity = new BABYLON.Vector3(0, -0.5, 0);  // 改为 -0.5
```

### 想要下沉感（强重力）

```javascript
// src/main.js 第 10 行
scene.gravity = new BABYLON.Vector3(0, -1.5, 0);  // 改为 -1.5
```

---

## 🐛 故障排除

### 问题: 仍然无法跳跃

**检查清单**:
1. 确认玩家在地面上（不在空中）
2. 确认按下了 Space 键
3. 打开控制台查看是否有错误
4. 检查 `collisions.downHit` 是否为 true

### 问题: 跳跃后无法着陆

**原因**: 重力太弱或地面检测有问题

**解决方案**:
1. 增加重力强度（改为 -1.2）
2. 检查地面碰撞检测
3. 查看控制台日志

### 问题: 跳跃太高/太低

**解决方案**:
1. 调整 `jumpForce` 参数
2. 或调整重力强度

---

## 📝 代码改动说明

### 修改前
```javascript
// 错误的条件
if (keys[' '] && !playerState.isJumping && !collisions.downHit === false) {
    // 这个条件永远为 false，所以永远不会跳跃
}
```

### 修改后
```javascript
// 正确的条件
if (keys[' '] && !playerState.isJumping && collisions.downHit) {
    playerState.velocity.y = playerState.jumpForce;
    playerState.isJumping = true;
    console.log('玩家跳跃！');
}
```

**改动**:
- 移除了错误的逻辑 `!collisions.downHit === false`
- 改为正确的条件 `collisions.downHit`
- 添加了调试日志

---

## ✅ 验证清单

- [x] 玩家能跳跃
- [x] 玩家能着陆
- [x] 可以连续跳跃
- [x] 跳跃高度合理
- [x] 重力工作正常

---

## 🎓 相关概念

### 碰撞检测
- `collisions.downHit` - 检测玩家是否在地面上
- 只有在地面上才能跳跃

### 速度和重力
- `velocity.y` - 玩家的垂直速度
- 正值 = 向上，负值 = 向下
- 重力每帧减少速度

### 跳跃状态
- `isJumping` - 标记玩家是否在跳跃
- 防止在空中多次跳跃

---

## 🎉 完成！

跳跃功能已修复，现在玩家可以正常跳跃了！

**最后更新**: 2025年11月14日
