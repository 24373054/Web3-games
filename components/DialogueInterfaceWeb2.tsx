'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { IWalletAdapter } from '@/lib/walletAdapter'
import { NPC_KEYWORDS } from '@/lib/mockWallet'

interface Message {
  role: 'user' | 'npc'
  content: string
  timestamp: number
}

interface DialogueInterfaceWeb2Props {
  walletAdapter: IWalletAdapter
  npcId: string
  onFragmentEarned?: (fragmentId: number) => void
}

const NPC_INFO: Record<string, { name: string, icon: string, color: string }> = {
  historian: { name: '史官·记录者', icon: '📜', color: '#00FFFF' },
  craftsman: { name: '工匠·塑造者', icon: '⚒️', color: '#00FF00' },
  merchant: { name: '商序·交易者', icon: '💰', color: '#FFD700' },
  prophet: { name: '先知·预言者', icon: '🔮', color: '#FF4444' },
  forgotten: { name: '遗忘者·见证者', icon: '👻', color: '#9B59B6' }
}

export default function DialogueInterfaceWeb2({ walletAdapter, npcId, onFragmentEarned }: DialogueInterfaceWeb2Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const npcInfo = NPC_INFO[npcId] || NPC_INFO.historian
  const npcKeywords = NPC_KEYWORDS[npcId]
  const npcHint = walletAdapter.getKeywordHint(npcId)
  const npcStyle = walletAdapter.getNpcStyle?.(npcId) || ''

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    walletAdapter.getInteractions(npcId).then((history: any[]) => {
      const msgs: Message[] = []
      history.forEach((h: any) => {
        msgs.push({ role: 'user', content: h.message, timestamp: h.timestamp })
        msgs.push({ role: 'npc', content: h.response, timestamp: h.timestamp + 1 })
      })
      setMessages(msgs)
    })
  }, [npcId, walletAdapter])


  const generateFallbackResponse = (npcType: string): string => {
    const responses: Record<string, string[]> = {
      historian: [
        '古老的记录显示...这个问题与世界的起源有关。',
        '我在无尽的数据流中看到了创世的痕迹...',
        '让我查阅远古的账本...诞生之初，一切都是虚无。',
        '你想了解起源的秘密吗？这需要深入的探索...'
      ],
      craftsman: [
        '就像锻造一件工艺品，生命需要时间来成长。',
        '每一个细节都很重要！就像萌芽需要精心呵护。',
        '我的工作就是见证进化的过程，从简单到复杂。',
        '你知道吗？最美的创造都来自不断的成长和试错。'
      ],
      merchant: [
        '在文明的巅峰时期，交易带来了繁荣和辉煌！',
        '让我告诉你一个关于文明鼎盛时期的故事...',
        '价值的交换是文明的基石，繁荣由此而来。',
        '我见证过最辉煌的时代，那时的交易市场多么繁忙！'
      ],
      prophet: [
        '我看到了...混乱即将降临...熵化不可避免...',
        '预言已经写在数据流中...衰败的征兆早已显现。',
        '你感受到了吗？秩序正在崩塌...混乱在蔓延...',
        '我的预言从未出错...熵化的力量正在增强...'
      ],
      forgotten: [
        '毁灭...终结...但也是新的开始。',
        '我已经看透了一切。轮回是永恒的。',
        '在终结之后，必有重生。这是宇宙的法则。',
        '我是最后的见证者...也将是新纪元的第一个观察者。'
      ]
    }
    const npcResponses = responses[npcType] || responses.historian
    return npcResponses[Math.floor(Math.random() * npcResponses.length)]
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          npcType: npcId, 
          npcStyle: npcStyle,
          hint: npcHint,
          keywords: npcKeywords?.keywords || []
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data.response
      }
    } catch (e) { 
      console.log('AI API error, using fallback') 
    }
    return generateFallbackResponse(npcId)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }])
    
    try {
      const keywordResult = walletAdapter.checkKeywordAndReward(userMessage, npcId)
      const response = await generateAIResponse(userMessage)
      setMessages(prev => [...prev, { role: 'npc', content: response, timestamp: Date.now() }])
      await walletAdapter.interactWithNPC(npcId, userMessage, response)
      
      if (keywordResult.found) {
        setTimeout(() => {
          alert('🎉 发现关键词：「' + keywordResult.keyword + '」！\n\n✨ 获得隐藏碎片 #' + keywordResult.fragmentId + '！')
          onFragmentEarned?.(keywordResult.fragmentId!)
        }, 500)
      }
    } catch (error) { 
      console.error('Send failed:', error) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault()
      handleSend() 
    }
  }


  return (
    <div className="digital-frame">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{npcInfo.icon}</span>
          <h3 className="text-lg font-bold" style={{ color: npcInfo.color }}>{npcInfo.name}</h3>
        </div>
      </div>

      <div className="h-64 overflow-y-auto mb-4 space-y-3 p-3 bg-yingzhou-dark bg-opacity-50 rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>开始与 {npcInfo.name} 对话</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div 
              className={`inline-block max-w-xs p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-yingzhou-cyan bg-opacity-20 border border-yingzhou-cyan' 
                  : 'bg-opacity-30 border'
              }`}
              style={msg.role === 'npc' ? { 
                backgroundColor: `${npcInfo.color}20`, 
                borderColor: `${npcInfo.color}60` 
              } : {}}
            >
              {msg.role === 'npc' && (
                <div className="text-xs mb-1" style={{ color: npcInfo.color }}>{npcInfo.icon} {npcInfo.name}</div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-opacity-30 border" style={{ backgroundColor: `${npcInfo.color}20`, borderColor: `${npcInfo.color}60` }}>
              <p className="text-sm animate-pulse">{npcInfo.icon} 正在思考...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题..." 
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yingzhou-dark border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ borderColor: npcInfo.color }}
        />
        <button 
          onClick={handleSend} 
          disabled={!input.trim() || loading} 
          className="px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ backgroundColor: npcInfo.color, color: '#000' }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
