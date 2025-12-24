'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface MazeGameProps {
  onComplete: (score: number, completion: number) => void
  provider: unknown
  account: string | null
}

const MAZE_SIZE = 21 // 增大迷宫尺寸
const CELL_SIZE = 22

// 使用递归回溯算法生成更复杂的迷宫
const generateMaze = (): number[][] => {
  // 初始化全是墙
  const maze: number[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(1))
  
  // 递归回溯生成迷宫
  const carve = (x: number, y: number) => {
    maze[y][x] = 0
    
    // 随机打乱方向
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5)
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && maze[ny][nx] === 1) {
        // 打通中间的墙
        maze[y + dy / 2][x + dx / 2] = 0
        carve(nx, ny)
      }
    }
  }
  
  carve(1, 1)
  
  // 确保起点和终点可通行
  maze[1][1] = 0
  maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 0
  
  // 随机打开一些额外的通道，增加多条路径
  for (let i = 0; i < MAZE_SIZE * 2; i++) {
    const x = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2
    const y = Math.floor(Math.random() * (MAZE_SIZE - 4)) + 2
    if (maze[y][x] === 1) {
      // 检查周围是否有足够的通道
      let pathCount = 0
      if (maze[y-1]?.[x] === 0) pathCount++
      if (maze[y+1]?.[x] === 0) pathCount++
      if (maze[y]?.[x-1] === 0) pathCount++
      if (maze[y]?.[x+1] === 0) pathCount++
      if (pathCount >= 2) {
        maze[y][x] = 0
      }
    }
  }
  
  return maze
}

