'use client'

import { useState, useEffect, useRef } from 'react'

interface MemorySortGameProps {
  onComplete: (score: number, completion: number) => void
  provider: unknown
  account: string | null
}

type GamePhase = 'ready' | 'showing' | 'input' | 'result'

export default function MemorySortGame({ onComplete }: MemorySortGameProps) {
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [level, setLevel] = useState(1)
  const [numbers, setNumbers] = useState<number[]>([])
  const [currentShowIndex, setCurrentShowIndex] = useState(-1)
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [message, setMessage] = useState('')
  const [showingNumber, setShowingNumber] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 生成随机数字序列
  const generateNumbers = (len: number): number[] => {
    const nums: number[] = []
    for (let i = 0; i < len; i++) {
      nums.push(Math.floor(Math.random() * 10))
    }
    return nums
  }

  // 开始新一轮
  const startRound = () => {
    const len = level + 2 // 第1关3个数字，第2关4个，以此类推
    const nums = generateNumbers(len)
    setNumbers(nums)
    setUserInput('')
    setMessage('')
    setPhase('showing')
    setCurrentShowIndex(0)
  }

  // 显示数字序列
  useEffect(() => {
    if (phase !== 'showing') return
    if (currentShowIndex < 0) return

    if (currentShowIndex < numbers.length) {
      // 显示当前数字
      setShowingNumber(numbers[currentShowIndex])
      
      const timer = setTimeout(() => {
        setShowingNumber(null)
        // 短暂间隔后显示下一个
        setTimeout(() => {
          setCurrentShowIndex(currentShowIndex + 1)
        }, 200)
      }, 800) // 每个数字显示800ms
      
      return () => clearTimeout(timer)
    } else {
      // 所有数字显示完毕，进入输入阶段
      setPhase('input')
      setCurrentShowIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase, currentShowIndex, numbers])

  // 检查答案
  const checkAnswer = () => {
    const correctAnswer = numbers.join('')
    if (userInput === correctAnswer) {
      // 正确
      const roundScore = level * 10 + numbers.length * 5
      setScore(score + roundScore)
      setMessage(`\u2713 \u6B63\u786E\uFF01+${roundScore}\u5206`)
      
      if (level >= 5) {
        // 通关
        setTimeout(() => {
          const finalScore = score + roundScore
          const completion = 100
          onComplete(finalScore, completion)
          setPhase('result')
        }, 1000)
      } else {
        // 下一关
        setTimeout(() => {
          setLevel(level + 1)
          startRound()
        }, 1500)
      }
    } else {
      // 错误
      setLives(lives - 1)
      setMessage(`\u2717 \u9519\u8BEF\uFF01\u6B63\u786E\u7B54\u6848\uFF1A${correctAnswer}`)
      
      if (lives <= 1) {
        // 游戏结束
        setTimeout(() => {
          const completion = Math.round((level / 5) * 100)
          onComplete(score, completion)
          setPhase('result')
        }, 1500)
      } else {
        // 重试当前关
        setTimeout(() => {
          startRound()
        }, 2000)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  const startGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setMessage('')
    startRound()
  }

  const restartGame = () => {
    setPhase('ready')
    setLevel(1)
    setScore(0)
    setLives(3)
    setNumbers([])
    setUserInput('')
    setMessage('')
  }

  // 准备界面
  if (phase === 'ready') {
    return (
      <div className="digital-frame text-center py-6">
        <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">{'\uD83E\uDDE0'} 记忆数字</h2>
        <p className="text-gray-300 mb-2">创世纪元 - 记忆的起源</p>
        
        <div className="my-6 p-4 bg-black bg-opacity-50 rounded-lg text-left max-w-md mx-auto">
          <h3 className="text-cyan-400 mb-3 text-lg font-bold">{'\uD83D\uDCD6'} 游戏说明</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">{'\uD83C\uDFAF'}</span>
              <div>
                <p className="text-white font-bold">目标</p>
                <p className="text-gray-400">记住屏幕上闪现的数字序列，并按顺序输入</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">{'\uD83D\uDC41'}</span>
              <div>
                <p className="text-white font-bold">观察</p>
                <p className="text-gray-400">数字会一个接一个地闪现，每个显示约1秒</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">{'\u2328\uFE0F'}</span>
              <div>
                <p className="text-white font-bold">输入</p>
                <p className="text-gray-400">所有数字显示完后，按顺序输入你记住的数字</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-cyan-400">{'\uD83D\uDCC8'}</span>
              <div>
                <p className="text-white font-bold">难度递增</p>
                <p className="text-gray-400">共5关：第1关3个数字，每关增加1个</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              {'\uD83D\uDCA1'} 提示：可以在心里默念数字来帮助记忆！
            </p>
          </div>
        </div>
        
        <button onClick={startGame} className="btn-primary bg-cyan-600 hover:bg-cyan-500 px-8 py-3 text-lg">
          {'\uD83D\uDE80'} 开始游戏
        </button>
      </div>
    )
  }

  // 结果界面
  if (phase === 'result') {
    const isWin = level > 5 || (level === 5 && lives > 0)
    return (
      <div className="digital-frame text-center py-8">
        <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">
          {isWin ? '\uD83C\uDF89 \u901A\u5173\uFF01' : '\uD83D\uDCAB \u6E38\u620F\u7ED3\u675F'}
        </h2>
        <div className="mb-6">
          <p className="text-gray-300 mb-2">最终得分: <span className="text-2xl text-cyan-400 font-bold">{score}</span></p>
          <p className="text-gray-400">到达关卡: {level}/5</p>
        </div>
        <button onClick={restartGame} className="btn-primary bg-cyan-600 hover:bg-cyan-500">
          再玩一次
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-yingzhou-cyan glow-text">{'\uD83E\uDDE0'} 记忆数字</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-300">第 {level}/5 关</span>
          <span className="text-cyan-400">得分: {score}</span>
          <span className="text-red-400">{'\u2764'.repeat(lives)}</span>
        </div>
      </div>

      {/* 数字显示区域 */}
      <div className="h-64 flex items-center justify-center mb-6 bg-black bg-opacity-50 rounded-lg border-2 border-cyan-800">
        {phase === 'showing' && showingNumber !== null && (
          <div className="text-9xl font-bold text-cyan-400 animate-pulse glow-text" style={{ fontSize: '12rem' }}>
            {showingNumber}
          </div>
        )}
        {phase === 'showing' && showingNumber === null && (
          <div className="text-2xl text-gray-600">...</div>
        )}
        {phase === 'input' && (
          <div className="text-center">
            <p className="text-gray-400 mb-4">输入你记住的数字序列</p>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder={`${numbers.length}位数字`}
              maxLength={numbers.length}
              className="text-center text-3xl font-mono w-48 px-4 py-3 bg-gray-900 border-2 border-cyan-500 rounded-lg text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* 提示信息 */}
      {message && (
        <div className={`text-center mb-4 text-lg font-bold ${message.includes('\u2713') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </div>
      )}

      {/* 操作按钮 */}
      {phase === 'input' && (
        <div className="flex gap-4">
          <button
            onClick={checkAnswer}
            disabled={userInput.length !== numbers.length}
            className="flex-1 btn-primary bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认 ({userInput.length}/{numbers.length})
          </button>
        </div>
      )}

      {/* 进度提示 */}
      <div className="mt-6 text-center text-xs text-gray-500">
        {phase === 'showing' && `正在显示第 ${Math.min(currentShowIndex + 1, numbers.length)}/${numbers.length} 个数字...`}
        {phase === 'input' && '按 Enter 键确认'}
      </div>
    </div>
  )
}
