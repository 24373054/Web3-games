import { ethers } from 'ethers'

export function getRpcProvider() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
  if (!rpcUrl) {
    throw new Error('缺少 NEXT_PUBLIC_RPC_URL 环境变量')
  }
  return new ethers.JsonRpcProvider(rpcUrl)
}


