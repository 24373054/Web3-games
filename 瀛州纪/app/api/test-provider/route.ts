import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    
    const network = await provider.getNetwork()
    const blockNumber = await provider.getBlockNumber()
    
    // 测试合约
    const worldLedgerAddress = process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS
    const code = await provider.getCode(worldLedgerAddress!)
    
    return NextResponse.json({
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      },
      blockNumber,
      contractCode: code.substring(0, 100) + '...',
      codeLength: code.length,
      hasContract: code !== '0x'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


