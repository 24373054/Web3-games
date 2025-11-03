# 部署指南

本文档详细说明如何部署《瀛州纪》项目到不同的环境。

## 📋 部署前准备

### 1. 确保已安装依赖

```bash
npm install
```

### 2. 编译智能合约

```bash
npx hardhat compile
```

确保编译成功，无错误。

## 🏠 本地开发环境部署

### 步骤 1: 启动本地区块链

在一个终端中运行：

```bash
npx hardhat node
```

这将启动一个本地以太坊节点，默认端口 8545。记下显示的测试账户和私钥。

### 步骤 2: 部署合约

在新的终端中运行：

```bash
npx hardhat run scripts/deploy.js --network localhost
```

部署成功后，你会看到类似输出：

```
部署完成！
=================================
WorldLedger: 0x5FbDB2315678afecb367f032d93F642f64180aa3
DigitalBeing: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
AINPC: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
=================================
```

### 步骤 3: 配置环境变量

创建 `.env.local` 文件并填入合约地址：

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_AINPC_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 步骤 4: 启动前端

```bash
npm run dev
```

访问 http://localhost:3000

### 步骤 5: 配置 MetaMask

1. 打开 MetaMask
2. 添加网络：
   - 网络名称: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - 链 ID: 31337
   - 货币符号: ETH
3. 导入测试账户（使用 hardhat node 输出的私钥）

## 🧪 测试网部署（以 Sepolia 为例）

### 步骤 1: 准备测试网账户

1. 确保你有一个以太坊钱包并导出私钥
2. 获取 Sepolia 测试网 ETH（从水龙头）
3. 获取 Infura 或 Alchemy 的 RPC URL

### 步骤 2: 配置 hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **警告**：永远不要将包含真实私钥的 `.env` 文件提交到 Git！

### 步骤 4: 部署到测试网

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

等待交易确认（可能需要几分钟）。

### 步骤 5: 验证合约（可选）

```bash
npx hardhat verify --network sepolia WORLD_LEDGER_ADDRESS
npx hardhat verify --network sepolia DIGITAL_BEING_ADDRESS WORLD_LEDGER_ADDRESS
npx hardhat verify --network sepolia AINPC_ADDRESS WORLD_LEDGER_ADDRESS
```

### 步骤 6: 更新前端配置

更新 `.env.local`：

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=deployed_address_here
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=deployed_address_here
NEXT_PUBLIC_AINPC_ADDRESS=deployed_address_here
```

## 🌐 前端部署（Vercel）

### 步骤 1: 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your_repo_url
git push -u origin main
```

### 步骤 2: 连接 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 导入你的 GitHub 仓库
3. 配置环境变量（在 Vercel 项目设置中添加 `.env.local` 中的所有变量）

### 步骤 3: 部署

Vercel 会自动构建和部署。

## 🔧 配置 AI 服务（可选）

### 使用魔搭 AI

1. 注册魔搭账号：https://www.modelscope.cn/
2. 获取 API Key
3. 在环境变量中配置：

```env
AI_API_KEY=your_modelscope_api_key
AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 使用其他 AI 服务

修改 `app/api/ai-chat/route.ts` 中的 API 调用逻辑。

## 📊 Gas 优化建议

1. **批量操作**：尽可能批量记录事件
2. **使用事件**：大量数据存储在事件日志而非状态变量
3. **Layer 2**：考虑部署到 L2 网络（如 Arbitrum、Optimism）降低成本

## 🐛 常见问题

### Q: MetaMask 连接失败

A: 确保：
- 已安装 MetaMask
- 已切换到正确的网络
- 有足够的 ETH 支付 Gas

### Q: 合约部署失败

A: 检查：
- Gas 价格是否足够
- 账户是否有足够的 ETH
- RPC 节点是否正常

### Q: AI 对话无响应

A: 确认：
- AI_API_KEY 是否正确配置
- 网络连接是否正常
- 检查浏览器控制台错误信息

### Q: 前端显示合约地址未配置

A: 确保：
- `.env.local` 文件存在且包含正确的地址
- 重启了开发服务器（`npm run dev`）

## 📚 后续步骤

部署完成后，你可以：

1. **测试游戏流程**：创建数字生命、与NPC对话
2. **推进世界状态**：调用 `WorldLedger.advanceState()` 改变纪元
3. **监控链上事件**：使用 ethers.js 监听合约事件
4. **扩展功能**：添加新的NPC、事件类型、叙事内容

## 🎯 生产环境检查清单

- [ ] 所有合约已在 Etherscan 上验证
- [ ] 合约所有权转移到多签钱包
- [ ] 前端环境变量已在 Vercel 配置
- [ ] AI API 限流和错误处理已实现
- [ ] 用户指南和帮助文档已完成
- [ ] 安全审计已完成（推荐）
- [ ] Gas 优化已完成
- [ ] 错误监控已配置（如 Sentry）

---

如有任何问题，请查看项目 README 或提交 Issue。

