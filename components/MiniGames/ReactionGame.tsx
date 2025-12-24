'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface Target {
  id: number
  x: number
  y: number
  size: number
  color: string
  createdAt: number
  lifetime: number
}

interface ReactionGameProps {
  onComplete: (score: number, completion: number) => void
  provider: unknown
  account: string | null
}

const GAME_DURATION = 30
const ARENA_SIZE = 400
const TARGET_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']

export default function ReactionGame({ onComplete }: ReactionGameProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targets, setTargets] = useState<Target[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  
  const targetIdRef = useRef(0)
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hitsRef = useRef(0)
  const missesRef = useRef(0)
  const scoreRef = useRef(0)

  useEffect(() => {
    hitsRef.current = hits
    missesRef.current = misses
    scoreRef.current = score
  }, [hits, misses, score])

  const spawnTarget = useCallback(() => {
    const size = 30 + Math.random() * 30
    const newTarget: Target = {
      id: targetIdRef.current++,
      x: Math.random() * (ARENA_SIZE - size),
      y: Math.random() * (ARENA_SIZE - size),
      size,
      color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
      createdAt: Date.now(),
      lifetime: 1500 + Math.random() * 1000
    }
    setTargets(prev => [...prev, newTarget])
  }, [])

  const removeExpiredTargets = useCallback(() => {
    const now = Date.now()
    setTargets(prev => {
      const expired = prev.filter(t => now - t.createdAt > t.lifetime)
      if (expired.length > 0) {
        setMisses(m => m + expired.length)
        setCombo(0)
      }
      return prev.filter(t => now - t.createdAt <= t.lifetime)
    })
  }, [])

  const hitTarget = useCallback((targetId: number) => {
    setTargets(prev => prev.filter(t => t.id !== targetId))
    setHits(h => h + 1)
    setCombo(c => {
      const newCombo = c + 1
      if (newCombo > maxCombo) setMaxCombo(newCombo)
      const comboBonus = Math.min(newCombo, 10)
      const points = 10 + comboBonus * 2
      setScore(s => s + points)
      return newCombo
    })
  }, [maxCombo])

  const endGame = useCallback(() => {
    setGameOver(true)
    setGameStarted(false)
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
    }
    
    const h = hitsRef.current
    const m = missesRef.current
    const s = scoreRef.current
    const accuracy = h + m > 0 ? (h / (h + m)) * 100 : 0
    const completion = Math.min(100, Math.round(accuracy * 0.6 + (s / 200) * 40))
    onComplete(s, completion)
  }, [onComplete])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            endGame()
            return 0
          }
          return t - 1
        })
      }, 1000)

      spawnIntervalRef.current = setInterval(() => {
        spawnTarget()
        removeExpiredTargets()
      }, 600)

      return () => {
        clearInterval(timer)
        if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
      }
    }
  }, [gameStarted, gameOver, spawnTarget, removeExpiredTargets, endGame])

  const startGame = () => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setTargets([])
    setHits(0)
    setMisses(0)
    setCombo(0)
    setMaxCombo(0)
    targetIdRef.current = 0
    hitsRef.current = 0
    missesRef.current = 0
    scoreRef.current = 0
    setGameOver(false)
    setGameStarted(true)
  }

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const hitAny = targets.some(t => 
      x >= t.x && x <= t.x + t.size && y >= t.y && y <= t.y + t.size
    )
    if (!hitAny && gameStarted) {
      setMisses(m => m + 1)
      setCombo(0)
    }
  }

  if (!gameStarted && !gameOver) {
    return (
      <div className="digital-frame text-center py-6">
        <h2 className="text-2xl text-purple-400 mb-4 glow-text">{'\u26A1'} 反应测试</h2>
        <p className="text-gray-300 mb-2">毁灭纪元 - 最后的挣扎</p>
        
        <div className="my-6 p-4 bg-black bg-opacity-50 rounded-lg text-left max-w-md mx-auto">
          <h3 className="text-purple-400 mb-3 text-lg font-bold">{'\uD83D\uDCD6'} 游戏说明</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-purple-400">{'\uD83C\uDFAF'}</span>
              <div>
                <p className="text-white font-bold">目标</p>
                <p className="text-gray-400">在{GAME_DURATION}秒内尽可能多地点击出现的目标</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-purple-400">{'\uD83D\uDC46'}</span>
              <div>
                <p className="text-white font-bold">操作</p>
                <p className="text-gray-400">用鼠标点击屏幕上出现的彩色圆形目标</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-purple-400">{'\uD83D\uDD25'}</span>
              <div>
                <p className="text-white font-bold">连击系统</p>
                <p className="text-gray-400">连续命中可获得连击加分，失误会重置连击</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-purple-400">{'\u23F1'}</span>
              <div>
                <p className="text-white font-bold">时间限制</p>
                <p className="text-gray-400">目标会在短时间内消失，错过也算失误</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} 提示：保持专注，优先点击即将消失的目标！
            </p>
          </div>
        </div>
        
        <button onClick={startGame} className="btn-primary bg-purple-600 hover:bg-purple-500 px-8 py-3 text-lg">
          {'\uD83D\uDE80'} 开始测试
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-purple-400 glow-text">⚡ 反应测试</h2>
        <div className="flex gap-4 text-sm">
          <span className={timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-gray-300'}>
            ⏱️ {timeLeft}秒
          </span>
          <span className="text-purple-400">得分: {score}</span>
          <span className="text-yellow-400">连击: {combo}x</span>
        </div>
      </div>

      <div 
        className="mx-auto border-2 border-purple-400 bg-black relative cursor-crosshair overflow-hidden"
        style={{ width: ARENA_SIZE, height: ARENA_SIZE }}
        onClick={handleArenaClick}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(purple 1px, transparent 1px), linear-gradient(90deg, purple 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        
        {targets.map(target => {
          const age = Date.now() - target.createdAt
          const opacity = 1 - (age / target.lifetime) * 0.5
          return (
            <div
              key={target.id}
              className="absolute rounded-full cursor-pointer transform hover:scale-110 transition-transform"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
                backgroundColor: target.color,
                opacity,
                boxShadow: `0 0 20px ${target.color}`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                hitTarget(target.id)
              }}
            />
          )
        })}

        {combo >= 3 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-yellow-400 animate-bounce">
            {combo}x COMBO!
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-8 text-sm">
        <span className="text-green-400">命中: {hits}</span>
        <span className="text-red-400">失误: {misses}</span>
        <span className="text-yellow-400">最高连击: {maxCombo}</span>
      </div>

      {gameOver && (
        <div className="mt-4 p-4 border-2 border-purple-500 rounded-lg bg-purple-900 bg-opacity-20 text-center">
          <p className="text-purple-400 font-bold mb-2">⏰ 时间到！</p>
          <p className="text-gray-300 mb-1">最终得分: {score}</p>
          <p className="text-gray-400 text-sm mb-4">
            命中率: {hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%
          </p>
          <button onClick={startGame} className="btn-primary bg-purple-600 hover:bg-purple-500">
            再玩一次
          </button>
        </div>
      )}
    </div>
  )
}
