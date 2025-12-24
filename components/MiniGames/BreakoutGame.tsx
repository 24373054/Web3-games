'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 500
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_WIDTH = 45
const BRICK_HEIGHT = 18
const BRICK_PADDING = 4

interface Brick {
  x: number
  y: number
  alive: boolean
  color: string
}

interface BreakoutGameProps {
  onComplete: (score: number, completion: number) => void
  provider: unknown
  account: string | null
}

export default function BreakoutGame({ onComplete }: BreakoutGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  
  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 50,
    ballDX: 1.5,
    ballDY: -1.5,
    ballSpeed: 1.5,
    bricksDestroyed: 0,
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
    running: false
  })

  const initBricks = useCallback(() => {
    const bricks: Brick[] = []
    const colors = ['#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF']
    const startX = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING))) / 2
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: startX + col * (BRICK_WIDTH + BRICK_PADDING),
          y: 60 + row * (BRICK_HEIGHT + BRICK_PADDING),
          alive: true,
          color: colors[row]
        })
      }
    }
    return bricks
  }, [])

  const resetBall = useCallback(() => {
    const state = gameStateRef.current
    state.ballX = CANVAS_WIDTH / 2
    state.ballY = CANVAS_HEIGHT - 50
    const speed = state.ballSpeed
    state.ballDX = (Math.random() > 0.5 ? 1 : -1) * speed
    state.ballDY = -speed
  }, [])

  const initGame = useCallback(() => {
    const state = gameStateRef.current
    state.paddleX = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2
    state.bricks = initBricks()
    state.score = 0
    state.lives = 3
    state.ballSpeed = 1.5
    state.bricksDestroyed = 0
    resetBall()
    setScore(0)
    setLives(3)
    setGameOver(false)
  }, [initBricks, resetBall])

  const endGame = useCallback(() => {
    gameStateRef.current.running = false
    setGameOver(true)
    setGameStarted(false)
    const finalScore = gameStateRef.current.score
    const totalBricks = BRICK_ROWS * BRICK_COLS
    const destroyed = totalBricks - gameStateRef.current.bricks.filter((b: Brick) => b.alive).length
    const completion = Math.round((destroyed / totalBricks) * 100)
    onComplete(finalScore, completion)
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      const state = gameStateRef.current
      
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      state.bricks.forEach((brick: Brick) => {
        if (brick.alive) {
          ctx.fillStyle = brick.color
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
          ctx.strokeStyle = '#ffffff33'
          ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
        }
      })
      
      ctx.fillStyle = '#FF4444'
      ctx.fillRect(state.paddleX, CANVAS_HEIGHT - 30, PADDLE_WIDTH, PADDLE_HEIGHT)
      
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.closePath()
      
      ctx.fillStyle = '#FF4444'
      ctx.font = '16px monospace'
      ctx.fillText(`\u5206\u6570: ${state.score}`, 10, 25)
      ctx.fillText(`\u751F\u547D: ${'\u2764'.repeat(state.lives)}`, 10, 45)

      if (!state.running) return

      state.ballX += state.ballDX
      state.ballY += state.ballDY

      if (state.ballX <= BALL_RADIUS || state.ballX >= CANVAS_WIDTH - BALL_RADIUS) {
        state.ballDX = -state.ballDX
      }
      if (state.ballY <= BALL_RADIUS) {
        state.ballDY = -state.ballDY
      }

      if (
        state.ballY >= CANVAS_HEIGHT - 30 - BALL_RADIUS &&
        state.ballY <= CANVAS_HEIGHT - 30 &&
        state.ballX >= state.paddleX &&
        state.ballX <= state.paddleX + PADDLE_WIDTH
      ) {
        state.ballDY = -Math.abs(state.ballDY)
        const hitPos = (state.ballX - state.paddleX) / PADDLE_WIDTH
        state.ballDX = (hitPos - 0.5) * (state.ballSpeed * 2.5)
      }

      state.bricks.forEach((brick: Brick) => {
        if (brick.alive &&
          state.ballX >= brick.x &&
          state.ballX <= brick.x + BRICK_WIDTH &&
          state.ballY >= brick.y &&
          state.ballY <= brick.y + BRICK_HEIGHT
        ) {
          brick.alive = false
          state.ballDY = -state.ballDY
          state.score += 10
          state.bricksDestroyed++
          setScore(state.score)
          
          // 每击碎8个砖块，球速增加0.2，最高3.5
          if (state.bricksDestroyed % 8 === 0 && state.ballSpeed < 3.5) {
            state.ballSpeed += 0.2
            const speedRatio = state.ballSpeed / (state.ballSpeed - 0.2)
            state.ballDX *= speedRatio
            state.ballDY *= speedRatio
          }
        }
      })

      if (state.bricks.every((b: Brick) => !b.alive)) {
        endGame()
        return
      }

      if (state.ballY >= CANVAS_HEIGHT) {
        state.lives--
        setLives(state.lives)
        if (state.lives <= 0) {
          endGame()
          return
        }
        resetBall()
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    if (gameStarted && !gameOver) {
      animationId = requestAnimationFrame(draw)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [gameStarted, gameOver, endGame, resetBall])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !gameStarted) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - PADDLE_WIDTH / 2
      gameStateRef.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return
      const state = gameStateRef.current
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        state.paddleX = Math.max(0, state.paddleX - 30)
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        state.paddleX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX + 30)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [gameStarted])

  const startGame = () => {
    initGame()
    gameStateRef.current.running = true
    setGameStarted(true)
  }

  if (!gameStarted && !gameOver) {
    return (
      <div className="digital-frame text-center py-6">
        <h2 className="text-2xl text-red-400 mb-4 glow-text">{'\uD83E\uDDF1'} 打砖块</h2>
        <p className="text-gray-300 mb-2">熵化纪元 - 秩序的崩塌</p>
        
        <div className="my-6 p-4 bg-black bg-opacity-50 rounded-lg text-left max-w-md mx-auto">
          <h3 className="text-red-400 mb-3 text-lg font-bold">{'\uD83D\uDCD6'} 游戏说明</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-red-400">{'\uD83C\uDFAF'}</span>
              <div>
                <p className="text-white font-bold">目标</p>
                <p className="text-gray-400">用球击碎屏幕上方的所有砖块</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-red-400">{'\uD83C\uDFAE'}</span>
              <div>
                <p className="text-white font-bold">操作</p>
                <p className="text-gray-400">移动鼠标 或 使用 {'\u2190\u2192'} / A D 键控制底部挡板</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-red-400">{'\uD83D\uDCAF'}</span>
              <div>
                <p className="text-white font-bold">得分</p>
                <p className="text-gray-400">每击碎一块砖块得10分，球速会逐渐加快</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-red-400">{'\u2764\uFE0F'}</span>
              <div>
                <p className="text-white font-bold">生命</p>
                <p className="text-gray-400">共3条生命，球掉落到底部会失去一条</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} 提示：用挡板边缘击球可以改变球的角度！
            </p>
          </div>
        </div>
        
        <button onClick={startGame} className="btn-primary bg-red-600 hover:bg-red-500 px-8 py-3 text-lg">
          {'\uD83D\uDE80'} 开始游戏
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-red-400 glow-text">? 打砖块</h2>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="mx-auto border-2 border-red-400 cursor-none"
      />

      {gameOver && (
        <div className="mt-4 p-4 border-2 border-red-500 rounded-lg bg-red-900 bg-opacity-20 text-center">
          <p className="text-red-400 font-bold mb-2">
            {gameStateRef.current.bricks.every((b: Brick) => !b.alive) ? '? 全部击碎！' : '? 游戏结束'}
          </p>
          <p className="text-gray-300 mb-4">最终得分: {score}</p>
          <button onClick={startGame} className="btn-primary bg-red-600 hover:bg-red-500">
            再玩一次
          </button>
        </div>
      )}
    </div>
  )
}
