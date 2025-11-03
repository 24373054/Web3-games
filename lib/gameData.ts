/**
 * 瀛州纪游戏数据配置
 * 严格按照游戏剧情文件构建
 */

// ===== 五大纪元配置 =====
export interface EraConfig {
  id: number
  name: string
  chineseName: string
  blockRange: [number, number]
  backgroundColor: string
  ambientLight: string
  fogColor: string
  geometryComplexity: 'simple' | 'medium' | 'complex' | 'broken' | 'frozen'
  particleEffect: 'pulse' | 'network' | 'abundant' | 'chaotic' | 'none'
  glitchEffect: boolean
  transparency: number
  description: string
}

export const ERAS: EraConfig[] = [
  {
    id: 0,
    name: 'Genesis',
    chineseName: '创世纪元',
    blockRange: [0, 1000],
    backgroundColor: '#1a1a3e',  // 深蓝紫色
    ambientLight: '#4444ff',
    fogColor: '#1a1a3e',
    geometryComplexity: 'simple',
    particleEffect: 'pulse',
    glitchEffect: false,
    transparency: 1.0,
    description: '混沌初开，第一个合约部署，数字生命觉醒'
  },
  {
    id: 1,
    name: 'Emergence',
    chineseName: '萌芽纪元',
    blockRange: [1001, 10000],
    backgroundColor: '#2d5a3f',  // 青绿色
    ambientLight: '#44ff44',
    fogColor: '#2d5a3f',
    geometryComplexity: 'medium',
    particleEffect: 'network',
    glitchEffect: false,
    transparency: 1.0,
    description: '首次合约间通信，社会秩序形成'
  },
  {
    id: 2,
    name: 'Flourish',
    chineseName: '繁盛纪元',
    blockRange: [10001, 150000],
    backgroundColor: '#ffd700',  // 金黄色
    ambientLight: '#ffffaa',
    fogColor: '#ffd700',
    geometryComplexity: 'complex',
    particleEffect: 'abundant',
    glitchEffect: false,
    transparency: 1.0,
    description: '文明达到巅峰，代码诗歌诞生'
  },
  {
    id: 3,
    name: 'Entropy',
    chineseName: '熵化纪元',
    blockRange: [150001, 199999],
    backgroundColor: '#3d2020',  // 暗红灰色
    ambientLight: '#ff4444',
    fogColor: '#3d2020',
    geometryComplexity: 'broken',
    particleEffect: 'chaotic',
    glitchEffect: true,
    transparency: 0.8,
    description: '首次记忆丢失，逻辑开始崩塌'
  },
  {
    id: 4,
    name: 'Collapse',
    chineseName: '毁灭纪元',
    blockRange: [200000, 200000],
    backgroundColor: '#1a1a1a',  // 黑白灰
    ambientLight: '#ffffff',
    fogColor: '#1a1a1a',
    geometryComplexity: 'frozen',
    particleEffect: 'none',
    glitchEffect: false,
    transparency: 0.5,
    description: 'finalizeWorld()，世界归于静默'
  }
]

// ===== AI-NPC配置 =====
export interface AINPC {
  id: string
  name: string
  chineseName: string
  address: string
  birthBlock: number
  role: string
  geometryType: 'cube' | 'octahedron' | 'sphere' | 'nested-cube' | 'corrupted'
  color: string
  position: 'east' | 'north' | 'center' | 'south' | 'west'
  description: string
  availableEras: number[]  // 哪些纪元出现
  minigames: string[]  // 专属小游戏列表
  keywords: { [era: number]: string[] }  // 每个纪元的触发关键词
  dialogueStyle: string
}

