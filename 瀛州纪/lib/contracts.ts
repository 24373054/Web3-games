import { ethers } from 'ethers'

// 导入 ABI
const WorldLedgerABI = require('./abis/WorldLedger.json')
const DigitalBeingABI = require('./abis/DigitalBeing.json')
const AINPCABI = require('./abis/AINPC.json')
const Resource1155ABI = require('./abis/Resource1155.json')
const MarketABI = require('./abis/Market.json')

// 获取合约地址（从环境变量）
export const getContractAddresses = () => {
  return {
    worldLedger: process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS || '',
    digitalBeing: process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS || '',
    ainpc: process.env.NEXT_PUBLIC_AINPC_ADDRESS || '',
    resource1155: process.env.NEXT_PUBLIC_RESOURCE1155_ADDRESS || '',
    market: process.env.NEXT_PUBLIC_MARKET_ADDRESS || ''
  }
}

// 检查地址是否有效
function validateAddress(address: string, contractName: string): string {
  if (!address || address === '') {
    throw new Error(
      `${contractName} 地址未配置！\n` +
      `请确保：\n` +
      `1. 已创建 .env.local 文件\n` +
      `2. 已部署合约并填入地址\n` +
      `3. 已重启开发服务器 (npm run dev)\n\n` +
      `参考 快速开始指南.md 获取详细步骤`
    )
  }
  if (!ethers.isAddress(address)) {
    throw new Error(`${contractName} 地址格式无效: ${address}`)
  }
  return address
}

// 获取合约实例
export function getWorldLedgerContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.worldLedger, 'WorldLedger')
  return new ethers.Contract(validAddress, WorldLedgerABI, signerOrProvider)
}

export function getDigitalBeingContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.digitalBeing, 'DigitalBeing')
  return new ethers.Contract(validAddress, DigitalBeingABI, signerOrProvider)
}

export function getAINPCContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.ainpc, 'AINPC')
  return new ethers.Contract(validAddress, AINPCABI, signerOrProvider)
}

export function getResource1155Contract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.resource1155, 'Resource1155')
  return new ethers.Contract(validAddress, Resource1155ABI, signerOrProvider)
}

export function getMarketContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.market, 'Market')
  return new ethers.Contract(validAddress, MarketABI, signerOrProvider)
}

// 事件类型枚举
export enum EventType {
  Creation = 0,
  Interaction = 1,
  Discovery = 2,
  Conflict = 3,
  Memory = 4
}

// NPC类型枚举
export enum NPCType {
  Archivist = 0,
  Architect = 1,
  Mercantile = 2,
  Oracle = 3,
  Entropy = 4
}

// 世界状态枚举
export enum WorldState {
  Genesis = 0,
  Emergence = 1,
  Flourish = 2,
  Entropy = 3,
  Collapsed = 4
}

