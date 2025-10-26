import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    WORLD_LEDGER: process.env.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS || 'NOT SET',
    DIGITAL_BEING: process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS || 'NOT SET',
    AINPC: process.env.NEXT_PUBLIC_AINPC_ADDRESS || 'NOT SET',
    CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'NOT SET',
    RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'NOT SET'
  })
}


