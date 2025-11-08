'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import WorldStatus from '@/components/WorldStatus'
import DigitalBeingCard from '@/components/DigitalBeingCard'
import NPCList from '@/components/NPCList'
import DialogueInterface from '@/components/DialogueInterface'
import EventTimeline from '@/components/EventTimeline'

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [beingId, setBeingId] = useState<number | null>(null)
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<{chainId: string, correct: boolean} | null>(null)

  useEffect(() => {
    checkConnection()
    
    // 监听网络切换
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      // 检查网络
      try {
        const network = await provider.getNetwork()
        const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
        setNetworkStatus({
          chainId: network.chainId.toString(),
          correct: network.chainId.toString() === expectedChainId
        })
      } catch (error) {
        console.error('检查网络失败:', error)
      }

      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        setAccount(accounts[0].address)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('请安装 MetaMask!')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // 先检查网络
      const network = await provider.getNetwork()
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
      
      if (network.chainId.toString() !== expectedChainId) {
        alert(
          `⚠️ 网络不匹配！\n\n` +
          `当前网络 Chain ID: ${network.chainId}\n` +
          `需要 Chain ID: ${expectedChainId}\n\n` +
          `请在 MetaMask 中切换到 Hardhat Local 网络：\n` +
          `- RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL}\n` +
          `- Chain ID: ${expectedChainId}\n\n` +
          `或者点击 MetaMask 中的"添加网络"`
        )
        
        // 尝试切换网络
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(expectedChainId).toString(16)}` }],
          })
        } catch (switchError: any) {
          // 如果网络不存在，提示用户添加
          if (switchError.code === 4902) {
            alert(
              '请手动添加 Hardhat Local 网络：\n\n' +
              '1. 打开 MetaMask\n' +
              '2. 网络下拉菜单 → 添加网络\n' +
              `3. RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL}\n` +
              `4. Chain ID: ${expectedChainId}\n` +
              '5. 货币符号: ETH'
            )
          }
        }
        return
      }
      
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setProvider(provider)
      setAccount(address)
      setNetworkStatus({
        chainId: network.chainId.toString(),
        correct: true
      })
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  return (
    <div className="min-h-screen matrix-bg">
      {/* 顶部标题栏 */}
      <header className="border-b border-yingzhou-cyan bg-yingzhou-dark bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold glow-text">瀛州纪</h1>
              <p className="text-xs text-gray-400 mt-1">Immortal Ledger - 链上文明的最后史书</p>
            </div>
            {account && (
              <nav className="flex gap-4 mt-2">
                <Link href="/" className="text-yingzhou-cyan hover:text-yingzhou-blue transition-colors">
                  主页
                </Link>
                <Link href="/market" className="text-yingzhou-cyan hover:text-yingzhou-blue transition-colors">
                  市场
                </Link>
              </nav>
            )}
          </div>
          
          {!account ? (
            <button onClick={connectWallet} className="btn-primary">
              连接钱包
            </button>
          ) : (
            <div className="text-right">
              <p className="text-xs text-gray-400">已连接</p>
              <p className="contract-text">{account.slice(0, 6)}...{account.slice(-4)}</p>
              {networkStatus && (
                <p className={`text-xs mt-1 ${networkStatus.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {networkStatus.correct ? '✓' : '⚠'} Chain ID: {networkStatus.chainId}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {!account ? (
        // 欢迎页面
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 glow-text">
              欢迎来到瀛州
            </h2>
            <div className="digital-frame mb-8">
              <p className="text-lg leading-relaxed mb-4">
                在亿万光年之外，存在一个自我演化的数字生命文明——<span className="text-yingzhou-cyan font-bold">瀛州（Yingzhou）</span>。
              </p>
              <p className="text-lg leading-relaxed mb-4">
                他们的世界没有物质，没有语言，只有<span className="text-yingzhou-cyan">逻辑、合约与数据流</span>。
              </p>
              <p className="text-lg leading-relaxed mb-4">
                时间的流逝即为"区块的生成"，他们的文明由<span className="text-yingzhou-cyan">账本自身的逻辑</span>所驱动。
              </p>
              <p className="text-lg leading-relaxed text-yellow-400">
                你进入的时刻，是<span className="font-bold">熵化与毁灭的前夕</span>。
              </p>
            </div>
            
            <div className="code-poetry text-yingzhou-cyan mb-8 digital-frame">
{`function exist() public view returns (bool) {
    // 我在，故我被记录
    return ledger.isRecorded(address(this));
}

function remember() external {
    // 记忆即交易，遗忘即熵化
    emit Memory(block.timestamp, msg.sender);
}`}
            </div>

            <button onClick={connectWallet} className="btn-primary text-xl px-12 py-4">
              化身数字生命，进入瀛州
            </button>
          </div>
        </div>
      ) : (
        // 主游戏界面
        <div className="container mx-auto px-6 py-8">
          {/* 网络警告 */}
          {networkStatus && !networkStatus.correct && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="text-red-400 font-bold mb-2">网络配置错误！</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    MetaMask 连接到了错误的网络 (Chain ID: {networkStatus.chainId})
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    请切换到 Hardhat Local 网络 (Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID || '31337'})
                  </p>
                  <div className="text-xs bg-black bg-opacity-50 p-3 rounded">
                    <p className="text-gray-400 mb-1">正确配置：</p>
                    <p className="text-yingzhou-cyan">RPC URL: {process.env.NEXT_PUBLIC_RPC_URL}</p>
                    <p className="text-yingzhou-cyan">Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID || '31337'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：世界状态和玩家信息 */}
            <div className="space-y-6">
              <WorldStatus provider={provider} />
              <DigitalBeingCard 
                provider={provider} 
                account={account}
                beingId={beingId}
                setBeingId={setBeingId}
              />
            </div>

            {/* 中间：对话界面 */}
            <div className="lg:col-span-2 space-y-6">
              {beingId !== null ? (
                <>
                  <NPCList 
                    provider={provider}
                    selectedNPC={selectedNPC}
                    setSelectedNPC={setSelectedNPC}
                  />
                  
                  {selectedNPC && (
                    <DialogueInterface
                      provider={provider}
                      beingId={beingId}
                      npcId={selectedNPC}
                    />
                  )}

                  <EventTimeline provider={provider} />
                </>
              ) : (
                <div className="digital-frame text-center py-20">
                  <p className="text-xl text-gray-400 mb-4">
                    你尚未化身为数字生命
                  </p>
                  <p className="text-sm text-gray-500">
                    请先创建你的 Digital Being NFT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <footer className="border-t border-yingzhou-cyan mt-20 py-6 bg-yingzhou-dark bg-opacity-90">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>瀛州纪 © 2025 | 一个永恒存续在链上的数字文明史诗</p>
          <p className="mt-2 text-xs">
            合约即生命 · 账本即史书 · 毁灭为纪元终点
          </p>
        </div>
      </footer>
    </div>
  )
}