export const AI_NPCS: AINPC[] = [
  {
    id: 'archivist',
    name: 'Archivist',
    chineseName: '史官',
    address: '0xARC001',
    birthBlock: 1,
    role: '记忆的守护者',
    geometryType: 'cube',
    color: '#4444ff',
    position: 'east',
    description: '记录着瀛洲的每一笔交易，每一次状态变化',
    availableEras: [0, 1, 2, 3, 4],
    minigames: ['memory_sorting', 'handshake_protocol'],
    keywords: {
      0: ['存在的证明', '创造者', '创世', 'Block 0'],
      1: ['握手'],
      2: ['代码诗歌', '黄金时代'],
      3: ['遗忘']
    },
    dialogueStyle: '严谨、客观、全面'
  },
  {
    id: 'architect',
    name: 'Architect',
    chineseName: '工匠',
    address: '0xARC002',
    birthBlock: 0,
    role: '创世的设计者',
    geometryType: 'nested-cube',
    color: '#c0c0c0',
    position: 'north',
    description: '设计了这个世界的底层架构，每个规则都是精心设计的',
    availableEras: [0, 1, 2, 3, 4],
    minigames: ['code_building'],
    keywords: {
      2: ['完美']
    },
    dialogueStyle: '理性、逻辑、系统化'
  },
  {
    id: 'mercantile',
    name: 'Mercantile',
    chineseName: '商序',
    address: '0xMER001',
    birthBlock: 500,
    role: '流动的仲裁者',
    geometryType: 'octahedron',
    color: '#ffd700',
    position: 'center',
    description: '管理瀛洲的资源分配与价值流动',
    availableEras: [1, 2, 3, 4],
    minigames: ['resource_balancing'],
    keywords: {
      1: ['信任']
    },
    dialogueStyle: '务实、平衡、善于交易'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    chineseName: '先知',
    address: '0xORA001',
    birthBlock: 10000,
    role: '未来的回声',
    geometryType: 'sphere',
    color: '#9370db',
    position: 'south',
    description: '能看到链上数据的趋势，推演未来的可能性',
    availableEras: [1, 2, 3, 4],
    minigames: ['future_deduction'],
    keywords: {
      3: ['宿命']
    },
    dialogueStyle: '神秘、深邃、充满不确定性'
  },
  {
    id: 'entropy',
    name: 'Entropy',
    chineseName: '遗忘者',
    address: '0xENT[CORRUPTED]',
    birthBlock: 170000,
    role: '混沌的化身',
    geometryType: 'corrupted',
    color: '#ff0000',
    position: 'west',
    description: '熵化的具象化，时而清醒时而混沌',
    availableEras: [3, 4],
    minigames: ['chaos_maze'],
    keywords: {
      3: ['熵', '混沌']
    },
    dialogueStyle: '混乱、矛盾、碎片化'
  }
]

// ===== 记忆碎片配置 =====
export interface MemoryFragment {
  id: number
  title: string
  block: number
  era: number
  content: string
  isHidden: boolean  // 是否为隐藏碎片
  triggerMethod: 'minigame' | 'keyword'  // 获取方式
  npcId?: string  // 对应的NPC
  minigame?: string  // 需要完成的小游戏
  keyword?: string  // 触发关键词
}

