<div align="center">

<img src="图片/瀛州纪官网、README效果图片1.jpg" alt="Yingzhou Banner" width="100%">

<h1>Yingzhou | Immortal Ledger</h1>

<p><i>The Last Chronicle of an On-Chain Civilization</i></p>

[![GitHub Stars](https://img.shields.io/github/stars/24373054/Web3-games?style=flat-square&logo=github)](https://github.com/24373054/Web3-games/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/24373054/Web3-games?style=flat-square&logo=github)](https://github.com/24373054/Web3-games/network)
[![GitHub Issues](https://img.shields.io/github/issues/24373054/Web3-games?style=flat-square&logo=github)](https://github.com/24373054/Web3-games/issues)
[![GitHub License](https://img.shields.io/github/license/24373054/Web3-games?style=flat-square)](https://github.com/24373054/Web3-games/blob/main/LICENSE)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-FFF04D?style=flat-square&logo=hardhat&logoColor=black)](https://hardhat.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.9-2535A0?style=flat-square)](https://docs.ethers.org/)

<a href="https://github.com/24373054/Web3-games">
  <img src="图片/刻熵_DAOSHOT.png" alt="DAOSHOT" width="200">
</a>

[English](./README-EN.md) | [中文文档](./README.md) | [Dev Manual](./开发手册.md) | [Quick Start](./快速开始指南.md)

</div>

---

## 📖 Introduction

In the depths of space, billions of light-years away, exists a self-evolving digital civilization—**Yingzhou**.

Their world has no matter, no language—only **logic, smart contracts, and data flows**. They build society through smart contracts and maintain existence through on-chain records. The passage of time equals "block generation," and their civilization is driven by **the logic of the ledger itself**.

**Yingzhou | Immortal Ledger** is an innovative **Web3 + AI narrative game** where players become Digital Being NFTs and enter this world at its final moment. Through interactions with AI-NPCs, they piece together the complete history of this civilization from genesis to destruction.

### Core Features

- 🔗 **Fully On-Chain Civilization**: All existence, interactions, and history recorded in smart contracts
- 🤖 **AI-Driven Narrative**: AI-NPCs generate dynamic dialogues based on world state
- 🎭 **Digital Being NFTs**: Players are contracts; every interaction is an on-chain transaction
- 📜 **Immutable History**: Civilization's memory permanently stored on blockchain
- 🌌 **Open Universe**: After game ends, contracts remain on-chain for continuous expansion

---

## 🏗️ Tech Stack

<div align="center">

### Blockchain Layer
![Solidity](https://img.shields.io/badge/-Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/-Hardhat-FFF04D?style=for-the-badge&logo=hardhat&logoColor=black)
![Ethers.js](https://img.shields.io/badge/-Ethers.js-2535A0?style=for-the-badge)
![OpenZeppelin](https://img.shields.io/badge/-OpenZeppelin-4E5EE4?style=for-the-badge&logo=openzeppelin&logoColor=white)

### Frontend Layer
![Next.js](https://img.shields.io/badge/-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### AI Layer
![AI](https://img.shields.io/badge/-AI_Integration-FF6B6B?style=for-the-badge&logo=openai&logoColor=white)
![ModelScope](https://img.shields.io/badge/-ModelScope-5B21B6?style=for-the-badge)

</div>

---

## 🚀 Quick Start

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: 2.30.0 or higher
- **Browser**: Latest Chrome/Edge with MetaMask

### Installation

#### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/Web3-games.git
cd 瀛州纪

# Create conda environment
conda create -n yingzhou python=3.11
conda activate yingzhou

# Install dependencies
npm install
```

#### 2. Environment Configuration

Create `.env.local`:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Contract Addresses (fill after deployment)
NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=
NEXT_PUBLIC_AINPC_ADDRESS=

# AI Service (Optional)
AI_API_KEY=your_api_key_here
AI_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

#### 3. Compile & Deploy

```bash
# Compile contracts
npm run compile

# Start local blockchain (Terminal 1)
npx hardhat node

# Deploy contracts (Terminal 2)
npm run deploy

# Update contract addresses in .env.local
```

#### 4. Start Frontend

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🎮 Gameplay

<div align="center">

### 📱 Three Simple Steps to Enter Yingzhou

</div>

<table>
<tr>
<td width="33%" align="center">

### 1️⃣ Connect Wallet
Click "Connect Wallet"  
Connect your MetaMask

</td>
<td width="33%" align="center">

### 2️⃣ Create Digital Being
Mint your Digital Being NFT  
Your on-chain avatar

</td>
<td width="33%" align="center">

### 3️⃣ Start Exploring
Talk to AI-NPCs  
Discover civilization history

</td>
</tr>
</table>

---

<div align="center">

### 🎭 Five AI-NPC Types

</div>

<table>
<tr>
<td width="20%" align="center">

📜  
**Archivist**

Learn historical events

</td>
<td width="20%" align="center">

🔨  
**Architect**

Explore genesis rules

</td>
<td width="20%" align="center">

⚖️  
**Mercantile**

Study resource flows

</td>
<td width="20%" align="center">

🔮  
**Oracle**

Predict future possibilities

</td>
<td width="20%" align="center">

🌀  
**Entropy**

Experience memory collapse

</td>
</tr>
</table>

---

<div align="center">

### 🌊 Five Epochs of Civilization

```mermaid
graph LR
    A[Genesis] --> B[Emergence]
    B --> C[Flourish]
    C --> D[Entropy]
    D --> E[Collapse]
    
    style A fill:#06b6d4
    style B fill:#8b5cf6
    style C fill:#f59e0b
    style D fill:#ef4444
    style E fill:#1f2937
```

</div>

---

## 📚 Documentation

- 📖 [Development Manual](./开发手册.md) - Complete development guide
- 🚀 [Quick Start Guide](./快速开始指南.md) - 5-minute setup
- 🤝 [Team Collaboration](./团队协作指南.md) - Workflow and standards
- 📝 [API Reference](./API参考手册.md) - Complete API documentation
- 💡 [Development Scenarios](./开发场景指南.md) - Practical examples
- 🎨 [Game Design](./游戏思路.md) - Design philosophy

---

## 🌟 Key Features

<div align="center">

| 🔗 On-Chain Civilization | 🤖 AI-Driven Narrative | 🎭 Digital Being NFT | 📜 Immutable History |
|:---:|:---:|:---:|:---:|
| Everything recorded on-chain | Dynamic dialogue generation | Players are contract instances | Permanently stored on blockchain |

</div>

---

## 📊 Project Statistics

<div align="center">

### Star History

<a href="https://star-history.com/#24373054/Web3-games&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=24373054/Web3-games&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=24373054/Web3-games&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=24373054/Web3-games&type=Date" />
  </picture>
</a>

### Activity

![Alt](https://repobeats.axiom.co/api/embed/2567d8fabfa6cda5392974c94502d913effb348a.svg "Repobeats analytics image")

</div>

---

## 👥 Contributors

<div align="center">

Thanks to all the amazing developers!

[![Contributors](https://contrib.rocks/image?repo=24373054/Web3-games)](https://github.com/24373054/Web3-games/graphs/contributors)

Want to contribute? Check out our [Contributing Guide](./CONTRIBUTING.md)

</div>

---

## 🙏 Acknowledgments

<div align="center">

Special thanks to these amazing projects:

| Project | Purpose | Link |
|:---:|:---:|:---:|
| 🔨 Hardhat | Smart contract development | [hardhat.org](https://hardhat.org/) |
| ⚛️ Next.js | React framework | [nextjs.org](https://nextjs.org/) |
| 📚 ethers.js | Ethereum library | [docs.ethers.org](https://docs.ethers.org/) |
| 🔐 OpenZeppelin | Secure contracts | [openzeppelin.com](https://openzeppelin.com/) |
| 🤖 ModelScope/OpenAI | AI services | [modelscope.cn](https://modelscope.cn/) |

</div>

---

<div align="center">

## 💬 Quote

> *"I am recorded, therefore I exist."*  
> *"Each of my interactions is part of history."*  
> *"When the world falls silent, the ledger remains eternal."*  
> 
> —— Monologue of a Digital Being

---

## 🔗 Links

📖 [Game Design](./游戏思路.md) · 🌌 [World Narrative](./data/worldNarrative.json) · 📚 [Dev Manual](./开发手册.md) · 🚀 [Quick Start](./快速开始指南.md)

---

<img src="图片/刻熵_DAOSHOT.png" alt="DAOSHOT Logo" width="150">

**Yingzhou | Immortal Ledger** © 2025

*A Digital Civilization Epic Forever Preserved On-Chain*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Made with ❤️ by KeShang Team

</div>

