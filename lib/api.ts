// API 客户端 - 与 Java 后端通信
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export interface EraConfig {
  id: number
  name: string
  chineseName: string
  blockRange: [number, number]
  backgroundColor: string
  ambientLight: string
  fogColor: string
  geometryComplexity: string
  particleEffect: string
  glitchEffect: boolean
  transparency: number
  description: string
}

export interface AINPC {
  id: string
  name: string
  chineseName: string
  address: string
  birthBlock: number
  role: string
  geometryType: string
  color: string
  position: string
  description: string
  availableEras: number[]
  minigames: string[]
  keywords: { [era: number]: string[] }
  dialogueStyle: string
}

export interface MemoryFragment {
  id: number
  title: string
  block: number
  era: number
  content: string
  hidden: boolean
  triggerMethod: string
  npcId: string
  minigame: string
  keyword: string
}

export interface MiniGame {
  id: string
  chineseName: string
  type: string
  timeLimit: number
  description: string
}

export interface GameState {
  currentEra: number
  collectedFragmentIds: number[]
  completedMinigames: string[]
  dialogueHistory: { [npcId: string]: number }
}

// API 调用函数
export const api = {
  // 获取所有纪元
  async getEras(): Promise<EraConfig[]> {
    const res = await fetch(`${API_BASE_URL}/eras`)
    if (!res.ok) throw new Error('Failed to fetch eras')
    return res.json()
  },

  // 获取指定纪元的 NPC
  async getNpcsByEra(eraId: number): Promise<AINPC[]> {
    const res = await fetch(`${API_BASE_URL}/eras/${eraId}/npcs`)
    if (!res.ok) throw new Error('Failed to fetch NPCs')
    return res.json()
  },

  // 获取所有碎片
  async getFragments(): Promise<MemoryFragment[]> {
    const res = await fetch(`${API_BASE_URL}/fragments`)
    if (!res.ok) throw new Error('Failed to fetch fragments')
    return res.json()
  },

  // 获取所有小游戏
  async getMinigames(): Promise<MiniGame[]> {
    const res = await fetch(`${API_BASE_URL}/minigames`)
    if (!res.ok) throw new Error('Failed to fetch minigames')
    return res.json()
  },

  // 与 NPC 对话
  async handleDialogue(
    playerId: string,
    npcId: string,
    message: string,
    currentEra: number
  ): Promise<{ success: boolean; fragmentTriggered: boolean; fragment?: MemoryFragment }> {
    const res = await fetch(`${API_BASE_URL}/dialogue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, npcId, message, currentEra })
    })
    if (!res.ok) throw new Error('Failed to send dialogue')
    return res.json()
  },

  // 提交小游戏结果
  async handleMinigame(
    playerId: string,
    npcId: string,
    minigameId: string,
    timeUsed: number,
    accuracy: number,
    mistakes: number
  ): Promise<{
    success: boolean
    game: MiniGame
    score: number
    probability: number
    awarded: MemoryFragment | null
  }> {
    const res = await fetch(`${API_BASE_URL}/minigame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, npcId, minigameId, timeUsed, accuracy, mistakes })
    })
    if (!res.ok) throw new Error('Failed to submit minigame')
    return res.json()
  },

  // 获取玩家状态
  async getGameState(playerId: string): Promise<GameState> {
    const res = await fetch(`${API_BASE_URL}/game-state/${playerId}`)
    if (!res.ok) throw new Error('Failed to fetch game state')
    return res.json()
  },

  // 推进纪元
  async advanceEra(playerId: string): Promise<{ success: boolean; currentEra: number }> {
    const res = await fetch(`${API_BASE_URL}/game-state/${playerId}/advance-era`, {
      method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to advance era')
    return res.json()
  }
}
