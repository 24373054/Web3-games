'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getEpochManagerContract, getMemoryFragmentContract } from '@/lib/contracts'

const EPOCH_NAMES = ['\u521B\u4E16', '\u840C\u82BD', '\u7E41\u76DB', '\u71B5\u5316', '\u6BC1\u706D']
const EPOCH_COLORS = ['#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FFFFFF']
const EPOCH_ICONS = ['\uD83C\uDF0C', '\uD83C\uDF31', '\u2728', '\u26A1', '\uD83D\uDC80']
const EPOCH_DESC = [
  '\u4E16\u754C\u521D\u751F\uFF0C\u4E00\u5207\u4ECE\u865A\u65E0\u4E2D\u8BDE\u751F',
  '\u751F\u547D\u840C\u53D1\uFF0C\u4E07\u7269\u5F00\u59CB\u6210\u957F',
  '\u6587\u660E\u7E41\u76DB\uFF0C\u8FBE\u5230\u8F89\u714C\u9876\u5CF0',
  '\u79E9\u5E8F\u5D29\u584C\uFF0C\u71B5\u5316\u4FB5\u8680\u4E00\u5207',
  '\u7EC8\u7109\u964D\u4E34\uFF0C\u4F46\u8BB0\u5FC6\u6C38\u5B58'
]
const EPOCH_UNLOCK_REQUIREMENTS = [0, 1, 3, 6, 10]

