'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getWorldLedgerContract, getAINPCContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface EventTimelineProps {
  provider: ethers.BrowserProvider | null
}

const eventTypeNames = ['创建', '交互', '发现', '冲突', '记忆']
const eventTypeIcons = ['🌟', '🤝', '🔍', '⚔️', '💭']

export default function EventTimeline({ provider }: EventTimelineProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [openContent, setOpenContent] = useState<Record<number, { loading: boolean, q?: string, a?: string }>>({})

  useEffect(() => {
    if (provider) {
      loadEvents()
      const interval = setInterval(loadEvents, 10000) // 每10秒刷新
      return () => clearInterval(interval)
    }
  }, [provider])

  const loadEvents = async () => {
    try {
      const rpc = getRpcProvider()
      const contract = getWorldLedgerContract(rpc)
      const eventCounter = await contract.eventCounter()
      const count = Number(eventCounter)
      setTotalEvents(count)

      // 如果没有事件，直接返回
      if (count === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      // 加载最近的10个事件
      const startIdx = Math.max(0, count - 10)
      
      const eventPromises = []
      for (let i = count - 1; i >= startIdx; i--) {
        // 使用函数签名避免与 ethers 内部 key 冲突
        eventPromises.push(contract["getEvent(uint256)"](i))
      }

      const eventData = await Promise.all(eventPromises)
      
      console.log('加载到的事件数据:', eventData.length, eventData)
      
      const formattedEvents = eventData.map((event) => ({
        id: Number(event.id),
        timestamp: Number(event.timestamp),
        blockNumber: Number(event.blockNumber),
        eventType: Number(event.eventType),
        actor: event.actor,
        metadata: event.metadata
      }))

      console.log('格式化后的事件:', formattedEvents)

      setEvents(formattedEvents)
      setLoading(false)
    } catch (error) {
      console.error('加载事件失败:', error)
      setLoading(false)
    }
  }

  // 解析 metadata 中的 requestId
  const extractRequestId = (metadata: string): string | null => {
    if (!metadata) return null
    try {
      const obj = JSON.parse(metadata)
      if (obj && obj.type === 'npc_dialogue_store' && typeof obj.requestId === 'string') {
        return obj.requestId
      }
    } catch (e) {
      // 非JSON或解析失败
    }
    return null
  }

  const toggleViewContent = async (eventId: number, metadata: string) => {
    const reqId = extractRequestId(metadata)
    if (!reqId) return

    // 折叠
    if (openContent[eventId] && !openContent[eventId].loading && openContent[eventId].q) {
      const copy = { ...openContent }
      delete copy[eventId]
      setOpenContent(copy)
      return
    }

    // 加载
    setOpenContent(prev => ({ ...prev, [eventId]: { loading: true } }))
    try {
      const rpc = getRpcProvider()
      const ainpc = getAINPCContract(rpc)
      // 调用公共映射 getter：dialogueContents(bytes32)
      const content = await ainpc["dialogueContents(bytes32)"](reqId)
      setOpenContent(prev => ({ ...prev, [eventId]: { loading: false, q: content.question, a: content.response } }))
    } catch (e) {
      console.error('读取对话内容失败:', e)
      setOpenContent(prev => ({ ...prev, [eventId]: { loading: false, q: '读取失败', a: '' } }))
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <h3 className="text-lg font-bold mb-4 glow-text">历史事件</h3>
        <p className="loading-text">加载中...</p>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold glow-text">历史事件</h3>
        <span className="text-xs text-gray-400">
          总计: {totalEvents} 个事件
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            还没有历史事件
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-yingzhou-dark bg-opacity-50 border border-gray-700 
                       rounded-lg hover:border-yingzhou-cyan transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {eventTypeIcons[event.eventType]}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-yingzhou-cyan">
                      {eventTypeNames[event.eventType]}
                    </span>
                    <span className="text-xs text-gray-500">
                      #{event.id}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">
                    区块 {event.blockNumber} · {new Date(event.timestamp * 1000).toLocaleString()}
                  </p>

                  <p className="text-xs contract-text break-all">
                    {event.actor.slice(0, 10)}...{event.actor.slice(-8)}
                  </p>

                  {event.metadata && (
                    <div className="mt-2 p-2 bg-yingzhou-blue bg-opacity-20 rounded text-xs">
                      <pre className="whitespace-pre-wrap break-all text-gray-300">
                        {event.metadata}
                      </pre>
                      {extractRequestId(event.metadata) && (
                        <button
                          onClick={() => toggleViewContent(event.id, event.metadata)}
                          className="mt-2 btn-secondary px-3 py-1 text-xs"
                        >
                          {openContent[event.id] ? '收起对话' : '查看对话'}
                        </button>
                      )}

                      {openContent[event.id] && (
                        <div className="mt-2 p-2 border border-gray-700 rounded">
                          {openContent[event.id].loading ? (
                            <p className="text-gray-400">加载中...</p>
                          ) : (
                            <div className="space-y-2">
                              <div>
                                <p className="text-gray-400 text-[11px] mb-1">问题</p>
                                <pre className="whitespace-pre-wrap break-all text-gray-200">{openContent[event.id].q}</pre>
                              </div>
                              <div>
                                <p className="text-gray-400 text-[11px] mb-1">回答</p>
                                <pre className="whitespace-pre-wrap break-all text-gray-200">{openContent[event.id].a}</pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          所有事件都被永久记录在瀛州的账本之中
        </p>
      </div>
    </div>
  )
}

