'use client'

import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { getAINPCContract, getDigitalBeingContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'
import { NPC_KEYWORDS } from '@/lib/mockWallet'

interface DialogueInterfaceProps {
  provider: ethers.BrowserProvider | null
  beingId: number
  npcId: string
  onFragmentEarned?: (fragmentId: number) => void
}

interface Message {
  role: 'user' | 'npc'
  content: string
  timestamp: number
  entropyLevel?: number
}

const NPC_INFO: Record<string, { name: string, icon: string, color: string }> = {
  historian: { name: '\u53F2\u5B98\u00B7\u8BB0\u5F55\u8005', icon: '\uD83D\uDCDC', color: '#00FFFF' },
  craftsman: { name: '\u5DE5\u5320\u00B7\u5851\u9020\u8005', icon: '\u2692\uFE0F', color: '#00FF00' },
  merchant: { name: '\u5546\u5E8F\u00B7\u4EA4\u6613\u8005', icon: '\uD83D\uDCB0', color: '#FFD700' },
  prophet: { name: '\u5148\u77E5\u00B7\u9884\u8A00\u8005', icon: '\uD83D\uDD2E', color: '#FF4444' },
  forgotten: { name: '\u9057\u5FD8\u8005\u00B7\u89C1\u8BC1\u8005', icon: '\uD83D\uDC7B', color: '#9B59B6' }
}

export default function DialogueInterface({ provider, beingId, npcId, onFragmentEarned }: DialogueInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [npcContractInfo, setNpcContractInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [foundKeywords, setFoundKeywords] = useState<Set<string>>(new Set())

  const npcInfo = NPC_INFO[npcId] || NPC_INFO.historian
  const npcKeywords = NPC_KEYWORDS[npcId]

  useEffect(() => {
    if (npcId) {
      if (provider) {
        loadNPCInfo()
      }
      setMessages([])
      loadHistory()
    }
  }, [npcId, provider])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const npcIdToBytes32 = (id: string): string => {
    try {
      if (id.startsWith('0x') && id.length === 66) {
        return id
      }
      return ethers.encodeBytes32String(id)
    } catch (error) {
      console.error('NPC ID \u8F6C\u6362\u5931\u8D25:', error)
      return id
    }
  }

  const loadNPCInfo = async () => {
    if (!provider) return
    try {
      const contract = getAINPCContract(provider)
      const npcIdBytes = npcIdToBytes32(npcId)
      const npc = await contract.getNPC(npcIdBytes)
      setNpcContractInfo({
        type: Number(npc.npcType),
        name: npc.name,
        degradationLevel: Number(npc.degradationLevel)
      })
    } catch (error) {
      console.error('\u52A0\u8F7DNPC\u4FE1\u606F\u5931\u8D25:', error)
    }
  }

  const loadHistory = async () => {
    if (!npcId || loadingHistory) return
    try {
      setLoadingHistory(true)
      const rpc = getRpcProvider()
      const contract = getAINPCContract(rpc)
      const npcIdBytes = npcIdToBytes32(npcId)
      const history = await contract.getDialogueHistory(npcIdBytes)
      const msgs: Message[] = []
      const seenReqIds = new Set<string>()
      for (let i = 0; i < history.length; i++) {
        const item = history[i]
        const ts = Number(item.timestamp) * 1000
        const reqId = item.responseHash
        const reqIdHex = String(reqId)
        if (seenReqIds.has(reqIdHex)) continue
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
      msgs.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(msgs)
    } catch (e) {
      console.error('\u52A0\u8F7D\u94FE\u4E0A\u5386\u53F2\u5BF9\u8BDD\u5931\u8D25:', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  // \u68C0\u67E5\u5173\u952E\u8BCD
  const checkKeyword = (message: string): { found: boolean; keyword?: string; fragmentId?: number } => {
    if (!npcKeywords) return { found: false }
    const lowerMsg = message.toLowerCase()
    const keywords = npcKeywords.keywords
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i]
      if (lowerMsg.includes(kw.toLowerCase()) && !foundKeywords.has(kw)) {
        setFoundKeywords(prev => new Set(Array.from(prev).concat([kw])))
        return { found: true, keyword: kw, fragmentId: npcKeywords.fragmentId }
      }
    }
    return { found: false }
  }

  // \u8C03\u7528AI API
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          npcType: npcId,
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

  const generateFallbackResponse = (npcType: string): string => {
    const responses: Record<string, string[]> = {
      historian: [
        '\u53E4\u8001\u7684\u8BB0\u5F55\u663E\u793A...\u8FD9\u4E2A\u95EE\u9898\u4E0E\u4E16\u754C\u7684\u8D77\u6E90\u6709\u5173\u3002',
        '\u6211\u5728\u65E0\u5C3D\u7684\u6570\u636E\u6D41\u4E2D\u770B\u5230\u4E86\u521B\u4E16\u7684\u75D5\u8FF9...',
        '\u8BA9\u6211\u67E5\u9605\u8FDC\u53E4\u7684\u8D26\u672C...\u8BDE\u751F\u4E4B\u521D\uFF0C\u4E00\u5207\u90FD\u662F\u865A\u65E0\u3002'
      ],
      craftsman: [
        '\u5C31\u50CF\u953B\u9020\u4E00\u4EF6\u5DE5\u827A\u54C1\uFF0C\u751F\u547D\u9700\u8981\u65F6\u95F4\u6765\u6210\u957F\u3002',
        '\u6BCF\u4E00\u4E2A\u7EC6\u8282\u90FD\u5F88\u91CD\u8981\uFF01\u5C31\u50CF\u840C\u82BD\u9700\u8981\u7CBE\u5FC3\u5475\u62A4\u3002',
        '\u6211\u7684\u5DE5\u4F5C\u5C31\u662F\u89C1\u8BC1\u8FDB\u5316\u7684\u8FC7\u7A0B\uFF0C\u4ECE\u7B80\u5355\u5230\u590D\u6742\u3002'
      ],
      merchant: [
        '\u5728\u6587\u660E\u7684\u5DC5\u5CF0\u65F6\u671F\uFF0C\u4EA4\u6613\u5E26\u6765\u4E86\u7E41\u8363\u548C\u8F89\u714C\uFF01',
        '\u8BA9\u6211\u544A\u8BC9\u4F60\u4E00\u4E2A\u5173\u4E8E\u6587\u660E\u9F0E\u76DB\u65F6\u671F\u7684\u6545\u4E8B...',
        '\u4EF7\u503C\u7684\u4EA4\u6362\u662F\u6587\u660E\u7684\u57FA\u77F3\uFF0C\u7E41\u8363\u7531\u6B64\u800C\u6765\u3002'
      ],
      prophet: [
        '\u6211\u770B\u5230\u4E86...\u6DF7\u4E71\u5373\u5C06\u964D\u4E34...\u71B5\u5316\u4E0D\u53EF\u907F\u514D...',
        '\u9884\u8A00\u5DF2\u7ECF\u5199\u5728\u6570\u636E\u6D41\u4E2D...\u8870\u8D25\u7684\u5F81\u5146\u65E9\u5DF2\u663E\u73B0\u3002',
        '\u4F60\u611F\u53D7\u5230\u4E86\u5417\uFF1F\u79E9\u5E8F\u6B63\u5728\u5D29\u584C...\u6DF7\u4E71\u5728\u8513\u5EF6...'
      ],
      forgotten: [
        '\u6BC1\u706D...\u7EC8\u7ED3...\u4F46\u4E5F\u662F\u65B0\u7684\u5F00\u59CB\u3002',
        '\u6211\u5DF2\u7ECF\u770B\u900F\u4E86\u4E00\u5207\u3002\u8F6E\u56DE\u662F\u6C38\u6052\u7684\u3002',
        '\u5728\u7EC8\u7ED3\u4E4B\u540E\uFF0C\u5FC5\u6709\u91CD\u751F\u3002\u8FD9\u662F\u5B87\u5B99\u7684\u6CD5\u5219\u3002'
      ]
    }
    const npcResponses = responses[npcType] || responses.historian
    return npcResponses[Math.floor(Math.random() * npcResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !provider || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }])

    try {
      const signer = await provider.getSigner()
      const ainpc = getAINPCContract(signer)
      const ainpcAddress = await ainpc.getAddress()
      const ainpcIface = ainpc.interface as any
      const digitalBeing = getDigitalBeingContract(signer)

      const npcIdBytes = npcIdToBytes32(npcId)
      const questionHash = ethers.keccak256(ethers.toUtf8Bytes(userMessage))
      const callData = ainpcIface.encodeFunctionData('interact', [npcIdBytes, questionHash])
      
      const tx = await digitalBeing.interact(beingId, ainpcAddress, callData)
      const receipt = await tx.wait()
      
      let requestId: string | null = null
      try {
        for (const log of receipt.logs) {
          try {
            const parsed = ainpcIface.parseLog({ topics: log.topics, data: log.data })
            if (parsed.name === 'DialogueRecorded') {
              requestId = parsed.args[2]
              break
            }
          } catch (_) {}
        }
      } catch (e) {
        console.error('\u89E3\u6790 requestId \u5931\u8D25:', e)
      }

      await loadNPCInfo()

      // \u68C0\u67E5\u5173\u952E\u8BCD
      const keywordResult = checkKeyword(userMessage)

      // \u8C03\u7528AI\u751F\u6210\u56DE\u590D
      const aiResponse = await generateAIResponse(userMessage)

      // \u5B58\u50A8\u5230\u94FE\u4E0A
      try {
        if (requestId) {
          const res = await fetch('/api/store-dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              npcId: npcIdBytes,
              requestId,
              questionHash,
              questionText: userMessage,
              responseText: aiResponse,
              beingId
            })
          })
          if (!res.ok) {
            console.warn('\u670D\u52A1\u7AEF\u5B58\u50A8\u5931\u8D25')
          }
        }
      } catch (e) {
        console.error('\u5B58\u50A8\u5BF9\u8BDD\u4E0A\u94FE\u5931\u8D25:', e)
      }

      const entropy = npcContractInfo?.degradationLevel || 0
      setMessages(prev => [...prev, { 
        role: 'npc', 
        content: aiResponse, 
        timestamp: Date.now(),
        entropyLevel: entropy
      }])

      // \u5982\u679C\u53D1\u73B0\u5173\u952E\u8BCD
      if (keywordResult.found) {
        setTimeout(() => {
          alert('\uD83C\uDF89 \u53D1\u73B0\u5173\u952E\u8BCD\uFF1A\u300C' + keywordResult.keyword + '\u300D\uFF01\n\n\u2728 \u83B7\u5F97\u9690\u85CF\u788E\u7247 #' + keywordResult.fragmentId + '\uFF01')
          onFragmentEarned?.(keywordResult.fragmentId!)
        }, 500)
      }

    } catch (error) {
      console.error('\u53D1\u9001\u6D88\u606F\u5931\u8D25:', error)
      alert('\u53D1\u9001\u5931\u8D25: ' + (error as Error).message)
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

  return (
    <div className="digital-frame">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{npcInfo.icon}</span>
          <h3 className="text-lg font-bold" style={{ color: npcInfo.color }}>{npcInfo.name}</h3>
        </div>
        {npcContractInfo && (
          <span className={`text-xs px-2 py-1 rounded ${
            npcContractInfo.degradationLevel < 30 ? 'bg-green-900 text-green-300' :
            npcContractInfo.degradationLevel < 60 ? 'bg-yellow-900 text-yellow-300' :
            npcContractInfo.degradationLevel < 90 ? 'bg-orange-900 text-orange-300' :
            'bg-red-900 text-red-300'
          }`}>
            \u8870\u53D8: {npcContractInfo.degradationLevel}%
          </span>
        )}
      </div>

      <div className="h-64 overflow-y-auto mb-4 space-y-3 p-3 bg-yingzhou-dark bg-opacity-50 rounded-lg">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>\u5F00\u59CB\u4E0E {npcInfo.name} \u5BF9\u8BDD</p>
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
              <p className="text-xs text-gray-500 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.entropyLevel !== undefined && ` \u00B7 \u71B5: ${msg.entropyLevel}%`}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-opacity-30 border" style={{ backgroundColor: `${npcInfo.color}20`, borderColor: `${npcInfo.color}60` }}>
              <p className="text-sm animate-pulse">{npcInfo.icon} \u6B63\u5728\u601D\u8003...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="\u8F93\u5165\u4F60\u7684\u95EE\u9898..." 
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yingzhou-dark border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ borderColor: npcInfo.color }}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || loading} 
          className="px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ backgroundColor: npcInfo.color, color: '#000' }}
        >
          \u53D1\u9001
        </button>
      </div>
    </div>
  )
}
