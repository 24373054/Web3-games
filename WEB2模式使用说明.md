# Web2 模式使用说明

## 概述

瀛州纪现在支持两种游戏模式：

- **Web2 模式** 🎮：使用模拟钱包，无需真实区块链钱包，数据保存在本地浏览器
- **Web3 模式** ⛓️：使用真实钱包（MetaMask），数据永久保存在区块链上

## Web2 模式特点

### ✅ 优势

1. **零门槛**
   - 无需安装 MetaMask 或其他钱包
   - 无需支付 Gas 费用
   - 无需了解区块链知识

2. **完整体验**
   - 所有游戏功能都可以正常使用
   - 创建数字生命 NFT
   - 收集记忆碎片
   - 与 NPC 对话
   - 玩小游戏获得奖励
   - 探索 3D 世界

3. **即时响应**
   - 无需等待区块确认
   - 所有操作立即生效
   - 流畅的游戏体验

### ⚠️ 限制

1. **数据存储**
   - 数据保存在浏览器 localStorage 中
   - 清除浏览器数据会丢失进度
   - 无法跨设备同步

2. **资产交易**
   - 无法在市场中交易资产
   - NFT 仅存在于本地
   - 无法转移给其他玩家

3. **数据迁移**
   - 可以导出数据备份
   - 可以导入到其他浏览器
   - 暂不支持直接迁移到 Web3 模式

## 使用流程

### 1. 选择模式

首次进入游戏时，会看到模式选择界面：

```
🎮 Web2 模式          ⛓️ Web3 模式
零门槛体验            真实上链
```

点击 **"选择 Web2 模式"** 按钮。

### 2. 自动创建钱包

系统会自动为你创建一个模拟钱包：
- 生成唯一的钱包地址
- 初始余额：100 ETH（模拟）
- 所有数据保存在本地

### 3. 创建数字生命

1. 点击 **"开始游戏"** 按钮
2. 在左侧面板找到 **"🧬 数字生命"** 卡片
3. 输入你的数字生命名称
4. 点击 **"创建数字生命"** 按钮
5. 立即创建成功，无需等待

### 4. 开始游戏

创建数字生命后，你可以：

- **探索 3D 世界**：点击 "🌌 进入3D区块链实体世界"
- **与 NPC 对话**：在 "💬 AI对话" 标签页选择 NPC
- **收集碎片**：在 "💎 记忆碎片" 标签页查看收藏
- **玩小游戏**：在 "🎮 小游戏" 标签页完成挑战
- **查看进度**：在 "📊 玩家进度" 标签页追踪成就

## 数据管理

### 导出数据

1. 打开浏览器开发者工具（F12）
2. 在 Console 中输入：
```javascript
localStorage.getItem('yingzhou_mock_wallet')
```
3. 复制输出的 JSON 数据
4. 保存到文本文件中

### 导入数据

1. 打开浏览器开发者工具（F12）
2. 在 Console 中输入：
```javascript
localStorage.setItem('yingzhou_mock_wallet', '你的JSON数据')
```
3. 刷新页面

### 重置数据

如果想重新开始：

1. 点击右上角的 **"切换模式"** 按钮
2. 确认切换
3. 重新选择 Web2 模式

或者在开发者工具中：
```javascript
localStorage.removeItem('yingzhou_mock_wallet')
localStorage.removeItem('yingzhou_game_mode')
```

## 模式切换

### 从 Web2 切换到 Web3

1. 点击右上角的 **"切换模式"** 按钮
2. 确认切换（会清除当前进度）
3. 选择 Web3 模式
4. 连接 MetaMask 钱包
5. 重新开始游戏

**注意**：Web2 数据不会自动迁移到 Web3，需要手动导出/导入。

### 从 Web3 切换到 Web2

1. 点击右上角的 **"切换模式"** 按钮
2. 确认切换
3. 选择 Web2 模式
4. 系统会创建新的模拟钱包

## 技术实现

### 模拟钱包架构

```typescript
// 模拟钱包数据结构
interface MockWalletData {
  address: string              // 钱包地址
  privateKey: string           // 私钥（仅本地）
  balance: string              // ETH 余额
  nfts: Array<{               // NFT 列表
    tokenId: number
    name: string
    attributes: any
  }>
  resources: Record<number, number>  // 资源余额
  fragments: number[]                // 碎片 ID
  gameScores: Array<{...}>          // 游戏成绩
  interactions: Array<{...}>        // NPC 交互历史
}
```

### 钱包适配器模式

游戏使用统一的 `IWalletAdapter` 接口，无论是 Web2 还是 Web3 模式，游戏逻辑代码都保持一致：

```typescript
// 统一接口
interface IWalletAdapter {
  getAddress(): string
  createDigitalBeing(name: string): Promise<number>
  getFragments(): Promise<number[]>
  submitGameScore(type: number, score: number): Promise<void>
  // ... 更多方法
}

// Web2 实现
class Web2WalletAdapter implements IWalletAdapter {
  // 使用 localStorage
}

// Web3 实现
class Web3WalletAdapter implements IWalletAdapter {
  // 使用真实合约
}
```

## 常见问题

### Q: Web2 模式的数据安全吗？

A: 数据保存在你的浏览器本地存储中，只有你能访问。但请注意：
- 不要在公共电脑上使用
- 定期导出备份
- 清除浏览器数据会丢失进度

### Q: 可以同时使用两种模式吗？

A: 不可以。每次只能选择一种模式。切换模式会清除当前进度。

### Q: Web2 模式的 NFT 有价值吗？

A: Web2 模式的 NFT 仅存在于本地，没有区块链上的价值。如果想要真实的 NFT 资产，请使用 Web3 模式。

### Q: 如何将 Web2 数据迁移到 Web3？

A: 目前需要手动操作：
1. 导出 Web2 数据
2. 切换到 Web3 模式
3. 在合约中重新创建相应的资产

未来可能会提供自动迁移工具。

### Q: Web2 模式会消耗真实的 ETH 吗？

A: 不会。Web2 模式完全离线运行，不会产生任何区块链交易和费用。

## 开发者信息

### 相关文件

- `lib/mockWallet.ts` - 模拟钱包实现
- `lib/walletAdapter.ts` - 钱包适配器
- `components/ModeSelector.tsx` - 模式选择器
- `components/DigitalBeingCardWeb2.tsx` - Web2 专用组件

### 扩展功能

如果你想为 Web2 模式添加新功能：

1. 在 `MockWallet` 类中添加数据存储方法
2. 在 `IWalletAdapter` 接口中添加方法定义
3. 在 `Web2WalletAdapter` 中实现该方法
4. 在 `Web3WalletAdapter` 中实现对应的合约调用

## 反馈与支持

如果你在使用 Web2 模式时遇到问题，请：

1. 检查浏览器控制台是否有错误信息
2. 尝试清除缓存并重新加载
3. 导出数据备份后重置钱包
4. 联系开发团队获取支持

---

**享受你的瀛州之旅！** 🌌
