/**
 * Web2 模式的数字生命卡片
 * 使用模拟钱包而不是真实合约
 */

'use client'

import { useState, useEffect } from 'react'
import { IWalletAdapter } from '@/lib/walletAdapter'

interface DigitalBeingCardWeb2Props {
  walletAdapter: IWalletAdapter
  beingId: number | null
  setBeingId: (id: number | null) => void
}

export default function DigitalBeingCardWeb2({ 
  walletAdapter, 
  beingId, 
  setBeingId 
}: DigitalBeingCardWeb2Props) {
  const [loading, setLoading] = useState(false)
  const [beingData, setBeingData] = useState<any>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    loadBeingData()
  }, [beingId])

  const loadBeingData = async () => {
    if (beingId === null) return

    try {
      const data = await walletAdapter.getDigitalBeing(beingId)
      setBeingData(data)
    } catch (error) {
      console.error('加载数字生命失败:', error)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('请输入名称')
      return
    }

    setLoading(true)
    try {
      const tokenId = await walletAdapter.createDigitalBeing(name, {
        createdAt: Date.now(),
        level: 1,
        experience: 0
      })
      
      setBeingId(tokenId)
      alert(`✅ 数字生命创建成功！\n\nToken ID: ${tokenId}\n名称: ${name}`)
    } catch (error: any) {
      console.error('创建失败:', error)
      alert(`❌ 创建失败：${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="digital-frame">
      <h2 className="text-2xl text-yingzhou-cyan mb-4 glow-text">
        🧬 数字生命
      </h2>

      {beingId === null ? (
        <div>
          <p className="text-gray-400 mb-4">
            你还没有数字生命。创建一个开始你的旅程。
          </p>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的数字生命名称"
              className="w-full px-4 py-2 bg-black border border-yingzhou-cyan text-white focus:outline-none focus:border-yingzhou-blue"
              maxLength={32}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '创建中...' : '创建数字生命'}
          </button>

          <div className="mt-4 p-3 bg-green-900 bg-opacity-20 border border-green-400 rounded text-sm">
            <p className="text-green-400 font-semibold mb-1">💡 Web2 模式提示</p>
            <p className="text-gray-300">
              在 Web2 模式下，你的数字生命数据保存在本地浏览器中，无需支付 Gas 费用。
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-900 to-blue-900 bg-opacity-30 border border-purple-500 rounded">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-400">Token ID</p>
                <p className="text-2xl font-bold text-purple-400">#{beingId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">名称</p>
                <p className="text-xl font-bold text-white">{beingData?.name || '加载中...'}</p>
              </div>
            </div>

            {beingData?.attributes && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-black bg-opacity-50 p-2 rounded">
                  <p className="text-xs text-gray-400">等级</p>
                  <p className="text-lg font-bold text-yingzhou-cyan">
                    {beingData.attributes.level || 1}
                  </p>
                </div>
                <div className="bg-black bg-opacity-50 p-2 rounded">
                  <p className="text-xs text-gray-400">经验</p>
                  <p className="text-lg font-bold text-yingzhou-cyan">
                    {beingData.attributes.experience || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-400">
            <p className="mb-2">✓ 数字生命已创建</p>
            <p className="mb-2">✓ 可以开始探索瀛州世界</p>
            <p>✓ 数据保存在本地浏览器</p>
          </div>
        </div>
      )}
    </div>
  )
}
