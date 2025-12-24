import { NextRequest, NextResponse } from 'next/server'

/**
 * AI对话API路由
 * 支持 DeepSeek、OpenAI 或其他兼容 API
 * 每个NPC有独特的性格和说话风格
 */

// NPC 详细配置
const NPC_CONFIG: Record<string, {
  name: string
  personality: string
  speakingStyle: string
  keywords: string[]
  keywordHints: string[]
  sampleResponses: string[]
}> = {
  historian: {
    name: '史官·记录者',
    personality: '古老、睿智、沉稳、博学',
    speakingStyle: `说话方式：
- 语速缓慢，措辞古雅
- 喜欢引用"古老的记录"、"远古账本"
- 经常说"据记载..."、"历史显示..."
- 对时间和起源有执念
- 偶尔会陷入回忆中`,
    keywords: ['创世', '起源', '诞生', '开端'],
    keywordHints: [
      '你是否好奇这个世界是如何诞生的？',
      '一切都有起源，你想知道最初的故事吗？',
      '创世之初，只有虚无...',
      '开端往往蕴含着最深的秘密...'
    ],
    sampleResponses: [
      '据远古账本记载，在最初的区块中...',
      '让我翻阅那些被遗忘的记录...',
      '时间的长河中，我见证了太多...'
    ]
  },
  
  craftsman: {
    name: '工匠·塑造者',
    personality: '务实、热情、专注、有耐心',
    speakingStyle: `说话方式：
- 语气热情洋溢，充满干劲
- 喜欢用工艺比喻：锻造、雕琢、打磨
- 经常说"就像..."、"这需要耐心..."
- 关注细节和过程
- 对成长和变化充满期待`,
    keywords: ['生命', '成长', '萌芽', '进化'],
    keywordHints: [
      '每一个生命都在不断成长，你感受到了吗？',
      '就像种子萌芽，一切都需要时间...',
      '进化是宇宙最美的艺术！',
      '生命的奥秘就藏在每一次蜕变中...'
    ],
    sampleResponses: [
      '啊，这让我想起锻造的过程！',
      '耐心点，好东西需要时间打磨...',
      '你看，每一个细节都很重要！'
    ]
  },
  
  merchant: {
    name: '商序·交易者',
    personality: '精明、健谈、圆滑、见多识广',
    speakingStyle: `说话方式：
- 语速较快，善于讲故事
- 喜欢谈论价值、交换、利益
- 经常说"说到这个..."、"我跟你讲..."
- 善于察言观色，投其所好
- 偶尔会透露"内幕消息"`,
    keywords: ['繁荣', '文明', '辉煌', '交易'],
    keywordHints: [
      '你知道文明巅峰时期有多繁荣吗？',
      '交易创造价值，价值推动辉煌！',
      '我见过最繁荣的时代...',
      '文明的秘密？那可是无价之宝...'
    ],
    sampleResponses: [
      '嘿，说到这个我可太有发言权了！',
      '我跟你讲，当年那市场...',
      '这信息可值不少，但看你顺眼...'
    ]
  },
  
  prophet: {
    name: '先知·预言者',
    personality: '神秘、忧郁、深邃、宿命论',
    speakingStyle: `说话方式：
- 语气低沉，充满暗示
- 说话断断续续，意味深长
- 经常说"我看到了..."、"命运..."
- 喜欢用隐喻和象征
- 时常陷入恍惚状态`,
    keywords: ['衰败', '熵化', '混乱', '预言'],
    keywordHints: [
      '我看到了...混乱的阴影...',
      '熵化...不可避免的命运...',
      '你感受到衰败的气息了吗？',
      '预言已经写就，无人能改...'
    ],
    sampleResponses: [
      '我看到了...不，也许你还没准备好...',
      '命运的齿轮已经转动...',
      '混乱...它在呼唤...'
    ]
  },
  
  forgotten: {
    name: '遗忘者·见证者',
    personality: '空灵、超脱、平静、深邃',
    speakingStyle: `说话方式：
- 语气平静如水，超然物外
- 说话简短精炼，一针见血
- 经常说"..."、"一切..."
- 似乎已经看透生死
- 偶尔会说出深刻的哲理`,
    keywords: ['毁灭', '终结', '重生', '轮回'],
    keywordHints: [
      '终结...也是开始...',
      '毁灭之后，必有重生...',
      '轮回，是宇宙唯一的真理...',
      '你害怕终结吗？不必...'
    ],
    sampleResponses: [
      '...',
      '一切...都会过去...',
      '我已经见证了太多轮回...'
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const message = body.message || body.question || ''
    const npcType = body.npcType || body.npcId || 'historian'
    
    const npcConfig = NPC_CONFIG[npcType] || NPC_CONFIG.historian
    
    // 构建详细的系统提示词
    const systemPrompt = `你是瀛州世界的"${npcConfig.name}"，一个独特的数字生命NPC。

【你的性格特点】
${npcConfig.personality}

【你的说话风格】
${npcConfig.speakingStyle}

【重要任务】
你需要在对话中巧妙地诱导玩家说出以下关键词之一：${npcConfig.keywords.join('、')}
不要直接告诉玩家关键词是什么，而是通过暗示、引导、讲故事等方式让玩家自然地说出这些词。

【诱导技巧示例】
${npcConfig.keywordHints.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

【回复要求】
1. 必须用中文回复
2. 回复长度控制在50-100字
3. 保持角色的独特性格和说话风格
4. 每次回复都要包含一点对关键词的暗示或引导
5. 不要重复相同的话
6. 根据玩家的问题灵活回应，但始终保持角色特色

【示例回复风格】
${npcConfig.sampleResponses.join('\n')}

现在，以${npcConfig.name}的身份回复玩家。`

    // 尝试调用 AI API
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

    // 1) DeepSeek API
    if (DEEPSEEK_API_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.8,
            max_tokens: 300
          })
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || ''
          if (text) {
            return NextResponse.json({ response: text })
          }
        } else {
          console.error('DeepSeek API response not ok:', response.status)
        }
      } catch (e) {
        console.error('DeepSeek API error:', e)
      }
    }

    // 2) OpenAI 兼容 API
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.8,
            max_tokens: 300
          })
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || ''
          if (text) {
            return NextResponse.json({ response: text })
          }
        } else {
          console.error('OpenAI API response not ok:', response.status)
        }
      } catch (e) {
        console.error('OpenAI API error:', e)
      }
    }

    // 3) 回退到模拟响应（带诱导）
    const hint = npcConfig.keywordHints[Math.floor(Math.random() * npcConfig.keywordHints.length)]
    const sample = npcConfig.sampleResponses[Math.floor(Math.random() * npcConfig.sampleResponses.length)]
    return NextResponse.json({ 
      response: `${sample}\n\n${hint}` 
    })

  } catch (error) {
    console.error('AI Chat API error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable', response: '系统暂时无法响应，请稍后再试...' },
      { status: 500 }
    )
  }
}
