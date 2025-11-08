'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getMemoryFragmentContract } from '@/lib/contracts'

interface Fragment {
  id: number
  title: string
  content: string
  triggerKeyword: string
  epoch: number
  isHidden: boolean
  owned: boolean
}

export default function FragmentGallery({ 
  provider, 
  account 
}: { 
  provider: ethers.BrowserProvider | null
  account: string | null 
}) {
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [progress, setProgress] = useState({ main: 0, hidden: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider && account) {
      loadFragments()
    }
  }, [provider, account])

  const loadFragments = async () => {
    if (!provider || !account) return
    
    try {
      setLoading(true)
      setError(null)
      
      const contract = getMemoryFragmentContract(provider)
      const totalFragments = await contract.getTotalFragments()
      
      const fragmentsData: Fragment[] = []
      for (let i = 0; i < Number(totalFragments); i++) {
        try {
          const fragmentInfo = await contract.getFragment(i)
          const balance = await contract.balanceOf(account, i)
          
          fragmentsData.push({
            id: i,
            title: fragmentInfo.title,
            content: fragmentInfo.content,
            triggerKeyword: fragmentInfo.triggerKeyword,
            epoch: Number(fragmentInfo.epoch),
            isHidden: fragmentInfo.isHidden,
            owned: Number(balance) > 0
          })
        } catch (err) {
          console.error(`加载碎片 #${i} 失败:`, err)
        }
      }
      
      setFragments(fragmentsData)
      
      // 计算进度
      const mainCollected = fragmentsData.filter(f => !f.isHidden && f.owned).length
      const hiddenCollected = fragmentsData.filter(f => f.isHidden && f.owned).length
      setProgress({ main: mainCollected, hidden: hiddenCollected })
      
      setLoading(false)
    } catch (err: any) {
      console.error('加载碎片失败:', err)
      setError(err.message || '加载失败')
      setLoading(false)
    }
  }

  const filteredFragments = fragments.filter(f => {
    if (filter === 'all') return true
    return f.epoch === parseInt(filter)
  })

  const epochNames = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
  const epochColors = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">⚡</div>
          <p className="text-gray-400">加载记忆碎片...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <p className="text-red-400">⚠️ {error}</p>
          <button onClick={loadFragments} className="btn-primary mt-4">
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">📚 记忆碎片收藏</h2>
      
      {/* 进度条 */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="text-gray-300">主要碎片: </span>
          <span className="text-yingzhou-cyan font-bold">{progress.main}/8</span>
          <span className="text-gray-400 ml-2">({Math.round(progress.main / 8 * 100)}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progress.main / 8 * 100}%` }}
          />
        </div>
        
        <div className="mb-2">
          <span className="text-gray-300">隐藏碎片: </span>
          <span className="text-yellow-400 font-bold">{progress.hidden}/10</span>
          <span className="text-gray-400 ml-2">({Math.round(progress.hidden / 10 * 100)}%)</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress.hidden / 10 * 100}%` }}
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
        {epochNames.map((name, index) => (
          <button
            key={index}
            onClick={() => setFilter(index.toString())}
            className={`px-3 py-1 text-sm border transition-all ${
              filter === index.toString()
                ? 'text-black border-current'
                : 'bg-black border-current hover:bg-current hover:text-black'
            }`}
            style={{ 
              color: filter === index.toString() ? '#000' : epochColors[index],
              backgroundColor: filter === index.toString() ? epochColors[index] : 'transparent',
              borderColor: epochColors[index]
            }}
          >
            {name}纪元
          </button>
        ))}
      </div>
      
      {/* 碎片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {filteredFragments.map((fragment) => (
          <div
            key={fragment.id}
            onClick={() => fragment.owned && setSelectedFragment(fragment)}
            className={`
              relative aspect-square border-2 rounded-lg p-4 flex flex-col items-center justify-center
              transition-all duration-300
              ${fragment.owned 
                ? 'border-yingzhou-cyan bg-yingzhou-dark hover:bg-yingzhou-cyan hover:text-black shadow-lg shadow-yingzhou-cyan/50 cursor-pointer hover:scale-105' 
                : 'border-gray-700 bg-gray-900 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {/* 稀有度标识 */}
            <div className="absolute top-2 right-2 text-xl">
              {fragment.isHidden ? '🔶' : '🔷'}
            </div>
            
            {/* ID */}
            <div className="text-xs text-gray-400 mb-2">#{fragment.id}</div>
            
            {/* 图标 */}
            <div className="text-4xl mb-2">
              {fragment.owned ? '✓' : '❓'}
            </div>
            
            {/* 标题 */}
            <div className="text-center text-xs font-medium">
              {fragment.owned ? fragment.title : '???'}
            </div>
            
            {/* 纪元标识 */}
            <div 
              className="text-[10px] mt-1 px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${epochColors[fragment.epoch]}20`,
                color: epochColors[fragment.epoch]
              }}
            >
              {epochNames[fragment.epoch]}
            </div>
          </div>
        ))}
      </div>
      
      {/* 空状态 */}
      {filteredFragments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">该纪元暂无碎片</p>
        </div>
      )}
      
      {/* 提示信息 */}
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">💡 获取碎片的方法：</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>🔷 <span className="text-yingzhou-cyan">主要碎片</span>：通过完成AI-NPC的小游戏挑战获得</li>
          <li>🔶 <span className="text-yellow-400">隐藏碎片</span>：在对话中提到特定关键词触发</li>
          <li>🎯 完成度越高，获得碎片的概率越大</li>
          <li>🔍 探索不同纪元，发现更多隐藏秘密</li>
        </ul>
      </div>
      
      {/* 碎片详情弹窗 */}
      {selectedFragment && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-yingzhou-dark border-2 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fadeIn"
            style={{ 
              borderColor: epochColors[selectedFragment.epoch],
              boxShadow: `0 0 20px ${epochColors[selectedFragment.epoch]}80`
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: epochColors[selectedFragment.epoch] }}
                >
                  {selectedFragment.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>#{selectedFragment.id}</span>
                  <span>|</span>
                  <span>{epochNames[selectedFragment.epoch]}纪元</span>
                  <span>|</span>
                  <span>{selectedFragment.isHidden ? '隐藏碎片🔶' : '主要碎片🔷'}</span>
                </div>
                {selectedFragment.triggerKeyword && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-400">触发关键词：</span>
                    <span className="text-yellow-400 ml-1">「{selectedFragment.triggerKeyword}」</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedFragment(null)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
              {selectedFragment.content}
            </div>
            
            <div className="mt-6 text-center">
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

