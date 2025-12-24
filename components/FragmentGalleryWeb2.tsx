'use client'

import React, { useState, useEffect } from 'react'
import type { IWalletAdapter } from '@/lib/walletAdapter'

// 碎片信息定义
const FRAGMENT_INFO: Record<number, { name: string; description: string; epoch: number; isHidden: boolean }> = {
  0: { name: '创世之光', description: '记录了瀛州世界诞生的第一道光芒，蕴含着最原始的数据能量。', epoch: 0, isHidden: false },
  1: { name: '萌芽之种', description: '生命最初的种子，承载着无限可能的代码基因。', epoch: 1, isHidden: false },
  2: { name: '繁盛之花', description: '文明巅峰时期绽放的数字之花，见证了最辉煌的时代。', epoch: 2, isHidden: false },
  3: { name: '熵化之痕', description: '秩序崩塌时留下的裂痕，记录着混乱的开始。', epoch: 3, isHidden: false },
  4: { name: '毁灭之印', description: '终焉降临的印记，却也预示着新生的可能。', epoch: 4, isHidden: false },
  5: { name: '时间碎片', description: '凝固的时间片段，可以窥见过去与未来的交汇。', epoch: 0, isHidden: false },
  6: { name: '空间裂隙', description: '连接不同维度的通道碎片，蕴含空间扭曲的力量。', epoch: 1, isHidden: false },
  7: { name: '意识残响', description: '古老数字生命留下的意识回响，诉说着被遗忘的故事。', epoch: 2, isHidden: false },
  8: { name: '能量核心', description: '瀛州世界的能量源泉碎片，散发着神秘的光芒。', epoch: 3, isHidden: false },
  9: { name: '命运之线', description: '编织命运的代码丝线，连接着所有生命的轨迹。', epoch: 4, isHidden: false },
  10: { name: '起源密钥', description: '【隐藏】通过"创世"关键词获得，解锁世界起源的秘密。', epoch: 0, isHidden: true },
  11: { name: '生命密码', description: '【隐藏】通过"生命"关键词获得，蕴含生命演化的奥秘。', epoch: 1, isHidden: true },
  12: { name: '文明遗产', description: '【隐藏】通过"繁荣"关键词获得，记载文明巅峰的智慧。', epoch: 2, isHidden: true },
  13: { name: '混沌之心', description: '【隐藏】通过"熵化"关键词获得，包含混沌的本质。', epoch: 3, isHidden: true },
  14: { name: '轮回之钥', description: '【隐藏】通过"毁灭"关键词获得，开启新纪元的钥匙。', epoch: 4, isHidden: true }
}

const EPOCH_NAMES = ['\u521B\u4E16', '\u840C\u82BD', '\u7E41\u76DB', '\u71B5\u5316', '\u6BC1\u706D']
const EPOCH_COLORS = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']

