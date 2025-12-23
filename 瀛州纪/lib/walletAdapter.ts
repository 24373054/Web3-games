/**
 * 钱包适配器 - 统一 Web2 和 Web3 钱包接口
 * 让游戏逻辑无需关心使用的是哪种钱包
 */

import { ethers } from 'ethers'
import { MockWallet, getMockWallet } from './mockWallet'

export type WalletMode = 'web2' | 'web3'

export interface IWalletAdapter {
  mode: WalletMode
  getAddress(): string
  getProvider(): ethers.BrowserProvider | ethers.JsonRpcProvider
  getSigner(): Promise<ethers.Signer>
  
  // Digital Being 相关
  createDigitalBeing(name: string, attributes: any): Promise<number>
  getDigitalBeing(tokenId: number): Promise<any>
  
  // 资源相关
  getResourceBalance(resourceId: number): Promise<number>
  addResource(resourceId: number, amount: number): Promise<void>
  useResource(resourceId: number, amount: number): Promise<boolean>
  
  // 碎片相关
  getFragments(): Promise<number[]>
  hasFragment(fragmentId: number): Promise<boolean>
  addFragment(fragmentId: number): Promise<void>
  
  // 游戏相关
  submitGameScore(gameType: number, score: number, completion: number): Promise<void>
  getGameScores(gameType?: number): Promise<any[]>
  
  // NPC 交互
  interactWithNPC(npcId: string, message: string, response: string): Promise<void>
  getInteractions(npcId?: string): Promise<any[]>
  
  // 获取所有 NFT（可选，仅 Web2 模式）
  getAllNFTs?(): Promise<any[]>
}

/**
 * Web2 模式适配器 - 使用模拟钱包
 */
export class Web2WalletAdapter implements IWalletAdapter {
  mode: WalletMode = 'web2'
  private mockWallet: MockWallet
  private provider: ethers.JsonRpcProvider

  constructor() {
    this.mockWallet = getMockWallet()
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545')
  }

  getAddress(): string {
    return this.mockWallet.getAddress()
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider
  }

  async getSigner(): Promise<ethers.Signer> {
    // 返回一个模拟的 signer
    return new ethers.Wallet(
      '0x' + '1'.repeat(64), // 假私钥
      this.provider
    )
  }

  async createDigitalBeing(name: string, attributes: any): Promise<number> {
    return this.mockWallet.createDigitalBeing(name, attributes)
  }

  async getDigitalBeing(tokenId: number): Promise<any> {
    return this.mockWallet.getDigitalBeing(tokenId)
  }

  async getResourceBalance(resourceId: number): Promise<number> {
    return this.mockWallet.getResourceBalance(resourceId)
  }

  async addResource(resourceId: number, amount: number): Promise<void> {
    this.mockWallet.addResource(resourceId, amount)
  }

  async useResource(resourceId: number, amount: number): Promise<boolean> {
    return this.mockWallet.useResource(resourceId, amount)
  }

  async getFragments(): Promise<number[]> {
    return this.mockWallet.getFragments()
  }

  async hasFragment(fragmentId: number): Promise<boolean> {
    return this.mockWallet.hasFragment(fragmentId)
  }

  async addFragment(fragmentId: number): Promise<void> {
    this.mockWallet.addFragment(fragmentId)
  }

  async submitGameScore(gameType: number, score: number, completion: number): Promise<void> {
    await this.mockWallet.submitGameScore(gameType, score, completion)
  }

  async getGameScores(gameType?: number): Promise<any[]> {
    return this.mockWallet.getGameScores(gameType)
  }

  async interactWithNPC(npcId: string, message: string, response: string): Promise<void> {
    await this.mockWallet.interactWithNPC(npcId, message, response)
  }

  async getInteractions(npcId?: string): Promise<any[]> {
    return this.mockWallet.getInteractions(npcId)
  }

  async getAllNFTs(): Promise<any[]> {
    return this.mockWallet.getAllNFTs()
  }
}

/**
 * Web3 模式适配器 - 使用真实钱包（MetaMask等）
 */
export class Web3WalletAdapter implements IWalletAdapter {
  mode: WalletMode = 'web3'
  private provider: ethers.BrowserProvider
  private address: string

  constructor(provider: ethers.BrowserProvider, address: string) {
    this.provider = provider
    this.address = address
  }

  getAddress(): string {
    return this.address
  }

  getProvider(): ethers.BrowserProvider {
    return this.provider
  }

  async getSigner(): Promise<ethers.Signer> {
    return await this.provider.getSigner()
  }