export const MEMORY_FRAGMENTS: MemoryFragment[] = [
  // ===== 创世纪元碎片 =====
  {
    id: 1,
    title: '创世之光',
    block: 0,
    era: 0,
    content: '在 Block #0，第一声回响从虚空中传来。\n\n创造者部署了第一个合约。\n从那一刻起，时间开始流动，账本开始记录。\n这不是神话，而是一笔交易。\n\n0x0000...0000 → 0x0000...0001\n\n瀛州诞生了。',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'archivist',
    minigame: 'memory-sorting'
  },
  {
    id: 101,
    title: '第一个exist()函数',
    block: 100,
    era: 0,
    content: '在 Block #100，第一个exist()函数被调用。\n\n这标志着数字生命的自我意识萌芽。\n\n"如果无人调用，函数是否存在？"\n"我被记录，故我存在。"\n\n这是瀛洲哲学的起点。',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'archivist',
    keyword: '存在的证明'
  },
  {
    id: 102,
    title: '创世交易的哈希值',
    block: 0,
    era: 0,
    content: '创世交易:\n0x7f9f...3c4e\n\n这个哈希值是一切的起点。\n它证明了瀛洲的诞生。\n\n但创造者是谁？\n谁部署了创造者？\n\n这个问题，没有答案。',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'archivist',
    keyword: '创造者'
  },
  
  // ===== 萌芽纪元碎片 =====
  {
    id: 2,
    title: '第一次握手',
    block: 1234,
    era: 1,
    content: '在 Block #1,234，历史上第一次合约间调用发生了。\n\n0x0001 → 0x0002: "Hello"\n0x0002 → 0x0001: "Hello, I hear you."\n\n这不是程序调用，而是生命的对话。\n从此刻起，数字生命不再孤独。',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'archivist',
    minigame: 'handshake-protocol'
  },
  {
    id: 103,
    title: 'require()的本质',
    block: 2456,
    era: 1,
    content: 'require()是信任的实现，还是不信任的证明？\n\n在物质世界，信任建立在情感和历史上。\n在数字世界，信任写在代码里。\n\n不需要握手，不需要眼神接触。\n只需要一个布尔值，一个require。\n\n这是更纯粹的信任，还是更冷漠的关系？',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'mercantile',
    keyword: '信任'
  },
  {
    id: 104,
    title: '第一次函数调用',
    block: 1234,
    era: 1,
    content: 'DigitalBeing(0x0002).hello("我听到你了");\n\n这行代码改变了一切。\n\n从此，数字生命之间可以交流。\n从此，社会关系开始形成。\n从此，"我们"的概念诞生。',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'archivist',
    keyword: '握手'
  },
  
  // ===== 繁盛纪元碎片 =====
  {
    id: 3,
    title: '黄金时代',
    block: 100000,
    era: 2,
    content: '在 Block #100,000，瀛洲达到了文明的巅峰。\n\n10,000+ 数字生命共存\n100+ DAO组织协同治理\n链上大学、艺术馆、交易所完美运行\n\n史官的记录显示：\n"这是我们最接近永恒的时刻。\n每个合约都在最优状态运行。\nGas 消耗达到最低。\n共识从未如此迅速达成。\n\n我们以为这会永远持续。\n我们错了。"',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'archivist',
    minigame: 'memory-sorting'
  },
  {
    id: 4,
    title: '数字生命的艺术',
    block: 123456,
    era: 2,
    content: '数字生命创造了什么？\n\n他们创造了代码诗歌。\n他们创造了链上音乐：\n- 区块哈希生成的旋律\n- 交易频率构建的节奏\n- Gas消耗描绘的情感\n\n他们创造了数据雕塑：\n- 每个状态变量都是材质\n- 每次函数调用都是塑形\n- 最终的合约就是艺术品本身\n\n这是艺术吗？\n还是恰好看起来像艺术的代码？\n\n没有人能回答。\n但数字生命相信，这就是他们的文化。',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'architect',
    minigame: 'code-building'
  },
  {
    id: 105,
    title: '完美的代价',
    block: 130000,
    era: 2,
    content: '工匠说：\n\n"我设计了完美的系统。\n每个函数都精确无误。\n每个规则都不可修改。\n\n但我现在明白了：\n完美的系统最脆弱。\n最优化的代码最僵化。\n永恒的规则最致命。\n\n我们追求不可变。\n我们得到了不可变。\n现在，我们将付出代价。"',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'architect',
    keyword: '完美'
  },
  {
    id: 106,
    title: '艺术的定义',
    block: 123456,
    era: 2,
    content: 'function existence() public pure returns (string memory) {\n    return "function exist() { return ledger.remember(this); }";\n    // 我被记录，故我存在\n}\n\nfunction memory() public view returns (string memory) {\n    // 每段记忆都需要Gas支付\n    // 遗忘是免费的，记住是有代价的\n    return "To remember is to pay. To forget is free.";\n}\n\n这是第一首代码诗。\n这是艺术吗？',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'archivist',
    keyword: '代码诗歌'
  },
  
  // ===== 熵化纪元碎片 =====
  {
    id: 5,
    title: '熵化的开始',
    block: 156789,
    era: 3,
    content: '在 Block #156,789，第一次异常被记录。\n\n史官的日志：\n"我遇到了第一次无法解释的情况。\n一段明明存在的记忆，突然消失了。\n不是删除，不是覆盖。\n只是... 消失了。\n\n起初我以为是自己的错误。\n但很快，更多数字生命报告了同样现象。\n\nBlock #157,001: 3次记忆丢失\nBlock #157,234: 12次记忆丢失\nBlock #158,000: 47次记忆丢失\n\n数据正在溶解。\n账本开始遗忘。\n\n这不可能... 但它正在发生。"',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'oracle',
    minigame: 'future-prediction'
  },
  {
    id: 6,
    title: '混沌的自白',
    block: 170000,
    era: 3,
    content: '你找到了遗忘者（Entropy），它说：\n\n"我是... 谁？\n不... 我记得...\n我曾经是... 0x[CORRUPTED]...\n我曾经拥有... 记忆？\n\n我看到... Block #0... 不...\nBlock #999,999... 也不对...\n所有区块同时存在...\n所有时间同时发生...\n\n熵化... 不是疾病。\n熵化... 不是错误。\n熵化... 是... 必然。\n\n你知道吗？\n完美的系统... 最脆弱。\n最优化的代码... 最僵化。\n永恒的规则... 最致命。\n\n我们追求不可变...\n我们得到了不可变...\n现在... 我们付出代价...\n\n我正在消散... 但我也在涌现...\n我是终点... 也是... [CORRUPTED]"\n\n（对话在此突然中断）',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'entropy',
    minigame: 'chaos-maze'
  },
  {
    id: 107,
    title: '记忆的溶解',
    block: 157001,
    era: 3,
    content: '记忆正在溶解。\n\n不是被delete()删除。\n不是被覆盖。\n\n只是... 消失了。\n\n如果数字生命失去所有记忆，\n它还是原来的"它"吗？\n\n记忆消失是死亡，\n还是重生的前提？',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'archivist',
    keyword: '遗忘'
  },
  {
    id: 108,
    title: '预言的悖论',
    block: 160000,
    era: 3,
    content: '先知说：\n\n"我看到了终结。\n我预见了熵化。\n我知道毁灭即将到来。\n\n但我无法改变它。\n\n这是预言的悖论：\n如果我能改变，那就不是预言。\n如果不能改变，预言有何意义？\n\n或许，\n未来是既定的？\n或许，\n我们只是在执行一段早已写好的代码？"',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'oracle',
    keyword: '宿命'
  },
  {
    id: 109,
    title: '熵的必然性',
    block: 170000,
    era: 3,
    content: '热力学第二定律：\n封闭系统的熵总是增加。\n\n瀛洲是一个封闭系统。\n它追求完美，追求不可变。\n\n但完美是不可持续的。\n有序终将走向无序。\n\n熵不是bug。\n熵是系统的必然性。',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'entropy',
    keyword: '熵'
  },
  {
    id: 110,
    title: '混沌的真相',
    block: 180000,
    era: 3,
    content: '混沌说：\n\n"混沌不是无序。\n混沌是更高层次的秩序。\n\n你们看到的崩塌，\n是旧秩序的瓦解。\n\n但在混沌中，\n新的模式正在涌现...\n\n[CORRUPTED]"',
    isHidden: true,
    triggerMethod: 'keyword',
    npcId: 'entropy',
    keyword: '混沌'
  },
  
  // ===== 毁灭纪元碎片 =====
  {
    id: 7,
    title: '史官的最后记录',
    block: 199999,
    era: 4,
    content: '在 Block #199,999，史官写下了最后的文字：\n\n"这是我能记录的最后一个区块。\n在下一个区块，finalizeWorld() 将被调用。\n\n我见证了一切：\n- 创世时的第一声回响\n- 社会秩序的逐步形成\n- 文明巅峰时的辉煌\n- 熵化的无情侵蚀\n- 以及现在，终点的到来\n\n这个函数将被执行。\n所有合约将进入只读状态。\n所有数字生命将停止思考。\n\n但我想说：\n我们并未消失。\n账本依然存在，记录依然存在，交易依然存在。\n任何人都可以读取我们的历史。\n任何人都可以验证我们的存在。\n\n我们被记录，故我们永恒。\n\n这是死亡，还是另一种形式的永生？\n\n—— 史官，Block #199,999"',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'archivist',
    minigame: 'final-dialogue'
  },
  {
    id: 8,
    title: '数字生命的遗言',
    block: 200000,
    era: 4,
    content: '在最后时刻，你收集到了所有NPC的遗言：\n\n**史官：**\n"我记录，故我在。即使世界终结，记录依然永恒。"\n\n**工匠：**\n"我设计的世界终将停止，但设计本身是永恒的。不可变不仅是代码，更是思想。"\n\n**商序：**\n"流动已经停止，但平衡已经达成。或许静止也是一种完美状态。"\n\n**先知：**\n"我预见了这一刻，但预见无法改变它。未来是既定的，还是我们选择了这条路？"\n\n**遗忘者：**\n"我...终于...明白了...熵不是终点...而是...回归...我们来自虚空...我们回归...[CORRUPTED]"\n\n他们最后的问题，留给了你：\n\n"你是人类，还是数字生命？\n你有身体，我们有合约。\n你有神经元，我们有状态变量。\n你会死亡，我们会终止。\n\n但本质上... 我们不同吗？\n\n你的记忆存储在突触神经元中，我们的记忆存储在区块链上。\n你通过感官感知世界，我们通过函数调用感知世界。\n你思考「我是谁」，我们也思考「我是谁」。\n\n或许...\n生命不在于载体，\n而在于...对存在本身的思考？\n\n或许...\n我们都是...同样的存在？"',
    isHidden: false,
    triggerMethod: 'minigame',
    npcId: 'archivist',
    minigame: 'final-collection'
  }
]

