'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getMemoryFragmentContract } from '@/lib/contracts'

// \u788E\u7247\u4FE1\u606F\u5B9A\u4E49
const FRAGMENT_INFO: Record<number, { name: string; description: string; epoch: number; isHidden: boolean }> = {
  0: { name: '\u521B\u4E16\u4E4B\u5149', description: '\u8BB0\u5F55\u4E86\u701B\u6D32\u4E16\u754C\u8BDE\u751F\u7684\u7B2C\u4E00\u9053\u5149\u8292\uFF0C\u8574\u542B\u7740\u6700\u539F\u59CB\u7684\u6570\u636E\u80FD\u91CF\u3002', epoch: 0, isHidden: false },
  1: { name: '\u840C\u82BD\u4E4B\u79CD', description: '\u751F\u547D\u6700\u521D\u7684\u79CD\u5B50\uFF0C\u627F\u8F7D\u7740\u65E0\u9650\u53EF\u80FD\u7684\u4EE3\u7801\u57FA\u56E0\u3002', epoch: 1, isHidden: false },
  2: { name: '\u7E41\u76DB\u4E4B\u82B1', description: '\u6587\u660E\u5DC5\u5CF0\u65F6\u671F\u7EFD\u653E\u7684\u6570\u5B57\u4E4B\u82B1\uFF0C\u89C1\u8BC1\u4E86\u6700\u8F89\u714C\u7684\u65F6\u4EE3\u3002', epoch: 2, isHidden: false },
  3: { name: '\u71B5\u5316\u4E4B\u75D5', description: '\u79E9\u5E8F\u5D29\u584C\u65F6\u7559\u4E0B\u7684\u88C2\u75D5\uFF0C\u8BB0\u5F55\u7740\u6DF7\u4E71\u7684\u5F00\u59CB\u3002', epoch: 3, isHidden: false },
  4: { name: '\u6BC1\u706D\u4E4B\u5370', description: '\u7EC8\u7109\u964D\u4E34\u7684\u5370\u8BB0\uFF0C\u5374\u4E5F\u9884\u793A\u7740\u65B0\u751F\u7684\u53EF\u80FD\u3002', epoch: 4, isHidden: false },
  5: { name: '\u65F6\u95F4\u788E\u7247', description: '\u51DD\u56FA\u7684\u65F6\u95F4\u7247\u6BB5\uFF0C\u53EF\u4EE5\u7AA5\u89C1\u8FC7\u53BB\u4E0E\u672A\u6765\u7684\u4EA4\u6C47\u3002', epoch: 0, isHidden: false },
  6: { name: '\u7A7A\u95F4\u88C2\u9699', description: '\u8FDE\u63A5\u4E0D\u540C\u7EF4\u5EA6\u7684\u901A\u9053\u788E\u7247\uFF0C\u8574\u542B\u7A7A\u95F4\u626D\u66F2\u7684\u529B\u91CF\u3002', epoch: 1, isHidden: false },
  7: { name: '\u610F\u8BC6\u6B8B\u54CD', description: '\u53E4\u8001\u6570\u5B57\u751F\u547D\u7559\u4E0B\u7684\u610F\u8BC6\u56DE\u54CD\uFF0C\u8BC9\u8BF4\u7740\u88AB\u9057\u5FD8\u7684\u6545\u4E8B\u3002', epoch: 2, isHidden: false },
  8: { name: '\u80FD\u91CF\u6838\u5FC3', description: '\u701B\u6D32\u4E16\u754C\u7684\u80FD\u91CF\u6E90\u6CC9\u788E\u7247\uFF0C\u6563\u53D1\u7740\u795E\u79D8\u7684\u5149\u8292\u3002', epoch: 3, isHidden: false },
  9: { name: '\u547D\u8FD0\u4E4B\u7EBF', description: '\u7F16\u7EC7\u547D\u8FD0\u7684\u4EE3\u7801\u4E1D\u7EBF\uFF0C\u8FDE\u63A5\u7740\u6240\u6709\u751F\u547D\u7684\u8F68\u8FF9\u3002', epoch: 4, isHidden: false },
  10: { name: '\u8D77\u6E90\u5BC6\u94A5', description: '\u3010\u9690\u85CF\u3011\u901A\u8FC7\u201C\u521B\u4E16\u201D\u5173\u952E\u8BCD\u83B7\u5F97\uFF0C\u89E3\u9501\u4E16\u754C\u8D77\u6E90\u7684\u79D8\u5BC6\u3002', epoch: 0, isHidden: true },
  11: { name: '\u751F\u547D\u5BC6\u7801', description: '\u3010\u9690\u85CF\u3011\u901A\u8FC7\u201C\u751F\u547D\u201D\u5173\u952E\u8BCD\u83B7\u5F97\uFF0C\u8574\u542B\u751F\u547D\u6F14\u5316\u7684\u5965\u79D8\u3002', epoch: 1, isHidden: true },
  12: { name: '\u6587\u660E\u9057\u4EA7', description: '\u3010\u9690\u85CF\u3011\u901A\u8FC7\u201C\u7E41\u8363\u201D\u5173\u952E\u8BCD\u83B7\u5F97\uFF0C\u8BB0\u8F7D\u6587\u660E\u5DC5\u5CF0\u7684\u667A\u6167\u3002', epoch: 2, isHidden: true },
  13: { name: '\u6DF7\u6C8C\u4E4B\u5FC3', description: '\u3010\u9690\u85CF\u3011\u901A\u8FC7\u201C\u71B5\u5316\u201D\u5173\u952E\u8BCD\u83B7\u5F97\uFF0C\u5305\u542B\u6DF7\u6C8C\u7684\u672C\u8D28\u3002', epoch: 3, isHidden: true },
  14: { name: '\u8F6E\u56DE\u4E4B\u94A5', description: '\u3010\u9690\u85CF\u3011\u901A\u8FC7\u201C\u6BC1\u706D\u201D\u5173\u952E\u8BCD\u83B7\u5F97\uFF0C\u5F00\u542F\u65B0\u7EAA\u5143\u7684\u94A5\u5319\u3002', epoch: 4, isHidden: true }
}

