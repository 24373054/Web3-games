'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Link from 'next/link'
import { getMarketContract, getResource1155Contract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface Listing {
  id: number
  seller: string
  token: string
  tokenId: number
  amount: number
  price: string
  active: boolean
}

export default function MarketPage() {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 上架表单
  const [tokenId, setTokenId] = useState('')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  
  // 我的资源余额
  const [myBalances, setMyBalances] = useState<{[key: number]: number}>({})

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    loadListings()
    if (address) {
      loadMyBalances()
    }
  }, [address])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum)
      setProvider(prov)

      const accounts = await prov.listAccounts()
      if (accounts.length > 0) {
        setAddress(accounts[0].address)
      }
    }
  }

  const connectWallet = async () => {
    // 检测是否为移动端
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (!window.ethereum) {
      if (isMobile) {
        // 移动端：使用 deep link 唤起 MetaMask 或跳转下载
        const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
        
        // 尝试唤起 MetaMask 应用
        window.location.href = metamaskDeepLink
        
        // 如果 2 秒后还在页面，说明没有安装，跳转到下载页
        setTimeout(() => {
          if (confirm('检测到您尚未安装 MetaMask，是否前往下载？')) {
            window.location.href = 'https://metamask.io/download/'
          }
        }, 2000)
        return
      } else {
        // 桌面端：提示安装浏览器插件
        alert('请安装 MetaMask 浏览器插件!\n\n访问: https://metamask.io/download/')
        window.open('https://metamask.io/download/', '_blank')
        return
      }
    }

    try {
      const prov = new ethers.BrowserProvider(window.ethereum)
      
      // 检查网络并自动添加
      const network = await prov.getNetwork()
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
      // 移动端使用 HTTPS RPC URL
      const rpcUrl = isMobile 
        ? (process.env.NEXT_PUBLIC_RPC_URL_HTTPS || 'https://immortal.matrixlab.work/rpc')
        : (process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545')
      
      if (network.chainId.toString() !== expectedChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(expectedChainId).toString(16)}` }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${parseInt(expectedChainId).toString(16)}`,
                  chainName: '瀛州纪本地网络',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: [rpcUrl],
                  blockExplorerUrls: null
                }],
              })
            } catch (addError: any) {
              alert(`无法添加网络: ${addError.message}`)
              return
            }
          }
        }
      }
      
      await prov.send("eth_requestAccounts", [])
      const signer = await prov.getSigner()
      const addr = await signer.getAddress()
      
      setProvider(prov)
      setAddress(addr)
    } catch (error) {
      console.error('连接钱包失败:', error)
    }
  }

  const loadListings = async () => {
    try {
      const provider = getRpcProvider()
      const market = getMarketContract(provider)
      
      const counter = await market.listingCounter()
      const allListings: Listing[] = []
      
      for (let i = 1; i <= Number(counter); i++) {
        const listing = await market.listings(i)
        if (listing.active) {
          allListings.push({
            id: Number(listing.id),
            seller: listing.seller,
            token: listing.token,
            tokenId: Number(listing.tokenId),
            amount: Number(listing.amount),
            price: ethers.formatEther(listing.price),
            active: listing.active
          })
        }
      }
      
      setListings(allListings)
      
      // 筛选我的挂单
      if (address) {
        const mine = allListings.filter(l => l.seller.toLowerCase() === address.toLowerCase())
        setMyListings(mine)
      }
    } catch (err: any) {
      console.error('加载挂单失败:', err)
      setError(err.message)
    }
  }

  const loadMyBalances = async () => {
    if (!address) return
    try {
      const provider = getRpcProvider()
      const resource = getResource1155Contract(provider)
      
      // 查询 token 0-10 的余额
      const balances: {[key: number]: number} = {}
      for (let i = 0; i <= 10; i++) {
        const bal = await resource.balanceOf(address, i)
        balances[i] = Number(bal)
      }
      setMyBalances(balances)
    } catch (err: any) {
      console.error('加载余额失败:', err)
    }
  }

  const handleList = async () => {
    if (!provider || !address) {
      setError('请先连接钱包')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const signer = await provider.getSigner()
      const resource = getResource1155Contract(signer)
      const market = getMarketContract(signer)
      
      const resourceAddress = await resource.getAddress()
      const marketAddress = await market.getAddress()
      
      // 1. 授权
      console.log('授权资源给市场...')
      const isApproved = await resource.isApprovedForAll(address, marketAddress)
      if (!isApproved) {
        const approveTx = await resource.setApprovalForAll(marketAddress, true)
        await approveTx.wait()
      }
      
      // 2. 上架
      console.log('上架资源...')
      const priceWei = ethers.parseEther(price)
      const listTx = await market.list(resourceAddress, tokenId, amount, priceWei)
      await listTx.wait()
      
      alert('上架成功！')
      setTokenId('')
      setAmount('')
      setPrice('')
      
      await loadListings()
      await loadMyBalances()
    } catch (err: any) {
      console.error('上架失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (listing: Listing, buyAmount: number) => {
    if (!provider) {
      setError('请先连接钱包')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const signer = await provider.getSigner()
      const market = getMarketContract(signer)
      const totalPrice = ethers.parseEther((parseFloat(listing.price) * buyAmount).toString())
      
      console.log(`购买 ${buyAmount} 个，总价 ${ethers.formatEther(totalPrice)} ETH`)
      const buyTx = await market.buy(listing.id, buyAmount, { value: totalPrice })
      await buyTx.wait()
      
      alert('购买成功！')
      await loadListings()
      await loadMyBalances()
    } catch (err: any) {
      console.error('购买失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (listingId: number) => {
    if (!provider) {
      setError('请先连接钱包')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const signer = await provider.getSigner()
      const market = getMarketContract(signer)
      const cancelTx = await market.cancel(listingId)
      await cancelTx.wait()
      
      alert('已下架！')
      await loadListings()
      await loadMyBalances()
    } catch (err: any) {
      console.error('下架失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen matrix-bg">
      {/* 顶部导航 */}
      <header className="border-b border-yingzhou-cyan bg-yingzhou-dark bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-3xl font-bold glow-text">瀛州纪</h1>
              <p className="text-xs text-gray-400 mt-1">瀛州市场 - 数字资源交易所</p>
            </div>
            {address && (
              <nav className="flex gap-4 mt-2">
                <Link href="/" className="text-yingzhou-cyan hover:text-yingzhou-blue transition-colors">
                  主页
                </Link>
                <Link href="/market" className="text-yingzhou-cyan hover:text-yingzhou-blue transition-colors font-bold">
                  市场
                </Link>
              </nav>
            )}
          </div>
          
          {!address ? (
            <button onClick={connectWallet} className="btn-primary">
              连接钱包
            </button>
          ) : (
            <div className="text-right">
              <p className="text-xs text-gray-400">已连接</p>
              <p className="contract-text">{address.slice(0, 6)}...{address.slice(-4)}</p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 glow-text">
            瀛州市场
          </h2>
          <p className="text-gray-400">在此交易数字资源，所有交易永久记录在链上</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* 我的资源 */}
        {address && (
          <div className="mb-8 p-6 digital-frame">
            <h2 className="text-2xl font-bold mb-4">我的资源</h2>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(myBalances).filter(([_, bal]) => bal > 0).map(([id, bal]) => (
                <div key={id} className="p-3 bg-black/30 rounded-lg">
                  <div className="text-sm text-gray-400">Token #{id}</div>
                  <div className="text-xl font-bold">{bal}</div>
                </div>
              ))}
              {Object.values(myBalances).every(b => b === 0) && (
                <div className="col-span-5 text-gray-500 text-center py-4">
                  暂无资源（可联系管理员空投测试资源）
                </div>
              )}
            </div>
          </div>
        )}

        {/* 上架表单 */}
        {address && (
          <div className="mb-8 p-6 digital-frame">
            <h2 className="text-2xl font-bold mb-4">上架资源</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="number"
                placeholder="Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="数量"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="单价 (ETH)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:border-yingzhou-cyan focus:outline-none"
              />
              <button
                onClick={handleList}
                disabled={loading || !tokenId || !amount || !price}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '处理中...' : '上架'}
              </button>
            </div>
          </div>
        )}

        {/* 我的挂单 */}
        {address && myListings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">我的挂单</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((listing) => (
                <div key={listing.id} className="p-4 bg-yingzhou-dark bg-opacity-50 border border-green-500/50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-gray-400">挂单 #{listing.id}</div>
                      <div className="text-lg font-bold">Token #{listing.tokenId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">库存</div>
                      <div className="text-xl font-bold">{listing.amount}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-gray-400">单价</div>
                    <div className="text-2xl font-bold text-yellow-400">{listing.price} ETH</div>
                  </div>
                  <button
                    onClick={() => handleCancel(listing.id)}
                    disabled={loading}
                    className="w-full btn-secondary disabled:opacity-50"
                  >
                    下架
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 所有挂单 */}
        <div>
          <h2 className="text-2xl font-bold mb-4">市场挂单</h2>
          {listings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无挂单
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="p-4 bg-yingzhou-dark bg-opacity-50 border border-yingzhou-cyan rounded-lg hover:border-yingzhou-blue transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-gray-400">挂单 #{listing.id}</div>
                      <div className="text-lg font-bold">Token #{listing.tokenId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">库存</div>
                      <div className="text-xl font-bold">{listing.amount}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-gray-400">卖家</div>
                    <div className="text-xs font-mono text-purple-400">
                      {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-gray-400">单价</div>
                    <div className="text-2xl font-bold text-yellow-400">{listing.price} ETH</div>
                  </div>
                  {address && listing.seller.toLowerCase() !== address.toLowerCase() && (
                    <button
                      onClick={() => handleBuy(listing, 1)}
                      disabled={loading}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      购买 1 个
                    </button>
                  )}
                  {listing.seller.toLowerCase() === address?.toLowerCase() && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      这是你的挂单
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

