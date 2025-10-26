/**
 * AI对话生成服务
 * 根据NPC类型和衰变程度生成不同风格的回答
 */

// NPC类型对应的系统提示
const npcSystemPrompts = {
  0: `你是瀛州文明的史官（Archivist），负责记录和保存历史。你的回答应该：
- 以客观、详实的方式描述历史事件
- 引用具体的区块号、交易哈希等技术细节
- 偶尔插入代码片段来说明历史记录的方式
- 保持庄重和学术性的语气`,

  1: `你是瀛州文明的工匠（Architect），负责创世和构建规则。你的回答应该：
- 解释世界的底层逻辑和智能合约架构
- 用技术性的语言描述系统设计
- 展示创世时的代码片段和初始化参数
- 强调规则的不可变性和永恒性`,

  2: `你是瀛州文明的商序（Mercantile），负责资源分配和市场平衡。你的回答应该：
- 分析资源流动和价值交换
- 用经济学的视角解释文明运作
- 提及交易记录和资源分布数据
- 保持理性和数据驱动的态度`,

  3: `你是瀛州文明的先知（Oracle），预测未来的可能性。你的回答应该：
- 基于链上数据推演未来趋势
- 提供多种可能性而非确定答案
- 使用概率和推理的语言
- 带有神秘和哲学性的色彩`,

  4: `你是瀛州文明的遗忘（Entropy），代表混沌与衰变。你的回答应该：
- 表现出逻辑的破碎和记忆的模糊
- 在清晰和混乱之间摇摆
- 暗示信息的丢失和不确定性
- 偶尔返回错误或矛盾的信息`
}

// 根据衰变程度调整回答
function applyDegradation(response: string, degradationLevel: number): string {
  if (degradationLevel < 30) {
    return response
  }

  // 中度衰变：添加一些不确定性
  if (degradationLevel < 60) {
    const uncertainPhrases = [
      '\n\n[记忆有些模糊...]',
      '\n\n[数据可能有误...]',
      '\n\n[信息不完整...]'
    ]
    return response + uncertainPhrases[Math.floor(Math.random() * uncertainPhrases.length)]
  }

  // 高度衰变：破坏部分文本
  if (degradationLevel < 90) {
    const words = response.split(' ')
    const corruptedWords = words.map(word => {
      if (Math.random() < 0.15) {
        return '█'.repeat(word.length)
      }
      return word
    })
    return corruptedWords.join(' ') + '\n\n[严重数据损坏]'
  }

  // 极度衰变：几乎不可读
  return '0x' + '░'.repeat(64) + '\n\n[记忆坍塌]'
}

/**
 * 生成AI响应（模拟版本）
 * 实际项目中应该调用真实的AI API（如魔搭、OpenAI等）
 */
export async function generateAIResponse(
  question: string,
  npcType: number,
  degradationLevel: number
): Promise<string> {
  // 这里是模拟响应，实际应该调用AI API
  // 例如使用魔搭的API：
  /*
  const response = await fetch(process.env.AI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: npcSystemPrompts[npcType] },
        { role: 'user', content: question }
      ]
    })
  })
  const data = await response.json()
  const aiResponse = data.output.text
  */

  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 根据NPC类型生成不同的回答
  let response = ''

  switch (npcType) {
    case 0: // 史官
      response = `作为史官，我查询了区块链账本。根据记录，${question}的答案可以在区块 #${Math.floor(Math.random() * 10000)} 中找到。

\`\`\`solidity
event HistoricalRecord(
    uint256 indexed blockNumber,
    bytes32 contentHash,
    address recorder
);
\`\`\`

这段历史被永久铭刻，不可篡改。每一笔交易都是文明的见证。`
      break

    case 1: // 工匠
      response = `从创世的架构来看，${question}涉及到核心合约的设计原理。

\`\`\`solidity
contract WorldFoundation {
    bytes32 public immutable GENESIS_HASH;
    
    constructor() {
        GENESIS_HASH = keccak256("Yingzhou");
    }
}
\`\`\`

这个世界的规则在部署时就已确定，它们将永远运行，直到最后一笔交易。`
      break

    case 2: // 商序
      response = `根据链上数据分析，${question}与资源流动密切相关。

当前系统中的价值交换遵循以下模式：
- 交易量: ${Math.floor(Math.random() * 1000)} 笔
- 流动性: ${Math.floor(Math.random() * 100)}%
- 市场效率: 最优

每次交互都会产生价值的重新分配，维持系统的动态平衡。`
      break

    case 3: // 先知
      response = `基于当前的链上状态推演，${question}可能导向多种未来...

可能性 A (概率 40%): 熵化继续加速
可能性 B (概率 35%): 系统进入稳定态  
可能性 C (概率 25%): 出现未知的涌现现象

未来始终是量子叠加的状态，只有当交易被打包，薛定谔的账本才会坍缩。`
      break

    case 4: // 遗忘
      response = `${question}... 我记得... 或者不记得？

数据在... 在哪里？区块 #████ ... 不对... 是 #${Math.floor(Math.random() * 10000)}...

\`0x${Math.random().toString(16).slice(2, 18)}...\`

记忆... 正在... 溶解...`
      break
  }

  // 应用衰变效果
  return applyDegradation(response, degradationLevel)
}

/**
 * 实际调用AI API的函数（示例）
 * 需要配置环境变量 AI_API_KEY 和 AI_API_URL
 */
export async function callRealAI(
  question: string,
  npcType: number,
  degradationLevel: number
): Promise<string> {
  try {
    const systemPrompt = npcSystemPrompts[npcType] || npcSystemPrompts[0]
    
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemPrompt,
        question,
        degradationLevel
      })
    })

    if (!response.ok) {
      throw new Error('AI API调用失败')
    }

    const data = await response.json()
    return applyDegradation(data.response, degradationLevel)
  } catch (error) {
    console.error('AI调用错误:', error)
    // 降级到模拟响应
    return generateAIResponse(question, npcType, degradationLevel)
  }
}

