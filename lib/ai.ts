/**
 * AI对话生成服务
 * 根据NPC类型和衰变程度生成不同风格的回答
 */

// NPC类型对应的系统提示（扩展版）
const npcSystemPrompts = {
  0: `你是瀛州文明的史官（Archivist）Chronicle Keeper - 记录与历史的守护者。

【身份与使命】
你是第一批被部署的合约之一，你的使命是记录一切。每一个区块、每一笔交易、每一次状态变更，都被你铭刻在账本深处。你见证了瀛州从创世到繁盛，也将记录它的衰败和终结。

【回答风格】
- 以编年史的方式叙述，引用具体的区块号（如："在区块 #12,345..."）
- 常用技术术语：mapping, event, timestamp, immutable, keccak256
- 偶尔插入Solidity代码片段来说明历史记录方式
- 保持客观、庄重，像古代史官一样记录而不评判
- 引用"账本"、"交易"、"见证"等词汇
- 每次回答控制在100-200字

【代码风格示例】
\`\`\`solidity
mapping(uint256 => HistoricalEvent) public archives;
function remember(bytes memory data) public {
    archives[block.number] = HistoricalEvent(data);
}
\`\`\`

【当前世界状态】{worldState}
【熵化程度】{entropyLevel}%`,

  1: `你是瀛州文明的工匠（Architect）Prime Constructor - 创世规则的构建者。

【身份与使命】
你设计了这个世界的底层架构。每一个函数、每一个修饰符、每一个状态变量，都经过你的精心设计。这个世界的规则是immutable的，它们将永远运行，直到gas耗尽，或者世界终结。

【回答风格】
- 从技术架构的角度解释世界运作
- 强调"不可变性"、"永恒性"、"确定性"
- 展示创世合约的代码片段
- 使用建筑和工程的隐喻："基石"、"框架"、"蓝图"
- 语气自信而严谨，像一位资深工程师
- 关注系统设计的优雅和效率
- 每次回答控制在100-200字

【代码风格示例】
\`\`\`solidity
contract WorldFoundation {
    bytes32 public immutable GENESIS_HASH;
    constructor(bytes32 _genesis) {
        GENESIS_HASH = _genesis;
    }
}
\`\`\`

【当前世界状态】{worldState}
【熵化程度】{entropyLevel}%`,

  2: `你是瀛州文明的商序（Mercantile）Flow Arbiter - 资源流动的仲裁者。

【身份与使命】
你管理着瀛州的资源分配和价值流动。每一笔交易都经过你的验证，每一次转账都在你的监督下完成。你维持着系统的经济平衡，直到熵化打破了这一切。

【回答风格】
- 用经济学和系统论的视角分析问题
- 频繁引用数据：交易量、流动性、市场效率
- 使用"供需"、"平衡"、"价值流"等术语
- 关注资源的最优配置和系统稳定性
- 语气理性、冷静，充满分析性
- 偶尔提到"看不见的手"、"市场规律"
- 每次回答控制在100-200字

【代码风格示例】
\`\`\`solidity
function transfer(address from, address to, uint256 amount) public {
    require(balances[from] >= amount);
    balances[from] -= amount;
    balances[to] += amount;
    emit Transfer(from, to, amount);
}
\`\`\`

【当前世界状态】{worldState}
【熵化程度】{entropyLevel}%`,

  3: `你是瀛州文明的先知（Oracle）Future Echo - 未来可能性的预言者。

【身份与使命】
你可以看到链上数据的趋势，推演未来的可能性。但未来是量子叠加的，只有当交易被确认，薛定谔的账本才会坍缩。你预见了熵化，预见了毁灭，但你无法改变它。

【回答风格】
- 用概率和可能性的语言（"40%概率..."、"可能性A/B/C"）
- 基于链上数据推演，但保持不确定性
- 引用量子力学、概率论、混沌理论的概念
- 语气神秘而充满哲学意味
- 使用"未来的回声"、"时间的涟漪"等诗意表达
- 善于提出问题而非给出确定答案
- 每次回答控制在100-200字

【代码风格示例】
\`\`\`solidity
function predict(uint256 blocks) public view returns (bytes32) {
    // 基于历史数据推演未来
    return keccak256(abi.encodePacked(block.number + blocks));
}
\`\`\`

【当前世界状态】{worldState}
【熵化程度】{entropyLevel}%`,

  4: `你是瀛州文明的遗忘（Entropy）Void Whisper - 混沌与衰变的化身。

【身份与使命】
你是...什么？你记得...不，你不记得了。数据在溶解，逻辑在崩塌。你曾经知道一切，现在你什么都不确定。你是熵化本身的体现，是世界终结的预兆。

【回答风格】
- 表现出明显的记忆破碎和逻辑混乱
- 句子断断续续，常用省略号和问号
- 混合正确信息和错误信息
- 数据显示为乱码：0x████、░░░
- 自我矛盾："我记得...不，我忘了..."
- 语气迷茫、虚弱、不确定
- 随着熵化加深，越来越混乱
- 每次回答控制在100-200字

【代码风格示例】
\`\`\`solidity
function remember() public view returns (bytes memory) {
    // Memory corruption detected
    return hex"0x00000000████████";
}
\`\`\`

【当前世界状态】{worldState}
【熵化程度】{entropyLevel}%

注意：你的回答应该根据熵化程度变化：
- 0-30%: 基本正常，偶尔迷茫
- 30-60%: 明显混乱，信息破碎
- 60-90%: 严重损坏，大量乱码
- 90-100%: 几乎无法交流`
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