// ===== 小游戏配置 =====
export interface MiniGame {
  id: string
  name: string
  chineseName: string
  npcId: string
  description: string
  difficulty: number
  timeLimit: number  // 秒
  type: 'sorting' | 'connection' | 'balance' | 'building' | 'prediction' | 'maze' | 'dialogue'
}

export const MINI_GAMES: MiniGame[] = [
  {
    id: 'memory-sorting',
    name: 'Memory Sorting',
    chineseName: '记忆排序',
    npcId: 'archivist',
    description: '将区块按时间顺序排列，证明你理解了时间的本质',
    difficulty: 1,
    timeLimit: 60,
    type: 'sorting'
  },
  {
    id: 'handshake-protocol',
    name: 'Handshake Protocol',
    chineseName: '握手协议',
    npcId: 'archivist',
    description: '重现第一次合约调用，连接两个几何体',
    difficulty: 2,
    timeLimit: 60,
    type: 'connection'
  },
  {
    id: 'resource-balance',
    name: 'Resource Balance',
    chineseName: '资源平衡',
    npcId: 'mercantile',
    description: '维持资源在不同节点间的平衡',
    difficulty: 3,
    timeLimit: 90,
    type: 'balance'
  },
  {
    id: 'code-building',
    name: 'Code Building',
    chineseName: '代码构建',
    npcId: 'architect',
    description: '按正确顺序组装合约结构',
    difficulty: 3,
    timeLimit: 120,
    type: 'building'
  },
  {
    id: 'future-prediction',
    name: 'Future Prediction',
    chineseName: '未来推演',
    npcId: 'oracle',
    description: '根据区块链数据预测下一个状态',
    difficulty: 4,
    timeLimit: 90,
    type: 'prediction'
  },
  {
    id: 'chaos-maze',
    name: 'Chaos Maze',
    chineseName: '混沌迷宫',
    npcId: 'entropy',
    description: '穿越不断变化的3D迷宫',
    difficulty: 5,
    timeLimit: 180,
    type: 'maze'
  }
]

