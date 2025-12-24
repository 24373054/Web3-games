'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface Position {
  x: number
  y: number
}

interface SnakeGameProps {
  onComplete: (score: number, completion: number) => void
  provider: unknown
  account: string | null
}

const GRID_SIZE = 15
const CELL_SIZE = 24
const INITIAL_SPEED = 200
const TARGET_SCORE = 100

export default function SnakeGame({ onComplete }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }])
  const [food, setFood] = useState<Position>({ x: 12, y: 7 })
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [speed] = useState(INITIAL_SPEED)
  
  const directionRef = useRef(direction)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scoreRef = useRef(score)

  // 同步score到ref
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y))
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 7, y: 7 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection({ x: 1, y: 0 })
    directionRef.current = { x: 1, y: 0 }
    setScore(0)
    scoreRef.current = 0
    setGameOver(false)
    setGameStarted(false)
  }, [generateFood])

  const endGame = useCallback((finalScore: number) => {
    setGameOver(true)
    setGameStarted(false)
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
    const completion = Math.min(100, Math.round((finalScore / TARGET_SCORE) * 100))
    onComplete(finalScore, completion)
  }, [onComplete])

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0]
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y
      }

      // 检查是否撞墙
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame(scoreRef.current)
        return prevSnake
      }

      // 检查是否撞到自己
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        endGame(scoreRef.current)
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // 检查是否吃到食物
      setFood(currentFood => {
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          const newScore = scoreRef.current + 10
          setScore(newScore)
          scoreRef.current = newScore
          if (newScore >= TARGET_SCORE) {
            endGame(newScore)
          }
          return generateFood(newSnake)
        }
        newSnake.pop()
        return currentFood
      })

      return newSnake
    })
  }, [generateFood, endGame])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed)
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, speed, moveSnake])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return
      
      const keyMap: Record<string, Position> = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 },
        'w': { x: 0, y: -1 },
        's': { x: 0, y: 1 },
        'a': { x: -1, y: 0 },
        'd': { x: 1, y: 0 },
      }

      const newDir = keyMap[e.key]
      if (newDir) {
        if (directionRef.current.x + newDir.x !== 0 || directionRef.current.y + newDir.y !== 0) {
          directionRef.current = newDir
          setDirection(newDir)
        }
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted, gameOver])

  const startGame = () => {
    resetGame()
    setGameStarted(true)
  }

  if (!gameStarted && !gameOver) {
    return (
      <div className="digital-frame text-center py-6">
        <h2 className="text-2xl text-green-400 mb-4 glow-text">{'\uD83D\uDC0D'} 贪吃蛇</h2>
        <p className="text-gray-300 mb-2">萌芽纪元 - 生命的成长</p>
        
        <div className="my-6 p-4 bg-black bg-opacity-50 rounded-lg text-left max-w-md mx-auto">
          <h3 className="text-green-400 mb-3 text-lg font-bold">{'\uD83D\uDCD6'} 游戏说明</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-400">{'\uD83C\uDFAF'}</span>
              <div>
                <p className="text-white font-bold">目标</p>
                <p className="text-gray-400">控制小蛇吃食物，获得{TARGET_SCORE}分即可通关</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400">{'\uD83C\uDFAE'}</span>
              <div>
                <p className="text-white font-bold">操作</p>
                <p className="text-gray-400">使用 {'\u2191\u2193\u2190\u2192'} 方向键 或 WASD 控制蛇的移动方向</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400">{'\uD83C\uDF4E'}</span>
              <div>
                <p className="text-white font-bold">吃食物</p>
                <p className="text-gray-400">每吃一个食物得10分，蛇身会变长一节</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-400">{'\u26A0\uFE0F'}</span>
              <div>
                <p className="text-white font-bold">注意</p>
                <p className="text-gray-400">撞到墙壁或自己的身体会导致游戏结束</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} 提示：蛇不能掉头，规划好路线避免把自己困住！
            </p>
          </div>
        </div>
        
        <button onClick={startGame} className="btn-primary bg-green-600 hover:bg-green-500 px-8 py-3 text-lg">
          {'\uD83D\uDE80'} 开始游戏
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-green-400 glow-text">🐍 贪吃蛇</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">得分: {score}/{TARGET_SCORE}</span>
        </div>
      </div>

      <div 
        className="mx-auto border-2 border-green-400 bg-black relative"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${index === 0 ? 'bg-green-400' : 'bg-green-600'} rounded-sm`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />
        ))}
        <div
          className="absolute bg-yellow-400 rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
          }}
        />
      </div>

      {gameOver && (
        <div className="mt-4 p-4 border-2 border-green-500 rounded-lg bg-green-900 bg-opacity-20 text-center">
          <p className="text-green-400 font-bold mb-2">
            {score >= TARGET_SCORE ? '🎉 恭喜通关！' : '💀 游戏结束'}
          </p>
          <p className="text-gray-300 mb-4">最终得分: {score}</p>
          <button onClick={startGame} className="btn-primary bg-green-600 hover:bg-green-500">
            再玩一次
          </button>
        </div>
      )}
    </div>
  )
}
