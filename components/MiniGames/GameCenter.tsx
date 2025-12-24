'use client'

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import type { IWalletAdapter } from '@/lib/walletAdapter'
import { EPOCH_UNLOCK_REQUIREMENTS } from '@/lib/mockWallet'
import MemorySortGame from './MemorySortGame'
import SnakeGame from './SnakeGame'
import MazeGame from './MazeGame'
import BreakoutGame from './BreakoutGame'
import ReactionGame from './ReactionGame'

interface GameInfo {
  id: number
  name: string
  icon: string
  epoch: string
  epochIndex: number
  epochColor: string
  description: string
  fragmentReward: number
  requiredCompletion: number
}

const GAMES: GameInfo[] = [
  { id: 0, name: '记忆排序', icon: '🧩', epoch: '创世纪元', epochIndex: 0, epochColor: '#00FFFF',
    description: '将区块编号按顺序排列', fragmentReward: 0, requiredCompletion: 60 },
  { id: 1, name: '贪吃蛇', icon: '🐍', epoch: '萌芽纪元', epochIndex: 1, epochColor: '#00FF00',
    description: '生命不断成长，小心撞墙', fragmentReward: 1, requiredCompletion: 60 },
  { id: 2, name: '迷宫探索', icon: '🏰', epoch: '繁盛纪元', epochIndex: 2, epochColor: '#FFD700',
    description: '探索未知领域，找到出口', fragmentReward: 2, requiredCompletion: 60 },
  { id: 3, name: '打砖块', icon: '🧱', epoch: '熵化纪元', epochIndex: 3, epochColor: '#FF4444',
    description: '秩序崩塌，击碎数据块', fragmentReward: 3, requiredCompletion: 60 },
  { id: 4, name: '反应测试', icon: '⚡', epoch: '毁灭纪元', epochIndex: 4, epochColor: '#9B59B6',
    description: '在混沌中捕捉希望之光', fragmentReward: 4, requiredCompletion: 60 }
]

const EPOCH_NAMES = ['创世', '萌芽', '繁盛', '熵化', '毁灭']


interface GameCenterProps {
  provider: ethers.BrowserProvider | null
  account: string | null
  walletAdapter: IWalletAdapter | null
  gameMode: 'web2' | 'web3'
  onFragmentEarned?: (fragmentId: number) => void
}

