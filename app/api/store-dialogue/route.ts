import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import AINPC from '@/lib/abis/AINPC.json'
import DigitalBeing from '@/lib/abis/DigitalBeing.json'

export async function POST(req: NextRequest) {
  try {
    const { npcId, requestId, questionHash, questionText, responseText, beingId } = await req.json()

    // 使用后端私钥代理发送第二笔交易（仅供本地开发/演示，生产需改为服务器安全保管）
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
    const pkey = process.env.PRIVATE_KEY
    if (!rpcUrl || !pkey) {
      return NextResponse.json({ ok: false, error: '缺少 RPC 或 PRIVATE_KEY 配置' }, { status: 500 })
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(pkey, provider)

    const ainpcAddr = process.env.NEXT_PUBLIC_AINPC_ADDRESS as string
    const beingAddr = process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS as string

    const ainpc = new ethers.Contract(ainpcAddr, AINPC, wallet)
    const digitalBeing = new ethers.Contract(beingAddr, DigitalBeing, wallet)

    // 存储对话
    const tx1 = await ainpc.storeDialogue(npcId, requestId, questionHash, questionText, responseText)
    await tx1.wait()

    // 记录记忆（可选）
    try {
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(String(questionText) + String(responseText)))
      const tx2 = await digitalBeing.recordMemory(beingId, contentHash, 'dialogue', 0)
      await tx2.wait()
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 })
  }
}