export default function EpochPanel({ 
  provider, 
  account,
  beingId,
  onEpochChange
}: { 
  provider: ethers.BrowserProvider | null
  account: string | null
  beingId: number | null
  onEpochChange?: (epoch: number) => void
}) {
  const [currentEpoch, setCurrentEpoch] = useState<number>(0)
  const [playerFragments, setPlayerFragments] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (provider && account) {
      loadEpochInfo()
    }
  }, [provider, account, beingId])

  const loadEpochInfo = async () => {
    if (!provider || !account) return
    
    try {
      setLoading(true)
      setError(null)
      
      const epochContract = getEpochManagerContract(provider)
      const fragmentContract = getMemoryFragmentContract(provider)
      
      // \u83B7\u53D6\u5F53\u524D\u7EAA\u5143
      const epoch = await epochContract.getCurrentEpoch(account)
      setCurrentEpoch(Number(epoch))
      
      // \u83B7\u53D6\u73A9\u5BB6\u6536\u96C6\u7684\u788E\u7247
      const fragments: number[] = []
      try {
        const totalFragments = await fragmentContract.getTotalFragments()
        for (let i = 0; i < Number(totalFragments); i++) {
          const balance = await fragmentContract.balanceOf(account, i)
          if (Number(balance) > 0) {
            fragments.push(i)
          }
        }
      } catch (e) {
        console.log('\u83B7\u53D6\u788E\u7247\u5931\u8D25:', e)
      }
      setPlayerFragments(fragments)
      
      setLoading(false)
    } catch (err: any) {
      console.error('\u52A0\u8F7D\u7EAA\u5143\u4FE1\u606F\u5931\u8D25:', err)
      setError(err.message || '\u52A0\u8F7D\u5931\u8D25')
      setLoading(false)
    }
  }

  const handleAdvanceEpoch = async () => {
    if (!provider || !account) return
    
    const nextReq = EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1]
    if (playerFragments.length < nextReq) {
      alert('\u274C \u788E\u7247\u4E0D\u8DB3\uFF0C\u9700\u8981 ' + nextReq + ' \u4E2A\u788E\u7247')
      return
    }
    
    try {
      const signer = await provider.getSigner()
      const epochManagerContract = getEpochManagerContract(signer)
      
      const tx = await epochManagerContract.advanceEpoch(account)
      await tx.wait()
      
      const newEpoch = currentEpoch + 1
      setCurrentEpoch(newEpoch)
      onEpochChange?.(newEpoch)
      alert('\u2728 \u6210\u529F\u63A8\u8FDB\u5230 ' + EPOCH_NAMES[newEpoch] + ' \u7EAA\u5143\uFF01')
      loadEpochInfo()
    } catch (error: any) {
      console.error('\u63A8\u8FDB\u7EAA\u5143\u5931\u8D25:', error)
      alert('\u274C \u63A8\u8FDB\u5931\u8D25\uFF1A' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">\u26A1</div>
          <p className="text-gray-400">\u52A0\u8F7D\u7EAA\u5143\u4FE1\u606F...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <p className="text-red-400">\u26A0\uFE0F {error}</p>
          <button onClick={loadEpochInfo} className="btn-primary mt-4">
            \u91CD\u8BD5
          </button>
        </div>
      </div>
    )
  }

  const nextReq = currentEpoch < 4 ? EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1] : 0
  const canAdvance = currentEpoch < 4 && playerFragments.length >= nextReq
  const progress = nextReq > 0 ? Math.min((playerFragments.length / nextReq) * 100, 100) : 100

  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">\uD83C\uDF0C \u7EAA\u5143\u7CFB\u7EDF</h2>
      
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
              {EPOCH_NAMES[currentEpoch]}\u7EAA\u5143
            </h3>
          </div>
          <span className="text-sm text-gray-400">\u7EAA\u5143 {currentEpoch + 1}/5</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{EPOCH_DESC[currentEpoch]}</p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-3">\u6587\u660E\u6F14\u5316\u8FDB\u7A0B</h3>
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
                  {index < currentEpoch ? '\u2713' : EPOCH_ICONS[index]}
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
            \u63A8\u8FDB\u5230 {EPOCH_NAMES[currentEpoch + 1]}\u7EAA\u5143 {EPOCH_ICONS[currentEpoch + 1]}
          </h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 flex items-center gap-2">
                  <span>\uD83D\uDCDA</span>
                  <span>\u6536\u96C6\u8BB0\u5FC6\u788E\u7247</span>
                </span>
                <span className={`font-bold ${playerFragments.length >= nextReq ? 'text-green-400' : 'text-yellow-400'}`}>
                  {playerFragments.length} / {nextReq}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    playerFragments.length >= nextReq
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {playerFragments.length < nextReq && (
                <p className="text-xs text-gray-500 mt-1">
                  \u8FD8\u9700\u6536\u96C6 {nextReq - playerFragments.length} \u4E2A\u788E\u7247
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
              {canAdvance ? `\u2728 \u63A8\u8FDB\u5230 ${EPOCH_NAMES[currentEpoch + 1]}\u7EAA\u5143` : '\uD83D\uDD12 \u6761\u4EF6\u672A\u6EE1\u8DB3'}
            </button>
            
            {canAdvance && (
              <div className="text-center text-sm text-green-400 animate-pulse">
                \u2713 \u4F60\u5DF2\u6EE1\u8DB3\u63A8\u8FDB\u6761\u4EF6\uFF01
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
          <p className="text-white font-bold text-xl mb-2">\u26A0\uFE0F \u6BC1\u706D\u7EAA\u5143</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            \u4F60\u5DF2\u7ECF\u5230\u8FBE\u701B\u6D32\u6587\u660E\u7684\u7EC8\u70B9\u3002<br />
            \u4F46\u8D26\u672C\u5C06\u6C38\u8FDC\u4FDD\u5B58\u8FD9\u6BB5\u5386\u53F2\u3002
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-900 rounded-lg">
        <h4 className="text-sm text-gray-400 mb-2">\u5DF2\u6536\u96C6\u788E\u7247: {playerFragments.length}</h4>
        <div className="flex flex-wrap gap-2">
          {playerFragments.map(f => (
            <span key={f} className="px-2 py-1 bg-cyan-900 text-cyan-300 rounded text-xs">
              \u788E\u7247 #{f}
            </span>
          ))}
          {playerFragments.length === 0 && (
            <span className="text-gray-500 text-xs">\u6682\u65E0\u788E\u7247\uFF0C\u5B8C\u6210\u5C0F\u6E38\u620F\u6216\u4E0EAI\u5BF9\u8BDD\u83B7\u53D6</span>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">\uD83D\uDCA1 \u7EAA\u5143\u7CFB\u7EDF\u8BF4\u660E\uFF1A</h3>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>\uD83C\uDF0C \u701B\u6D32\u6587\u660E\u7ECF\u53865\u4E2A\u7EAA\u5143\uFF1A\u521B\u4E16 \u2192 \u840C\u82BD \u2192 \u7E41\u76DB \u2192 \u71B5\u5316 \u2192 \u6BC1\u706D</li>
          <li>\uD83D\uDCDA \u6536\u96C6\u8BB0\u5FC6\u788E\u7247\u53EF\u63A8\u8FDB\u7EAA\u5143</li>
          <li>\uD83C\uDFAE \u6BCF\u4E2A\u7EAA\u5143\u89E3\u9501\u5BF9\u5E94\u7684\u5C0F\u6E38\u620F</li>
          <li>\uD83E\uDD16 \u4E0EAI\u5BF9\u8BDD\u8BF4\u51FA\u5173\u952E\u8BCD\u53EF\u83B7\u5F97\u989D\u5916\u788E\u7247</li>
          <li>\u23F0 \u7EAA\u5143\u63A8\u8FDB\u4E0D\u53EF\u9006\uFF0C\u8BF7\u8C28\u614E\u9009\u62E9</li>
        </ul>
      </div>
    </div>
  )
}
