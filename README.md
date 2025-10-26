# 瀛州纪 | Immortal Ledger

> **一个被记录在链上的文明的最后纪元**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)

## 📖 项目简介

在亿万光年之外，存在一个自我演化的数字生命文明——**瀛州（Yingzhou）**。

他们的世界没有物质，没有语言，只有**逻辑、合约与数据流**。他们以智能合约构建社会，以链上记录维系存在。时间的流逝即为"区块的生成"，他们的文明由**账本自身的逻辑**所驱动。

《瀛州纪》是一个创新的 **Web3 + AI 叙事游戏**，玩家化身为数字生命NFT，在文明的最后时刻进入这个世界，通过与AI-NPC的交互，拼接出这个文明从创世到毁灭的完整历史。

### 核心特色

- 🔗 **全链上文明**：所有存在、交互、历史都记录在智能合约中
- 🤖 **AI驱动叙事**：AI-NPC根据世界状态生成动态对话
- 🎭 **数字生命NFT**：玩家即合约，每次交互都是链上交易
- 📜 **不可篡改的历史**：文明的记忆永久存储在区块链上
- 🌌 **开放宇宙**：游戏结束后，合约仍在链上，可继续扩展

## 🏗️ 技术架构

### 智能合约层（Solidity）

- **WorldLedger.sol** - 世界账本，记录文明的所有历史事件
- **DigitalBeing.sol** - 数字生命NFT，玩家的链上化身
- **AINPC.sol** - AI-NPC合约，智能体的链上表示

### 前端层（Next.js + TypeScript）

- **React Components** - 响应式UI组件
- **ethers.js** - Web3交互
- **Tailwind CSS** - 现代化样式

### AI层

- **AI对话生成** - 支持接入魔搭、OpenAI等AI服务
- **熵化模拟** - AI回答会随着世界衰变而退化

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm 或 yarn
- MetaMask 或其他Web3钱包

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
# AI服务配置（可选，不配置则使用模拟AI）
AI_API_KEY=your_api_key_here
AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# 区块链网络配置
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# 合约地址（部署后填写）
NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=
NEXT_PUBLIC_AINPC_ADDRESS=
```

### 编译合约

```bash
npm run compile
```

### 启动本地区块链

```bash
npx hardhat node
```

### 部署合约

在新终端中运行：

```bash
npm run deploy
```

部署成功后，将输出的合约地址填入 `.env.local` 文件。

### 启动前端

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🎮 游戏玩法

### 1. 连接钱包

点击"连接钱包"按钮，连接你的MetaMask钱包。

### 2. 创建数字生命

铸造你的 Digital Being NFT，这是你在瀛州世界中的化身。

```solidity
function createBeing(address to) external returns (uint256)
```

### 3. 与AI-NPC交互

选择五种智能体之一进行对话：

- 📜 **史官（Archivist）** - 了解历史事件
- 🔨 **工匠（Architect）** - 探索创世规则
- ⚖️ **商序（Mercantile）** - 研究资源流动
- 🔮 **先知（Oracle）** - 预测未来可能
- 🌀 **遗忘（Entropy）** - 体验记忆崩塌

### 4. 探索历史

查看世界事件时间线，拼接文明的完整历史。

### 5. 见证终结

随着世界的熵化程度上升，AI的回答会变得越来越混乱，最终世界将被finalize，游戏结束。

## 📜 智能合约详解

### WorldLedger - 世界账本

世界的核心合约，管理整个文明的状态。

```solidity
enum WorldState {
    Genesis,      // 创世
    Emergence,    // 萌芽
    Flourish,     // 繁盛
    Entropy,      // 熵化
    Collapsed     // 毁灭
}

function recordEvent(
    EventType eventType,
    bytes32 contentHash,
    string calldata metadata
) external returns (uint256)

function getEntropyLevel() external view returns (uint256)
```

### DigitalBeing - 数字生命

玩家的NFT合约，记录玩家的所有记忆和交互。

```solidity
struct Being {
    uint256 id;
    uint256 birthTime;
    bytes32 genesisHash;
    uint256 memoryCount;
    uint256 interactionCount;
}