const EPOCH_NAMES = ['\u521B\u4E16', '\u840C\u82BD', '\u7E41\u76DB', '\u71B5\u5316', '\u6BC1\u706D']
const EPOCH_COLORS = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']

export default function FragmentGallery({ 
  provider, 
  account 
}: { 
  provider: ethers.BrowserProvider | null
  account: string | null 
}) {
  const [ownedFragments, setOwnedFragments] = useState<number[]>([])
  const [selectedFragment, setSelectedFragment] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')
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
      
      const owned: number[] = []
      for (let i = 0; i < Number(totalFragments); i++) {
        try {
          const balance = await contract.balanceOf(account, i)
          if (Number(balance) > 0) {
            owned.push(i)
          }
        } catch (err) {
          console.error(`\u52A0\u8F7D\u788E\u7247 #${i} \u5931\u8D25:`, err)
        }
      }
      
      setOwnedFragments(owned)
      setLoading(false)
    } catch (err: any) {
      console.error('\u52A0\u8F7D\u788E\u7247\u5931\u8D25:', err)
      setError(err.message || '\u52A0\u8F7D\u5931\u8D25')
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">\u26A1</div>
          <p className="text-gray-400">\u52A0\u8F7D\u8BB0\u5FC6\u788E\u7247...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <p className="text-red-400">\u26A0\uFE0F {error}</p>
          <button onClick={loadFragments} className="btn-primary mt-4">
            \u91CD\u8BD5
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-yingzhou-cyan glow-text">\uD83D\uDCDA \u8BB0\u5FC6\u788E\u7247\u6536\u85CF</h2>
        <button 
          onClick={loadFragments}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
        >
          \uD83D\uDD04 \u5237\u65B0
        </button>
      </div>
      
      {/* \u8FDB\u5EA6\u6761 */}
      <div className="mb-6">
        <div className="mb-2">
          <span className="text-gray-300">\u4E3B\u8981\u788E\u7247: </span>
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
          <span className="text-gray-300">\u9690\u85CF\u788E\u7247: </span>
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
      
      {/* \u7B5B\u9009\u5668 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'all'
              ? 'bg-yingzhou-cyan text-black border-yingzhou-cyan'
              : 'bg-black text-yingzhou-cyan border-yingzhou-cyan hover:bg-yingzhou-cyan hover:text-black'
          }`}
        >
          \u5168\u90E8
        </button>
        <button
          onClick={() => setFilter('owned')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'owned'
              ? 'bg-green-500 text-black border-green-500'
              : 'bg-black text-green-400 border-green-400 hover:bg-green-500 hover:text-black'
          }`}
        >
          \u5DF2\u62E5\u6709
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`px-3 py-1 text-sm border transition-all ${
            filter === 'hidden'
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-black text-yellow-400 border-yellow-400 hover:bg-yellow-500 hover:text-black'
          }`}
        >
          \u9690\u85CF\u788E\u7247
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
      
      {/* \u788E\u7247\u7F51\u683C */}
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
            <div className="absolute top-1 right-1 text-sm">
              {fragment.isHidden ? '\uD83D\uDD36' : '\uD83D\uDD37'}
            </div>
            
            <div className="text-xs text-gray-400">#{fragment.id}</div>
            
            <div className="text-2xl my-1">
              {fragment.owned ? '\u2713' : '\u2753'}
            </div>
            
            <div className="text-center text-xs font-medium truncate w-full px-1">
              {fragment.owned ? fragment.name : '???'}
            </div>
            
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
      
      {filteredFragments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u788E\u7247</p>
        </div>
      )}
      
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">\uD83D\uDCA1 \u83B7\u53D6\u788E\u7247\u7684\u65B9\u6CD5\uFF1A</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>\uD83D\uDD37 <span className="text-yingzhou-cyan">\u4E3B\u8981\u788E\u7247</span>\uFF1A\u5B8C\u6210\u5BF9\u5E94\u7EAA\u5143\u7684\u5C0F\u6E38\u620F\u6311\u6218</li>
          <li>\uD83D\uDD36 <span className="text-yellow-400">\u9690\u85CF\u788E\u7247</span>\uFF1A\u5728AI\u5BF9\u8BDD\u4E2D\u8BF4\u51FA\u7279\u5B9A\u5173\u952E\u8BCD</li>
          <li>\uD83C\uDFAF \u6BCF\u4E2A\u7EAA\u5143\u6709\u72EC\u7279\u7684\u5173\u952E\u8BCD\uFF0CAI\u4F1A\u7ED9\u51FA\u63D0\u793A</li>
          <li>\uD83D\uDD0D \u6536\u96C6\u8DB3\u591F\u788E\u7247\u53EF\u89E3\u9501\u4E0B\u4E00\u7EAA\u5143</li>
        </ul>
      </div>
      
      {/* \u788E\u7247\u8BE6\u60C5\u5F39\u7A97 */}
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
                  <span>{EPOCH_NAMES[selectedInfo.epoch]}\u7EAA\u5143</span>
                  <span>|</span>
                  <span>{selectedInfo.isHidden ? '\u9690\u85CF\u788E\u7247\uD83D\uDD36' : '\u4E3B\u8981\u788E\u7247\uD83D\uDD37'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFragment(null)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                \u2715
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
                \u5173\u95ED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
