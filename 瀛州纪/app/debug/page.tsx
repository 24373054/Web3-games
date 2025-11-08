'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContractAddresses } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

export default function DebugPage() {
  const [checks, setChecks] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const results: any = {}

    // 1. 检查环境变量
    results.env = {
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '❌ 未配置',
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || '❌ 未配置',
      NEXT_PUBLIC_WORLD_LEDGER_ADDRESS: process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS || '❌ 未配置',
      NEXT_PUBLIC_DIGITAL_BEING_ADDRESS: process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS || '❌ 未配置',
      NEXT_PUBLIC_AINPC_ADDRESS: process.env.NEXT_PUBLIC_AINPC_ADDRESS || '❌ 未配置',
    }

    // 2. 检查 RPC 连接
    try {
      const provider = getRpcProvider()
      const network = await provider.getNetwork()
      const blockNumber = await provider.getBlockNumber()
      results.rpc = {
        status: '✅ 连接成功',
        chainId: network.chainId.toString(),
        blockNumber: blockNumber.toString(),
      }
    } catch (error: any) {
      results.rpc = {
        status: '❌ 连接失败',
        error: error.message,
      }
    }

    // 3. 检查 MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const accounts = await provider.listAccounts()
        results.metamask = {
          status: '✅ 已安装',
          chainId: network.chainId.toString(),
          connected: accounts.length > 0,
          account: accounts.length > 0 ? accounts[0].address : '未连接',
        }
      } catch (error: any) {
        results.metamask = {
          status: '⚠️ 已安装但无法连接',
          error: error.message,
        }
      }
    } else {
      results.metamask = {
        status: '❌ 未安装',
      }
    }

    // 4. 检查合约部署
    results.contracts = {}
    try {
      const provider = getRpcProvider()
      const addresses = getContractAddresses()

      for (const [name, address] of Object.entries(addresses)) {
        if (address) {
          const code = await provider.getCode(address)
          results.contracts[name] = {
            address,
            deployed: code !== '0x' ? '✅ 已部署' : '❌ 未部署',
            codeSize: code !== '0x' ? `${code.length} bytes` : 'N/A',
          }
        } else {
          results.contracts[name] = {
            address: '❌ 未配置',
            deployed: 'N/A',
          }
        }
      }
    } catch (error: any) {
      results.contracts = {
        error: error.message,
      }
    }

    // 5. 网络匹配检查
    if (results.rpc.status.includes('✅') && results.metamask.status.includes('✅')) {
      const rpcChainId = results.rpc.chainId
      const mmChainId = results.metamask.chainId
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337'

      results.networkMatch = {
        expected: expectedChainId,
        rpc: rpcChainId,
        metamask: mmChainId,
        rpcMatch: rpcChainId === expectedChainId ? '✅ 匹配' : '❌ 不匹配',
        mmMatch: mmChainId === expectedChainId ? '✅ 匹配' : '❌ 不匹配',
      }
    }

    setChecks(results)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen matrix-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl text-yingzhou-cyan">运行诊断中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen matrix-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 glow-text text-center">
          瀛州纪 - 系统诊断
        </h1>

        {/* 环境变量 */}
        <div className="digital-frame mb-6">
          <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">1. 环境变量配置</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(checks.env || {}).map(([key, value]: any) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={value.includes('❌') ? 'text-red-400' : 'text-green-400'}>
                  {typeof value === 'string' && value.length > 50 
                    ? value.slice(0, 50) + '...' 
                    : value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RPC 连接 */}
        <div className="digital-frame mb-6">
          <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">2. RPC 连接状态</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(checks.rpc || {}).map(([key, value]: any) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  value.toString().includes('✅') ? 'text-green-400' : 
                  value.toString().includes('❌') ? 'text-red-400' : 
                  'text-gray-300'
                }>
                  {value.toString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MetaMask */}
        <div className="digital-frame mb-6">
          <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">3. MetaMask 状态</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(checks.metamask || {}).map(([key, value]: any) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className={
                  value.toString().includes('✅') ? 'text-green-400' : 
                  value.toString().includes('❌') || value.toString().includes('⚠️') ? 'text-red-400' : 
                  'text-gray-300'
                }>
                  {value.toString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 网络匹配 */}
        {checks.networkMatch && (
          <div className="digital-frame mb-6">
            <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">4. 网络匹配检查</h2>
            <div className="space-y-2 font-mono text-sm">
              {Object.entries(checks.networkMatch).map(([key, value]: any) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400">{key}:</span>
                  <span className={
                    value.toString().includes('✅') ? 'text-green-400' : 
                    value.toString().includes('❌') ? 'text-red-400' : 
                    'text-gray-300'
                  }>
                    {value.toString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 合约部署 */}
        <div className="digital-frame mb-6">
          <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">5. 合约部署状态</h2>
          {checks.contracts.error ? (
            <p className="text-red-400">{checks.contracts.error}</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(checks.contracts).map(([name, info]: any) => (
                <div key={name} className="border-l-2 border-yingzhou-cyan pl-4">
                  <p className="text-yingzhou-cyan font-bold">{name}</p>
                  <div className="text-sm space-y-1 mt-2">
                    {Object.entries(info).map(([key, value]: any) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className={
                          value.toString().includes('✅') ? 'text-green-400' : 
                          value.toString().includes('❌') ? 'text-red-400' : 
                          'text-gray-300'
                        }>
                          {typeof value === 'string' && value.length > 50 
                            ? value.slice(0, 50) + '...' 
                            : value.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 建议 */}
        <div className="digital-frame bg-yingzhou-blue bg-opacity-20">
          <h2 className="text-2xl font-bold mb-4 text-yingzhou-cyan">💡 诊断建议</h2>
          <div className="space-y-3 text-sm">
            {checks.rpc?.status?.includes('❌') && (
              <div className="p-3 bg-red-900 bg-opacity-30 rounded">
                <p className="text-red-400 font-bold mb-1">❌ RPC 连接失败</p>
                <p className="text-gray-300">请确保 Hardhat 节点正在运行：<code className="text-yingzhou-cyan">npx hardhat node</code></p>
              </div>
            )}

            {checks.networkMatch?.mmMatch?.includes('❌') && (
              <div className="p-3 bg-red-900 bg-opacity-30 rounded">
                <p className="text-red-400 font-bold mb-1">❌ MetaMask 网络不匹配</p>
                <p className="text-gray-300">请在 MetaMask 中切换到 Chain ID {checks.networkMatch.expected}</p>
              </div>
            )}

            {Object.values(checks.contracts || {}).some((c: any) => c.deployed?.includes('❌')) && (
              <div className="p-3 bg-red-900 bg-opacity-30 rounded">
                <p className="text-red-400 font-bold mb-1">❌ 部分合约未部署</p>
                <p className="text-gray-300">请运行：<code className="text-yingzhou-cyan">npm run deploy:auto</code></p>
              </div>
            )}

            {checks.rpc?.status?.includes('✅') && 
             checks.metamask?.status?.includes('✅') && 
             checks.networkMatch?.mmMatch?.includes('✅') &&
             !Object.values(checks.contracts || {}).some((c: any) => c.deployed?.includes('❌')) && (
              <div className="p-3 bg-green-900 bg-opacity-30 rounded">
                <p className="text-green-400 font-bold mb-1">✅ 所有检查通过！</p>
                <p className="text-gray-300">系统配置正确，可以正常使用。</p>
                <a href="/" className="text-yingzhou-cyan hover:underline mt-2 inline-block">
                  → 返回主页开始游戏
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={runDiagnostics}
            className="btn-primary"
          >
            🔄 重新检查
          </button>
          <a href="/" className="ml-4 text-yingzhou-cyan hover:underline">
            ← 返回主页
          </a>
        </div>
      </div>
    </div>
  )
}
