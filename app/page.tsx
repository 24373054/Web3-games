'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import WorldStatus from '@/components/WorldStatus'
import DigitalBeingCard from '@/components/DigitalBeingCard'
import DigitalBeingCardWeb2 from '@/components/DigitalBeingCardWeb2'
import NPCList from '@/components/NPCList'
import NPCListWeb2 from '@/components/NPCListWeb2'
import DialogueInterface from '@/components/DialogueInterface'
import DialogueInterfaceWeb2 from '@/components/DialogueInterfaceWeb2'
import EventTimeline from '@/components/EventTimeline'
import FragmentGallery from '@/components/FragmentGallery'
import FragmentGalleryWeb2 from '@/components/FragmentGalleryWeb2'
import EpochPanel from '@/components/EpochPanel'
import EpochPanelWeb2 from '@/components/EpochPanelWeb2'
import PlayerProgress from '@/components/PlayerProgress'
import PlayerProgressWeb2 from '@/components/PlayerProgressWeb2'
import GameCenter from '@/components/MiniGames/GameCenter'
import ModeSelector from '@/components/ModeSelector'
import { IWalletAdapter, createWalletAdapter, WalletMode } from '@/lib/walletAdapter'

// 动态导入3D组件（仅客户端）
const YingzhouWorld = lazy(() => import('@/components/Scene3D/YingzhouWorld'))
const SimpleWorld = lazy(() => import('@/components/Scene3D/SimpleWorld'))

type ViewMode = '3d' | '2d'
type SceneMode = 'full' | 'simple'
type PanelTab = 'dialogue' | 'fragments' | 'world' | 'games' | 'progress'

