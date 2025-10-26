'use client'

import { useState } from 'react'
import { ethers } from 'ethers'

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: any = {}

    try {
      // 1. 检查 MetaMask
      if (!window.ethereum) {
        diagnostics.metamask = 'NOT_INSTALLED'
      } else {
        diagnostics.metamask = 'INSTALLED'
        
        // 2. 获取链ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        diagnostics.metamaskChainId = parseInt(chainId, 16)
        
        // 3. 创建 provider
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        diagnostics.providerChainId = network.chainId.toString()
        
        // 4. 获取账户
        const accounts = await provider.listAccounts()
        diagnostics.accountCount = accounts.length
        if (accounts.length > 0) {
          diagnostics.account = accounts[0].address
        }
        
        // 5. 检查合约地址
        const worldLedgerAddr = process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS
        diagnostics.worldLedgerAddress = worldLedgerAddr
        
        if (worldLedgerAddr) {
          // 6. 获取合约代码
          const code = await provider.getCode(worldLedgerAddr)
          diagnostics.contractCodeLength = code.length
          diagnostics.contractExists = code !== '0x'
          
          if (code !== '0x') {
            // 7. 尝试调用合约
            const WorldLedgerABI = require('../../lib/abis/WorldLedger.json')
            const contract = new ethers.Contract(worldLedgerAddr, WorldLedgerABI, provider)
            
            try {
              const state = await contract.currentState()
              diagnostics.contractCall = 'SUCCESS'
              diagnostics.worldState = state.toString()
            } catch (err: any) {
              diagnostics.contractCall = 'FAILED'
              diagnostics.contractError = err.message
            }
          }
        }
        
        // 8. 环境变量
        diagnostics.env = {
          CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
          RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
          WORLD_LEDGER: process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS,
          DIGITAL_BEING: process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS,
          AINPC: process.env.NEXT_PUBLIC_AINPC_ADDRESS
        }
      }
    } catch (error: any) {
      diagnostics.error = error.message
    }

    setInfo(diagnostics)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-yingzhou-dark text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-yingzhou-cyan">🔍 瀛州纪诊断页面</h1>
        
        <button 
          onClick={runDiagnostics}
          disabled={loading}
          className="btn-primary mb-6"
        >
          {loading ? '诊断中...' : '运行诊断'}
        </button>

        {info && (
          <div className="digital-frame">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(info, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yingzhou-blue bg-opacity-30 rounded-lg text-sm">
          <h3 className="font-bold mb-2">检查清单：</h3>
          <ul className="space-y-1">
            <li>✅ metamaskChainId 应该是 <strong>31337</strong></li>
            <li>✅ contractExists 应该是 <strong>true</strong></li>
            <li>✅ contractCall 应该是 <strong>SUCCESS</strong></li>
            <li>✅ worldState 应该是 <strong>0</strong> (创世状态)</li>
          </ul>
        </div>

        <div className="mt-4">
          <a href="/" className="btn-secondary">
            返回主页
          </a>
        </div>
      </div>
    </div>
  )
}

