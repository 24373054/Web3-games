'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface Block {
  id: number
  number: number
  position: number
}

export default function MemorySortGame({
  onComplete,
  provider,
  account
}: {
  onComplete: (score: number, completion: number) => void
  provider: ethers.BrowserProvider | null
  account: string | null
}) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [targetOrder] = useState<number[]>([0, 42, 100, 1000, 10000])
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [mistakes, setMistakes] = useState(0)

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !gameEnded) {
      endGame()
    }
  }, [timeLeft, gameStarted, gameEnded])

  const initializeGame = () => {
    // 打乱目标顺序
    const shuffled = [...targetOrder]
      .sort(() => Math.random() - 0.5)
      .map((num, idx) => ({
        id: idx,
        number: num,
        position: idx
      }))
    setBlocks(shuffled)
  }

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(60)
    setMistakes(0)
    initializeGame()
  }

  const swapBlocks = (index1: number, index2: number) => {
    if (gameEnded || !gameStarted) return

    const newBlocks = [...blocks]
    const temp = newBlocks[index1]
    newBlocks[index1] = newBlocks[index2]
    newBlocks[index2] = temp

    // 更新position
    newBlocks[index1].position = index1
    newBlocks[index2].position = index2

    setBlocks(newBlocks)
  }

  const checkSolution = () => {
    const currentOrder = blocks.map(b => b.number)
    const isCorrect = currentOrder.every((num, idx) => num === targetOrder[idx])

    if (isCorrect) {
      endGame()
    } else {
      setMistakes(mistakes + 1)
      alert('排序不正确，请继续尝试！')
    }
  }

  const endGame = () => {
    setGameEnded(true)
    const currentOrder = blocks.map(b => b.number)
    const correct = currentOrder.filter((num, idx) => num === targetOrder[idx]).length
    const accuracy = (correct / targetOrder.length) * 100
    
    // 计算时间得分
    const timeScore = (timeLeft / 60) * 40
    
    // 计算准确度得分
    const accuracyScore = accuracy * 0.4
    
    // 计算流畅度得分（基于失误次数）
    const smoothScore = Math.max(0, 20 - mistakes * 5)
    
    const totalScore = Math.round(timeScore + accuracyScore + smoothScore)
    const completion = accuracy
    
    onComplete(totalScore, completion)
  }

  if (!gameStarted) {
    return (
      <div className="digital-frame text-center py-12">
        <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">
          🧩 记忆排序游戏
        </h2>
        <p className="text-gray-300 mb-6">
          将区块编号按从小到大的顺序排列
        </p>
        <div className="mb-6 text-left max-w-md mx-auto">
          <h3 className="text-yingzhou-cyan mb-2">游戏规则：</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• 点击相邻的两个方块进行交换</li>
            <li>• 将所有区块按数字从小到大排序</li>
            <li>• 时间限制：60秒</li>
            <li>• 完成度 = 准确度 + 速度 + 流畅度</li>
          </ul>
        </div>
        <button onClick={startGame} className="btn-primary">
          开始游戏
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-yingzhou-cyan glow-text">🧩 记忆排序</h2>
        <div className="flex gap-4 text-sm">
          <span className={`${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
            ⏱️ {timeLeft}秒
          </span>
          <span className="text-gray-300">❌ {mistakes}次失误</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-4">
          目标顺序：{targetOrder.join(' → ')}
        </p>
        
        {/* 方块区域 */}
        <div className="flex justify-center gap-4 mb-6">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              onClick={() => {
                if (index > 0) swapBlocks(index, index - 1)
              }}
              className="relative w-20 h-20 border-2 border-yingzhou-cyan bg-yingzhou-dark hover:bg-yingzhou-cyan hover:text-black transition-all cursor-pointer flex items-center justify-center font-bold text-lg shadow-lg shadow-yingzhou-cyan/30"
            >
              {block.number}
              <div className="absolute -bottom-6 text-xs text-gray-500">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mb-4">
          点击方块与左侧方块交换位置
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={checkSolution}
          disabled={gameEnded}
          className="flex-1 btn-primary"
        >
          {gameEnded ? '游戏结束' : '检查答案'}
        </button>
        <button
          onClick={initializeGame}
          disabled={gameEnded}
          className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          重新打乱
        </button>
      </div>

      {gameEnded && (
        <div className="mt-6 p-4 border-2 border-green-500 rounded-lg bg-green-900 bg-opacity-20">
          <p className="text-green-400 font-bold text-center">
            {blocks.map(b => b.number).every((num, idx) => num === targetOrder[idx])
              ? '✓ 恭喜！排序正确！'
              : '⚠️ 时间到！游戏结束'}
          </p>
        </div>
      )}
    </div>
  )
}

