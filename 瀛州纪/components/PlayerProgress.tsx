'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getEpochManagerContract, getMemoryFragmentContract, getAINPCContract } from '@/lib/contracts'

interface ProgressData {
  currentEpoch: number
  epochName: string
  mainFragments: number
  hiddenFragments: number
  totalDialogues: number
  gamesPlayed: number
}

const EPOCH_NAMES = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
const EPOCH_ICONS = ['🌌', '🌱', '✨', '⚡', '💀']

export default function PlayerProgress({
  provider,
  account
}: {
  provider: ethers.BrowserProvider | null
  account: string | null
}) {
  const [progress, setProgress] = useState<ProgressData>({
    currentEpoch: 0,
    epochName: '创世',
    mainFragments: 0,
    hiddenFragments: 0,
    totalDialogues: 0,
    gamesPlayed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (provider && account) {
      loadProgress()
    }
  }, [provider, account])

  const loadProgress = async () => {
    if (!provider || !account) return

    try {
      setLoading(true)

      // 获取当前纪元
      const epochManager = getEpochManagerContract(provider)
      const epoch = await epochManager.getCurrentEpoch(account)
      const currentEpoch = Number(epoch)

      // 获取碎片数量
      const fragmentContract = getMemoryFragmentContract(provider)
      const totalFragments = await fragmentContract.getTotalFragments()
      
      let mainCount = 0
      let hiddenCount = 0
      
      for (let i = 0; i < Number(totalFragments); i++) {
        const balance = await fragmentContract.balanceOf(account, i)
        if (Number(balance) > 0) {
          const frag = await fragmentContract.getFragment(i)
          if (frag.isHidden) {
            hiddenCount++
          } else {
            mainCount++
          }
        }
      }

      // 获取对话数量（如果有AINPC_Extended合约）
      let dialogueCount = 0
      try {
        const ainpcContract = getAINPCContract(provider)
        // 尝试调用 getPlayerInteractionCount（如果存在）
        dialogueCount = await ainpcContract.getPlayerInteractionCount(account)
        dialogueCount = Number(dialogueCount)
      } catch (err) {
        // 如果方法不存在，忽略错误
        console.log('未找到 getPlayerInteractionCount 方法')
      }

      setProgress({
        currentEpoch,
        epochName: EPOCH_NAMES[currentEpoch],
        mainFragments: mainCount,
        hiddenFragments: hiddenCount,
        totalDialogues: dialogueCount,
        gamesPlayed: 0 // 需要MiniGameManager合约
      })

      setLoading(false)
    } catch (error) {
      console.error('加载玩家进度失败:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">⚡</div>
          <p className="text-gray-400">加载进度...</p>
        </div>
      </div>
    )
  }

  const totalProgress = Math.round(
    ((progress.mainFragments / 8) * 40 +
    (progress.hiddenFragments / 10) * 40 +
    (progress.currentEpoch / 4) * 20) * 100
  ) / 100

  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">📊 玩家进度</h2>

      {/* 总体进度 */}
      <div className="mb-6 p-4 border-2 border-yingzhou-cyan rounded-lg bg-yingzhou-dark">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-yingzhou-cyan">总体进度</span>
          <span className="text-2xl font-bold text-yingzhou-cyan">{totalProgress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 transition-all duration-1000"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 当前纪元 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">{EPOCH_ICONS[progress.currentEpoch]}</div>
          <p className="text-xs text-gray-400 text-center">当前纪元</p>
          <p className="text-lg font-bold text-yingzhou-cyan text-center">{progress.epochName}</p>
        </div>

        {/* 主要碎片 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">🔷</div>
          <p className="text-xs text-gray-400 text-center">主要碎片</p>
          <p className="text-lg font-bold text-blue-400 text-center">
            {progress.mainFragments} / 8
          </p>
        </div>

        {/* 隐藏碎片 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">🔶</div>
          <p className="text-xs text-gray-400 text-center">隐藏碎片</p>
          <p className="text-lg font-bold text-yellow-400 text-center">
            {progress.hiddenFragments} / 10
          </p>
        </div>

        {/* NPC对话 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">💬</div>
          <p className="text-xs text-gray-400 text-center">NPC对话</p>
          <p className="text-lg font-bold text-green-400 text-center">
            {progress.totalDialogues}
          </p>
        </div>
      </div>

      {/* 成就提示 */}
      <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">🏆 下一个目标：</h3>
        {progress.currentEpoch < 4 ? (
          <p className="text-xs text-gray-400">
            收集更多碎片以推进到 {EPOCH_NAMES[progress.currentEpoch + 1]}纪元
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            恭喜！你已到达最终纪元。尝试收集所有18个碎片！
          </p>
        )}
      </div>

      {/* 刷新按钮 */}
      <button
        onClick={loadProgress}
        className="w-full mt-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
      >
        🔄 刷新进度
      </button>
    </div>
  )
}

