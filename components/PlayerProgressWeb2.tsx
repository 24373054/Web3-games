'use client'

import React, { useState, useEffect } from 'react'
import type { IWalletAdapter } from '@/lib/walletAdapter'
import { EPOCH_UNLOCK_REQUIREMENTS } from '@/lib/mockWallet'

const EPOCH_NAMES = ['\u521B\u4E16', '\u840C\u82BD', '\u7E41\u76DB', '\u71B5\u5316', '\u6BC1\u706D']
const EPOCH_ICONS = ['\uD83C\uDF0C', '\uD83C\uDF31', '\u2728', '\u26A1', '\uD83D\uDC80']

// 碎片信息（与FragmentGalleryWeb2保持一致）
const FRAGMENT_INFO: Record<number, { name: string; isHidden: boolean }> = {
  0: { name: '\u521B\u4E16\u4E4B\u5149', isHidden: false },
  1: { name: '\u840C\u82BD\u4E4B\u79CD', isHidden: false },
  2: { name: '\u7E41\u76DB\u4E4B\u82B1', isHidden: false },
  3: { name: '\u71B5\u5316\u4E4B\u75D5', isHidden: false },
  4: { name: '\u6BC1\u706D\u4E4B\u5370', isHidden: false },
  5: { name: '\u65F6\u95F4\u788E\u7247', isHidden: false },
  6: { name: '\u7A7A\u95F4\u88C2\u9699', isHidden: false },
  7: { name: '\u610F\u8BC6\u6B8B\u54CD', isHidden: false },
  8: { name: '\u80FD\u91CF\u6838\u5FC3', isHidden: false },
  9: { name: '\u547D\u8FD0\u4E4B\u7EBF', isHidden: false },
  10: { name: '\u8D77\u6E90\u5BC6\u94A5', isHidden: true },
  11: { name: '\u751F\u547D\u5BC6\u7801', isHidden: true },
  12: { name: '\u6587\u660E\u9057\u4EA7', isHidden: true },
  13: { name: '\u6DF7\u6C8C\u4E4B\u5FC3', isHidden: true },
  14: { name: '\u8F6E\u56DE\u4E4B\u94A5', isHidden: true }
}

