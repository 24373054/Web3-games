# ⚡ 出生点快速修复

## 问题已解决！

玩家现在会自动在场景外部安全生成。

---

## 🚀 工作原理

系统会：
1. ✅ 扫描场景模型的边界
2. ✅ 自动计算安全出生点
3. ✅ 将玩家放在场景外部

---

## 📍 如何调整出生点

### 最简单的方法：修改偏移量

编辑 `src/main.js` 第 155-157 行：

```javascript
// 原始（推荐）
const spawnX = maxX + 20;  // 右侧 20 单位
const spawnY = maxY + 10;  // 上方 10 单位
const spawnZ = (minZ + maxZ) / 2;  // 中心

// 改为更远
const spawnX = maxX + 50;
const spawnY = maxY + 20;
const spawnZ = (minZ + maxZ) / 2;

// 改为更近
const spawnX = maxX + 5;
const spawnY = maxY + 5;
const spawnZ = (minZ + maxZ) / 2;
```

---

## 🎯 快速调整选项

### 出生在右侧（推荐）
```javascript
const spawnX = maxX + 20;
const spawnY = maxY + 10;
const spawnZ = (minZ + maxZ) / 2;
```

### 出生在左侧
```javascript
const spawnX = minX - 20;
const spawnY = maxY + 10;
const spawnZ = (minZ + maxZ) / 2;
```

### 出生在前方
```javascript
const spawnX = (minX + maxX) / 2;
const spawnY = maxY + 10;
const spawnZ = minZ - 20;
```

### 出生在后方
```javascript
const spawnX = (minX + maxX) / 2;
const spawnY = maxY + 10;
const spawnZ = maxZ + 20;
```

### 出生在上方
```javascript
const spawnX = (minX + maxX) / 2;
const spawnY = maxY + 50;
const spawnZ = (minZ + maxZ) / 2;
```

---

## 🔍 调试

打开浏览器控制台 (F12) 查看：

```
场景边界: { minX: ..., maxX: ..., minZ: ..., maxZ: ..., maxY: ... }
自动出生点: { spawnX: ..., spawnY: ..., spawnZ: ... }
```

这告诉你场景的实际位置和出生点坐标。

---

## ✅ 测试

1. 刷新浏览器
2. 玩家应该在场景外部
3. 玩家应该能看到场景
4. 玩家应该能走进场景

---

**完成！** 🎮