export default function Home() {
  const [gameMode, setGameMode] = useState<WalletMode | null>(null)
  const [walletAdapter, setWalletAdapter] = useState<IWalletAdapter | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [beingId, setBeingId] = useState<number | null>(null)
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<{chainId: string, correct: boolean} | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [sceneMode, setSceneMode] = useState<SceneMode>('simple')
  const [show3DDialog, setShow3DDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<PanelTab>('dialogue')

  useEffect(() => {
    // 检查是否已选择模式
    const savedMode = localStorage.getItem('yingzhou_game_mode') as WalletMode | null
    if (savedMode) {
      handleModeSelection(savedMode)
    }
    
    // 监听网络切换
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  // 处理模式选择
  const handleModeSelection = async (mode: WalletMode) => {
    setGameMode(mode)
    localStorage.setItem('yingzhou_game_mode', mode)

    if (mode === 'web2') {
      // Web2 模式：使用模拟钱包
      const adapter = createWalletAdapter('web2')
      setWalletAdapter(adapter)
      setAccount(adapter.getAddress())
      setProvider(adapter.getProvider() as any)
      
      // 检查是否已有数字生命
      const nfts = await adapter.getAllNFTs?.()
      if (nfts && nfts.length > 0) {
        setBeingId(nfts[0].tokenId)
      }
    } else {
      // Web3 模式：等待用户连接钱包
      checkConnection()
    }
  }

  // 切换模式
  const switchMode = () => {
    if (confirm('切换模式将重新开始，确定要切换吗？')) {
      localStorage.removeItem('yingzhou_game_mode')
      setGameMode(null)
      setWalletAdapter(null)
      setAccount(null)
      setProvider(null)
      setBeingId(null)
      window.location.reload()
    }
  }

  // 不再自动跳转到3D视图，让用户自己选择

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
    if (gameMode === 'web2') {
      // Web2 模式已自动连接
      return
    }

    // Web3 模式连接逻辑
    // 检测是否为移动端
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (!window.ethereum) {
      if (isMobile) {
        // 移动端：使用 deep link 唤起 MetaMask 或跳转下载
        const currentUrl = window.location.href
        const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
        
        // 尝试唤起 MetaMask 应用
        window.location.href = metamaskDeepLink
        
        // 如果 2 秒后还在页面，说明没有安装，跳转到下载页
        setTimeout(() => {
          if (confirm('检测到您尚未安装 MetaMask，是否前往下载？')) {
            window.location.href = 'https://metamask.io/download/'
          }
        }, 2000)
        return
      } else {
        // 桌面端：提示安装浏览器插件
        alert('请安装 MetaMask 浏览器插件!\n\n访问: https://metamask.io/download/')
        window.open('https://metamask.io/download/', '_blank')
        return
      }
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // 先检查网络
      const network = await provider.getNetwork()
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
      // 移动端使用 HTTPS RPC URL
      const rpcUrl = isMobile 
        ? (process.env.NEXT_PUBLIC_RPC_URL_HTTPS || 'https://immortal.matrixlab.work/rpc')
        : (process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545')
      
      if (network.chainId.toString() !== expectedChainId) {
        console.log('网络不匹配，尝试切换或添加网络...')
        
        // 尝试切换网络
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(expectedChainId).toString(16)}` }],
          })
          console.log('✅ 网络切换成功')
        } catch (switchError: any) {
          // 如果网络不存在 (code 4902)，自动添加网络
          if (switchError.code === 4902) {
            try {
              console.log('网络不存在，尝试添加...')
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${parseInt(expectedChainId).toString(16)}`,
                  chainName: '瀛州纪本地网络',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: [rpcUrl],
                  blockExplorerUrls: null
                }],
              })
              console.log('✅ 网络添加成功')
            } catch (addError: any) {
              console.error('添加网络失败:', addError)
              alert(
                `⚠️ 无法自动添加网络\n\n` +
                `错误: ${addError.message}\n\n` +
                `请手动添加网络：\n` +
                `- 网络名称: 瀛州纪本地网络\n` +
                `- RPC URL: ${rpcUrl}\n` +
                `- Chain ID: ${expectedChainId}\n` +
                `- 货币符号: ETH`
              )
              return
            }
          } else {
            console.error('切换网络失败:', switchError)
            alert(`切换网络失败: ${switchError.message}`)
            return
          }
        }
      }
      
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      // 创建 Web3 适配器
      const adapter = createWalletAdapter('web3', provider, address)
      setWalletAdapter(adapter)
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

  // 如果还没选择模式，显示模式选择器
  if (!gameMode) {
    return <ModeSelector onSelectMode={handleModeSelection} />
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
            <div className="flex gap-3">
              <button onClick={switchMode} className="px-4 py-2 border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-all">
                切换模式
              </button>
              {gameMode === 'web3' && (
                <button onClick={connectWallet} className="btn-primary">
                  连接钱包
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* 模式指示器 */}
              <div className={`px-3 py-1 rounded text-xs font-bold ${
                gameMode === 'web2' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {gameMode === 'web2' ? '🎮 Web2 模式' : '⛓️ Web3 模式'}
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-400">已连接</p>
                <p className="contract-text">{account.slice(0, 6)}...{account.slice(-4)}</p>
                {networkStatus && gameMode === 'web3' && (
                  <p className={`text-xs mt-1 ${networkStatus.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {networkStatus.correct ? '✓' : '⚠'} Chain ID: {networkStatus.chainId}
                  </p>
                )}
              </div>
              
              <button 
                onClick={switchMode} 
                className="px-3 py-1 text-xs border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-all"
              >
                切换模式
              </button>
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
            
            {/* 模式提示 */}
            <div className={`mb-8 p-6 rounded-lg border-2 ${
              gameMode === 'web2'
                ? 'bg-green-900 bg-opacity-20 border-green-400'
                : 'bg-blue-900 bg-opacity-20 border-blue-400'
            }`}>
              <h3 className={`text-2xl font-bold mb-3 ${
                gameMode === 'web2' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {gameMode === 'web2' ? '🎮 Web2 模式已启动' : '⛓️ Web3 模式已启动'}
              </h3>
              <p className="text-gray-300">
                {gameMode === 'web2' 
                  ? '你正在使用模拟钱包体验游戏，所有数据保存在本地浏览器中。'
                  : '你正在使用真实区块链钱包，所有数据将永久保存在链上。'
                }
              </p>
            </div>
            
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

            {gameMode === 'web2' ? (
              <button 
                onClick={() => {
                  setAccount(walletAdapter!.getAddress())
                  setProvider(walletAdapter!.getProvider() as any)
                }}
                className="btn-primary text-xl px-12 py-4"
              >
                开始游戏（Web2 模式）
              </button>
            ) : (
              <button onClick={connectWallet} className="btn-primary text-xl px-12 py-4">
                连接钱包，进入瀛州
              </button>
            )}
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
              {gameMode === 'web2' && walletAdapter ? (
                <DigitalBeingCardWeb2
                  walletAdapter={walletAdapter}
                  beingId={beingId}
                  setBeingId={setBeingId}
                />
              ) : (
                <DigitalBeingCard 
                  provider={provider} 
                  account={account}
                  beingId={beingId}
                  setBeingId={setBeingId}
                />
              )}
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
                      {gameMode === 'web2' ? (
                        <NPCListWeb2
                          selectedNPC={selectedNPC}
                          setSelectedNPC={setSelectedNPC}
                        />
                      ) : (
                        <NPCList 
                          provider={provider}
                          selectedNPC={selectedNPC}
                          setSelectedNPC={setSelectedNPC}
                        />
                      )}
                      
                      {selectedNPC && (
                        gameMode === 'web2' && walletAdapter ? (
                          <DialogueInterfaceWeb2
                            walletAdapter={walletAdapter}
                            npcId={selectedNPC}
                          />
                        ) : (
                          <DialogueInterface
                            provider={provider}
                            beingId={beingId}
                            npcId={selectedNPC}
                          />
                        )
                      )}

                      {gameMode !== 'web2' && <EventTimeline provider={provider} />}
                    </>
                  )}

                  {/* 碎片收藏标签页 */}
                  {activeTab === 'fragments' && (
                    gameMode === 'web2' && walletAdapter ? (
                      <FragmentGalleryWeb2 walletAdapter={walletAdapter} />
                    ) : (
                      <FragmentGallery 
                        provider={provider}
                        account={account}
                      />
                    )
                  )}

                  {/* 纪元系统标签页 */}
                  {activeTab === 'world' && (
                    gameMode === 'web2' && walletAdapter ? (
                      <EpochPanelWeb2 walletAdapter={walletAdapter} />
                    ) : (
                      <EpochPanel 
                        provider={provider}
                        account={account}
                        beingId={beingId}
                      />
                    )
                  )}

                  {/* 小游戏标签页 */}
                  {activeTab === 'games' && (
                    <GameCenter
                      provider={provider}
                      account={account}
                      walletAdapter={walletAdapter}
                      gameMode={gameMode || 'web2'}
                    />
                  )}

                  {/* 玩家进度标签页 */}
                  {activeTab === 'progress' && (
                    gameMode === 'web2' && walletAdapter ? (
                      <PlayerProgressWeb2 walletAdapter={walletAdapter} />
                    ) : (
                      <PlayerProgress 
                        provider={provider}
                        account={account}
                      />
                    )
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

