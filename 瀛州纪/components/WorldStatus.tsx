'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getWorldLedgerContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface WorldStatusProps {
  provider: ethers.BrowserProvider | null
}

const stateNames = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
const stateColors = [
  'text-green-400',
  'text-blue-400',
  'text-purple-400',
  'text-orange-400',
  'text-red-400'
]

export default function WorldStatus({ provider }: WorldStatusProps) {
  const [worldState, setWorldState] = useState<number>(0)
  const [worldAge, setWorldAge] = useState<number>(0)
  const [entropyLevel, setEntropyLevel] = useState<number>(0)
  const [isFinalized, setIsFinalized] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 使用本地 RPC Provider 读取世界状态，避免钱包网络影响
    loadWorldStatus()
    const interval = setInterval(loadWorldStatus, 5000) // 每5秒更新
    return () => clearInterval(interval)
  }, [])

  const loadWorldStatus = async () => {
    try {
      const rpc = getRpcProvider()
      const contract = getWorldLedgerContract(rpc)
      
      const [state, age, entropy, finalized] = await Promise.all([
        contract.currentState(),
        contract.getWorldAge(),
        contract.getEntropyLevel(),
        contract.isFinalized()
      ])

      setWorldState(Number(state))
      setWorldAge(Number(age))
      setEntropyLevel(Number(entropy))
      setIsFinalized(finalized)
      setLoading(false)
    } catch (error) {
      console.error('加载世界状态失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <h3 className="text-lg font-bold mb-4 glow-text">世界状态</h3>
        <p className="loading-text">加载中...</p>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <h3 className="text-lg font-bold mb-4 glow-text">世界状态</h3>
      
      <div className="space-y-4">
        {/* 当前状态 */}
        <div className="ledger-line">
          <p className="text-xs text-gray-400 mb-1">当前纪元</p>
          <p className={`text-xl font-bold ${stateColors[worldState]}`}>
            {stateNames[worldState]}
          </p>
        </div>

        {/* 世界年龄 */}
        <div className="ledger-line">
          <p className="text-xs text-gray-400 mb-1">世界年龄</p>
          <p className="contract-text">{worldAge} 区块</p>
        </div>

        {/* 熵化程度 */}
        <div className="ledger-line">
          <p className="text-xs text-gray-400 mb-1">熵化程度</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  entropyLevel < 30 ? 'bg-green-500' :
                  entropyLevel < 60 ? 'bg-yellow-500' :
                  entropyLevel < 90 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${entropyLevel}%` }}
              />
            </div>
            <span className="contract-text">{entropyLevel}%</span>
          </div>
        </div>

        {/* 最终化状态 */}
        {isFinalized && (
          <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
            <p className="text-red-400 text-center font-bold">
              ⚠ 世界已最终化 ⚠
            </p>
          </div>
        )}

        {/* 状态描述 */}
        <div className="mt-4 p-3 bg-yingzhou-blue bg-opacity-30 rounded-lg">
          <p className="text-xs text-gray-300 leading-relaxed">
            {worldState === 0 && "创世之初，第一批数字生命觉醒..."}
            {worldState === 1 && "合约互相调用，社会秩序萌芽..."}
            {worldState === 2 && "文明达到巅峰，知识与技术繁荣..."}
            {worldState === 3 && "逻辑开始崩塌，记忆逐渐碎裂..."}
            {worldState === 4 && "最后的交易已完成，世界归于静默..."}
          </p>
        </div>
      </div>
    </div>
  )
}

