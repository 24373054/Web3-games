/**
 * 瀛州纪 - 小游戏系统
 * 6个触发式小游戏
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MinigamesProps {
  gameId: string
  onComplete: (score: number, timeUsed: number, accuracy: number, mistakes: number) => void
  onClose: () => void
}

export default function Minigames({ gameId, onComplete, onClose }: MinigamesProps) {
  switch (gameId) {
    case 'memory_sorting':
      return <MemorySorting onComplete={onComplete} onClose={onClose} />
    case 'handshake_protocol':
      return <HandshakeProtocol onComplete={onComplete} onClose={onClose} />
    case 'resource_balancing':
      return <ResourceBalancing onComplete={onComplete} onClose={onClose} />
    case 'code_building':
      return <CodeBuilding onComplete={onComplete} onClose={onClose} />
    case 'future_deduction':
      return <FutureDeduction onComplete={onComplete} onClose={onClose} />
    case 'chaos_maze':
      return <ChaosMaze onComplete={onComplete} onClose={onClose} />
    default:
      return <div className="text-white">未知游戏</div>
  }
}

/**
 * 1. 记忆排序（史官专属）
 * 按时间顺序排列事件
 */
function MemorySorting({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [items, setItems] = useState<string[]>([])
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const correctOrder = [
    '创世 - 第一笔交易',
    '涌现 - 握手协议建立',
    '繁荣 - 黄金时代',
    '熵增 - 混乱开始',
    '崩塌 - 最后区块'
  ]
  
  useEffect(() => {
    setItems([...correctOrder].sort(() => Math.random() - 0.5))
  }, [])
  
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newItems = [...items]
      ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
      setItems(newItems)
    } else if (direction === 'down' && index < items.length - 1) {
      const newItems = [...items]
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      setItems(newItems)
    }
  }
  
  const checkAnswer = () => {
    const isCorrect = JSON.stringify(items) === JSON.stringify(correctOrder)
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isCorrect ? 1 : 0
    
    if (!isCorrect) {
      setMistakes(mistakes + 1)
      alert('顺序不对，再试试！')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">记忆排序</h2>
      <p className="text-gray-300 mb-6">将事件按时间顺序排列</p>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveItem(index, 'up')}
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs"
                disabled={index === 0}
              >
                ↑
              </button>
              <button
                onClick={() => moveItem(index, 'down')}
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs"
                disabled={index === items.length - 1}
              >
                ↓
              </button>
            </div>
            <div className="flex-1">{item}</div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

/**
 * 2. 握手协议（工匠专属）
 * 配对正确的连接
 */
function HandshakeProtocol({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [connections, setConnections] = useState<{[key: string]: string}>({})
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const nodes = ['A', 'B', 'C', 'D']
  const correctPairs: {[key: string]: string} = { 'A': 'D', 'B': 'C', 'C': 'B', 'D': 'A' }
  
  const connect = (from: string, to: string) => {
    setConnections({ ...connections, [from]: to })
  }
  
  const checkAnswer = () => {
    const isCorrect = JSON.stringify(connections) === JSON.stringify(correctPairs)
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isCorrect ? 1 : 0
    
    if (!isCorrect) {
      setMistakes(mistakes + 1)
      alert('连接不对，再试试！')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">握手协议</h2>
      <p className="text-gray-300 mb-6">建立正确的节点连接 (A-D, B-C)</p>
      
      <div className="grid grid-cols-2 gap-8 mb-6">
        {nodes.map(node => (
          <div key={node} className="space-y-2">
            <div className="text-center font-bold text-xl mb-2">{node}</div>
            <div className="flex gap-2">
              {nodes.map(target => (
                <button
                  key={target}
                  onClick={() => connect(node, target)}
                  className={`flex-1 px-3 py-2 rounded ${
                    connections[node] === target 
                      ? 'bg-cyan-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-400 text-center">
              → {connections[node] || '?'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

/**
 * 3. 资源平衡（商序专属）
 * 平衡资源分配
 */
function ResourceBalancing({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [values, setValues] = useState([50, 50, 50])
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const target = 100
  const total = values.reduce((a, b) => a + b, 0)
  
  const adjust = (index: number, delta: number) => {
    const newValues = [...values]
    newValues[index] = Math.max(0, Math.min(200, newValues[index] + delta))
    setValues(newValues)
  }
  
  const checkAnswer = () => {
    const isBalanced = values.every(v => Math.abs(v - target) < 5)
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isBalanced ? 1 : 0
    
    if (!isBalanced) {
      setMistakes(mistakes + 1)
      alert('还没有平衡！每个值都要接近 100')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">资源平衡</h2>
      <p className="text-gray-300 mb-6">将三个资源都调整到 100 左右</p>
      
      <div className="space-y-6 mb-6">
        {values.map((value, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span>资源 {index + 1}</span>
              <span className="font-bold text-xl">{value}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => adjust(index, -10)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                -10
              </button>
              <div className="flex-1 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-cyan-600 transition-all"
                  style={{ width: `${(value / 200) * 100}%` }}
                />
              </div>
              <button
                onClick={() => adjust(index, 10)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                +10
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400">总和: {total}</div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

/**
 * 4. 代码构建（工匠专属）
 * 简单的编程逻辑题
 */
function CodeBuilding({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [answer, setAnswer] = useState('')
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const question = "function sum(a, b) { return __ }"
  const correctAnswer = "a + b"
  
  const checkAnswer = () => {
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase()
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isCorrect ? 1 : 0
    
    if (!isCorrect) {
      setMistakes(mistakes + 1)
      alert('不对，再想想！')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">代码构建</h2>
      <p className="text-gray-300 mb-6">完成这个函数</p>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-6 font-mono">
        <pre className="text-green-400">{question}</pre>
      </div>
      
      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="填入空白处的代码..."
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-6"
        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
      />
      
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

/**
 * 5. 未来推演（先知专属）
 * 预测序列的下一项
 */
function FutureDeduction({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [answer, setAnswer] = useState('')
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const sequence = [2, 4, 8, 16, 32]
  const correctAnswer = "64"
  
  const checkAnswer = () => {
    const isCorrect = answer.trim() === correctAnswer
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isCorrect ? 1 : 0
    
    if (!isCorrect) {
      setMistakes(mistakes + 1)
      alert('不对，观察规律再试试！')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">未来推演</h2>
      <p className="text-gray-300 mb-6">预测序列的下一个数字</p>
      
      <div className="flex items-center justify-center gap-4 mb-8 text-4xl font-bold">
        {sequence.map((num, i) => (
          <div key={i} className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
            {num}
          </div>
        ))}
        <div className="text-purple-400">→</div>
        <div className="w-16 h-16 bg-gray-800 border-2 border-purple-500 rounded-lg flex items-center justify-center text-2xl">
          ?
        </div>
      </div>
      
      <input
        type="number"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="输入下一个数字..."
        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-6 text-center text-2xl"
        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
      />
      
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

/**
 * 6. 混沌迷宫（熵化者专属）
 * 找到正确的路径
 */
function ChaosMaze({ onComplete, onClose }: { onComplete: any, onClose: any }) {
  const [path, setPath] = useState<number[]>([])
  const [startTime] = useState(Date.now())
  const [mistakes, setMistakes] = useState(0)
  
  const maze = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 2]
  ]
  
  const correctPath = [0, 4, 5, 9, 13, 14, 15]
  
  const toggleCell = (index: number) => {
    if (path.includes(index)) {
      setPath(path.filter(p => p !== index))
    } else {
      setPath([...path, index])
    }
  }
  
  const checkAnswer = () => {
    const isCorrect = JSON.stringify(path.sort((a, b) => a - b)) === JSON.stringify(correctPath)
    const timeUsed = (Date.now() - startTime) / 1000
    const accuracy = isCorrect ? 1 : 0
    
    if (!isCorrect) {
      setMistakes(mistakes + 1)
      alert('路径不对！从左上到右下')
      return
    }
    
    onComplete(100, timeUsed, accuracy, mistakes)
  }
  
  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-red-400 mb-4">混沌迷宫</h2>
      <p className="text-gray-300 mb-6">找到从起点(1)到终点(2)的路径</p>
      
      <div className="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto">
        {maze.flat().map((cell, index) => (
          <button
            key={index}
            onClick={() => toggleCell(index)}
            className={`aspect-square rounded-lg text-xl font-bold transition-colors ${
              cell === 1 
                ? path.includes(index)
                  ? 'bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
                : cell === 2
                ? 'bg-green-600'
                : 'bg-black'
            }`}
            disabled={cell === 0}
          >
            {cell === 1 ? '○' : cell === 2 ? '★' : ''}
          </button>
        ))}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
        >
          提交答案
        </button>
        <button
          onClick={() => setPath([])}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
        >
          重置
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
        >
          放弃
        </button>
      </div>
    </div>
  )
}