export default function MazeGame({ onComplete }: MazeGameProps) {
  const [maze, setMaze] = useState<number[][]>([])
  const [player, setPlayer] = useState<Position>({ x: 1, y: 1 })
  const [fragments, setFragments] = useState<Position[]>([])
  const [collected, setCollected] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [moves, setMoves] = useState(0)
  const [showIntro, setShowIntro] = useState(true)

  const initGame = useCallback(() => {
    const newMaze = generateMaze()
    setMaze(newMaze)
    setPlayer({ x: 1, y: 1 })
    
    // 放置8个碎片在迷宫各处
    const newFragments: Position[] = []
    const targetCount = 8
    let attempts = 0
    
    while (newFragments.length < targetCount && attempts < 500) {
      attempts++
      const fx = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
      const fy = Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1
      
      // 确保在通道上，不在起点/终点，不重复
      if (
        newMaze[fy][fx] === 0 && 
        !(fx === 1 && fy === 1) && 
        !(fx === MAZE_SIZE - 2 && fy === MAZE_SIZE - 2) &&
        !newFragments.some(f => f.x === fx && f.y === fy) &&
        // 确保碎片分布在迷宫各处
        (fx > 5 || fy > 5)
      ) {
        newFragments.push({ x: fx, y: fy })
      }
    }
    
    setFragments(newFragments)
    setCollected(0)
    setTimeLeft(120)
    setMoves(0)
    setGameOver(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const endGame = useCallback((won: boolean) => {
    setGameOver(true)
    setGameStarted(false)
    const timeBonus = Math.max(0, timeLeft * 2)
    const collectBonus = collected * 15
    const efficiency = moves > 0 ? Math.max(0, 100 - Math.floor(moves / 5)) : 100
    const finalScore = (won ? 100 : 0) + timeBonus + collectBonus + efficiency
    const completion = won ? Math.min(100, 50 + collected * 6) : Math.min(40, collected * 5)
    onComplete(Math.max(0, finalScore), completion)
  }, [timeLeft, collected, moves, onComplete])

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !gameOver && gameStarted) {
      endGame(false)
    }
  }, [timeLeft, gameStarted, gameOver, endGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return
      
      const keyMap: Record<string, Position> = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 },
        'w': { x: 0, y: -1 },
        'W': { x: 0, y: -1 },
        's': { x: 0, y: 1 },
        'S': { x: 0, y: 1 },
        'a': { x: -1, y: 0 },
        'A': { x: -1, y: 0 },
        'd': { x: 1, y: 0 },
        'D': { x: 1, y: 0 },
      }

      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        const newX = player.x + dir.x
        const newY = player.y + dir.y
        
        if (newX >= 0 && newX < MAZE_SIZE && newY >= 0 && newY < MAZE_SIZE && maze[newY][newX] === 0) {
          setPlayer({ x: newX, y: newY })
          setMoves(m => m + 1)
          
          // 检查是否收集到碎片
          const fragIndex = fragments.findIndex(f => f.x === newX && f.y === newY)
          if (fragIndex !== -1) {
            setFragments(prev => prev.filter((_, i) => i !== fragIndex))
            setCollected(c => c + 1)
          }
          
          // 检查是否到达终点
          if (newX === MAZE_SIZE - 2 && newY === MAZE_SIZE - 2) {
            endGame(true)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, gameOver, player, maze, fragments, endGame])

  const startGame = () => {
    setShowIntro(false)
    initGame()
    setGameStarted(true)
  }

  // 游戏介绍界面
  if (showIntro && !gameStarted) {
    return (
      <div className="digital-frame text-center py-6">
        <h2 className="text-2xl text-yellow-400 mb-4 glow-text">{'\uD83C\uDFF0'} 迷宫探索</h2>
        <p className="text-gray-300 mb-2">繁盛纪元 - 文明的探索</p>
        
        <div className="my-6 p-4 bg-black bg-opacity-50 rounded-lg text-left max-w-md mx-auto">
          <h3 className="text-yellow-400 mb-3 text-lg font-bold">{'\uD83D\uDCD6'} 游戏说明</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">{'\uD83C\uDFAF'}</span>
              <div>
                <p className="text-white font-bold">目标</p>
                <p className="text-gray-400">从左上角出发，找到通往右下角出口的路径</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">{'\uD83C\uDFAE'}</span>
              <div>
                <p className="text-white font-bold">操作</p>
                <p className="text-gray-400">使用 {'\u2191\u2193\u2190\u2192'} 方向键 或 WASD 移动角色</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">{'\uD83D\uDC8E'}</span>
              <div>
                <p className="text-white font-bold">收集碎片</p>
                <p className="text-gray-400">迷宫中散落着8个记忆碎片，收集它们获得额外分数</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-yellow-400">{'\u23F1'}</span>
              <div>
                <p className="text-white font-bold">时间限制</p>
                <p className="text-gray-400">120秒内完成探索，剩余时间越多分数越高</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} 提示：迷宫有多条路径，选择最优路线收集更多碎片！
            </p>
          </div>
        </div>
        
        <button onClick={startGame} className="btn-primary bg-yellow-600 hover:bg-yellow-500 px-8 py-3 text-lg">
          {'\uD83D\uDE80'} 开始探索
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-yellow-400 glow-text">{'\uD83C\uDFF0'} 迷宫探索</h2>
        <div className="flex gap-4 text-sm">
          <span className={timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-gray-300'}>
            {'\u23F1'} {timeLeft}秒
          </span>
          <span className="text-yellow-400">{'\uD83D\uDC8E'} {collected}/8</span>
          <span className="text-gray-400">步数: {moves}</span>
        </div>
      </div>

      <div 
        className="mx-auto border-2 border-yellow-400 bg-black relative overflow-hidden"
        style={{ width: MAZE_SIZE * CELL_SIZE, height: MAZE_SIZE * CELL_SIZE }}
      >
        {/* 渲染迷宫 */}
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`absolute ${cell === 1 ? 'bg-gray-700' : 'bg-gray-900'}`}
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                boxShadow: cell === 1 ? 'inset 0 0 3px rgba(0,0,0,0.5)' : 'none'
              }}
            />
          ))
        )}
        
        {/* 终点 */}
        <div
          className="absolute bg-green-600 animate-pulse flex items-center justify-center text-sm"
          style={{
            left: (MAZE_SIZE - 2) * CELL_SIZE,
            top: (MAZE_SIZE - 2) * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        >
          {'\uD83D\uDEAA'}
        </div>
        
        {/* 碎片 */}
        {fragments.map((frag, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center text-sm animate-bounce"
            style={{
              left: frag.x * CELL_SIZE,
              top: frag.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
            {'\uD83D\uDC8E'}
          </div>
        ))}
        
        {/* 玩家 */}
        <div
          className="absolute bg-yellow-400 rounded-full flex items-center justify-center transition-all duration-75 shadow-lg"
          style={{
            left: player.x * CELL_SIZE + 2,
            top: player.y * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            boxShadow: '0 0 10px rgba(255,200,0,0.5)'
          }}
        >
          {'\uD83E\uDDED'}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        使用方向键或WASD移动 | 目标：到达右下角出口 {'\uD83D\uDEAA'}
      </p>

      {gameOver && (
        <div className="mt-4 p-4 border-2 border-yellow-500 rounded-lg bg-yellow-900 bg-opacity-20 text-center">
          <p className="text-yellow-400 font-bold mb-2 text-lg">
            {player.x === MAZE_SIZE - 2 && player.y === MAZE_SIZE - 2 ? '\uD83C\uDF89 成功逃出迷宫！' : '\u23F0 时间到！'}
          </p>
          <p className="text-gray-300 mb-1">收集碎片: {collected}/8</p>
          <p className="text-gray-400 text-sm mb-3">总步数: {moves}</p>
          <button onClick={startGame} className="btn-primary bg-yellow-600 hover:bg-yellow-500">
            再玩一次
          </button>
        </div>
      )}
    </div>
  )
}