export default function PlayerProgressWeb2({
  walletAdapter
}: {
  walletAdapter: IWalletAdapter
}) {
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [fragments, setFragments] = useState<number[]>([])
  const [gameScores, setGameScores] = useState<any[]>([])
  const [interactions, setInteractions] = useState<any[]>([])
  const [keywordsFound, setKeywordsFound] = useState<string[]>([])

  useEffect(() => {
    loadProgress()
    // 监听 mockWallet 更新事件
    const handleUpdate = () => loadProgress()
    window.addEventListener('mockWalletUpdate', handleUpdate)
    return () => window.removeEventListener('mockWalletUpdate', handleUpdate)
  }, [walletAdapter])

  const loadProgress = async () => {
    setCurrentEpoch(walletAdapter.getCurrentEpoch())
    const frags = await walletAdapter.getFragments()
    setFragments(frags)
    
    // 获取游戏分数和交互记录
    try {
      const scores = await walletAdapter.getGameScores()
      setGameScores(scores || [])
    } catch { setGameScores([]) }
    
    try {
      const ints = await walletAdapter.getInteractions()
      setInteractions(ints || [])
    } catch { setInteractions([]) }
    
    if (walletAdapter.getFoundKeywords) {
      setKeywordsFound(walletAdapter.getFoundKeywords())
    }
  }

  const refreshProgress = () => {
    loadProgress()
  }

  const mainFragments = fragments.filter(f => FRAGMENT_INFO[f] && !FRAGMENT_INFO[f].isHidden).length
  const hiddenFragments = fragments.filter(f => FRAGMENT_INFO[f] && FRAGMENT_INFO[f].isHidden).length
  const gamesCompleted = new Set(gameScores.filter(s => s.completion >= 60).map(s => s.gameType)).size

  const totalProgress = Math.round(
    ((mainFragments / 10) * 30 +
    (hiddenFragments / 5) * 20 +
    (currentEpoch / 4) * 30 +
    (gamesCompleted / 5) * 20) * 100
  ) / 100

  const nextEpochReq = currentEpoch < 4 ? EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1] : 0

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-yingzhou-cyan glow-text">{'\uD83D\uDCCA'} 玩家进度</h2>
        <button 
          onClick={refreshProgress}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
        >
          {'\uD83D\uDD04'} 刷新
        </button>
      </div>

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
          <div className="text-4xl mb-2 text-center">{EPOCH_ICONS[currentEpoch]}</div>
          <p className="text-xs text-gray-400 text-center">当前纪元</p>
          <p className="text-lg font-bold text-yingzhou-cyan text-center">{EPOCH_NAMES[currentEpoch]}</p>
          {currentEpoch < 4 && (
            <p className="text-xs text-gray-500 text-center mt-1">
              下一纪元需要 {nextEpochReq} 碎片
            </p>
          )}
        </div>

        {/* 主要碎片 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">{'\uD83D\uDD37'}</div>
          <p className="text-xs text-gray-400 text-center">主要碎片</p>
          <p className="text-lg font-bold text-blue-400 text-center">
            {mainFragments} / 10
          </p>
        </div>

        {/* 隐藏碎片 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">{'\uD83D\uDD36'}</div>
          <p className="text-xs text-gray-400 text-center">隐藏碎片</p>
          <p className="text-lg font-bold text-yellow-400 text-center">
            {hiddenFragments} / 5
          </p>
        </div>

        {/* 小游戏完成 */}
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">{'\uD83C\uDFAE'}</div>
          <p className="text-xs text-gray-400 text-center">小游戏完成</p>
          <p className="text-lg font-bold text-green-400 text-center">
            {gamesCompleted} / 5
          </p>
        </div>
      </div>

      {/* 已收集碎片列表 */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-sm text-gray-400 mb-3">{'\uD83D\uDCDA'} 已收集碎片 ({fragments.length})</h3>
        <div className="flex flex-wrap gap-2">
          {fragments.length > 0 ? (
            fragments.map(f => (
              <span 
                key={f} 
                className={`px-2 py-1 rounded text-xs ${
                  FRAGMENT_INFO[f]?.isHidden 
                    ? 'bg-yellow-900 text-yellow-300' 
                    : 'bg-cyan-900 text-cyan-300'
                }`}
              >
                {FRAGMENT_INFO[f]?.isHidden ? '\uD83D\uDD36' : '\uD83D\uDD37'} {FRAGMENT_INFO[f]?.name || `碎片#${f}`}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">暂无碎片，完成小游戏或与AI对话获取</span>
          )}
        </div>
      </div>

      {/* 已发现关键词 */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-sm text-gray-400 mb-3">{'\uD83D\uDD11'} 已发现关键词 ({keywordsFound.length})</h3>
        <div className="flex flex-wrap gap-2">
          {keywordsFound.length > 0 ? (
            keywordsFound.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs">
                {'\u300C'}{kw}{'\u300D'}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">与AI对话时说出特定关键词可获得隐藏碎片</span>
          )}
        </div>
      </div>

      {/* NPC对话统计 */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-sm text-gray-400 mb-3">{'\uD83D\uDCAC'} 对话记录 ({interactions.length})</h3>
        {interactions.length > 0 ? (
          <div className="max-h-32 overflow-y-auto space-y-2">
            {interactions.slice(-5).reverse().map((int, i) => (
              <div key={i} className="text-xs text-gray-400 border-l-2 border-gray-600 pl-2">
                <span className="text-yingzhou-cyan">{int.npcId}</span>: {int.message.slice(0, 30)}...
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 text-xs">暂无对话记录</span>
        )}
      </div>

      {/* 成就提示 */}
      <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">{'\uD83C\uDFC6'} 下一个目标：</h3>
        {currentEpoch < 4 ? (
          <div className="text-xs text-gray-400 space-y-1">
            <p>{'\u2022'} 收集 {nextEpochReq - fragments.length > 0 ? nextEpochReq - fragments.length : 0} 个碎片推进到 {EPOCH_NAMES[currentEpoch + 1]}纪元</p>
            <p>{'\u2022'} 完成纪元 {currentEpoch} 的小游戏获得碎片</p>
            <p>{'\u2022'} 与AI对话发现隐藏关键词</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            {'\uD83C\uDF89'} 恭喜！你已到达最终纪元。尝试收集所有15个碎片！
          </p>
        )}
      </div>
    </div>
  )
}
