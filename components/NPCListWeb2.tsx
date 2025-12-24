'use client'

import React from 'react'

interface NPCListWeb2Props {
  selectedNPC: string | null
  setSelectedNPC: (id: string | null) => void
}

const NPC_LIST = [
  { id: 'historian', name: '史官·记录者', icon: '📜', color: '#00FFFF', desc: '记录与历史的守护者，知晓世界的起源' },
  { id: 'craftsman', name: '工匠·塑造者', icon: '⚒️', color: '#00FF00', desc: '生命的锻造者，见证成长与进化' },
  { id: 'merchant', name: '商序·交易者', icon: '💰', color: '#FFD700', desc: '繁荣的见证者，熟知文明的辉煌' },
  { id: 'prophet', name: '先知·预言者', icon: '🔮', color: '#FF4444', desc: '命运的预言者，洞察衰败与混乱' },
  { id: 'forgotten', name: '遗忘者·见证者', icon: '👻', color: '#9B59B6', desc: '终焉的守望者，理解毁灭与轮回' }
]

export default function NPCListWeb2({ selectedNPC, setSelectedNPC }: NPCListWeb2Props) {
  return (
    <div className="digital-frame">
      <h3 className="text-lg font-bold mb-4 glow-text">智能体（AI-NPC）</h3>
      <p className="text-xs text-gray-400 mb-4">
        选择一个智能体进行交互，说出关键词可获得隐藏碎片
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NPC_LIST.map((npc) => (
          <button
            key={npc.id}
            onClick={() => setSelectedNPC(npc.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedNPC === npc.id
                ? 'border-yingzhou-cyan bg-yingzhou-cyan bg-opacity-10 scale-105'
                : 'border-gray-600 hover:border-yingzhou-cyan hover:bg-yingzhou-blue hover:bg-opacity-20'
            }`}
            style={selectedNPC === npc.id ? { borderColor: npc.color, boxShadow: `0 0 15px ${npc.color}40` } : {}}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{npc.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold mb-1" style={{ color: npc.color }}>
                  {npc.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {npc.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
