'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getEpochManagerContract, getMemoryFragmentContract } from '@/lib/contracts'

const EPOCH_NAMES = ['\u521B\u4E16', '\u840C\u82BD', '\u7E41\u76DB', '\u71B5\u5316', '\u6BC1\u706D']
const EPOCH_ICONS = ['\uD83C\uDF0C', '\uD83C\uDF31', '\u2728', '\u26A1', '\uD83D\uDC80']
const EPOCH_UNLOCK_REQUIREMENTS = [0, 1, 3, 6, 10]

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

export default function PlayerProgress({
  provider,
  account
}: {
  provider: ethers.BrowserProvider | null
  account: string | null
}) {
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [fragments, setFragments] = useState<number[]>([])
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

      const epochManager = getEpochManagerContract(provider)
      const epoch = await epochManager.getCurrentEpoch(account)
      setCurrentEpoch(Number(epoch))

      const fragmentContract = getMemoryFragmentContract(provider)
      const owned: number[] = []
      
      try {
        const totalFragments = await fragmentContract.getTotalFragments()
        for (let i = 0; i < Number(totalFragments); i++) {
          const balance = await fragmentContract.balanceOf(account, i)
          if (Number(balance) > 0) {
            owned.push(i)
          }
        }
      } catch (e) {
        console.log('\u83B7\u53D6\u788E\u7247\u5931\u8D25:', e)
      }

      setFragments(owned)
      setLoading(false)
    } catch (error) {
      console.error('\u52A0\u8F7D\u73A9\u5BB6\u8FDB\u5EA6\u5931\u8D25:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <div className="text-center py-8">
          <div className="text-yingzhou-cyan text-lg mb-2">\u26A1</div>
          <p className="text-gray-400">\u52A0\u8F7D\u8FDB\u5EA6...</p>
        </div>
      </div>
    )
  }

  const mainFragments = fragments.filter(f => FRAGMENT_INFO[f] && !FRAGMENT_INFO[f].isHidden).length
  const hiddenFragments = fragments.filter(f => FRAGMENT_INFO[f] && FRAGMENT_INFO[f].isHidden).length

  const totalProgress = Math.round(
    ((mainFragments / 10) * 40 +
    (hiddenFragments / 5) * 30 +
    (currentEpoch / 4) * 30) * 100
  ) / 100

  const nextEpochReq = currentEpoch < 4 ? EPOCH_UNLOCK_REQUIREMENTS[currentEpoch + 1] : 0

  return (
    <div className="digital-frame">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-yingzhou-cyan glow-text">\uD83D\uDCCA \u73A9\u5BB6\u8FDB\u5EA6</h2>
        <button 
          onClick={loadProgress}
          className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded hover:bg-gray-700"
        >
          \uD83D\uDD04 \u5237\u65B0
        </button>
      </div>

      {/* \u603B\u4F53\u8FDB\u5EA6 */}
      <div className="mb-6 p-4 border-2 border-yingzhou-cyan rounded-lg bg-yingzhou-dark">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-yingzhou-cyan">\u603B\u4F53\u8FDB\u5EA6</span>
          <span className="text-2xl font-bold text-yingzhou-cyan">{totalProgress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 transition-all duration-1000"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* \u8BE6\u7EC6\u7EDF\u8BA1 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">{EPOCH_ICONS[currentEpoch]}</div>
          <p className="text-xs text-gray-400 text-center">\u5F53\u524D\u7EAA\u5143</p>
          <p className="text-lg font-bold text-yingzhou-cyan text-center">{EPOCH_NAMES[currentEpoch]}</p>
          {currentEpoch < 4 && (
            <p className="text-xs text-gray-500 text-center mt-1">
              \u4E0B\u4E00\u7EAA\u5143\u9700\u8981 {nextEpochReq} \u788E\u7247
            </p>
          )}
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">\uD83D\uDD37</div>
          <p className="text-xs text-gray-400 text-center">\u4E3B\u8981\u788E\u7247</p>
          <p className="text-lg font-bold text-blue-400 text-center">
            {mainFragments} / 10
          </p>
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">\uD83D\uDD36</div>
          <p className="text-xs text-gray-400 text-center">\u9690\u85CF\u788E\u7247</p>
          <p className="text-lg font-bold text-yellow-400 text-center">
            {hiddenFragments} / 5
          </p>
        </div>

        <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
          <div className="text-4xl mb-2 text-center">\uD83C\uDFAE</div>
          <p className="text-xs text-gray-400 text-center">\u5C0F\u6E38\u620F\u89E3\u9501</p>
          <p className="text-lg font-bold text-green-400 text-center">
            {currentEpoch + 1} / 5
          </p>
        </div>
      </div>

      {/* \u5DF2\u6536\u96C6\u788E\u7247\u5217\u8868 */}
      <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-sm text-gray-400 mb-3">\uD83D\uDCDA \u5DF2\u6536\u96C6\u788E\u7247 ({fragments.length})</h3>
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
                {FRAGMENT_INFO[f]?.isHidden ? '\uD83D\uDD36' : '\uD83D\uDD37'} {FRAGMENT_INFO[f]?.name || `\u788E\u7247#${f}`}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-xs">\u6682\u65E0\u788E\u7247\uFF0C\u5B8C\u6210\u5C0F\u6E38\u620F\u6216\u4E0EAI\u5BF9\u8BDD\u83B7\u53D6</span>
          )}
        </div>
      </div>

      {/* \u6210\u5C31\u63D0\u793A */}
      <div className="p-4 border border-gray-700 rounded-lg bg-black bg-opacity-50">
        <h3 className="text-yingzhou-cyan text-sm font-bold mb-2">\uD83C\uDFC6 \u4E0B\u4E00\u4E2A\u76EE\u6807\uFF1A</h3>
        {currentEpoch < 4 ? (
          <div className="text-xs text-gray-400 space-y-1">
            <p>\u2022 \u6536\u96C6 {nextEpochReq - fragments.length > 0 ? nextEpochReq - fragments.length : 0} \u4E2A\u788E\u7247\u63A8\u8FDB\u5230 {EPOCH_NAMES[currentEpoch + 1]}\u7EAA\u5143</p>
            <p>\u2022 \u5B8C\u6210\u7EAA\u5143 {currentEpoch} \u7684\u5C0F\u6E38\u620F\u83B7\u5F97\u788E\u7247</p>
            <p>\u2022 \u4E0EAI\u5BF9\u8BDD\u53D1\u73B0\u9690\u85CF\u5173\u952E\u8BCD</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            \uD83C\uDF89 \u606D\u559C\uFF01\u4F60\u5DF2\u5230\u8FBE\u6700\u7EC8\u7EAA\u5143\u3002\u5C1D\u8BD5\u6536\u96C6\u6240\u670915\u4E2A\u788E\u7247\uFF01
          </p>
        )}
      </div>
    </div>
  )
}
