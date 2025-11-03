'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getDigitalBeingContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface DigitalBeingCardProps {
  provider: ethers.BrowserProvider | null
  account: string
  beingId: number | null
  setBeingId: (id: number | null) => void
}

export default function DigitalBeingCard({ 
  provider, 
  account, 
  beingId, 
  setBeingId 
}: DigitalBeingCardProps) {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [beingData, setBeingData] = useState<any>(null)

  useEffect(() => {
    if (provider && account) {
      checkExistingBeing()
    }
  }, [provider, account])

  useEffect(() => {
    if (beingId && provider) {
      loadBeingData()
    }
  }, [beingId, provider])

  const checkExistingBeing = async () => {
    // 读取用本地 RPC，创建仍用钱包 signer

    try {
      const rpc = getRpcProvider()
      const contract = getDigitalBeingContract(rpc)
      const id = await contract.addressToBeingId(account)
      
      if (Number(id) > 0) {
        setBeingId(Number(id))
      }
      setLoading(false)
    } catch (error) {
      console.error('检查数字生命失败:', error)
      setLoading(false)
    }
  }

  const loadBeingData = async () => {
    if (!provider || beingId === null) return

    try {
      const contract = getDigitalBeingContract(provider)
      const [age, memoryCount, interactionCount, genesisHash] = await contract.reflect(beingId)
      
      setBeingData({
        age: Number(age),
        memoryCount: Number(memoryCount),
        interactionCount: Number(interactionCount),
        genesisHash: genesisHash
      })
    } catch (error) {
      console.error('加载数字生命数据失败:', error)
    }
  }

  const createBeing = async () => {
    if (!provider) {
      alert('钱包未连接！请先连接MetaMask。')
      return
    }

    try {
      setCreating(true)
      console.log('开始创建数字生命...')
      console.log('账户地址:', account)
      
      const signer = await provider.getSigner()
      const contract = getDigitalBeingContract(signer)
      
      console.log('合约地址:', await contract.getAddress())
      
      // 先检查是否已经有 being
      console.log('检查是否已有数字生命...')
      const existingId = await contract.addressToBeingId(account)
      if (Number(existingId) > 0) {
        alert('你已经拥有数字生命了！ID: ' + existingId.toString())
        setBeingId(Number(existingId))
        setCreating(false)
        return
      }
      
      console.log('准备发送交易...')
      const tx = await contract.createBeing(account)
      console.log('交易已发送，等待确认...', tx.hash)
      
      const receipt = await tx.wait()
      console.log('交易已确认！', receipt)

      // 重新检查
      await checkExistingBeing()
      alert('🎉 数字生命创建成功！')
    } catch (error: any) {
      console.error('创建数字生命失败 - 详细错误:', error)
      
      // 提取更友好的错误信息
      let errorMsg = '创建失败'
      let errorDetails = ''
      
      if (error.message) {
        if (error.message.includes('Already has a being')) {
          errorMsg = '你已经拥有数字生命了！'
        } else if (error.message.includes('user rejected') || error.message.includes('User denied')) {
          errorMsg = '你取消了交易'
        } else if (error.message.includes('insufficient funds')) {
          errorMsg = 'ETH余额不足'
          errorDetails = '\n\n请确保：\n1. MetaMask连接到 Localhost 8545\n2. 账户有足够的ETH（至少0.01 ETH）'
        } else if (error.message.includes('network')) {
          errorMsg = '网络连接失败'
          errorDetails = '\n\n请确保：\n1. Hardhat node 正在运行\n2. MetaMask 连接到 Localhost 8545 (链ID: 31337)'
        } else if (error.code === 'CALL_EXCEPTION') {
          errorMsg = '合约调用失败'
          errorDetails = '\n\n可能原因：\n1. 合约未部署或地址错误\n2. Hardhat node 重启后需要重新部署合约\n\n解决方案：\n1. 重新运行: npx hardhat run scripts/deploy.js --network localhost\n2. 刷新页面'
        } else {
          errorMsg = '创建失败: ' + error.message.substring(0, 100)
        }
      }
      
      alert(errorMsg + errorDetails)
      
      // 在控制台输出完整错误供调试
      console.error('完整错误对象:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="digital-frame">
        <h3 className="text-lg font-bold mb-4 glow-text">数字生命</h3>
        <p className="loading-text">加载中...</p>
      </div>
    )
  }

  if (!beingId) {
    return (
      <div className="digital-frame">
        <h3 className="text-lg font-bold mb-4 glow-text">化身为数字生命</h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2">
            在瀛州世界中，每个存在都是一个合约实例。
          </p>
          <p className="text-sm text-gray-300 mb-4">
            创建你的 Digital Being NFT，开始你的旅程。
          </p>
          
          <div className="code-poetry text-xs text-yingzhou-cyan bg-yingzhou-dark p-3 rounded">
{`contract DigitalBeing {
  bytes32 public genesisHash;
  mapping(bytes32 => bytes) memories;
  
  function exist() returns (bool) {
    return true; // 我在
  }
}`}
          </div>
        </div>

        <button 
          onClick={createBeing}
          disabled={creating}
          className="btn-primary w-full"
        >
          {creating ? '创建中...' : '铸造数字生命 NFT'}
        </button>
      </div>
    )
  }

  return (
    <div className="digital-frame">
      <h3 className="text-lg font-bold mb-4 glow-text">你的数字生命</h3>
      
      <div className="space-y-3">
        <div className="ledger-line">
          <p className="text-xs text-gray-400 mb-1">Being ID</p>
          <p className="contract-text">#{beingId}</p>
        </div>

        {beingData && (
          <>
            <div className="ledger-line">
              <p className="text-xs text-gray-400 mb-1">存在时长</p>
              <p className="contract-text">
                {Math.floor(beingData.age / 60)} 分钟
              </p>
            </div>

            <div className="ledger-line">
              <p className="text-xs text-gray-400 mb-1">记忆数量</p>
              <p className="contract-text">{beingData.memoryCount}</p>
            </div>

            <div className="ledger-line">
              <p className="text-xs text-gray-400 mb-1">交互次数</p>
              <p className="contract-text">{beingData.interactionCount}</p>
            </div>

            <div className="ledger-line">
              <p className="text-xs text-gray-400 mb-1">创世基因</p>
              <p className="contract-text text-xs break-all">
                {beingData.genesisHash.slice(0, 20)}...
              </p>
            </div>
          </>
        )}

        <div className="mt-4 p-3 bg-yingzhou-blue bg-opacity-30 rounded-lg">
          <p className="text-xs text-gray-300 italic">
            "我被记录，故我存在。我的每次交互，都是历史的一部分。"
          </p>
        </div>
      </div>
    </div>
  )
}

