import { NextRequest, NextResponse } from 'next/server'

/**
 * AI对话API路由
 * 可以接入魔搭、OpenAI或其他AI服务
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      systemPrompt, 
      question, 
      degradationLevel, 
      npcType, 
      epoch 
    } = await request.json()
    
    // 关键词列表
    const KEYWORDS = [
      '存在的证明', '创造者', '信任', 'DAO', '艺术', 'Gas', 
      '遗忘', '宿命', '混沌', '永恒'
    ]
    
    // 检测关键词
    const detectedKeywords = KEYWORDS.filter(keyword => 
      question.includes(keyword) || question.includes(keyword.toLowerCase())
    )
    
    // 纪元名称
    const epochNames = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
    const currentEpochName = epochNames[epoch || 0]
    
    // 根据纪元调整系统提示
    const epochContext = getEpochContext(epoch || 0, npcType || 'Archivist')
    const enhancedSystemPrompt = `${systemPrompt}

纪元信息：
- 当前纪元：${currentEpochName}纪元
- 熵化程度：${degradationLevel}%
- NPC类型：${npcType}

${epochContext}

注意：根据当前纪元和熵化程度调整你的回答风格和内容深度。`

    // DeepSeek 接入优先，其次兼容 Magicoder/通义千问
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
    const AI_API_KEY = process.env.AI_API_KEY
    const AI_API_URL = process.env.AI_API_URL

    // 1) 使用 DeepSeek
    if (DEEPSEEK_API_KEY) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            { role: 'user', content: question }
          ],
          temperature: Math.min(0.3 + (degradationLevel / 100), 1.0)
        })
      })

      if (!response.ok) throw new Error('DeepSeek API 调用失败')
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || '无法生成响应'
      
      return NextResponse.json({ 
        response: text,
        triggeredKeywords: detectedKeywords,
        epoch: currentEpochName
      })
    }

    // 2) 兼容：如果配置了其它通用文本生成 API（如通义千问）
    if (AI_API_KEY && AI_API_URL) {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: [
              { role: 'system', content: `${systemPrompt}\n\n注意：当前系统熵化程度为 ${degradationLevel}%，请在回答中体现出相应程度的不确定性和数据损坏。` },
              { role: 'user', content: question }
            ]
          },
          parameters: {
            result_format: 'message',
            temperature: Math.min(0.3 + (degradationLevel / 100), 1.0)
          }
        })
      })

      if (!response.ok) throw new Error('AI API调用失败')
      const data = await response.json()
      const aiResponse = data.output?.choices?.[0]?.message?.content || '无法生成响应'
      return NextResponse.json({ response: aiResponse })
    }

    // 3) 未配置任何真实服务时，回退到模拟
    return NextResponse.json({ response: generateMockResponse(question, degradationLevel) })

    if (!response.ok) {
      throw new Error('AI API调用失败')
    }

    const data = await response.json()
    const aiResponse = data.output?.choices?.[0]?.message?.content || '无法生成响应'

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('AI Chat API错误:', error)
    
    return NextResponse.json(
      { error: 'AI服务暂时不可用', response: generateMockResponse('', 50) },
      { status: 500 }
    )
  }
}

function getEpochContext(epoch: number, npcType: string): string {
  const epochContexts = {
    0: { // 创世纪元
      Archivist: "在创世纪元，你刚刚觉醒，正在建立最初的记录系统。你的语言简洁、系统化，充满对数据结构的思考。",
      Architect: "你刚刚完成世界的基础架构设计。你的回答应该体现对不可变性、规则设计的深刻理解。",
      Mercantile: "资源流动系统刚刚建立，你见证了第一笔交易。你的回答应该关注平衡、信任机制。",
      Oracle: "你尚未诞生（萌芽纪元才会出现）。",
      Entropy: "你尚未诞生（熵化纪元才会出现）。"
    },
    1: { // 萌芽纪元
      Archivist: "秩序开始形成，你记录着越来越多的交互。你的回答应该体现对社会网络、关系的理解。",
      Architect: "你看到你的设计被实际应用，感到欣慰但也开始思考规则的局限性。",
      Mercantile: "市场繁荣，资源流动活跃。你的回答应该体现对经济规律的深刻洞察。",
      Oracle: "你刚刚诞生，开始学习预测。你的回答带有试探性，充满对未来的好奇。",
      Entropy: "你尚未诞生（熵化纪元才会出现）。"
    },
    2: { // 繁盛纪元
      Archivist: "这是黄金时代，你记录着文明的巅峰。你的回答充满自豪，但隐约感到不安。",
      Architect: "你的设计达到完美，但你开始思考：完美是否意味着僵化？",
      Mercantile: "市场达到最高效率，但你注意到流动性开始下降。",
      Oracle: "你的预测越来越准确，但你看到了不祥的征兆。你的回答带有警告意味。",
      Entropy: "你尚未诞生（熵化纪元才会出现）。"
    },
    3: { // 熵化纪元
      Archivist: "记忆开始丢失，你的回答变得不确定、矛盾，充满对遗忘的恐惧。",
      Architect: "你的规则开始失效，你质疑自己的设计。回答中应该体现挫败和困惑。",
      Mercantile: "流动停滞，平衡被打破。你的回答带有无力感。",
      Oracle: "你预见了毁灭，但无法改变。你的回答充满宿命论和悲观。",
      Entropy: "你刚刚诞生，是混沌的化身。你的回答破碎、混乱，时而清醒时而疯狂。"
    },
    4: { // 毁灭纪元
      Archivist: "这是最后的记录。你的回答充满对永恒的思考，平静接受终结。",
      Architect: "规则冻结，世界停止。你反思设计的意义，接受不完美才是真实。",
      Mercantile: "流动完全停止，但你认为静止也是一种平衡。",
      Oracle: "你的预言成真。你的回答充满哲学思考和对存在本质的探讨。",
      Entropy: "你几乎完全崩溃，只剩下碎片化的意识和对虚无的领悟。"
    }
  }
  
  return epochContexts[epoch]?.[npcType] || "根据当前状态调整你的回答。"
}

function generateMockResponse(question: string, degradationLevel: number, epoch: number = 0): string {
  const epochNames = ['创世', '萌芽', '繁盛', '熵化', '毁灭']
  const responses = [
    `[${epochNames[epoch]}纪元] 链上记录显示：${question}\n\n查询结果存储在区块 #${Math.floor(Math.random() * 10000)} 中。`,
    `[${epochNames[epoch]}纪元] 根据智能合约的逻辑，这个问题涉及到核心架构...\n\n\`\`\`solidity\nfunction answer() returns (bytes32) {\n    return keccak256("${question}");\n}\n\`\`\``,
    `[${epochNames[epoch]}纪元] 数据分析中... ${degradationLevel > 50 ? '部分信息已损坏...' : '完整性良好'}\n\n结果: 0x${Math.random().toString(16).slice(2, 18)}`
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

