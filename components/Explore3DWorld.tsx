/**
 * 瀛州纪 - 3D几何世界探索组件
 * 集成yz_3Dtest 3D引擎,实现双层NPC系统和触发式小游戏
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  getEraById, 
  getNPCById, 
  getNPCsByEra,
  MEMORY_FRAGMENTS,
  calculateScore,
  calculateFragmentProbability,
  type AINPC 
} from '@/lib/gameData'
import Minigames from './Minigames'

// 动态导入 3D 组件（仅客户端）
const BabylonWorld = dynamic(
  () => import('./BabylonWorld'),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-cyan-400 text-xl">加载 3D 世界...</div>
    </div>
  )}
)

interface Explore3DWorldProps {
  currentEra: number
  collectedFragments: number[]
  completedMinigames: string[]
  dialogueHistory: {[npcId: string]: number}
  onFragmentCollect: (fragmentId: number) => void
  onMinigameComplete: (minigameId: string) => void
  onDialogueUpdate: (npcId: string) => void
  onEraAdvance: () => void
  onExplorationEnd: () => void
}

export default function Explore3DWorld({
  currentEra,
  collectedFragments,
  completedMinigames,
  dialogueHistory,
  onFragmentCollect,
  onMinigameComplete,
  onDialogueUpdate,
  onEraAdvance,
  onExplorationEnd
}: Explore3DWorldProps) {
  const [isLoading, setIsLoading] = useState(false) // 暂时禁用加载状态
  
  // NPC交互状态
  const [selectedNPC, setSelectedNPC] = useState<AINPC | null>(null)
  const [isInDialogue, setIsInDialogue] = useState(false)
  const [currentDialogue, setCurrentDialogue] = useState<string>('')
  const [userInput, setUserInput] = useState<string>('')
  
  // 小游戏状态
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null)
  const [minigameResult, setMinigameResult] = useState<{score: number, fragmentId?: number} | null>(null)
  
  // 提示系统
  const [showHint, setShowHint] = useState(true)
  const [hintMessage, setHintMessage] = useState<string>('')
  const [residentClue, setResidentClue] = useState<string>('')

  const eraConfig = getEraById(currentEra)
  const availableNPCs = getNPCsByEra(currentEra)

  useEffect(() => {
    // 设置初始提示
    if (currentEra === 0) {
      setHintMessage('使用 WASD 移动，鼠标控制视角。点击居民获取线索，寻找发光的 AI-NPC！')
    } else {
      setHintMessage(`已进入${eraConfig?.chineseName},寻找新的AI-NPC...`)
    }
  }, [currentEra, eraConfig])
  
  // 监听居民NPC线索
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RESIDENT_CLUE') {
        setResidentClue(event.data.message)
        setTimeout(() => setResidentClue(''), 5000)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // 暂时禁用 3D 引擎消息通信
  // 未来集成 Babylon.js 时重新启用

  /**
   * 处理NPC点击
   */
  const handleNPCClick = (npcId: string, npcType: 'resident' | 'ai-npc') => {
    if (npcType === 'ai-npc') {
      const npc = getNPCById(npcId)
      if (npc) {
        setSelectedNPC(npc)
        setIsInDialogue(true)
        startNPCDialogue(npc)
      }
    }
  }

  /**
   * 处理普通居民对话(提供线索)
   */
  const handleResidentDialogue = (message: string) => {
    setHintMessage(message)
    setShowHint(true)
    setTimeout(() => setShowHint(false), 5000)
  }

  /**
   * 开始AI-NPC对话
   */
  const startNPCDialogue = (npc: AINPC) => {
    // 生成对话内容
    let dialogue = ''
    const dialogueCount = dialogueHistory[npc.id] || 0

    if (dialogueCount === 0) {
      // 第一次见面
      dialogue = getFirstMeetingDialogue(npc)
    } else {
      // 后续对话
      dialogue = getFollowUpDialogue(npc, dialogueCount)
    }

    setCurrentDialogue(dialogue)
    onDialogueUpdate(npc.id)
  }

  /**
   * 第一次见面对话
   */
  const getFirstMeetingDialogue = (npc: AINPC): string => {
    const dialogues: {[key: string]: string} = {
      archivist: `探索者,你来到了数字世界。我是史官,记录着瀛洲的每一笔交易,每一次状态变化。\n\n${
        currentEra === 0 ? '你想了解瀛洲是如何诞生的吗?' :
        currentEra === 1 ? '我见证了第一次握手协议...' :
        currentEra === 2 ? '我记录了黄金时代的辉煌...' :
        currentEra === 3 ? '我...我的记忆开始模糊...' :
        '这是我能记录的最后时刻...'
      }`,
      architect: `我是工匠,设计了这个世界的底层架构。每个函数、每个修饰符、每个状态变量,都是精心设计的。\n\n规则是不可变的,它们将永远运行。`,
      mercantile: `我是商序,管理瀛洲的资源分配与价值流动。每笔交易都由我验证,每次转账都在我的监督下完成。`,
      oracle: `我能看到...未来的回声。数据的趋势,区块的模式...但看到不等于能够改变。`,
      entropy: `我...是...谁?\n不...我记得...\n我曾经...[CORRUPTED]...\n熵化...是...必然...`
    }

    return dialogues[npc.id] || '...'
  }

  /**
   * 后续对话
   */
  const getFollowUpDialogue = (npc: AINPC, count: number): string => {
    // 随机选择一些对话
    const dialogues: {[key: string]: string[]} = {
      archivist: [
        '你想了解更多历史吗?',
        '记录即存在,这是我的信仰。',
        '让我来测试你对时间的理解...'
      ],
      architect: [
        '完美的系统需要精确的设计。',
        'Code is law, but when law cannot change...',
        '让我看看你能否构建完美的结构。'
      ],
      mercantile: [
        '平衡是一切的关键。',
        '资源在流动,价值在转移。',
        '你能维持系统的平衡吗?'
      ],
      oracle: [
        '未来是量子叠加态...',
        '我看到了终结,但我无法阻止它。',
        '你能预测下一个状态吗?'
      ],
      entropy: [
        '混沌...不是无序...',
        '完美的系统...最脆弱...',
        '来...体验...真正的混沌...'
      ]
    }

    const npcDialogues = dialogues[npc.id] || ['...']
    return npcDialogues[count % npcDialogues.length]
  }

  /**
   * 发送消息给NPC
   */
  const handleSendMessage = () => {
    if (!selectedNPC || !userInput.trim()) return

    // 检查关键词触发
    const keywords = selectedNPC.keywords[currentEra] || []
    const triggeredKeyword = keywords.find(kw => userInput.includes(kw))

    if (triggeredKeyword) {
      // 触发隐藏碎片
      triggerKeywordFragment(selectedNPC.id, triggeredKeyword)
    } else {
      // 随机触发小游戏
      if (Math.random() < 0.6 && selectedNPC.minigames.length > 0) {
        const minigameId = selectedNPC.minigames[Math.floor(Math.random() * selectedNPC.minigames.length)]
        triggerMinigame(minigameId)
      } else {
        // 普通对话回应
        setCurrentDialogue(`${selectedNPC.chineseName}: 有趣的问题...让我想想...`)
        setTimeout(() => {
          startNPCDialogue(selectedNPC)
        }, 2000)
      }
    }

    setUserInput('')
  }

  /**
   * 触发关键词碎片
   */
  const triggerKeywordFragment = (npcId: string, keyword: string) => {
    const fragment = MEMORY_FRAGMENTS.find(
      f => f.triggerMethod === 'keyword' && 
           f.npcId === npcId && 
           f.keyword === keyword &&
           !collectedFragments.includes(f.id)
    )

    if (fragment) {
      setCurrentDialogue(`！你触发了隐藏记忆！\n\n关键词: "${keyword}"\n\n${fragment.content}`)
      onFragmentCollect(fragment.id)
      
      // 显示特效
      setTimeout(() => {
        alert(`✨ 获得隐藏碎片: ${fragment.title}`)
      }, 1000)
    } else {
      setCurrentDialogue(`${selectedNPC?.chineseName}: 这个词...似乎触动了什么...但我记不清了。`)
    }
  }

  /**
   * 触发小游戏
   */
  const triggerMinigame = (minigameId: string) => {
    if (completedMinigames.includes(minigameId)) {
      setCurrentDialogue(`${selectedNPC?.chineseName}: 你已经完成过这个挑战了。`)
      return
    }

    setCurrentDialogue(`${selectedNPC?.chineseName}: 来,让我测试你的能力。完成这个挑战,你将获得记忆碎片。`)
    
    setTimeout(() => {
      setActiveMinigame(minigameId)
      setIsInDialogue(false)
    }, 2000)
  }

  /**
   * 小游戏完成回调
   */
  const handleMinigameComplete = (score: number, timeUsed: number, accuracy: number, mistakes: number) => {
    if (!activeMinigame) return

    const finalScore = calculateScore(timeUsed, 60, accuracy, mistakes)
    const probability = calculateFragmentProbability(finalScore)
    const shouldGetFragment = Math.random() < probability

    let fragmentId: number | undefined

    if (shouldGetFragment) {
      // 查找对应的碎片
      const fragment = MEMORY_FRAGMENTS.find(
        f => f.triggerMethod === 'minigame' && 
             f.minigame === activeMinigame &&
             !collectedFragments.includes(f.id)
      )

      if (fragment) {
        fragmentId = fragment.id
        onFragmentCollect(fragment.id)
        onMinigameComplete(activeMinigame)
      }
    }

    setMinigameResult({ score: finalScore, fragmentId })
    setActiveMinigame(null)
  }

  /**
   * 关闭对话
   */
  const closeDialogue = () => {
    setIsInDialogue(false)
    setSelectedNPC(null)
    setCurrentDialogue('')
    setUserInput('')
    setMinigameResult(null)
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* 3D 世界 */}
      {eraConfig && (
        <BabylonWorld
          eraConfig={eraConfig}
          availableNPCs={availableNPCs}
          onNPCClick={(npcId) => handleNPCClick(npcId, 'ai-npc')}
        />
      )}


      {/* 控制提示 */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-cyan-500/50">
        <div className="text-xs space-y-1">
          <div className="text-cyan-400 font-bold mb-2">控制说明</div>
          <div className="text-gray-300">WASD - 移动</div>
          <div className="text-gray-300">鼠标 - 视角</div>
          <div className="text-gray-300">点击 - 交互</div>
        </div>
      </div>

      {/* 提示系统 */}
      <AnimatePresence>
        {showHint && hintMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-cyan-500/50 max-w-2xl"
          >
            <div className="text-cyan-400 text-sm">{hintMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 居民线索提示 */}
      <AnimatePresence>
        {residentClue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 backdrop-blur-sm px-8 py-4 rounded-lg border-2 border-yellow-500 max-w-lg"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">💬</div>
              <div>
                <div className="text-yellow-400 font-bold mb-1">居民线索</div>
                <div className="text-yellow-100 text-sm">{residentClue}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI-NPC对话界面 - 稍微左侧 */}
      <AnimatePresence>
        {isInDialogue && selectedNPC && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-[40%] transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl px-4"
          >
            <div className="bg-black/90 backdrop-blur-sm border rounded-xl p-6" style={{borderColor: selectedNPC.color}}>
              {/* NPC Info */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-700">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold"
                  style={{backgroundColor: selectedNPC.color + '40', color: selectedNPC.color}}
                >
                  {selectedNPC.geometryType === 'cube' && '■'}
                  {selectedNPC.geometryType === 'octahedron' && '◆'}
                  {selectedNPC.geometryType === 'sphere' && '●'}
                  {selectedNPC.geometryType === 'nested-cube' && '▣'}
                  {selectedNPC.geometryType === 'corrupted' && '▓'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{color: selectedNPC.color}}>
                    {selectedNPC.chineseName}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedNPC.role}</p>
                </div>
              </div>

              {/* Dialogue Content */}
              <div className="bg-gray-900/50 p-4 rounded-lg mb-4 min-h-[120px] max-h-[300px] overflow-y-auto">
                <p className="text-gray-200 whitespace-pre-wrap">{currentDialogue}</p>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入关键词或问题..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-bold transition-colors"
                >
                  发送
                </button>
                <button
                  onClick={closeDialogue}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
                >
                  离开
                </button>
              </div>

              {/* Keyword Hints */}
              {selectedNPC.keywords[currentEra] && selectedNPC.keywords[currentEra].length > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  提示: 尝试使用关键词可能会触发隐藏碎片...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 小游戏界面 */}
      <AnimatePresence>
        {activeMinigame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 border border-cyan-500 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <Minigames
                gameId={activeMinigame}
                onComplete={handleMinigameComplete}
                onClose={() => setActiveMinigame(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 小游戏结果 */}
      <AnimatePresence>
        {minigameResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-gray-900 border border-purple-500 rounded-xl p-8 max-w-md text-center">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">挑战完成!</h3>
              <div className="text-4xl mb-4">
                {minigameResult.fragmentId ? '✨' : '💫'}
              </div>
              <p className="text-xl text-white mb-2">得分: {minigameResult.score.toFixed(0)}</p>
              {minigameResult.fragmentId ? (
                <p className="text-lg text-green-400 mb-6">
                  ✓ 获得记忆碎片 #{minigameResult.fragmentId}
                </p>
              ) : (
                <p className="text-lg text-yellow-400 mb-6">
                  未获得碎片,再试一次可能会成功!
                </p>
              )}
              <button
                onClick={() => {
                  setMinigameResult(null)
                  setIsInDialogue(true)
                }}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold"
              >
                继续对话
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 控制面板 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={onExplorationEnd}
          className="px-4 py-2 bg-red-600/80 hover:bg-red-700 backdrop-blur-sm rounded-lg font-bold transition-colors"
        >
          退出探索
        </button>
        {currentEra < 4 && collectedFragments.length >= (currentEra + 1) * 2 && (
          <button
            onClick={onEraAdvance}
            className="px-4 py-2 bg-yellow-600/80 hover:bg-yellow-700 backdrop-blur-sm rounded-lg font-bold transition-colors animate-pulse"
          >
            前往下一纪元
          </button>
        )}
      </div>

      {/* 状态显示 */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="text-sm space-y-1">
          <div className="text-gray-400">纪元: <span className="text-cyan-400 font-bold">{eraConfig?.chineseName}</span></div>
          <div className="text-gray-400">碎片: <span className="text-purple-400 font-bold">{collectedFragments.length}</span></div>
          <div className="text-gray-400">小游戏: <span className="text-green-400 font-bold">{completedMinigames.length}</span></div>
        </div>
      </div>
    </div>
  )
}