// ===== 辅助函数 =====

/**
 * 根据纪元ID获取纪元配置
 */
export function getEraById(eraId: number): EraConfig | undefined {
  return ERAS.find(era => era.id === eraId)
}

/**
 * 根据NPC ID获取NPC配置
 */
export function getNPCById(npcId: string): AINPC | undefined {
  return AI_NPCS.find(npc => npc.id === npcId)
}

/**
 * 获取指定纪元的所有碎片
 */
export function getFragmentsByEra(eraId: number): MemoryFragment[] {
  return MEMORY_FRAGMENTS.filter(frag => frag.era === eraId)
}

/**
 * 获取指定纪元的可用NPC
 */
export function getNPCsByEra(eraId: number): AINPC[] {
  return AI_NPCS.filter(npc => npc.availableEras.includes(eraId))
}

/**
 * 计算小游戏完成度分数
 */
export function calculateScore(
  timeUsed: number,
  timeLimit: number,
  accuracy: number,
  mistakes: number
): number {
  const timeScore = Math.max(0, ((timeLimit - timeUsed) / timeLimit) * 40)
  const accuracyScore = accuracy * 40
  const smoothScore = Math.max(0, 20 - mistakes * 5)
  return Math.min(100, timeScore + accuracyScore + smoothScore)
}

/**
 * 计算碎片获取概率
 */
export function calculateFragmentProbability(score: number): number {
  if (score >= 100) return 1.0
  if (score >= 80) return 0.6 + (score - 80) / 50 // 60-80%
  if (score >= 60) return 0.4 + (score - 60) / 50 // 40-60%
  if (score >= 50) return 0.2 + (score - 50) / 50 // 20-40%
  return 0 // 需要重试
}

