'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import DigitalBeingCard from '@/components/DigitalBeingCard'
import Explore3DWorld from '@/components/Explore3DWorld'
import MetaMaskResetAlert from '@/components/MetaMaskResetAlert'
import { ERAS, AI_NPCS, MEMORY_FRAGMENTS, getEraById, getNPCsByEra, getFragmentsByEra } from '@/lib/gameData'

export default function Home() {
  // ===== Web3 State =====
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [beingId, setBeingId] = useState<number | null>(null)

  // ===== Game State =====
  const [currentEra, setCurrentEra] = useState(0) // 当前纪元
  const [isExploring, setIsExploring] = useState(false) // 是否在3D探索中
  const [collectedFragments, setCollectedFragments] = useState<number[]>([]) // 已收集碎片ID
  const [completedMinigames, setCompletedMinigames] = useState<string[]>([]) // 已完成的小游戏
  const [dialogueHistory, setDialogueHistory] = useState<{[npcId: string]: number}>({}) // NPC对话次数
  
  // Load progress from localStorage
  useEffect(() => {
    checkConnection()
    const savedProgress = localStorage.getItem('yingzhou_progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setCurrentEra(progress.currentEra || 0)
        setCollectedFragments(progress.collectedFragments || [])
        setCompletedMinigames(progress.completedMinigames || [])
        setDialogueHistory(progress.dialogueHistory || {})
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
  }, [])

  // Save progress
  useEffect(() => {
    if (account) {
      const progress = {
        currentEra,
        collectedFragments,
        completedMinigames,
        dialogueHistory
      }
      localStorage.setItem('yingzhou_progress', JSON.stringify(progress))
    }
  }, [currentEra, collectedFragments, completedMinigames, dialogueHistory, account])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await browserProvider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await browserProvider.getSigner()
          const address = await signer.getAddress()
          setAccount(address)
          setProvider(browserProvider)
        }
      } catch (error) {
        console.error('Check connection error:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        await browserProvider.send('eth_requestAccounts', [])
        const signer = await browserProvider.getSigner()
        const address = await signer.getAddress()
        
        setAccount(address)
        setProvider(browserProvider)
      } catch (error) {
        console.error('Connect wallet error:', error)
      }
    } else {
      alert('请安装 MetaMask!')
    }
  }

  const handleDisconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setBeingId(null)
    setIsExploring(false)
  }

  const handleFragmentCollect = (fragmentId: number) => {
    if (!collectedFragments.includes(fragmentId)) {
      setCollectedFragments([...collectedFragments, fragmentId])
    }
  }

  const handleMinigameComplete = (minigameId: string) => {
    if (!completedMinigames.includes(minigameId)) {
      setCompletedMinigames([...completedMinigames, minigameId])
    }
  }

  const handleEraAdvance = () => {
    if (currentEra < 4) {
      setCurrentEra(currentEra + 1)
    }
  }

  const currentEraConfig = getEraById(currentEra)
  const totalFragments = MEMORY_FRAGMENTS.length
  const progressPercent = (collectedFragments.length / totalFragments) * 100

  return (
    <div 
      className="min-h-screen text-white transition-colors duration-1000"
      style={{
        background: currentEraConfig ? 
          `linear-gradient(to bottom, ${currentEraConfig.backgroundColor}, #000000)` :
          'linear-gradient(to bottom, #1a1a3e, #000000)'
      }}
    >
      {/* MetaMask 重置提示 */}
      <MetaMaskResetAlert />

      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                瀛州纪
              </h1>
              <p className="text-sm text-gray-400 mt-1">Immortal Ledger - 数字生命的史诗</p>
            </div>

            {/* Era Indicator */}
            {account && beingId && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-400">当前纪元</div>
                  <div className="text-lg font-bold" style={{color: currentEraConfig?.ambientLight}}>
                    {currentEraConfig?.chineseName}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-400">记忆碎片</div>
                  <div className="text-lg font-bold text-cyan-400">
                    {collectedFragments.length} / {totalFragments}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet */}
            <div className="flex items-center gap-4">
              {account ? (
                <>
                  <div className="text-sm">
                    <div className="text-gray-400">已连接</div>
                    <div className="font-mono text-cyan-400">
                      {account.substring(0, 6)}...{account.substring(38)}
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    断开连接
                  </button>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-bold transition-all transform hover:scale-105"
                >
                  连接钱包
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {account && beingId && (
            <div className="mt-4">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                探索进度: {progressPercent.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!account ? (
            // ===== Welcome Screen =====
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center py-20"
            >
              <div className="mb-8">
                <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  欢迎来到瀛州纪
                </h2>
                <p className="text-xl text-gray-300 mb-2">
                  一个被记录在链上的文明的最后纪元
                </p>
                <p className="text-lg text-purple-400 italic">
                  "我被记录，故我存在"
                </p>
              </div>

              <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">游戏介绍</h3>
                <div className="text-left space-y-3 text-gray-300">
                  <p>• <strong>3D几何世界探索</strong>：第一人称探索五大纪元的抽象世界</p>
                  <p>• <strong>寻找AI-NPC</strong>：通过线索找到5个核心数字生命</p>
                  <p>• <strong>完成小游戏挑战</strong>：在对话中触发专属小游戏</p>
                  <p>• <strong>收集记忆碎片</strong>：通过游戏和关键词获得18个碎片NFT</p>
                  <p>• <strong>见证文明史诗</strong>：从创世到毁灭的完整叙事</p>
                </div>
              </div>

              <button
                onClick={connectWallet}
                className="px-12 py-4 text-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
              >
                开始探索
              </button>
            </motion.div>

          ) : !beingId ? (
            // ===== Create Digital Being =====
            <motion.div
              key="create-being"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
                  创建你的数字生命
                </h2>
                <p className="text-gray-300 mb-8 text-center">
                  在瀛洲的世界中，每个探索者都需要一个数字化身。
                  <br />
                  创建你的 Digital Being NFT，开启探索之旅。
                </p>

                <DigitalBeingCard
                  provider={provider}
                  account={account}
                  beingId={beingId}
                  setBeingId={setBeingId}
                />
              </div>
            </motion.div>

          ) : isExploring ? (
            // ===== 3D Exploration =====
            <Explore3DWorld
              currentEra={currentEra}
              collectedFragments={collectedFragments}
              completedMinigames={completedMinigames}
              dialogueHistory={dialogueHistory}
              onFragmentCollect={handleFragmentCollect}
              onMinigameComplete={handleMinigameComplete}
              onDialogueUpdate={(npcId) => {
                setDialogueHistory({
                  ...dialogueHistory,
                  [npcId]: (dialogueHistory[npcId] || 0) + 1
                })
              }}
              onEraAdvance={handleEraAdvance}
              onExplorationEnd={() => setIsExploring(false)}
            />

          ) : (
            // ===== Explorer Hub =====
            <motion.div
              key="explorer-hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold mb-4 text-cyan-400">
                    数字生命 #{beingId}
                  </h2>
                  <p className="text-gray-300 text-lg">
                    {currentEraConfig?.chineseName} - {currentEraConfig?.description}
                  </p>
                </div>

                {/* Era Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div 
                    className="p-6 rounded-lg border"
                    style={{
                      background: `linear-gradient(135deg, ${currentEraConfig?.backgroundColor}80, transparent)`,
                      borderColor: currentEraConfig?.ambientLight + '50'
                    }}
                  >
                    <div className="text-sm text-gray-400 mb-2">当前纪元</div>
                    <div className="text-2xl font-bold">{currentEraConfig?.chineseName}</div>
                    <div className="text-xs text-gray-500 mt-1">{currentEraConfig?.name}</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-lg border border-purple-500/30">
                    <div className="text-purple-400 text-sm mb-2">已收集碎片</div>
                    <div className="text-2xl font-bold">{collectedFragments.length} / {totalFragments}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getFragmentsByEra(currentEra).filter(f => collectedFragments.includes(f.id)).length} / {getFragmentsByEra(currentEra).length} 本纪元
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 p-6 rounded-lg border border-cyan-500/30">
                    <div className="text-cyan-400 text-sm mb-2">探索状态</div>
                    <div className="text-2xl font-bold">就绪</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getNPCsByEra(currentEra).length} 个NPC可交互
                    </div>
                  </div>
                </div>

                {/* Explore Button */}
                <div className="text-center mb-8">
                  <button
                    onClick={() => setIsExploring(true)}
                    className="px-12 py-4 text-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                  >
                    进入3D世界探索
                  </button>
                  <p className="text-sm text-gray-400 mt-4">
                    在3D几何世界中寻找AI-NPC，完成小游戏挑战，收集记忆碎片
                  </p>
                </div>

                {/* Available NPCs in this Era */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">本纪元的AI-NPC</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getNPCsByEra(currentEra).map(npc => (
                      <div 
                        key={npc.id}
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-12 h-12 rounded flex items-center justify-center font-bold text-2xl"
                            style={{backgroundColor: npc.color + '40', color: npc.color}}
                          >
                            {npc.geometryType === 'cube' && '■'}
                            {npc.geometryType === 'octahedron' && '◆'}
                            {npc.geometryType === 'sphere' && '●'}
                            {npc.geometryType === 'nested-cube' && '▣'}
                            {npc.geometryType === 'corrupted' && '▓'}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{npc.chineseName}</div>
                            <div className="text-xs text-gray-400">{npc.name}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{npc.description}</p>
                        <div className="text-xs text-gray-500">
                          位置: {npc.position === 'east' && '东方'}
                          {npc.position === 'north' && '北方'}
                          {npc.position === 'center' && '中央'}
                          {npc.position === 'south' && '南方'}
                          {npc.position === 'west' && '西方'}
                        </div>
                        {dialogueHistory[npc.id] && (
                          <div className="text-xs text-cyan-400 mt-1">
                            已对话 {dialogueHistory[npc.id]} 次
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Era Progress */}
                {currentEra < 4 && (
                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="text-yellow-400 text-sm font-bold mb-2">进入下一纪元</div>
                    <p className="text-xs text-gray-300">
                      收集本纪元的记忆碎片并与关键NPC对话后，即可前往下一纪元
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400 space-y-2">
            <p className="text-cyan-400 italic">"我被记录，故我存在"</p>
            <p className="text-sm">"当世界归于静默，账本依然永存"</p>
            <p className="text-xs text-gray-500">瀛州纪 - Immortal Ledger</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
