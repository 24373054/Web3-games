/**
 * MetaMask 重置提示组件
 * 智能检测交易错误并提示用户重置账户
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 扩展 Window 接口
declare global {
  interface Window {
    ethereum?: any
  }
}

interface MetaMaskResetAlertProps {
  onClose?: () => void
}

export default function MetaMaskResetAlert({ onClose }: MetaMaskResetAlertProps) {
  const [show, setShow] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // 监听区块链连接事件
    const checkChainId = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const expectedChainId = '0x7a69' // 31337 in hex
          
          if (chainId !== expectedChainId) {
            setErrorMessage('网络错误：请切换到 Localhost (链ID 31337)')
            setShow(true)
          }
        } catch (e) {
          console.error('Failed to check chain ID:', e)
        }
      }
    }

    checkChainId()

    // 监听网络切换
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkChainId)
      
      return () => {
        window.ethereum.removeListener('chainChanged', checkChainId)
      }
    }
  }, [])

  // 显示首次访问提示
  useEffect(() => {
    const hasSeenAlert = localStorage.getItem('yingzhou_metamask_alert_seen')
    
    if (!hasSeenAlert) {
      setErrorMessage('首次使用提示')
      setShow(true)
      localStorage.setItem('yingzhou_metamask_alert_seen', 'true')
    }
  }, [])

  const handleClose = () => {
    setShow(false)
    if (onClose) onClose()
  }

  const resetSteps = [
    '1. 点击 MetaMask 浏览器扩展图标',
    '2. 点击右上角的"设置"图标',
    '3. 选择"高级"',
    '4. 向下滚动找到"重置账户"或"清除活动标签页数据"',
    '5. 点击并确认'
  ]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl">M</div>
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  {errorMessage === '首次使用提示' ? 'MetaMask 使用提示' : '! 重要提示'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {errorMessage === '首次使用提示' 
                    ? '每次重启游戏后需要重置 MetaMask 账户' 
                    : errorMessage
                  }
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {errorMessage === '首次使用提示' ? (
                <>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">
                      {'>'} 为什么需要重置账户？
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      每次重启 Hardhat 本地区块链时，区块链状态会重置，但 MetaMask 还记得之前的交易历史（nonce）。
                      如果不重置，会导致交易失败（nonce 不匹配错误）。
                    </p>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-3">
                      * 重置步骤
                    </h3>
                    <div className="space-y-2">
                      {resetSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-cyan-400 font-bold min-w-[20px]">{index + 1}.</span>
                          <span>{step.replace(/^\d+\.\s/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-400 mb-2">
                      + 注意事项
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        重置账户<strong>不会</strong>删除账户或私钥
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        只是清除本地交易历史，避免 nonce 冲突
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        每次重启游戏后都需要重置一次
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">•</span>
                        私钥只需导入一次，不用重新导入
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold text-white transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
              >
                我知道了
              </button>
              <button
                onClick={() => window.open('./MetaMask使用说明.md', '_blank')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
              >
                查看详细说明
              </button>
            </div>

            {/* Quick Access */}
            <div className="mt-4 text-center text-xs text-gray-500">
              提示: 按 ESC 或点击背景关闭此窗口
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * 错误检测 Hook
 * 监听交易错误并自动显示重置提示
 */
export function useMetaMaskErrorDetection() {
  const [shouldShowReset, setShouldShowReset] = useState(false)

  useEffect(() => {
    // 全局错误监听
    const handleError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || ''
      
      // 检测 nonce 相关错误
      if (
        message.includes('nonce') ||
        message.includes('transaction') && message.includes('fail') ||
        message.includes('replacement transaction underpriced')
      ) {
        console.warn('🦊 检测到可能的 nonce 错误，建议重置 MetaMask 账户')
        setShouldShowReset(true)
      }
    }

    // 监听未处理的 Promise 拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message?.toLowerCase() || ''
      
      if (
        reason.includes('nonce') ||
        reason.includes('transaction') && reason.includes('fail')
      ) {
        console.warn('🦊 检测到可能的 nonce 错误，建议重置 MetaMask 账户')
        setShouldShowReset(true)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return {
    shouldShowReset,
    dismissReset: () => setShouldShowReset(false)
  }
}

