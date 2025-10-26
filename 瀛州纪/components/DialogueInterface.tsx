'use client'

import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { getAINPCContract, getDigitalBeingContract } from '@/lib/contracts'
import { callRealAI } from '@/lib/ai'
import { getRpcProvider } from '@/lib/provider'

interface DialogueInterfaceProps {
  provider: ethers.BrowserProvider | null
  beingId: number
  npcId: string
}

interface Message {
  role: 'user' | 'npc'
  content: string
  timestamp: number
  entropyLevel?: number
}

export default function DialogueInterface({ provider, beingId, npcId }: DialogueInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [npcInfo, setNpcInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [tempUserMessage, setTempUserMessage] = useState<Message | null>(null)

  useEffect(() => {
    if (npcId) {
      // NPC 基本信息仍依赖钱包 provider（已连接情况下）
      if (provider) {
        loadNPCInfo()
      }
      setMessages([]) // 切换NPC时清空对话
      loadHistory()
    }
  }, [npcId, provider])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadNPCInfo = async () => {
    if (!provider) return

    try {
      const contract = getAINPCContract(provider)
      const npc = await contract.getNPC(npcId)
      setNpcInfo({
        type: Number(npc.npcType),
        name: npc.name,
        degradationLevel: Number(npc.degradationLevel)
      })
    } catch (error) {
      console.error('加载NPC信息失败:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    if (!npcId || loadingHistory) return
    try {
      setLoadingHistory(true)
      const rpc = getRpcProvider()
      const contract = getAINPCContract(rpc)
      const history = await contract.getDialogueHistory(npcId)
      // 将链上历史转换为前端消息
      const msgs: Message[] = []
      const seenReqIds = new Set<string>()
      for (let i = 0; i < history.length; i++) {
        const item = history[i]
        const ts = Number(item.timestamp) * 1000
        const reqId = item.responseHash // 在合约中暂存为 requestId（bytes32）
        const reqIdHex = String(reqId)
        if (seenReqIds.has(reqIdHex)) continue
        // 读取内容
        const content = await contract["dialogueContents(bytes32)"](reqId)
        const questionText: string = (content && typeof content.question === 'string') ? content.question : ''
        const responseText: string = (content && typeof content.response === 'string') ? content.response : ''
        const entropy = Number(item.entropyLevel)

        if (questionText && responseText) {
          msgs.push({ role: 'user', content: questionText, timestamp: ts })
          msgs.push({ role: 'npc', content: responseText, timestamp: ts + 1, entropyLevel: entropy })
          seenReqIds.add(reqIdHex)
        }
      }
      // 按时间排序
      msgs.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(msgs)
      // 回放完成后清理临时气泡
      setTempUserMessage(null)
    } catch (e) {
      console.error('加载链上历史对话失败:', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !provider || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // 展示临时用户气泡，链上回放完成后会自动清除
    setTempUserMessage({ role: 'user', content: userMessage, timestamp: Date.now() })

    try {
      // 与合约交互（通过 DigitalBeing.interact 包装，以累计 Being 的交互次数）
      const signer = await provider.getSigner()
      const ainpc = getAINPCContract(signer)
      const ainpcAddress = await ainpc.getAddress()
      const ainpcIface = ainpc.interface as any
      const digitalBeing = getDigitalBeingContract(signer)

      const npcType = npcInfo?.type || 0
      const entropy = npcInfo?.degradationLevel || 0

      const questionHash = ethers.keccak256(ethers.toUtf8Bytes(userMessage))
      // 编码 AINPC.interact 调用数据
      const callData = ainpcIface.encodeFunctionData('interact', [npcId, questionHash])
      const tx = await digitalBeing.interact(beingId, ainpcAddress, callData)
      const receipt = await tx.wait()
      // 解析 requestId（从 AINPC 的 DialogueRecorded 事件）
      let requestId: string | null = null
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = ainpcIface.parseLog({ topics: log.topics, data: log.data })
            if (parsed.name === 'DialogueRecorded') {
              // args: npcId, inquirer, responseHash(=requestId)
              requestId = parsed.args[2]
              break
            }
          } catch (_) {}
        }
      } catch (e) {
        console.error('解析 requestId 失败:', e)
      }

      // 重新加载NPC信息（获取更新的衰变等级）
      await loadNPCInfo()

      // 使用服务端（DeepSeek）生成AI响应
      const aiResponse = await callRealAI(userMessage, npcType, entropy)

      // 不再本地插入 NPC 回复，避免与链上回放竞争导致重复
      // 统一以上链为准：上链成功后再从链上回放，确保只出现一次
      try {
        if (requestId) {
          // 交由服务端代付第二笔交易（只让用户确认一次）
          const res = await fetch('/api/store-dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              npcId,
              requestId,
              questionHash,
              questionText: userMessage,
              responseText: aiResponse,
              beingId
            })
          })
          if (!res.ok) {
            const t = await res.text()
            console.warn('服务端存储失败:', t)
          }
          // 统一从链上回放，避免重复
          await loadHistory()
        } else {
          console.warn('未获取到 requestId，跳过上链存储。')
        }
      } catch (e) {
        console.error('存储对话上链失败（已忽略）:', e)
      }

      // 添加NPC响应
      const npcMessage: Message = {
        role: 'npc',
        content: aiResponse,
        timestamp: Date.now(),
        entropyLevel: entropy
      }
      setMessages(prev => [...prev, npcMessage])

    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送失败: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const npcTypeNames = ['史官', '工匠', '商序', '先知', '遗忘']

  return (
    <div className="digital-frame">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold glow-text">
          对话：{npcInfo ? npcTypeNames[npcInfo.type] : '...'}
        </h3>
        {npcInfo && (
          <span className={`text-xs px-2 py-1 rounded ${
            npcInfo.degradationLevel < 30 ? 'bg-green-900 text-green-300' :
            npcInfo.degradationLevel < 60 ? 'bg-yellow-900 text-yellow-300' :
            npcInfo.degradationLevel < 90 ? 'bg-orange-900 text-orange-300' :
            'bg-red-900 text-red-300'
          }`}>
            衰变: {npcInfo.degradationLevel}%
          </span>
        )}
      </div>

      {/* 消息列表 */}
      <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-yingzhou-dark bg-opacity-50 rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">开始与智能体对话</p>
            <p className="text-xs">
              询问关于瀛州历史、创世规则、文明演化的问题
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-3/4 p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-yingzhou-cyan bg-opacity-20 border border-yingzhou-cyan'
                  : 'bg-yingzhou-blue bg-opacity-30 border border-gray-600'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.entropyLevel !== undefined && ` · 熵: ${msg.entropyLevel}%`}
              </p>
            </div>
          </div>
        ))}

        {/* 临时用户气泡 */}
        {tempUserMessage && (
          <div className="text-right">
            <div className="inline-block max-w-3/4 p-3 rounded-lg bg-yingzhou-cyan bg-opacity-20 border border-yingzhou-cyan">
              <p className="text-sm whitespace-pre-wrap">{tempUserMessage.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(tempUserMessage.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-yingzhou-blue bg-opacity-30 border border-gray-600">
              <p className="loading-text text-sm">智能体正在思考...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入你的问题..."
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yingzhou-dark border border-yingzhou-cyan rounded-lg 
                   text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
                   focus:ring-yingzhou-cyan disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        提示：每次交互都会消耗Gas，并被永久记录在链上
      </p>
    </div>
  )
}

