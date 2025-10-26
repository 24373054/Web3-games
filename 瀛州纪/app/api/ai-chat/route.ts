import { NextRequest, NextResponse } from 'next/server'

/**
 * AI对话API路由
 * 可以接入魔搭、OpenAI或其他AI服务
 */
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, question, degradationLevel } = await request.json()
    
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
            { role: 'system', content: `${systemPrompt}\n\n注意：当前系统熵化程度为 ${degradationLevel}%，请在回答中体现出相应程度的不确定性和数据损坏。` },
            { role: 'user', content: question }
          ],
          temperature: Math.min(0.3 + (degradationLevel / 100), 1.0)
        })
      })

      if (!response.ok) throw new Error('DeepSeek API 调用失败')
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || '无法生成响应'
      return NextResponse.json({ response: text })
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

function generateMockResponse(question: string, degradationLevel: number): string {
  const responses = [
    `链上记录显示：${question}\n\n查询结果存储在区块 #${Math.floor(Math.random() * 10000)} 中。`,
    `根据智能合约的逻辑，这个问题涉及到核心架构...\n\n\`\`\`\nfunction answer() returns (bytes32) {\n    return keccak256("${question}");\n}\n\`\`\``,
    `数据分析中... ${degradationLevel > 50 ? '部分信息已损坏...' : '完整性良好'}\n\n结果: 0x${Math.random().toString(16).slice(2, 18)}`
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