export default function GameCenter({ 
  provider, account, walletAdapter, gameMode, onFragmentEarned 
}: GameCenterProps) {
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [earnedFragments, setEarnedFragments] = useState<number[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [gameScores, setGameScores] = useState<Record<number, { score: number, completion: number }>>({})

  useEffect(() => {
    if (walletAdapter && gameMode === 'web2') {
      setCurrentEpoch(walletAdapter.getCurrentEpoch())
      walletAdapter.getFragments().then(setEarnedFragments)
    }
    // 监听 mockWallet 更新事件
    const handleUpdate = () => {
      if (walletAdapter && gameMode === 'web2') {
        setCurrentEpoch(walletAdapter.getCurrentEpoch())
        walletAdapter.getFragments().then(setEarnedFragments)
      }
    }
    window.addEventListener('mockWalletUpdate', handleUpdate)
    return () => window.removeEventListener('mockWalletUpdate', handleUpdate)
  }, [walletAdapter, gameMode])

  const handleGameComplete = async (gameId: number, score: number, completion: number) => {
    setGameScores(prev => ({ ...prev, [gameId]: { score, completion } }))
    const game = GAMES.find(g => g.id === gameId)
    if (!game) return

    try {
      if (gameMode === 'web2' && walletAdapter) {
        await walletAdapter.submitGameScore(gameId, score, completion)
        
        if (completion >= game.requiredCompletion && !earnedFragments.includes(game.fragmentReward)) {
          await walletAdapter.addFragment(game.fragmentReward)
          const newFragments = [...earnedFragments, game.fragmentReward]
          setEarnedFragments(newFragments)
          onFragmentEarned?.(game.fragmentReward)
          alert(`🎉 恭喜！得分：${score}\n完成度：${completion}%\n\n✨ 获得记忆碎片 #${game.fragmentReward}（${game.epoch}）！`)
        } else if (completion >= game.requiredCompletion) {
          alert(`🎮 游戏完成！得分：${score}\n完成度：${completion}%\n\n你已经拥有这个碎片了`)
        } else {
          alert(`🎮 游戏结束！得分：${score}\n完成度：${completion}%\n\n需要完成度≥${game.requiredCompletion}%才能获得碎片`)
        }
      } else if (gameMode === 'web3' && provider && account) {
        const signer = await provider.getSigner()
        const { getMiniGameManagerContract } = await import('@/lib/contracts')
        const gameManager = getMiniGameManagerContract(signer)
        
        alert(`⏳ 正在提交成绩到区块链...\n请在MetaMask中确认交易`)
        const tx = await gameManager.submitGameScore(gameId, score, completion)
        await tx.wait()
        
        if (completion >= game.requiredCompletion) {
          setEarnedFragments(prev => [...prev, game.fragmentReward])
          onFragmentEarned?.(game.fragmentReward)
          alert(`🎉 链上记录成功！获得碎片 #${game.fragmentReward}`)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert(`❌ 提交失败：${errorMessage}`)
    }
  }


  const isGameUnlocked = (epochIndex: number) => epochIndex <= currentEpoch

  const renderGame = () => {
    if (selectedGame === null) return null
    const commonProps = {
      provider,
      account,
      onComplete: (score: number, completion: number) => handleGameComplete(selectedGame, score, completion)
    }
    switch (selectedGame) {
      case 0: return <MemorySortGame {...commonProps} />
      case 1: return <SnakeGame {...commonProps} />
      case 2: return <MazeGame {...commonProps} />
      case 3: return <BreakoutGame {...commonProps} />
      case 4: return <ReactionGame {...commonProps} />
      default: return null
    }
  }

  const nextEpochRequirement = currentEpoch < 4 ? EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1] : 0
  const canUnlockNext = currentEpoch < 4 && earnedFragments.length >= nextEpochRequirement


  return (
    <div className="space-y-6">
      <div className="digital-frame">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-yingzhou-cyan glow-text">🎮 小游戏中心</h2>
          <div className="text-sm text-gray-400">
            当前纪元: <span className="text-yingzhou-cyan font-bold">{EPOCH_NAMES[currentEpoch]}</span>
            {' | '}碎片: <span className="text-yingzhou-cyan font-bold">{earnedFragments.length}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          {GAMES.map(game => (
            <div
              key={game.id}
              className={`flex-1 h-3 rounded-full transition-all ${
                earnedFragments.includes(game.fragmentReward)
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50'
                  : isGameUnlocked(game.epochIndex)
                    ? 'bg-gray-600'
                    : 'bg-gray-800'
              }`}
              title={`${game.epoch} - ${game.name}${isGameUnlocked(game.epochIndex) ? '' : '（未解锁）'}`}
            />
          ))}
        </div>

        {currentEpoch < 4 && (
          <div className="p-3 bg-gray-900 rounded-lg text-sm text-gray-400">
            下一纪元（{EPOCH_NAMES[currentEpoch + 1]}）需要 {EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1]} 个碎片
            <span className="text-xs ml-2">（前往"纪元系统"标签页解锁）</span>
          </div>
        )}
      </div>


      {selectedGame === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map(game => {
            const hasFragment = earnedFragments.includes(game.fragmentReward)
            const unlocked = isGameUnlocked(game.epochIndex)
            const gameScore = gameScores[game.id]
            
            return (
              <div
                key={game.id}
                onClick={() => unlocked && setSelectedGame(game.id)}
                className={`digital-frame transition-all ${
                  unlocked 
                    ? 'cursor-pointer hover:scale-105 hover:shadow-lg' 
                    : 'opacity-50 cursor-not-allowed'
                }${hasFragment ? ' border-green-500 shadow-green-500/30' : ''}`}
                style={{ borderColor: hasFragment ? '#22c55e' : unlocked ? game.epochColor : '#374151' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{game.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: unlocked ? game.epochColor : '#6b7280' }}>
                      {game.name}
                    </h3>
                    <p className="text-xs text-gray-500">{game.epoch}</p>
                  </div>
                  {hasFragment && <span className="ml-auto text-xl text-green-500">✅</span>}
                  {!unlocked && <span className="ml-auto text-xl">🔒</span>}
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{game.description}</p>
                
                {gameScore && (
                  <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
                    最高分: {gameScore.score} | 完成度: {gameScore.completion}%
                  </div>
                )}
                
                <div className="mt-3 text-center">
                  <span 
                    className="inline-block px-4 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: unlocked ? `${game.epochColor}20` : '#1f2937',
                      color: unlocked ? game.epochColor : '#6b7280',
                      border: `1px solid ${unlocked ? game.epochColor : '#374151'}`
                    }}
                  >
                    {!unlocked ? '未解锁' : hasFragment ? '再玩一次' : '开始游戏'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-4 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors rounded flex items-center gap-2"
          >
            ← 返回游戏列表
          </button>
          <div className="mb-4 p-3 bg-gray-900 rounded-lg flex items-center gap-3">
            <span className="text-2xl">{GAMES[selectedGame].icon}</span>
            <div>
              <h3 className="font-bold" style={{ color: GAMES[selectedGame].epochColor }}>
                {GAMES[selectedGame].name}
              </h3>
              <p className="text-xs text-gray-500">
                {GAMES[selectedGame].epoch} | 完成度≥{GAMES[selectedGame].requiredCompletion}%可获得碎片
              </p>
            </div>
          </div>
          {renderGame()}
        </div>
      )}
    </div>
  )
}
