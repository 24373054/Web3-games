// 小游戏组件导出
export { default as MemorySortGame } from './MemorySortGame'
export { default as SnakeGame } from './SnakeGame'
export { default as MazeGame } from './MazeGame'
export { default as BreakoutGame } from './BreakoutGame'
export { default as ReactionGame } from './ReactionGame'
export { default as GameCenter } from './GameCenter'

// 游戏信息类型
export interface GameInfo {
  id: number
  name: string
  icon: string
  epoch: string
  epochColor: string
  description: string
  fragmentReward: number
  requiredCompletion: number
}

// 游戏列表
export const GAMES: GameInfo[] = [
  {
    id: 0,
    name: '记忆排序',
    icon: '?',
    epoch: '创世纪元',
    epochColor: '#00FFFF',
    description: '将区块编号按顺序排列，重建创世记忆',
    fragmentReward: 0,
    requiredCompletion: 60
  },
  {
    id: 1,
    name: '贪吃蛇',
    icon: '?',
    epoch: '萌芽纪元',
    epochColor: '#00FF00',
    description: '生命不断成长，收集能量壮大自己',
    fragmentReward: 1,
    requiredCompletion: 60
  },
  {
    id: 2,
    name: '迷宫探索',
    icon: '?',
    epoch: '繁盛纪元',
    epochColor: '#FFD700',
    description: '探索未知领域，收集散落的记忆碎片',
    fragmentReward: 2,
    requiredCompletion: 60
  },
  {
    id: 3,
    name: '打砖块',
    icon: '?',
    epoch: '熵化纪元',
    epochColor: '#FF4444',
    description: '秩序开始崩塌，击碎腐化的数据块',
    fragmentReward: 3,
    requiredCompletion: 60
  },
  {
    id: 4,
    name: '反应测试',
    icon: '?',
    epoch: '毁灭纪元',
    epochColor: '#9B59B6',
    description: '在混沌中捕捉最后的希望之光',
    fragmentReward: 4,
    requiredCompletion: 60
  }
]
