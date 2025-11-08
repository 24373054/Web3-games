'use client'

import { useState, useEffect, Suspense, lazy } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import WorldStatus from '@/components/WorldStatus'
import DigitalBeingCard from '@/components/DigitalBeingCard'
import NPCList from '@/components/NPCList'
import DialogueInterface from '@/components/DialogueInterface'
import EventTimeline from '@/components/EventTimeline'
import FragmentGallery from '@/components/FragmentGallery'
import EpochPanel from '@/components/EpochPanel'
import PlayerProgress from '@/components/PlayerProgress'
import MemorySortGame from '@/components/MiniGames/MemorySortGame'

// 动态导入3D组件（仅客户端）
const YingzhouWorld = lazy(() => import('@/components/Scene3D/YingzhouWorld'))
const SimpleWorld = lazy(() => import('@/components/Scene3D/SimpleWorld'))

type ViewMode = '3d' | '2d'
type SceneMode = 'full' | 'simple'
type PanelTab = 'dialogue' | 'fragments' | 'world' | 'games' | 'progress'

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [beingId, setBeingId] = useState<number | null>(null)
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<{chainId: string, correct: boolean} | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('3d')
  const [sceneMode, setSceneMode] = useState<SceneMode>('simple')
  const [show3DDialog, setShow3DDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<PanelTab>('dialogue')

  useEffect(() => {
    checkConnection()
    
    // 监听网络切换
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  // 当创建数字生命后，自动切换到3D视图
  useEffect(() => {
    if (beingId !== null && viewMode === '2d') {
      // 给用户一点时间看到成功消息，然后切换
      const timer = setTimeout(() => {
        setViewMode('3d')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [beingId])

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
        <div className="relative">
          {/* 场景模式切换（仅在3D视图时显示） */}
          {viewMode === '3d' && (
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <button
                onClick={() => setSceneMode('simple')}
                className={`px-3 py-1 text-xs border transition-all ${
                  sceneMode === 'simple'
                    ? 'bg-green-500 text-black border-green-500'
                    : 'bg-black/70 text-green-400 border-green-400 hover:bg-green-500/20'
                }`}
              >
                ✅ 简化版
              </button>
              <button
                onClick={() => setSceneMode('full')}
                className={`px-3 py-1 text-xs border transition-all ${
                  sceneMode === 'full'
                    ? 'bg-blue-500 text-black border-blue-500'
                    : 'bg-black/70 text-blue-400 border-blue-400 hover:bg-blue-500/20'
                }`}
              >
                🚀 完整版
              </button>
            </div>
          )}

          {/* 3D视图 */}
          {viewMode === '3d' && (
            <div className="h-screen w-full">
              {beingId === null ? (
                // 未创建数字生命时的提示界面
                <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-yingzhou-dark to-black">
                  <div className="max-w-2xl mx-auto text-center p-8">
                    <div className="text-6xl mb-6 animate-pulse">🌌</div>
                    <h2 className="text-4xl font-bold text-yingzhou-cyan mb-6 glow-text">
                      瀛州3D世界
                    </h2>
                    <div className="digital-frame mb-8 text-left">
                      <p className="text-lg text-gray-300 mb-4">
                        在进入3D世界之前，你需要先创建你的数字生命...
                      </p>
                      <p className="text-sm text-gray-400">
                        点击右侧的 <span className="text-yingzhou-cyan">📋 管理面板</span> 创建你的 Digital Being NFT
                      </p>
                    </div>
                    <button
                      onClick={() => setViewMode('2d')}
                      className="btn-primary text-xl px-8 py-4"
                    >
                      前往创建数字生命 →
                    </button>
                  </div>
                </div>
              ) : (
                // 已创建数字生命，显示3D场景
                <Suspense fallback={
                  <div className="h-screen w-full flex items-center justify-center bg-black">
                    <div className="text-center">
                      <div className="text-4xl text-yingzhou-cyan mb-4 animate-pulse">⚡</div>
                      <div className="text-yingzhou-cyan">加载3D世界...</div>
                    </div>
                  </div>
                }>
                  {sceneMode === 'simple' ? (
                  <SimpleWorld
                    provider={provider}
                    account={account}
                    beingId={beingId}
                    onNPCInteract={(npcId) => {
                      setSelectedNPC(npcId)
                      setShow3DDialog(true)
                    }}
                    onEnterPortal={() => setViewMode('2d')}
                  />
                ) : (
                  <YingzhouWorld
                    provider={provider}
                    account={account}
                    beingId={beingId}
                    onNPCInteract={(npcId) => {
                      setSelectedNPC(npcId)
                      setShow3DDialog(true)
                    }}
                    onEnterPortal={() => setViewMode('2d')}
                  />
                )}
                </Suspense>
              )}

              {/* 3D场景中的对话框 */}
              {beingId !== null && show3DDialog && selectedNPC && (
                <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
                  <div className="max-w-4xl mx-auto bg-black/95 border-2 border-yingzhou-cyan p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl text-yingzhou-cyan">与 {selectedNPC} 对话</h3>
                      <button
                        onClick={() => setShow3DDialog(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <DialogueInterface
                      provider={provider}
                      beingId={beingId}
                      npcId={selectedNPC}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2D视图（原有UI） */}
          {viewMode === '2d' && (
            <div className="container mx-auto px-6 py-8">
              {/* 返回3D世界按钮 */}
              {beingId !== null && (
                <div className="mb-6 flex justify-center">
                  <button
                    onClick={() => setViewMode('3d')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-2 border-blue-400 hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 font-bold text-lg shadow-lg shadow-blue-500/50"
                  >
                    🌌 进入3D区块链实体世界
                  </button>
                </div>
              )}

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

            {/* 中间：标签页面板 */}
            <div className="lg:col-span-2 space-y-6">
              {beingId !== null ? (
                <>
                  {/* 标签切换 */}
                  <div className="flex gap-2 border-b border-gray-700 pb-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('dialogue')}
                      className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'dialogue'
                          ? 'bg-yingzhou-cyan text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      💬 AI对话
                    </button>
                    <button
                      onClick={() => setActiveTab('fragments')}
                      className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'fragments'
                          ? 'bg-yingzhou-cyan text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      💎 记忆碎片
                    </button>
                    <button
                      onClick={() => setActiveTab('world')}
                      className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'world'
                          ? 'bg-yingzhou-cyan text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      ⏳ 纪元系统
                    </button>
                    <button
                      onClick={() => setActiveTab('games')}
                      className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'games'
                          ? 'bg-yingzhou-cyan text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      🎮 小游戏
                    </button>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className={`px-4 py-2 rounded-t-lg transition-all ${
                        activeTab === 'progress'
                          ? 'bg-yingzhou-cyan text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      📊 玩家进度
                    </button>
                  </div>

                  {/* 对话标签页 */}
                  {activeTab === 'dialogue' && (
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
                  )}

                  {/* 碎片收藏标签页 */}
                  {activeTab === 'fragments' && (
                    <FragmentGallery 
                      provider={provider}
                      account={account}
                    />
                  )}

                  {/* 纪元系统标签页 */}
                  {activeTab === 'world' && (
                    <EpochPanel 
                      provider={provider}
                      account={account}
                      beingId={beingId}
                    />
                  )}

                  {/* 小游戏标签页 */}
                  {activeTab === 'games' && (
                    <div className="space-y-6">
                      <div className="digital-frame">
                        <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">
                          🎮 小游戏中心
                        </h2>
                        <p className="text-gray-400 mb-6">
                          通过小游戏获得记忆碎片，推进纪元！
                        </p>
                        
                        <Suspense fallback={<div className="text-center py-8 text-gray-400">加载中...</div>}>
                          <MemorySortGame 
                            onComplete={async (score, completion) => {
                              console.log('游戏完成:', score, completion)
                              
                              if (!provider || !account) {
                                alert('❌ 请先连接钱包')
                                return
                              }

                              try {
                                // 提交成绩到合约
                                const signer = await provider.getSigner()
                                const { getMiniGameManagerContract } = await import('@/lib/contracts')
                                const gameManager = getMiniGameManagerContract(signer)
                                
                                console.log('📤 提交游戏成绩到合约...')
                                const tx = await gameManager.submitGameScore(
                                  0, // GameType.MemorySort
                                  score,
                                  completion
                                )
                                
                                alert(`⏳ 正在提交成绩...\n请在MetaMask中确认交易`)
                                await tx.wait()
                                
                                if (completion >= 60) {
                                  alert(`🎉 游戏完成！\n得分：${score}\n完成度：${completion}%\n\n✨ 恭喜获得碎片#0（创世之光）！\n\n请前往"记忆碎片"标签页查看`)
                                } else {
                                  alert(`🎮 游戏完成！\n得分：${score}\n完成度：${completion}%\n\n需要完成度≥60%才能获得碎片\n请再试一次！`)
                                }
                              } catch (error: any) {
                                console.error('提交成绩失败:', error)
                                alert(`❌ 提交失败：${error.message}`)
                              }
                            }}
                            provider={provider}
                            account={account}
                          />
                        </Suspense>
                      </div>
                    </div>
                  )}

                  {/* 玩家进度标签页 */}
                  {activeTab === 'progress' && (
                    <PlayerProgress 
                      provider={provider}
                      account={account}
                    />
                  )}
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

