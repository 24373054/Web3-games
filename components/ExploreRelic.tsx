'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExploreRelicProps {
  onClose: () => void
  onFragmentCollected: (fragmentId: number, score: number) => void
  currentEra: number
  account: string | null
}

export default function ExploreRelic({ 
  onClose, 
  onFragmentCollected,
  currentEra,
  account 
}: ExploreRelicProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [explorationTime, setExplorationTime] = useState(300) // 5 minutes
  const [collectedFragments, setCollectedFragments] = useState(0)

  useEffect(() => {
    // 监听来自 3D 世界的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === '3D_FRAGMENT_COLLECTED') {
        const { fragmentId, score } = event.data
        setCollectedFragments(prev => prev + 1)
        onFragmentCollected(fragmentId, score)
      } else if (event.data.type === '3D_EXPLORATION_END') {
        // 探索结束
        setTimeout(() => {
          onClose()
        }, 2000)
      } else if (event.data.type === '3D_LOADED') {
        setIsLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onFragmentCollected, onClose])

  // 发送游戏数据到 3D 世界
  useEffect(() => {
    if (!isLoading && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'INIT_3D_WORLD',
        data: {
          era: currentEra,
          account: account,
          timeLimit: explorationTime
        }
      }, '*')
    }
  }, [isLoading, currentEra, account, explorationTime])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      >
        {/* 加载提示 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-cyan-400 text-xl font-mono">正在进入历史遗迹...</p>
              <p className="text-gray-400 text-sm mt-2">Loading 3D World...</p>
            </div>
          </div>
        )}

        {/* HUD 叠加层 */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-500 rounded-lg px-4 py-2">
              <div className="text-cyan-400 text-sm font-mono">
                历史遗迹探索 - 纪元 {currentEra + 1}
              </div>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm border border-yellow-500 rounded-lg px-4 py-2">
              <div className="text-yellow-400 text-sm font-mono">
                收集碎片: {collectedFragments}
              </div>
            </div>

            <button
              onClick={onClose}
              className="pointer-events-auto bg-red-900/80 hover:bg-red-800 border border-red-500 text-white px-4 py-2 rounded-lg text-sm font-mono transition-colors"
            >
              退出遗迹
            </button>
          </div>
        </div>

        {/* 3D 世界 iframe */}
        <iframe
          ref={iframeRef}
          src="http://localhost:5173"
          className="w-full h-full border-none"
          title="历史遗迹探索"
          allow="accelerometer; gyroscope"
        />

        {/* 底部提示 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-500 rounded-lg px-4 py-2">
              <p className="text-cyan-400 text-xs font-mono text-center">
                💡 WASD 移动 | 鼠标 视角 | E 交互 | 空格 跳跃 | 在遗迹中寻找数字生命体，完成挑战获取记忆碎片
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

