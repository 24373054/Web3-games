'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getEpochManagerContract, getDigitalBeingContract } from '@/lib/contracts'

interface EpochConfig {
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  minFragments: bigint
  minNPCInteractions: bigint
}

const EPOCH_NAMES = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
const EPOCH_COLORS = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']
const EPOCH_ICONS = ['🌌', '🌱', '✨', '⚡', '💀']

export default function EpochPanel({ 
  provider, 
  account,
  beingId
}: { 
  provider: ethers.BrowserProvider | null
  account: string | null
  beingId: number | null
}) {
  const [currentEpoch, setCurrentEpoch] = useState<number>(0)
  const [epochConfig, setEpochConfig] = useState<EpochConfig | null>(null)
  const [playerFragments, setPlayerFragments] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider && account && beingId !== null) {
      loadEpochInfo()
    }
  }, [provider, account, beingId])

  const loadEpochInfo = async () => {
    if (!provider || !account) return
    
    try {
      setLoading(true)
      setError(null)
      
      const contract = getEpochManagerContract(provider)
      
      // 获取当前纪元
      const epoch = await contract.getCurrentEpoch(account)
      setCurrentEpoch(Number(epoch))
      
      // 获取纪元状态
      const state = await contract.getEpochState(epoch)
      setEpochConfig({
        name: state.name,
        description: '', // EpochState没有description字段
        primaryColor: '#00FFFF', // 默认颜色
        secondaryColor: '#00FFFF',
        accentColor: '#00FFFF',
        minFragments: BigInt(0), // 从requirements获取
        minNPCInteractions: BigInt(0)
      })
      
      // 获取玩家收集的碎片数
      const fragments = await contract.getPlayerFragmentCount(account)
      setPlayerFragments(Number(fragments))
      
      setLoading(false)
    } catch (err: any) {
      console.error('加载纪元信息失败:', err)
      setError(err.message || '加载失败')
      setLoading(false)
    }
  }

  const handleAdvanceEpoch = async () => {
    if (!provider || !account) return
    
    try {
      const signer = await provider.getSigner()
      const epochManagerContract = getEpochManagerContract(signer)
      
      // 通过 EpochManager 合约推进纪元
      const tx = await epochManagerContract.advanceEpoch(account)
      await tx.wait()
      
      alert(`✨ 成功推进到 ${EPOCH_NAMES[currentEpoch + 1]} 纪元！`)
      loadEpochInfo()
    } catch (error: any) {
      console.error('推进纪元失败:', error)
      if (error.message.includes('Already at final epoch')) {
        alert('⚠️ 已经到达最后纪元')
      } else if (error.message.includes('Not enough fragments')) {
        alert('❌ 推进失败：收集的碎片不足')
      } else {
        alert(`❌ 推进失败：${error.message}`)
      }
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">⚡</div>
          <p className="text-gray-400">加载纪元信息...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <p className="text-red-400">⚠️ {error}</p>
          <button onClick={loadEpochInfo} className="btn-primary mt-4">
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!epochConfig) {
    return (
      <div className="digital-frame">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  const canAdvance = currentEpoch < 4 && playerFragments >= Number(epochConfig.minFragments)
  const progressPercent = Math.min((playerFragments / Number(epochConfig.minFragments)) * 100, 100)

  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">🌌 纪元系统</h2>
      
      {/* 当前纪元信息 */}
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
            <h3 
              className="text-xl font-bold"
              style={{ color: EPOCH_COLORS[currentEpoch] }}
            >
              {epochConfig.name}
            </h3>
          </div>
          <span className="text-sm text-gray-400">纪元 {currentEpoch + 1}/5</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{epochConfig.description}</p>
      </div>
      
      {/* 纪元时间线 */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-3">文明演化进程</h3>
        <div className="relative">
          {/* 背景进度条 */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-green-500 via-yellow-500 via-red-500 to-white transition-all duration-1000"
              style={{ width: `${(currentEpoch / 4) * 100}%` }}
            />
          </div>
          
          {/* 纪元节点 */}
          <div className="flex items-center justify-between">
            {EPOCH_NAMES.map((name, index) => (
              <div
                key={index}
                className={`flex-1 text-center transition-all duration-500 ${
                  index <= currentEpoch 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-40 scale-90'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                    index < currentEpoch
                      ? 'bg-opacity-80'
                      : index === currentEpoch
                      ? 'animate-pulse'
                      : 'bg-transparent'
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
      
      {/* 推进条件 */}
      {currentEpoch < 4 ? (
        <div className="mb-6">
          <h4 
            className="text-lg mb-3 font-bold"
            style={{ color: EPOCH_COLORS[currentEpoch + 1] }}
          >
            推进到 {EPOCH_NAMES[currentEpoch + 1]}纪元 {EPOCH_ICONS[currentEpoch + 1]}
          </h4>
          
          <div className="space-y-4">
            {/* 碎片要求 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 flex items-center gap-2">
                  <span>📚</span>
                  <span>收集记忆碎片</span>
                </span>
                <span 
                  className={`font-bold ${playerFragments >= Number(epochConfig.minFragments) ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {playerFragments} / {Number(epochConfig.minFragments)}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    playerFragments >= Number(epochConfig.minFragments)
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {playerFragments < Number(epochConfig.minFragments) && (
                <p className="text-xs text-gray-500 mt-1">
                  还需收集 {Number(epochConfig.minFragments) - playerFragments} 个碎片
                </p>
              )}
            </div>
            
            {/* 推进按钮 */}
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
              {canAdvance 
                ? `✨ 推进到 ${EPOCH_NAMES[currentEpoch + 1]}纪元` 
                : '🔒 条件未满足'}
            </button>
            
            {canAdvance && (
              <div className="text-center text-sm text-green-400 animate-pulse">
                ✓ 你已满足推进条件！
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 终焉提示 */
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
            所有合约将进入只读状态。<br />
            但账本将永远保存这段历史。
          </p>
          <div className="mt-4 text-xs text-gray-500 code-poetry">
            {`function exist() public view returns (bool) {
  // 我们被记录，故我们永恒
  return ledger.isRecorded(address(this));
}`}
          </div>
        </div>
      )}
      
      {/* 纪元提示 */}
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">💡 纪元系统说明：</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>🌌 瀛州文明经历5个纪元：创世 → 萌芽 → 繁盛 → 熵化 → 毁灭</li>
          <li>📚 收集记忆碎片可推进纪元</li>
          <li>🎨 每个纪元有独特的视觉风格和色调</li>
          <li>🤖 AI-NPC在不同纪元有不同的表现和对话</li>
          <li>⏰ 纪元推进不可逆，请谨慎选择</li>
        </ul>
      </div>
    </div>
  )
}

