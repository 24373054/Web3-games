# 《瀛州纪》API 参考手册

> 智能合约和前端 API 完整参考

---

## 📚 目录

- [智能合约 API](#智能合约-api)
  - [WorldLedger](#worldledger)
  - [DigitalBeing](#digitalbeing)
  - [AINPC](#ainpc)
- [前端工具 API](#前端工具-api)
  - [合约交互](#合约交互)
  - [AI 服务](#ai-服务)
- [类型定义](#类型定义)

---

## 智能合约 API

### WorldLedger

世界账本合约 - 管理整个瀛州文明的状态和历史。

#### 地址
```
Localhost: 需要部署后获取
Sepolia: 待部署
```

#### 状态变量

```solidity
// 世界当前状态
WorldState public currentState;

// 当前纪元
uint256 public currentEra;

// 事件计数器
uint256 public eventCounter;

// 创世区块
uint256 public birthBlock;

// 是否已最终化
bool public isFinalized;

// 世界管理员
address public worldGovernor;
```

#### 枚举类型

##### WorldState
```solidity
enum WorldState {
    Genesis,      // 0: 创世
    Emergence,    // 1: 萌芽
    Flourish,     // 2: 繁盛
    Entropy,      // 3: 熵化
    Collapsed     // 4: 毁灭
}
```

##### EventType
```solidity
enum EventType {
    Creation,     // 0: 创建事件
    Interaction,  // 1: 交互事件
    Discovery,    // 2: 发现事件
    Conflict,     // 3: 冲突事件
    Memory        // 4: 记忆事件
}
```

#### 主要函数

##### registerDigitalBeing

注册数字生命合约。

```solidity
function registerDigitalBeing(address being) external onlyGovernor
```

**参数**:
- `being`: 数字生命合约地址

**权限**: 仅 Governor

**事件**: `DigitalBeingRegistered`

**示例**:
```javascript
await worldLedger.registerDigitalBeing(digitalBeingAddress);
```

---

##### recordEvent

记录历史事件。

```solidity
function recordEvent(
    EventType eventType,
    bytes32 contentHash,
    string calldata metadata
) external onlyDigitalBeing notFinalized returns (uint256)
```

**参数**:
- `eventType`: 事件类型（0-4）
- `contentHash`: 内容哈希（IPFS 或其他）
- `metadata`: JSON 格式的元数据

**返回**: 事件 ID

**权限**: 仅已注册的数字生命合约

**事件**: `EventRecorded`

**示例**:
```javascript
const contentHash = ethers.keccak256(ethers.toUtf8Bytes("event content"));
const metadata = JSON.stringify({
  description: "玩家创建了新的数字生命",
  timestamp: Date.now()
});

const tx = await worldLedger.recordEvent(0, contentHash, metadata);
const receipt = await tx.wait();
```

---

##### advanceState

推进世界状态到下一个纪元。

```solidity
function advanceState(WorldState newState) external onlyGovernor notFinalized
```

**参数**:
- `newState`: 新的世界状态

**权限**: 仅 Governor

**事件**: `StateChanged`, `EraEnded`

**示例**:
```javascript
// 推进到萌芽期
await worldLedger.advanceState(1);
```

---

##### getEntropyLevel

获取当前世界的熵化程度（0-100）。

```solidity
function getEntropyLevel() external view returns (uint256)
```

**返回**: 熵化程度百分比（0-100）

**说明**:
- Genesis/Emergence: 0-20%
- Flourish: 20-40%
- Entropy: 40-80%
- Collapsed: 80-100%

**示例**:
```javascript
const entropy = await worldLedger.getEntropyLevel();
console.log(`当前熵化程度: ${entropy}%`);
```

---

##### finalizeWorld

最终化世界，标记文明结束。

```solidity
function finalizeWorld() external onlyGovernor notFinalized
```

**权限**: 仅 Governor

**效果**: 
- 设置 `isFinalized = true`
- 禁止后续事件记录
- 触发 `WorldFinalized` 事件

**示例**:
```javascript
await worldLedger.finalizeWorld();
```

---

##### getRecentEvents

获取最近的 N 个事件。

```solidity
function getRecentEvents(uint256 count) 
    external view returns (HistoricalEvent[] memory)
```

**参数**:
- `count`: 要获取的事件数量

**返回**: 事件数组

**示例**:
```javascript
const recentEvents = await worldLedger.getRecentEvents(10);
recentEvents.forEach(event => {
  console.log(`Event ${event.id}: ${event.metadata}`);
});
```

---

#### 事件

##### WorldCreated
```solidity
event WorldCreated(uint256 timestamp, uint256 blockNumber);
```

##### StateChanged
```solidity
event StateChanged(
    WorldState oldState, 
    WorldState newState, 
    uint256 timestamp
);
```

##### EventRecorded
```solidity
event EventRecorded(
    uint256 indexed eventId, 
    EventType eventType, 
    address indexed actor
);
```

##### WorldFinalized
```solidity
event WorldFinalized(uint256 timestamp, uint256 finalBlock);
```

---

### DigitalBeing

数字生命 NFT 合约 - 玩家在瀛州的链上化身。

#### 继承
```solidity
contract DigitalBeing is ERC721
```

#### 主要函数

##### createBeing

创建新的数字生命 NFT。

```solidity
function createBeing(address to) external returns (uint256)
```

**参数**:
- `to`: 接收者地址

**返回**: 新创建的 Being ID

**限制**: 每个地址只能拥有一个 Being

**事件**: ERC721 `Transfer`, `BeingCreated`

**示例**:
```javascript
const tx = await digitalBeing.createBeing(userAddress);
const receipt = await tx.wait();

// 从事件中获取 Being ID
const event = receipt.logs.find(log => 
  log.eventName === 'BeingCreated'
);
const beingId = event.args.beingId;
```

---

##### recordMemory

记录数字生命的记忆。

```solidity
function recordMemory(
    uint256 beingId,
    bytes32 memoryHash,
    string calldata memoryData
) external
```

**参数**:
- `beingId`: Being ID
- `memoryHash`: 记忆哈希
- `memoryData`: 记忆数据

**权限**: Being 所有者或授权地址

**事件**: `MemoryRecorded`

**示例**:
```javascript
const memoryHash = ethers.keccak256(
  ethers.toUtf8Bytes("与史官的第一次对话")
);
const memoryData = JSON.stringify({
  npcType: "Archivist",
  question: "告诉我瀛州的历史",
  response: "..."
});

await digitalBeing.recordMemory(beingId, memoryHash, memoryData);
```

---

##### interact

执行交互操作。

```solidity
function interact(
    uint256 beingId,
    address target,
    bytes calldata data
) external returns (bytes memory)
```

**参数**:
- `beingId`: Being ID
- `target`: 目标合约地址
- `data`: 调用数据

**返回**: 交互结果

**示例**:
```javascript
const ainpcAddress = await getContractAddress('AINPC');
const callData = ainpc.interface.encodeFunctionData('interact', [
  npcId,
  questionHash
]);

const result = await digitalBeing.interact(
  beingId,
  ainpcAddress,
  callData
);
```

---

##### reflect

查询数字生命的完整状态。

```solidity
function reflect(uint256 beingId) 
    external view returns (Being memory)
```

**参数**:
- `beingId`: Being ID

**返回**: Being 结构体

**示例**:
```javascript
const being = await digitalBeing.reflect(beingId);
console.log({
  id: being.id.toString(),
  birthTime: new Date(being.birthTime * 1000),
  memoryCount: being.memoryCount.toString(),
  interactionCount: being.interactionCount.toString()
});
```

---

##### addressToBeingId

获取地址对应的 Being ID。

```solidity
function addressToBeingId(address owner) 
    external view returns (uint256)
```

**参数**:
- `owner`: 所有者地址

**返回**: Being ID（如果不存在返回 0）

**示例**:
```javascript
const beingId = await digitalBeing.addressToBeingId(userAddress);
if (beingId > 0) {
  console.log(`用户已拥有 Being: ${beingId}`);
}
```

---

### AINPC

AI-NPC 合约 - 智能体的链上表示。

#### 主要函数

##### interact

与 NPC 交互。

```solidity
function interact(
    bytes32 npcId,
    bytes32 questionHash
) external returns (bytes32 responseRequestId)
```

**参数**:
- `npcId`: NPC ID（通过 `getNPCId(NPCType)` 获取）
- `questionHash`: 问题哈希

**返回**: 响应请求 ID

**事件**: `NPCInteraction`

**示例**:
```javascript
// 获取史官的 ID
const npcId = await ainpc.getNPCId(0); // 0 = Archivist

// 创建问题哈希
const questionHash = ethers.keccak256(
  ethers.toUtf8Bytes("告诉我瀛州的历史")
);

// 交互
const requestId = await ainpc.interact(npcId, questionHash);
```

---

##### getNPC

获取 NPC 信息。

```solidity
function getNPC(bytes32 npcId) 
    external view returns (NPC memory)
```

**参数**:
- `npcId`: NPC ID

**返回**: NPC 结构体

**示例**:
```javascript
const npcId = await ainpc.getNPCId(0);
const npc = await ainpc.getNPC(npcId);

console.log({
  name: npc.name,
  npcType: npc.npcType,
  interactionCount: npc.interactionCount.toString(),
  degradationLevel: npc.degradationLevel.toString()
});
```

---

##### getAllNPCs

获取所有 NPC 列表。

```solidity
function getAllNPCs() external view returns (NPC[] memory)
```

**返回**: NPC 数组

**示例**:
```javascript
const allNPCs = await ainpc.getAllNPCs();
allNPCs.forEach(npc => {
  console.log(`${npc.name}: ${npc.interactionCount} 次交互`);
});
```

---

##### getNPCId

通过类型获取 NPC ID。

```solidity
function getNPCId(NPCType npcType) 
    external pure returns (bytes32)
```

**参数**:
- `npcType`: NPC 类型（0-4）

**返回**: NPC ID

**示例**:
```javascript
const archivistId = await ainpc.getNPCId(0); // 史官
const architectId = await ainpc.getNPCId(1); // 工匠
const mercantileId = await ainpc.getNPCId(2); // 商序
const oracleId = await ainpc.getNPCId(3);    // 先知
const entropyId = await ainpc.getNPCId(4);   // 遗忘
```

---

## 前端工具 API

### 合约交互

#### getContract

获取合约实例。

```typescript
function getContract(
  contractName: string,
  signerOrProvider: ethers.Signer | ethers.Provider
): ethers.Contract
```

**参数**:
- `contractName`: 合约名称（'WorldLedger' | 'DigitalBeing' | 'AINPC'）
- `signerOrProvider`: Signer 或 Provider

**返回**: 合约实例

**示例**:
```typescript
import { getContract } from '@/lib/contracts';
import { ethers } from 'ethers';

// 获取 Provider
const provider = new ethers.BrowserProvider(window.ethereum);

// 获取只读合约
const worldLedger = getContract('WorldLedger', provider);
const state = await worldLedger.currentState();

// 获取可写合约
const signer = await provider.getSigner();
const worldLedgerWrite = getContract('WorldLedger', signer);
await worldLedgerWrite.recordEvent(...);
```

---

#### getContractAddress

获取合约地址。

```typescript
function getContractAddress(
  contractName: string
): string
```

**参数**:
- `contractName`: 合约名称

**返回**: 合约地址

**示例**:
```typescript
const worldLedgerAddress = getContractAddress('WorldLedger');
console.log('WorldLedger 部署在:', worldLedgerAddress);
```

---

#### waitForTransaction

等待交易确认并处理错误。

```typescript
async function waitForTransaction(
  tx: ethers.TransactionResponse
): Promise<ethers.TransactionReceipt>
```

**参数**:
- `tx`: 交易响应

**返回**: 交易收据

**抛出**: 交易失败时抛出错误

**示例**:
```typescript
try {
  const tx = await contract.someFunction();
  console.log('交易已发送:', tx.hash);
  
  const receipt = await waitForTransaction(tx);
  console.log('交易已确认:', receipt.blockNumber);
} catch (error) {
  console.error('交易失败:', error.message);
}
```

---

### AI 服务

#### generateAIResponse

生成 AI 响应。

```typescript
async function generateAIResponse(
  npcType: NPCType,
  message: string,
  context?: {
    worldState?: number;
    entropyLevel?: number;
  }
): Promise<string>
```

**参数**:
- `npcType`: NPC 类型（'Archivist' | 'Architect' | 'Mercantile' | 'Oracle' | 'Entropy'）
- `message`: 用户消息
- `context`: 可选上下文信息

**返回**: AI 生成的响应

**示例**:
```typescript
import { generateAIResponse } from '@/lib/ai';

const response = await generateAIResponse(
  'Archivist',
  '告诉我瀛州的历史',
  {
    worldState: 2, // Flourish
    entropyLevel: 30
  }
);

console.log('史官回答:', response);
```

---

#### getNPCPrompt

获取 NPC 系统提示词。

```typescript
function getNPCPrompt(
  npcType: NPCType,
  worldState: number,
  entropyLevel: number
): string
```

**参数**:
- `npcType`: NPC 类型
- `worldState`: 世界状态（0-4）
- `entropyLevel`: 熵化程度（0-100）

**返回**: 系统提示词

**示例**:
```typescript
const prompt = getNPCPrompt('Archivist', 2, 30);
console.log(prompt);
```

---

#### applyDegradation

应用衰变效果到文本。

```typescript
function applyDegradation(
  text: string,
  degradationLevel: number
): string
```

**参数**:
- `text`: 原始文本
- `degradationLevel`: 衰变程度（0-100）

**返回**: 应用衰变后的文本

**效果**:
- 0-20%: 无变化
- 20-40%: 轻微混乱（偶尔替换字符）
- 40-60%: 中度混乱（增加乱码）
- 60-80%: 严重混乱（大量乱码和断句）
- 80-100%: 完全崩溃（几乎不可读）

**示例**:
```typescript
const original = "瀛州文明从创世开始...";
const degraded = applyDegradation(original, 60);
console.log(degraded); // "瀛州文█从��世...□□..."
```

---

## 类型定义

### TypeScript 类型

#### WorldState

```typescript
enum WorldState {
  Genesis = 0,
  Emergence = 1,
  Flourish = 2,
  Entropy = 3,
  Collapsed = 4
}

// 获取状态名称
function getStateName(state: WorldState): string {
  const names = ['创世', '萌芽', '繁盛', '熵化', '毁灭'];
  return names[state];
}
```

---

#### EventType

```typescript
enum EventType {
  Creation = 0,
  Interaction = 1,
  Discovery = 2,
  Conflict = 3,
  Memory = 4
}
```

---

#### NPCType

```typescript
type NPCType = 
  | 'Archivist'   // 史官
  | 'Architect'   // 工匠
  | 'Mercantile'  // 商序
  | 'Oracle'      // 先知
  | 'Entropy';    // 遗忘

// NPC 信息
interface NPCInfo {
  type: NPCType;
  name: string;
  description: string;
  icon: string;
}

const NPC_INFO: Record<NPCType, NPCInfo> = {
  Archivist: {
    type: 'Archivist',
    name: '史官',
    description: '记录和讲述瀛州的历史',
    icon: '📜'
  },
  // ...
};
```

---

#### Being

```typescript
interface Being {
  id: bigint;
  birthTime: bigint;
  genesisHash: string;
  memoryCount: bigint;
  interactionCount: bigint;
}
```

---

#### HistoricalEvent

```typescript
interface HistoricalEvent {
  id: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  eventType: EventType;
  actor: string;
  contentHash: string;
  metadata: string;
  isSealed: boolean;
}

// 解析事件元数据
interface EventMetadata {
  description: string;
  timestamp?: number;
  [key: string]: any;
}

function parseEventMetadata(event: HistoricalEvent): EventMetadata {
  try {
    return JSON.parse(event.metadata);
  } catch {
    return { description: event.metadata };
  }
}
```

---

#### NPC (Chain)

```typescript
interface NPC {
  id: string;
  name: string;
  npcType: number;
  createdAt: bigint;
  interactionCount: bigint;
  degradationLevel: bigint;
  isActive: boolean;
}
```

---

### React 组件 Props

#### DialogueInterfaceProps

```typescript
interface DialogueInterfaceProps {
  npcType: NPCType;
  beingId?: number;
  onClose?: () => void;
}
```

#### DigitalBeingCardProps

```typescript
interface DigitalBeingCardProps {
  address: string;
  onBeingCreated?: (beingId: number) => void;
}
```

#### EventTimelineProps

```typescript
interface EventTimelineProps {
  events: HistoricalEvent[];
  onEventClick?: (event: HistoricalEvent) => void;
}
```

---

## 错误处理

### 常见错误代码

```typescript
// 用户拒绝交易
error.code === 'ACTION_REJECTED'
error.code === 4001

// 余额不足
error.code === 'INSUFFICIENT_FUNDS'

// Gas 估算失败
error.code === 'UNPREDICTABLE_GAS_LIMIT'

// 网络错误
error.code === 'NETWORK_ERROR'

// 合约 revert
error.reason // revert 原因
error.data   // 错误数据
```

### 错误处理示例

```typescript
async function safeContractCall<T>(
  contractCall: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await contractCall();
    return { success: true, data };
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      return { success: false, error: '用户取消了交易' };
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return { success: false, error: '余额不足' };
    }
    if (error.reason) {
      return { success: false, error: `合约错误: ${error.reason}` };
    }
    return { success: false, error: error.message };
  }
}

// 使用
const result = await safeContractCall(() => 
  worldLedger.recordEvent(...)
);

if (result.success) {
  console.log('成功:', result.data);
} else {
  console.error('失败:', result.error);
}
```

---

## 完整示例

### 创建数字生命并与 NPC 交互

```typescript
import { ethers } from 'ethers';
import { getContract } from '@/lib/contracts';
import { generateAIResponse } from '@/lib/ai';

async function completeFlow() {
  // 1. 连接钱包
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // 2. 获取合约
  const digitalBeing = getContract('DigitalBeing', signer);
  const ainpc = getContract('AINPC', provider);

  // 3. 创建数字生命
  console.log('创建数字生命...');
  const createTx = await digitalBeing.createBeing(address);
  const createReceipt = await createTx.wait();
  
  const beingId = createReceipt.logs
    .find((log: any) => log.eventName === 'BeingCreated')
    ?.args.beingId;
  console.log('数字生命已创建，ID:', beingId.toString());

  // 4. 获取 NPC 信息
  const npcId = await ainpc.getNPCId(0); // 史官
  const npc = await ainpc.getNPC(npcId);
  console.log('与', npc.name, '交互');

  // 5. 生成 AI 响应
  const question = "告诉我瀛州的历史";
  const worldLedger = getContract('WorldLedger', provider);
  const worldState = await worldLedger.currentState();
  const entropyLevel = await worldLedger.getEntropyLevel();

  const aiResponse = await generateAIResponse(
    'Archivist',
    question,
    { worldState: Number(worldState), entropyLevel: Number(entropyLevel) }
  );
  console.log('AI 回答:', aiResponse);

  // 6. 记录交互到链上
  const questionHash = ethers.keccak256(ethers.toUtf8Bytes(question));
  const interactTx = await ainpc.connect(signer).interact(
    npcId,
    questionHash
  );
  await interactTx.wait();
  console.log('交互已记录到链上');

  // 7. 记录记忆
  const memoryData = JSON.stringify({
    npcType: 'Archivist',
    question,
    response: aiResponse,
    timestamp: Date.now()
  });
  const memoryHash = ethers.keccak256(ethers.toUtf8Bytes(memoryData));
  
  const memoryTx = await digitalBeing.recordMemory(
    beingId,
    memoryHash,
    memoryData
  );
  await memoryTx.wait();
  console.log('记忆已保存');

  // 8. 查看最终状态
  const being = await digitalBeing.reflect(beingId);
  console.log('数字生命状态:', {
    id: being.id.toString(),
    记忆数量: being.memoryCount.toString(),
    交互次数: being.interactionCount.toString()
  });
}
```

---

## 网络配置

### 本地开发

```typescript
const LOCAL_CONFIG = {
  chainId: 31337,
  name: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
  blockExplorer: null
};
```

### Sepolia 测试网

```typescript
const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  blockExplorer: 'https://sepolia.etherscan.io'
};
```

### 以太坊主网

```typescript
const MAINNET_CONFIG = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
  blockExplorer: 'https://etherscan.io'
};
```

---

## Gas 费用参考

### 合约部署

| 合约 | Gas 消耗 | 约合 ETH (20 Gwei) |
|------|---------|-------------------|
| WorldLedger | ~2,500,000 | ~0.05 ETH |
| DigitalBeing | ~3,000,000 | ~0.06 ETH |
| AINPC | ~2,000,000 | ~0.04 ETH |

### 常用操作

| 操作 | Gas 消耗 | 约合 ETH (20 Gwei) |
|------|---------|-------------------|
| 创建 Being | ~150,000 | ~0.003 ETH |
| 记录事件 | ~80,000 | ~0.0016 ETH |
| NPC 交互 | ~60,000 | ~0.0012 ETH |
| 记录记忆 | ~70,000 | ~0.0014 ETH |
| 查询状态 | 0 (view) | 0 ETH |

---

## 相关资源

- [Ethers.js 文档](https://docs.ethers.org/v6/)
- [Solidity 文档](https://docs.soliditylang.org/)
- [OpenZeppelin 合约](https://docs.openzeppelin.com/contracts)
- [ERC-721 标准](https://eips.ethereum.org/EIPS/eip-721)

---

*最后更新：2025-10-26*  
*版本：1.0.0*

