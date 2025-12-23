/**
 * 游戏模式选择器
 * 让用户选择 Web2（模拟钱包）或 Web3（真实钱包）模式
 */

'use client'

import { useState } from 'react'

interface ModeSelectorProps {
  onSelectMode: (mode: 'web2' | 'web3') => void
}

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const [showDetails, setShowDetails] = useState<'web2' | 'web3' | null>(null)

  return (
    <div className="min-h-screen matrix-bg flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold glow-text mb-4">瀛州纪</h1>
          <p className="text-xl text-gray-400">选择你的游戏模式</p>
        </div>

        {/* 模式选择卡片 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Web2 模式 */}
          <div 
            className="digital-frame hover:border-green-400 transition-all cursor-pointer transform hover:scale-105"
            onMouseEnter={() => setShowDetails('web2')}
            onMouseLeave={() => setShowDetails(null)}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">Web2 模式</h2>
              <p className="text-sm text-gray-400">轻松体验 · 无需钱包</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">零门槛体验</p>
                  <p className="text-sm text-gray-400">无需安装钱包，立即开始游戏</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">模拟钱包系统</p>
                  <p className="text-sm text-gray-400">自动创建游戏内钱包，数据保存在本地</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">完整游戏功能</p>
                  <p className="text-sm text-gray-400">体验所有游戏内容和玩法</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">⚠</span>
                <div>
                  <p className="text-white font-semibold">数据仅本地存储</p>
                  <p className="text-sm text-gray-400">清除浏览器数据会丢失进度</p>
                </div>
              </div>
            </div>

            {showDetails === 'web2' && (
              <div className="bg-green-900 bg-opacity-20 border border-green-400 p-4 rounded mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  <strong className="text-green-400">适合人群：</strong>
                </p>
                <ul className="text-sm text-gray-400 space-y-1 ml-4">
                  <li>• 想快速体验游戏的新玩家</li>
                  <li>• 不熟悉区块链钱包的用户</li>
                  <li>• 只想单机游玩的玩家</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => onSelectMode('web2')}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-all transform hover:scale-105"
            >
              选择 Web2 模式 →
            </button>
          </div>

          {/* Web3 模式 */}
          <div 
            className="digital-frame hover:border-blue-400 transition-all cursor-pointer transform hover:scale-105"
            onMouseEnter={() => setShowDetails('web3')}
            onMouseLeave={() => setShowDetails(null)}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⛓️</div>
              <h2 className="text-3xl font-bold text-blue-400 mb-2">Web3 模式</h2>
              <p className="text-sm text-gray-400">真实上链 · 永久保存</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">真实区块链</p>
                  <p className="text-sm text-gray-400">所有数据上链，永久保存</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">NFT 资产</p>
                  <p className="text-sm text-gray-400">数字生命、碎片等都是真实 NFT</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <div>
                  <p className="text-white font-semibold">可交易资产</p>
                  <p className="text-sm text-gray-400">在市场中交易你的游戏资产</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">⚠</span>
                <div>
                  <p className="text-white font-semibold">需要钱包和 Gas</p>
                  <p className="text-sm text-gray-400">需要安装 MetaMask 并支付交易费用</p>
                </div>
              </div>
            </div>

            {showDetails === 'web3' && (
              <div className="bg-blue-900 bg-opacity-20 border border-blue-400 p-4 rounded mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  <strong className="text-blue-400">适合人群：</strong>
                </p>
                <ul className="text-sm text-gray-400 space-y-1 ml-4">
                  <li>• 熟悉区块链和钱包的用户</li>
                  <li>• 想要真实拥有游戏资产的玩家</li>
                  <li>• 希望参与链上交易的玩家</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => onSelectMode('web3')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all transform hover:scale-105"
            >
              选择 Web3 模式 →
            </button>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="digital-frame max-w-3xl mx-auto">
            <h3 className="text-xl text-yingzhou-cyan mb-4">💡 模式对比</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2 px-4 text-left text-gray-400">功能</th>
                    <th className="py-2 px-4 text-center text-green-400">Web2 模式</th>
                    <th className="py-2 px-4 text-center text-blue-400">Web3 模式</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-2 px-4">游戏体验</td>
                    <td className="py-2 px-4 text-center">✓ 完整</td>
                    <td className="py-2 px-4 text-center">✓ 完整</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 px-4">需要钱包</td>
                    <td className="py-2 px-4 text-center">✗ 不需要</td>
                    <td className="py-2 px-4 text-center">✓ 需要</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 px-4">数据存储</td>
                    <td className="py-2 px-4 text-center">本地浏览器</td>
                    <td className="py-2 px-4 text-center">区块链</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 px-4">资产交易</td>
                    <td className="py-2 px-4 text-center">✗ 不支持</td>
                    <td className="py-2 px-4 text-center">✓ 支持</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 px-4">交易费用</td>
                    <td className="py-2 px-4 text-center">✗ 免费</td>
                    <td className="py-2 px-4 text-center">需要 Gas</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">数据迁移</td>
                    <td className="py-2 px-4 text-center">可导出/导入</td>
                    <td className="py-2 px-4 text-center">永久保存</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            💡 提示：你可以随时在设置中切换模式（Web2 数据可导出后导入 Web3）
          </p>
        </div>
      </div>
    </div>
  )
}
