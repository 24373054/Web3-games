'use client'

import React, { useState, useEffect } from 'react'
import type { IWalletAdapter } from '@/lib/walletAdapter'
import { EPOCH_UNLOCK_REQUIREMENTS } from '@/lib/mockWallet'

const EPOCH_NAMES = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
const EPOCH_COLORS = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']
const EPOCH_ICONS = ['🌌', '🌱', '✨', '⚡', '💀']
const EPOCH_DESC = [
  '世界初生，一切从虚无中诞生',
  '生命萌发，万物开始成长',
  '文明繁盛，达到辉煌顶峰',
  '秩序崩塌，熵化侵蚀一切',
  '终焉降临，但记忆永存'
]

export default function EpochPanelWeb2({ 
  walletAdapter,
  onEpochChange
}: { 
  walletAdapter: IWalletAdapter
  onEpochChange?: (epoch: number) => void
}) {
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [fragments, setFragments] = useState<number[]>([])

  useEffect(() => {
    const loadData = () => {
      setCurrentEpoch(walletAdapter.getCurrentEpoch())
      walletAdapter.getFragments().then(setFragments)
    }
    loadData()
    // 监听 mockWallet 更新事件
    window.addEventListener('mockWalletUpdate', loadData)
    return () => window.removeEventListener('mockWalletUpdate', loadData)
  }, [walletAdapter])

  const handleAdvanceEpoch = () => {
    const result = walletAdapter.tryUnlockNextEpoch()
    alert(result.message)
    if (result.success) {
      const newEpoch = walletAdapter.getCurrentEpoch()
      setCurrentEpoch(newEpoch)
      onEpochChange?.(newEpoch)
    }
  }

  const nextReq = currentEpoch < 4 ? EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1] : 0
  const canAdvance = currentEpoch < 4 && fragments.length >= nextReq
  const progress = nextReq > 0 ? Math.min((fragments.length / nextReq) * 100, 100) : 100


  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">🌌 纪元系统</h2>
      
      <div 
        className="mb-6 p-4 border-2 rounded-lg transition-all duration-500"
        style={{ 
          borderColor: EPOCH_COLORS[currentEpoch],
          boxShadow: `0 0 15px ${EPOCH_COLORS[currentEpoch]}40`
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{EPOCH_ICONS[currentEpoch]}</span>
            <h3 className="text-xl font-bold" style={{ color: EPOCH_COLORS[currentEpoch] }}>
              {EPOCH_NAMES[currentEpoch]}纪元
            </h3>
          </div>
          <span className="text-sm text-gray-400">纪元 {currentEpoch + 1}/5</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{EPOCH_DESC[currentEpoch]}</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-3">文明演化进程</h3>
        <div className="relative">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-green-500 via-yellow-500 via-red-500 to-white transition-all duration-1000"
              style={{ width: `${(currentEpoch / 4) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {EPOCH_NAMES.map((name, index) => (
              <div
                key={index}
                className={`flex-1 text-center transition-all duration-500 ${
                  index <= currentEpoch ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                    index === currentEpoch ? 'animate-pulse' : ''
                  }`}
                  style={{
                    borderColor: EPOCH_COLORS[index],
                    backgroundColor: index <= currentEpoch ? EPOCH_COLORS[index] : 'transparent',
                    color: index <= currentEpoch ? '#000' : EPOCH_COLORS[index],
                    boxShadow: index === currentEpoch ? `0 0 20px ${EPOCH_COLORS[index]}` : 'none'
                  }}
                >
                  {index < currentEpoch ? '✓' : EPOCH_ICONS[index]}
                </div>
                <div 
                  className="text-xs font-medium"
                  style={{ color: index <= currentEpoch ? EPOCH_COLORS[index] : '#666' }}
                >
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {currentEpoch < 4 ? (
        <div className="mb-6">
          <h4 
            className="text-lg mb-3 font-bold"
            style={{ color: EPOCH_COLORS[currentEpoch + 1] }}
          >
            推进到 {EPOCH_NAMES[currentEpoch + 1]}纪元 {EPOCH_ICONS[currentEpoch + 1]}
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 flex items-center gap-2">
                  <span>📚</span>
                  <span>收集记忆碎片</span>
                </span>
                <span className={`font-bold ${fragments.length >= nextReq ? 'text-green-400' : 'text-yellow-400'}`}>
                  {fragments.length} / {nextReq}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    fragments.length >= nextReq
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {fragments.length < nextReq && (
                <p className="text-xs text-gray-500 mt-1">
                  还需收集 {nextReq - fragments.length} 个碎片
                </p>
              )}
            </div>
            
            <button
              onClick={handleAdvanceEpoch}
              disabled={!canAdvance}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                canAdvance
                  ? 'bg-gradient-to-r text-black hover:scale-105 shadow-lg'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
              style={canAdvance ? {
                backgroundImage: `linear-gradient(to right, ${EPOCH_COLORS[currentEpoch]}, ${EPOCH_COLORS[currentEpoch + 1]})`,
                boxShadow: `0 0 30px ${EPOCH_COLORS[currentEpoch + 1]}60`
              } : {}}
            >
              {canAdvance ? `✨ 推进到 ${EPOCH_NAMES[currentEpoch + 1]}纪元` : '🔒 条件未满足'}
            </button>
            
            {canAdvance && (
              <div className="text-center text-sm text-green-400 animate-pulse">
                ✓ 你已满足推进条件！
              </div>
            )}
          </div>
        </div>
      ) : (
        <div 
          className="text-center p-6 border-2 rounded-lg animate-pulse"
          style={{
            borderColor: EPOCH_COLORS[4],
            backgroundColor: `${EPOCH_COLORS[4]}10`,
            boxShadow: `0 0 20px ${EPOCH_COLORS[4]}40`
          }}
        >
          <div className="text-6xl mb-3">{EPOCH_ICONS[4]}</div>
          <p className="text-white font-bold text-xl mb-2">⚠️ 毁灭纪元</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            你已经到达瀛州文明的终点。<br />
            但账本将永远保存这段历史。
          </p>
        </div>
      )}


      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <h4 className="text-sm text-gray-400 mb-2">已收集碎片: {fragments.length}</h4>
        <div className="flex flex-wrap gap-2">
          {fragments.map(f => (
            <span key={f} className="px-2 py-1 bg-cyan-900 text-cyan-300 rounded text-xs">
              碎片 #{f}
            </span>
          ))}
          {fragments.length === 0 && (
            <span className="text-gray-500 text-xs">暂无碎片，完成小游戏或与AI对话获取</span>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">💡 纪元系统说明：</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>🌌 瀛州文明经历5个纪元：创世 → 萌芽 → 繁盛 → 熵化 → 毁灭</li>
          <li>📚 收集记忆碎片可推进纪元</li>
          <li>🎮 每个纪元解锁对应的小游戏</li>
          <li>🤖 与AI对话说出关键词可获得额外碎片</li>
          <li>⏰ 纪元推进不可逆，请谨慎选择</li>
        </ul>
      </div>
    </div>
  )
}
