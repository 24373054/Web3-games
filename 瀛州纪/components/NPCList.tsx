'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getAINPCContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface NPCListProps {
  provider: ethers.BrowserProvider | null
  selectedNPC: string | null
  setSelectedNPC: (id: string | null) => void
}

const npcTypeNames = ['史官', '工匠', '商序', '先知', '遗忘']
const npcTypeDescriptions = [
  '记录与历史的守护者',
  '创世规则的构建者',
  '资源流动的仲裁者',
  '未来可能性的预言者',
  '混沌与衰变的化身'
]
const npcTypeIcons = ['📜', '🔨', '⚖️', '🔮', '🌀']

export default function NPCList({ provider, selectedNPC, setSelectedNPC }: NPCListProps) {
  const [npcs, setNpcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (provider) {
      loadNPCs()
    }
  }, [provider])

  const loadNPCs = async () => {
    // 读取 NPC 列表使用本地 RPC，避免钱包网络影响

    try {
      const rpc = getRpcProvider()
      const contract = getAINPCContract(rpc)
      const npcIds = await contract.getAllNPCs()
      
      const npcDataPromises = npcIds.map(async (id: string) => {
        const npc = await contract.getNPC(id)
        return {
          id,
          type: Number(npc.npcType),
          name: npc.name,
          interactionCount: Number(npc.interactionCount),
          degradationLevel: Number(npc.degradationLevel),
          isActive: npc.isActive
        }
      })

      const npcData = await Promise.all(npcDataPromises)
      setNpcs(npcData)
      setLoading(false)
    } catch (error) {
      console.error('加载NPC失败:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <h3 className="text-lg font-bold mb-4 glow-text">智能体（AI-NPC）</h3>
        <p className="loading-text">加载中...</p>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <h3 className="text-lg font-bold mb-4 glow-text">智能体（AI-NPC）</h3>
      <p className="text-xs text-gray-400 mb-4">
        选择一个智能体进行交互，了解瀛州的历史
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {npcs.map((npc) => (
          <button
            key={npc.id}
            onClick={() => setSelectedNPC(npc.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedNPC === npc.id
                ? 'border-yingzhou-cyan bg-yingzhou-cyan bg-opacity-10'
                : 'border-gray-600 hover:border-yingzhou-cyan hover:bg-yingzhou-blue hover:bg-opacity-20'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{npcTypeIcons[npc.type]}</span>
              <div className="flex-1">
                <h4 className="font-bold text-yingzhou-cyan mb-1">
                  {npcTypeNames[npc.type]}
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  {npcTypeDescriptions[npc.type]}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    交互: {npc.interactionCount}
                  </span>
                  <span className={`${
                    npc.degradationLevel < 30 ? 'text-green-400' :
                    npc.degradationLevel < 60 ? 'text-yellow-400' :
                    npc.degradationLevel < 90 ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    衰变: {npc.degradationLevel}%
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {npcs.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          没有找到智能体
        </p>
      )}
    </div>
  )
}

