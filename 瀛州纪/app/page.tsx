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

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

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
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setProvider(provider)
      setAccount(address)
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