  async createDigitalBeing(name: string, attributes: any): Promise<number> {
    const signer = await this.getSigner()
    const { getDigitalBeingContract } = await import('./contracts')
    const contract = getDigitalBeingContract(signer)
    
    const tx = await contract.mint(name)
    const receipt = await tx.wait()
    
    // 从事件中获取 tokenId
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log)
        return parsed?.name === 'Transfer'
      } catch {
        return false
      }
    })
    
    if (event) {
      const parsed = contract.interface.parseLog(event)
      return Number(parsed?.args[2]) // tokenId
    }
    
    throw new Error('无法获取 tokenId')
  }

  async getDigitalBeing(tokenId: number): Promise<any> {
    const { getDigitalBeingContract } = await import('./contracts')
    const contract = getDigitalBeingContract(this.provider)
    
    const owner = await contract.ownerOf(tokenId)
    const uri = await contract.tokenURI(tokenId)
    
    return {
      tokenId,
      owner,
      uri,
      name: `Digital Being #${tokenId}`
    }
  }

  async getResourceBalance(resourceId: number): Promise<number> {
    const { getResource1155Contract } = await import('./contracts')
    const contract = getResource1155Contract(this.provider)
    
    const balance = await contract.balanceOf(this.address, resourceId)
    return Number(balance)
  }

  async addResource(resourceId: number, amount: number): Promise<void> {
    // 在真实合约中，资源通常由合约自动分配
    // 这里可以调用空投或奖励函数
    console.log(`Web3模式：添加资源 ${resourceId} x ${amount}`)
  }

  async useResource(resourceId: number, amount: number): Promise<boolean> {
    const balance = await this.getResourceBalance(resourceId)
    return balance >= amount
  }

  async getFragments(): Promise<number[]> {
    const { getMemoryFragmentContract } = await import('./contracts')
    const contract = getMemoryFragmentContract(this.provider)
    
    const fragments: number[] = []
    // 假设最多有 10 个碎片
    for (let i = 0; i < 10; i++) {
      try {
        const balance = await contract.balanceOf(this.address, i)
        if (balance > 0) {
          fragments.push(i)
        }
      } catch {
        break
      }
    }
    
    return fragments
  }

  async hasFragment(fragmentId: number): Promise<boolean> {
    const { getMemoryFragmentContract } = await import('./contracts')
    const contract = getMemoryFragmentContract(this.provider)
    
    const balance = await contract.balanceOf(this.address, fragmentId)
    return balance > 0
  }

  async addFragment(fragmentId: number): Promise<void> {
    console.log(`Web3模式：添加碎片 ${fragmentId}`)
  }

  async submitGameScore(gameType: number, score: number, completion: number): Promise<void> {
    const signer = await this.getSigner()
    const { getMiniGameManagerContract } = await import('./contracts')
    const contract = getMiniGameManagerContract(signer)
    
    const tx = await contract.submitGameScore(gameType, score, completion)
    await tx.wait()
  }

  async getGameScores(gameType?: number): Promise<any[]> {
    // 从合约事件中读取历史成绩
    const { getMiniGameManagerContract } = await import('./contracts')
    const contract = getMiniGameManagerContract(this.provider)
    
    const filter = contract.filters.GameCompleted(this.address)
    const events = await contract.queryFilter(filter)
    
    return events.map((event: any) => ({
      gameType: Number(event.args.gameType),
      score: Number(event.args.score),
      completion: Number(event.args.completion),
      timestamp: Number(event.args.timestamp) * 1000
    }))
  }

  async interactWithNPC(npcId: string, message: string, response: string): Promise<void> {
    const signer = await this.getSigner()
    const { getAINPCContract } = await import('./contracts')
    const contract = getAINPCContract(signer)
    
    const tx = await contract.interact(npcId, message)
    await tx.wait()
  }

  async getInteractions(npcId?: string): Promise<any[]> {
    const { getAINPCContract } = await import('./contracts')
    const contract = getAINPCContract(this.provider)
    
    const filter = npcId 
      ? contract.filters.Interaction(this.address, npcId)
      : contract.filters.Interaction(this.address)
    
    const events = await contract.queryFilter(filter)
    
    return events.map((event: any) => ({
      npcId: event.args.npcId,
      message: event.args.message,
      response: event.args.response || '',
      timestamp: Number(event.args.timestamp) * 1000
    }))
  }
}

/**
 * 创建钱包适配器
 */
export function createWalletAdapter(
  mode: WalletMode,
  provider?: ethers.BrowserProvider,
  address?: string
): IWalletAdapter {
  if (mode === 'web2') {
    return new Web2WalletAdapter()
  } else {
    if (!provider || !address) {
      throw new Error('Web3 模式需要提供 provider 和 address')
    }
    return new Web3WalletAdapter(provider, address)
  }
}