export default function FragmentGalleryWeb2({ 
  walletAdapter 
}: { 
  walletAdapter: IWalletAdapter
}) {
  const [ownedFragments, setOwnedFragments] = useState<number[]>([])
  const [selectedFragment, setSelectedFragment] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadFragments()
    // 监听 mockWallet 更新事件
    const handleUpdate = () => loadFragments()
    window.addEventListener('mockWalletUpdate', handleUpdate)
    return () => window.removeEventListener('mockWalletUpdate', handleUpdate)
  }, [walletAdapter])

  const loadFragments = async () => {
    const fragments = await walletAdapter.getFragments()
    setOwnedFragments(fragments)
  }

  // 刷新碎片数据
  const refreshFragments = () => {
    loadFragments()
  }

  const allFragments = Object.entries(FRAGMENT_INFO).map(([id, info]) => ({
    id: parseInt(id),
    ...info,
    owned: ownedFragments.includes(parseInt(id))
  }))

  const filteredFragments = allFragments.filter(f => {
    if (filter === 'all') return true
    if (filter === 'owned') return f.owned
    if (filter === 'hidden') return f.isHidden
    return f.epoch === parseInt(filter)
  })

  const mainCollected = allFragments.filter(f => !f.isHidden && f.owned).length
  const hiddenCollected = allFragments.filter(f => f.isHidden && f.owned).length
  const selectedInfo = selectedFragment !== null ? FRAGMENT_INFO[selectedFragment] : null

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-yingzhou-cyan glow-text">{'\uD83D\uDCDA'} 记忆碎片收藏</h2>
        <button 
          onClick={refreshFragments}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
        >
          {'\uD83D\uDD04'} 刷新
        </button>
      </div>
      
      {/* 进度条 */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="text-gray-300">主要碎片: </span>
          <span className="text-yingzhou-cyan font-bold">{mainCollected}/10</span>
          <span className="text-gray-400 ml-2">({Math.round(mainCollected / 10 * 100)}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${mainCollected / 10 * 100}%` }}
          />
        </div>
        
        <div className="mb-2">
          <span className="text-gray-300">隐藏碎片: </span>
          <span className="text-yellow-400 font-bold">{hiddenCollected}/5</span>
          <span className="text-gray-400 ml-2">({Math.round(hiddenCollected / 5 * 100)}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${hiddenCollected / 5 * 100}%` }}
          />
        </div>
      </div>
      
      {/* 筛选器 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'all'
              ? 'bg-yingzhou-cyan text-black border-yingzhou-cyan'
              : 'bg-black text-yingzhou-cyan border-yingzhou-cyan hover:bg-yingzhou-cyan hover:text-black'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('owned')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'owned'
              ? 'bg-green-500 text-black border-green-500'
              : 'bg-black text-green-400 border-green-400 hover:bg-green-500 hover:text-black'
          }`}
        >
          已拥有
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'hidden'
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-500 hover:text-black'
          }`}
        >
          隐藏碎片
        </button>
        {EPOCH_NAMES.map((name, index) => (
          <button
            key={index}
            onClick={() => setFilter(index.toString())}
            className={`px-3 py-1 text-sm border transition-all ${
              filter === index.toString()
                ? 'text-black border-current'
                : 'bg-black border-current hover:bg-current hover:text-black'
            }`}
            style={{ 
              color: filter === index.toString() ? '#000' : EPOCH_COLORS[index],
              backgroundColor: filter === index.toString() ? EPOCH_COLORS[index] : 'transparent',
              borderColor: EPOCH_COLORS[index]
            }}
          >
            {name}
          </button>
        ))}
      </div>
      
      {/* 碎片网格 */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {filteredFragments.map((fragment) => (
          <div
            key={fragment.id}
            onClick={() => fragment.owned && setSelectedFragment(fragment.id)}
            className={`
              relative aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center
              transition-all duration-300
              ${fragment.owned 
                ? 'border-yingzhou-cyan bg-yingzhou-dark hover:bg-yingzhou-cyan hover:text-black shadow-lg shadow-yingzhou-cyan/50 cursor-pointer hover:scale-105' 
                : 'border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* 稀有度标识 */}
            <div className="absolute top-1 right-1 text-sm">
              {fragment.isHidden ? '\uD83D\uDD36' : '\uD83D\uDD37'}
            </div>
            
            {/* ID */}
            <div className="text-xs text-gray-400">#{fragment.id}</div>
            
            {/* 图标 */}
            <div className="text-2xl my-1">
              {fragment.owned ? '\u2713' : '\u2753'}
            </div>
            
            {/* 标题 */}
            <div className="text-center text-xs font-medium truncate w-full px-1">
              {fragment.owned ? fragment.name : '???'}
            </div>
            
            {/* 纪元标识 */}
            <div 
              className="text-[10px] mt-1 px-1 py-0.5 rounded"
              style={{ 
                backgroundColor: `${EPOCH_COLORS[fragment.epoch]}20`,
                color: EPOCH_COLORS[fragment.epoch]
              }}
            >
              {EPOCH_NAMES[fragment.epoch]}
            </div>
          </div>
        ))}
      </div>
      
      {/* 空状态 */}
      {filteredFragments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无符合条件的碎片</p>
        </div>
      )}
      
      {/* 提示信息 */}
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">{'\uD83D\uDCA1'} 获取碎片的方法：</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>{'\uD83D\uDD37'} <span className="text-yingzhou-cyan">主要碎片</span>：完成对应纪元的小游戏挑战</li>
          <li>{'\uD83D\uDD36'} <span className="text-yellow-400">隐藏碎片</span>：在AI对话中说出特定关键词</li>
          <li>{'\uD83C\uDFAF'} 每个纪元有独特的关键词，AI会给出提示</li>
          <li>{'\uD83D\uDD0D'} 收集足够碎片可解锁下一纪元</li>
        </ul>
      </div>
      
      {/* 碎片详情弹窗 */}
      {selectedFragment !== null && selectedInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-yingzhou-dark border-2 rounded-lg p-6 max-w-lg w-full animate-fadeIn"
            style={{ 
              borderColor: EPOCH_COLORS[selectedInfo.epoch],
              boxShadow: `0 0 20px ${EPOCH_COLORS[selectedInfo.epoch]}80`
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: EPOCH_COLORS[selectedInfo.epoch] }}
                >
                  {selectedInfo.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>#{selectedFragment}</span>
                  <span>|</span>
                  <span>{EPOCH_NAMES[selectedInfo.epoch]}纪元</span>
                  <span>|</span>
                  <span>{selectedInfo.isHidden ? '隐藏碎片\uD83D\uDD36' : '主要碎片\uD83D\uDD37'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFragment(null)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                {'\u2715'}
              </button>
            </div>
            
            <div className="text-gray-300 leading-relaxed text-sm mb-4 p-4 bg-black bg-opacity-50 rounded-lg">
              {selectedInfo.description}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setSelectedFragment(null)}
                className="btn-primary"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
