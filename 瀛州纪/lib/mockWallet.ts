/**
 * 模拟钱包系统 - 用于 Web2 模式
 * 提供与真实钱包相同的接口，但数据存储在本地
 */

import { ethers } from 'ethers'

export interface MockWalletData {
  address: string
  privateKey: string
  balance: string
  nfts: Array<{
    tokenId: number
    name: string
    attributes: any
  }>
  resources: Record<number, number> // resourceId => amount
  fragments: number[] // fragmentIds
  gameScores: Array<{
    gameType: number
    score: number
    completion: number
    timestamp: number
  }>
  interactions: Array<{
    npcId: string
    message: string
    response: string
    timestamp: number
  }>
}

const STORAGE_KEY = 'yingzhou_mock_wallet'

export class MockWallet {
  private data: MockWalletData
  private provider: ethers.JsonRpcProvider

  constructor() {
    // 从 localStorage 加载或创建新钱包
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      this.data = JSON.parse(saved)
    } else {
      // 创建新的模拟钱包
      const wallet = ethers.Wallet.createRandom()
      this.data = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: '100.0', // 初始余额 100 ETH
        nfts: [],
        resources: {},
        fragments: [],
        gameScores: [],
        interactions: []
      }
      this.save()
    }

    // 创建模拟 provider
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545')
  }

  getAddress(): string {
    return this.data.address
  }

  getBalance(): string {
    return this.data.balance
  }

  async getBalanceWei(): Promise<bigint> {
    return ethers.parseEther(this.data.balance)
  }

  // 创建数字生命 NFT
  async createDigitalBeing(name: string, attributes: any): Promise<number> {
    const tokenId = this.data.nfts.length
    this.data.nfts.push({
      tokenId,
      name,
      attributes
    })
    this.save()
    return tokenId
  }

  // 获取数字生命信息
  getDigitalBeing(tokenId: number): any {
    return this.data.nfts.find(nft => nft.tokenId === tokenId)
  }

  // 获取所有 NFT
  getAllNFTs(): any[] {
    return this.data.nfts
  }

  // 添加资源
  addResource(resourceId: number, amount: number): void {
    if (!this.data.resources[resourceId]) {
      this.data.resources[resourceId] = 0
    }
    this.data.resources[resourceId] += amount
    this.save()
  }

  // 获取资源余额
  getResourceBalance(resourceId: number): number {
    return this.data.resources[resourceId] || 0
  }

  // 使用资源
  useResource(resourceId: number, amount: number): boolean {
    const current = this.getResourceBalance(resourceId)
    if (current < amount) {
      return false
    }
    this.data.resources[resourceId] = current - amount
    this.save()
    return true
  }

  // 添加记忆碎片
  addFragment(fragmentId: number): void {
    if (!this.data.fragments.includes(fragmentId)) {
      this.data.fragments.push(fragmentId)
      this.save()
    }
  }

  // 获取所有碎片
  getFragments(): number[] {
    return this.data.fragments
  }

  // 检查是否拥有碎片
  hasFragment(fragmentId: number): boolean {
    return this.data.fragments.includes(fragmentId)
  }

  // 提交游戏成绩
  async submitGameScore(gameType: number, score: number, completion: number): Promise<void> {
    this.data.gameScores.push({
      gameType,
      score,
      completion,
      timestamp: Date.now()
    })

    // 根据完成度奖励碎片
    if (completion >= 60 && !this.hasFragment(gameType)) {
      this.addFragment(gameType)
    }

    this.save()
  }

  // 获取游戏成绩
  getGameScores(gameType?: number): any[] {
    if (gameType !== undefined) {
      return this.data.gameScores.filter(s => s.gameType === gameType)
    }
    return this.data.gameScores
  }

  // 记录 NPC 交互
  async interactWithNPC(npcId: string, message: string, response: string): Promise<void> {
    this.data.interactions.push({
      npcId,
      message,
      response,
      timestamp: Date.now()
    })
    this.save()
  }

  // 获取交互历史
  getInteractions(npcId?: string): any[] {
    if (npcId) {
      return this.data.interactions.filter(i => i.npcId === npcId)
    }
    return this.data.interactions
  }

  // 重置钱包（清除所有数据）
  reset(): void {
    localStorage.removeItem(STORAGE_KEY)
    const wallet = ethers.Wallet.createRandom()
    this.data = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      balance: '100.0',
      nfts: [],
      resources: {},
      fragments: [],
      gameScores: [],
      interactions: []
    }
    this.save()
  }

  // 导出钱包数据
  export(): string {
    return JSON.stringify(this.data, null, 2)
  }

  // 导入钱包数据
  import(jsonData: string): void {
    try {
      const imported = JSON.parse(jsonData)
      this.data = imported
      this.save()
    } catch (error) {
      throw new Error('导入失败：数据格式无效')
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
  }
}

// 单例模式
let mockWalletInstance: MockWallet | null = null

export function getMockWallet(): MockWallet {
  if (!mockWalletInstance) {
    mockWalletInstance = new MockWallet()
  }
  return mockWalletInstance
}