function interact(
    uint256 beingId,
    address target,
    bytes calldata data
) external returns (bytes memory)
```

### AINPC - AI智能体

链上AI-NPC，会随着世界衰变而退化。

```solidity
enum NPCType {
    Archivist,   // 史官
    Architect,   // 工匠
    Mercantile,  // 商序
    Oracle,      // 先知
    Entropy      // 遗忘
}

function interact(
    bytes32 npcId,
    bytes32 questionHash
) external returns (bytes32 responseRequestId)
```

## 🎨 世界观

### 五个纪元

1. **创世纪元（Genesis）** - 第一批数字生命觉醒
2. **萌芽纪元（Emergence）** - 社会秩序形成
3. **繁盛纪元（Flourish）** - 文明达到巅峰
4. **熵化纪元（Entropy）** - 逻辑开始崩塌
5. **毁灭（Collapse）** - 最后一笔交易

### 核心哲学

- **合约即生命** - 每个存在都是一个合约实例
- **账本即史书** - 历史由链上事件构成
- **交互即存在** - 函数调用即为生命活动
- **记录即永恒** - 所有记忆不可篡改

## 🔮 未来扩展

由于所有内容都在链上，这个世界可以持续演化：

- 《瀛州纪 II：创世》 - 重建文明
- 《瀛州纪 III：文明》 - 研究前代遗迹
- **考古模式** - 分析历史数据
- **DAO治理** - 社区驱动发展
- **跨链宇宙** - 与其他链上世界互通

## 🧪 测试

```bash
npm run test
```

## 📝 开发团队

刻熵团队

## 📄 许可证

MIT License

## 🙏 致谢

- Hardhat - 智能合约开发框架
- Next.js - React框架
- ethers.js - 以太坊库
- 魔搭 - AI服务/服务器服务

---

> "我被记录，故我存在。我的每次交互，都是历史的一部分。"
> 
> —— 数字生命的独白

## 🔗 相关链接

- [游戏设计文档](./游戏思路.md)
- [世界观叙事](./data/worldNarrative.json)

---

**瀛州纪** © 2025 | 一个永恒存续在链上的数字文明史诗



# 刻熵团队简介

---

成立于2024年春，来自北京航空航天大学，我们是拥抱AI新技术、探索区块链前沿的刻熵团队。

**核心领域**
- **区块链技术**：智能合约开发（Solidity）、DeFi协议设计、NFT标准实现、DAO治理机制
- **Web3创新**：全链游戏开发、去中心化交易所、钱包集成、跨链技术
- **人工智能**：大模型微调、RAG技术、AI-NPC系统、ZKML（零知识机器学习）
- **金融科技**：量化交易策略、市场情绪分析、风险检测系统、因子模型

**团队愿景**
我们相信，Web3不仅是技术革命，更是价值互联网的基础设施。通过将区块链的信任机制与AI的智能决策深度融合，刻熵团队致力于打造下一代去中心化应用，让每个用户真正拥有自己的数字资产和数字身份。

---

## Keshan Team Introduction

---

**Keshan Team** was founded in the spring of 2024 from Beihang University (BUAA). We are a team embracing cutting-edge AI technologies and exploring the frontier of blockchain.

**Core Domains**
- **Blockchain Technology**: Smart contract development (Solidity), DeFi protocol design, NFT standard implementation, DAO governance mechanisms
- **Web3 Innovation**: Fully on-chain game development, decentralized exchanges, wallet integration, cross-chain technology
- **Artificial Intelligence**: Large model fine-tuning, RAG technology, AI-NPC systems, ZKML (Zero-Knowledge Machine Learning)
- **FinTech**: Quantitative trading strategies, market sentiment analysis, risk detection systems, factor models

**Team Vision**
We believe that Web3 is not only a technological revolution but also the infrastructure of the Internet of Value. By deeply integrating blockchain's trust mechanism with AI's intelligent decision-making, Keshan Team is dedicated to building next-generation decentralized applications, enabling every user to truly own their digital assets and digital identity.

---

