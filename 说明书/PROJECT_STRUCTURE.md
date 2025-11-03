# 项目结构说明

《瀛州纪》项目的完整文件结构和说明。

## 📁 目录结构

```
瀛州纪/
├── contracts/                  # 智能合约
│   ├── WorldLedger.sol        # 世界账本合约
│   ├── DigitalBeing.sol       # 数字生命NFT合约
│   └── AINPC.sol              # AI-NPC合约
│
├── scripts/                    # 部署和工具脚本
│   └── deploy.js              # 合约部署脚本
│
├── test/                       # 测试文件
│   ├── WorldLedger.test.js    # 世界账本测试
│   └── DigitalBeing.test.js   # 数字生命测试
│
├── app/                        # Next.js 应用
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 主页面
│   ├── globals.css            # 全局样式
│   └── api/                   # API路由
│       └── ai-chat/           # AI对话API
│           └── route.ts
│
├── components/                 # React组件
│   ├── WorldStatus.tsx        # 世界状态组件
│   ├── DigitalBeingCard.tsx   # 数字生命卡片
│   ├── NPCList.tsx            # NPC列表
│   ├── DialogueInterface.tsx  # 对话界面
│   └── EventTimeline.tsx      # 事件时间线
│
├── lib/                        # 工具库
│   ├── contracts.ts           # 合约交互工具
│   └── ai.ts                  # AI服务
│
├── data/                       # 数据文件
│   └── worldNarrative.json    # 世界观叙事内容
│
├── public/                     # 静态资源
│   └── favicon.svg            # 网站图标
│
├── hardhat.config.js          # Hardhat配置
├── next.config.js             # Next.js配置
├── tsconfig.json              # TypeScript配置
├── tailwind.config.js         # Tailwind CSS配置
├── postcss.config.js          # PostCSS配置
├── package.json               # 项目依赖
│
├── README.md                  # 项目说明
├── DEPLOYMENT.md              # 部署指南
├── CONTRIBUTING.md            # 贡献指南
├── PROJECT_STRUCTURE.md       # 本文件
└── 游戏思路.md                # 原始设计文档
```

## 🔑 核心文件说明

### 智能合约层

#### `contracts/WorldLedger.sol`
- **功能**：世界账本，管理整个文明的状态
- **主要方法**：
  - `registerDigitalBeing()` - 注册数字生命
  - `recordEvent()` - 记录历史事件
  - `advanceState()` - 推进世界状态
  - `finalizeWorld()` - 最终化世界
  - `getEntropyLevel()` - 获取熵化程度

#### `contracts/DigitalBeing.sol`
- **功能**：数字生命NFT，玩家在瀛州的化身
- **主要方法**：
  - `createBeing()` - 创建数字生命
  - `recordMemory()` - 记录记忆
  - `interact()` - 执行交互
  - `reflect()` - 查询状态

#### `contracts/AINPC.sol`
- **功能**：AI-NPC合约，智能体的链上表示
- **主要方法**：
  - `interact()` - 与NPC交互
  - `getNPC()` - 获取NPC信息
  - `getAllNPCs()` - 获取所有NPC

### 前端层

#### `app/page.tsx`
- **功能**：主页面，游戏的入口
- **包含**：
  - 钱包连接
  - 欢迎界面
  - 游戏主界面布局

#### `components/WorldStatus.tsx`
- **功能**：显示世界当前状态
- **数据**：
  - 当前纪元
  - 世界年龄
  - 熵化程度
  - 最终化状态

#### `components/DigitalBeingCard.tsx`
- **功能**：管理玩家的数字生命
- **操作**：
  - 创建数字生命
  - 查看状态
  - 显示记忆和交互数据

#### `components/NPCList.tsx`
- **功能**：展示所有AI-NPC
- **特性**：
  - 5种NPC类型
  - 显示衰变程度
  - 交互次数统计

#### `components/DialogueInterface.tsx`
- **功能**：与AI-NPC对话
- **特性**：
  - 实时对话
  - AI响应生成
  - 链上交互记录

#### `components/EventTimeline.tsx`
- **功能**：显示历史事件时间线
- **数据**：
  - 事件列表
  - 区块信息
  - 元数据展示

### 工具库

#### `lib/contracts.ts`
- **功能**：封装合约交互
- **内容**：
  - 合约ABI
  - 地址配置
  - 工具函数
  - 类型定义

#### `lib/ai.ts`
- **功能**：AI对话生成
- **特性**：
  - NPC系统提示
  - 衰变模拟
  - API集成
  - 降级处理

### 配置文件

#### `hardhat.config.js`
- Hardhat开发环境配置
- 网络设置
- 编译器版本

#### `next.config.js`
- Next.js框架配置
- Webpack设置

#### `tailwind.config.js`
- Tailwind CSS配置
- 自定义主题
- 动画效果

## 🎯 数据流

```
用户操作 → 前端组件 → lib/contracts.ts → 智能合约
                ↓
            AI服务 ← lib/ai.ts ← DialogueInterface
                ↓
           链上记录 → WorldLedger
                ↓
           事件日志 → EventTimeline显示
```

## 🔄 交互流程

1. **用户连接钱包** → 获取账户地址
2. **创建数字生命** → 调用 `DigitalBeing.createBeing()`
3. **选择NPC** → 加载NPC信息
4. **发起对话** → 
   - 调用 `AINPC.interact()`
   - 生成AI响应
   - 记录到 `WorldLedger`
5. **查看历史** → 读取链上事件

## 📊 状态管理

- **链上状态**：存储在智能合约中
- **前端状态**：React Hooks管理
- **缓存策略**：定时刷新 + 事件监听

## 🔐 安全考虑

- 合约使用 `onlyGovernor`、`onlyDigitalBeing` 等修饰符
- 前端验证用户权限
- AI API密钥存储在环境变量
- 敏感操作需要钱包签名

## 🚀 扩展点

1. **新增NPC类型**：修改 `AINPC.sol` 和相关前端组件
2. **新增事件类型**：扩展 `EventType` 枚举
3. **自定义AI提示**：修改 `lib/ai.ts` 中的系统提示
4. **新增纪元**：扩展 `WorldState` 枚举
5. **DAO治理**：添加投票和提案合约

## 📝 代码约定

- **Solidity**：遵循 Solidity Style Guide
- **TypeScript**：使用严格类型检查
- **React**：函数式组件 + Hooks
- **命名**：
  - 合约：PascalCase
  - 函数：camelCase
  - 组件：PascalCase
  - 文件：kebab-case（合约除外）

## 🧪 测试

- **单元测试**：`test/*.test.js`
- **运行测试**：`npm test`
- **覆盖率**：建议 > 80%

## 📚 文档

- `README.md` - 项目概述和快速开始
- `DEPLOYMENT.md` - 详细部署指南
- `CONTRIBUTING.md` - 贡献指南
- `PROJECT_STRUCTURE.md` - 本文档
- `游戏思路.md` - 原始设计思路

---

这个结构设计支持模块化开发和未来扩展。

