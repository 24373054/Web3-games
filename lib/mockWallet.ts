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
  currentEpoch: number // 当前纪元 0-4
  keywordsFound: string[] // 已发现的关键词
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

// 每个NPC的关键词配置（每个NPC有独特的关键词和风格）
export const NPC_KEYWORDS: Record<string, { keywords: string[], fragmentId: number, hint: string, style: string }> = {
  historian: { 
    keywords: ['创世', '起源', '诞生', '开端'], 
    fragmentId: 10, 
    hint: '询问关于世界起源的问题...',
    style: '古老而睿智，说话缓慢而深沉，喜欢引用古老的记录'
  },
  craftsman: { 
    keywords: ['生命', '成长', '萌芽', '进化'], 
    fragmentId: 11, 
    hint: '探讨生命的意义...',
    style: '务实而热情，喜欢用工艺比喻，关注细节和过程'
  },
  merchant: { 
    keywords: ['繁荣', '文明', '辉煌', '交易'], 
    fragmentId: 12, 
    hint: '了解文明的巅峰...',
    style: '精明而健谈，喜欢讨论价值和交换，善于讲故事'
  },
  prophet: { 
    keywords: ['衰败', '熵化', '混乱', '预言'], 
    fragmentId: 13, 
    hint: '探索秩序的崩塌...',
    style: '神秘而忧郁，说话含糊不清，常常预言未来'
  },
  forgotten: { 
    keywords: ['毁灭', '终结', '重生', '轮回'], 
    fragmentId: 14, 
    hint: '面对最终的命运...',
    style: '空灵而超脱，似乎已经看透一切，说话简洁而深刻'
  }
}

// 纪元解锁需要的碎片数量
export const EPOCH_UNLOCK_REQUIREMENTS = [0, 1, 3, 6, 10] // 纪元0免费, 纪元1需1碎片, 纪元2需3碎片...

const STORAGE_KEY = 'yingzhou_mock_wallet'

export class MockWallet {
  private data: MockWalletData
  private provider: ethers.JsonRpcProvider

  constructor() {
    // 从 localStorage 加载或创建新钱包
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      this.data = JSON.parse(saved)
      // 兼容旧数据：添加缺失的字段
      if (this.data.currentEpoch === undefined) {
        this.data.currentEpoch = 0
      }
      if (!this.data.keywordsFound) {
        this.data.keywordsFound = []
      }
      this.save()
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
        currentEpoch: 0,
        keywordsFound: [],
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

  // 获取当前纪元
  getCurrentEpoch(): number {
    return this.data.currentEpoch || 0
  }

  // 尝试解锁下一个纪元
  tryUnlockNextEpoch(): { success: boolean, message: string } {
    const currentEpoch = this.getCurrentEpoch()
    if (currentEpoch >= 4) {
      return { success: false, message: '已经是最后一个纪元了' }
    }
    
    const nextEpoch = currentEpoch + 1
    const required = EPOCH_UNLOCK_REQUIREMENTS[nextEpoch]
    const currentFragments = this.data.fragments.length
    
    if (currentFragments >= required) {
      this.data.currentEpoch = nextEpoch
      this.save()
      return { success: true, message: `成功进入${['创世', '萌芽', '繁盛', '熵化', '毁灭'][nextEpoch]}纪元！` }
    }
    
    return { success: false, message: `需要${required}个碎片才能解锁下一纪元（当前${currentFragments}个）` }
  }

  // 检查关键词并奖励碎片（基于NPC）
  checkKeywordAndReward(message: string, npcId?: string): { found: boolean, keyword?: string, fragmentId?: number } {
    // 如果指定了NPC，使用NPC的关键词配置
    if (npcId && NPC_KEYWORDS[npcId]) {
      const npcConfig = NPC_KEYWORDS[npcId]
      for (const keyword of npcConfig.keywords) {
        if (message.includes(keyword) && !this.data.keywordsFound.includes(keyword)) {
          this.data.keywordsFound.push(keyword)
          if (!this.data.fragments.includes(npcConfig.fragmentId)) {
            this.data.fragments.push(npcConfig.fragmentId)
          }
          this.save()
          return { found: true, keyword, fragmentId: npcConfig.fragmentId }
        }
      }
    }
    return { found: false }
  }

  // 获取NPC的关键词提示
  getKeywordHint(npcId?: string): string {
    if (npcId && NPC_KEYWORDS[npcId]) {
      return NPC_KEYWORDS[npcId].hint
    }
    return '与智能体对话，发现隐藏的秘密...'
  }

  // 获取NPC的风格
  getNpcStyle(npcId: string): string {
    return NPC_KEYWORDS[npcId]?.style || ''
  }

  // 获取已发现的关键词
  getFoundKeywords(): string[] {
    return this.data.keywordsFound || []
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
      currentEpoch: 0,
      keywordsFound: [],
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
    // 触发自定义事件通知其他组件数据已更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mockWalletUpdate', { detail: this.data }))
    }
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
