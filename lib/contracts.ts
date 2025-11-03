import { ethers } from 'ethers'

// 导入 ABI
const WorldLedgerABI = require('./abis/WorldLedger.json')
const DigitalBeingABI = require('./abis/DigitalBeing.json')
const AINPCABI = require('./abis/AINPC.json')
const Resource1155ABI = require('./abis/Resource1155.json')
const MarketABI = require('./abis/Market.json')

// 获取合约地址（仅使用 contractAddresses.json）
export const getContractAddresses = () => {
  // 在浏览器环境中动态导入
  if (typeof window !== 'undefined') {
    try {
      // 使用动态导入避免缓存问题
      const addresses = require('./contractAddresses.json')
      
      console.log('📋 已加载合约地址配置:', {
        worldLedger: addresses.worldLedger?.substring(0, 10) + '...',
        digitalBeing: addresses.digitalBeing?.substring(0, 10) + '...',
        memoryFragment: addresses.memoryFragment?.substring(0, 10) + '...'
      })
      
      return {
        worldLedger: addresses.worldLedger || '',
        digitalBeing: addresses.digitalBeing || '',
        ainpc: addresses.ainpc || '',
        memoryFragment: addresses.memoryFragment || '',
        explorer: addresses.explorer || '',
        personalizedAINPC: addresses.personalizedAINPC || '',
        resource1155: addresses.resource1155 || '',
        market: addresses.market || ''
      }
    } catch (e) {
      console.error('❌ 无法加载 contractAddresses.json:', e)
      console.warn('💡 请运行一键启动脚本: npm run game')
      
      return {
        worldLedger: '',
        digitalBeing: '',
        ainpc: '',
        memoryFragment: '',
        explorer: '',
        personalizedAINPC: '',
        resource1155: '',
        market: ''
      }
    }
  }
  
  // 服务器端渲染时
  try {
    const addresses = require('./contractAddresses.json')
    return {
      worldLedger: addresses.worldLedger || '',
      digitalBeing: addresses.digitalBeing || '',
      ainpc: addresses.ainpc || '',
      memoryFragment: addresses.memoryFragment || '',
      explorer: addresses.explorer || '',
      personalizedAINPC: addresses.personalizedAINPC || '',
      resource1155: addresses.resource1155 || '',
      market: addresses.market || ''
    }
  } catch (e) {
    return {
      worldLedger: '',
      digitalBeing: '',
      ainpc: '',
      memoryFragment: '',
      explorer: '',
      personalizedAINPC: '',
      resource1155: '',
      market: ''
    }
  }
}

// 检查地址是否有效
function validateAddress(address: string, contractName: string): string {
  if (!address || address === '') {
    throw new Error(
      `${contractName} 地址未配置！\n` +
      `请确保：\n` +
      `1. 运行 'npx hardhat node' 启动本地区块链\n` +
      `2. 运行 'npx hardhat run scripts/deploy.js --network localhost' 部署合约\n` +
      `3. 合约地址会自动保存到 lib/contractAddresses.json\n` +
      `4. 重启开发服务器 (npm run dev)\n\n` +
      `参考 START_GAME.md 获取详细步骤`
    )
  }
  if (!ethers.isAddress(address)) {
    throw new Error(`${contractName} 地址格式无效: ${address}`)
  }
  return address
}

// 获取合约实例
export function getWorldLedgerContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.worldLedger, 'WorldLedger')
  return new ethers.Contract(validAddress, WorldLedgerABI, signerOrProvider)
}

export function getDigitalBeingContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.digitalBeing, 'DigitalBeing')
  return new ethers.Contract(validAddress, DigitalBeingABI, signerOrProvider)
}

export function getAINPCContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.ainpc, 'AINPC')
  return new ethers.Contract(validAddress, AINPCABI, signerOrProvider)
}

export function getResource1155Contract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.resource1155, 'Resource1155')
  return new ethers.Contract(validAddress, Resource1155ABI, signerOrProvider)
}

export function getMarketContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.market, 'Market')
  
  // Define Market ABI with all necessary methods
  const abi = [
    'function listItem(address nftContract, uint256 tokenId, uint256 price) external returns (uint256)',
    'function buyItem(uint256 listingId) external payable',
    'function cancelListing(uint256 listingId) external',
    'function getListing(uint256 listingId) external view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool isActive)',
    'function getListingCount() external view returns (uint256)',
    'function getAddress() external view returns (address)',
    'event ItemListed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)',
    'event ItemSold(uint256 indexed listingId, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price)',
    'event ListingCancelled(uint256 indexed listingId)'
  ]
  
  return new ethers.Contract(validAddress, abi, signerOrProvider)
}

export function getMemoryFragmentContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const addresses = getContractAddresses()
  const validAddress = validateAddress(addresses.memoryFragment || addresses.resource1155, 'MemoryFragment')
  
  // Use MemoryFragment ABI with ERC721 standard methods
  const abi = [
    // ERC721 Standard
    'function balanceOf(address owner) external view returns (uint256)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'function approve(address to, uint256 tokenId) external',
    'function getApproved(uint256 tokenId) external view returns (address)',
    'function setApprovalForAll(address operator, bool approved) external',
    'function isApprovedForAll(address owner, address operator) external view returns (bool)',
    'function transferFrom(address from, address to, uint256 tokenId) external',
    'function safeTransferFrom(address from, address to, uint256 tokenId) external',
    'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external',
    
    // ERC721Enumerable
    'function totalSupply() external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function tokenByIndex(uint256 index) external view returns (uint256)',
    
    // ERC721Metadata
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function tokenURI(uint256 tokenId) external view returns (string)',
    
    // Custom MemoryFragment functions
    'function getFragment(uint256 fragmentId) external view returns (string title, string narrative, uint8 fragmentType, uint8 rarity, uint256 timestamp, bool isCorrupted, uint256 relatedEra)',
    'function getTruthRecipe(uint256 recipeId) external view returns (string truthTitle, string revealedNarrative, uint256[] requiredFragments, uint256 minFragmentCount, bool isRevealed, address revealer)',
    'function canRevealTruth(address player, uint256 recipeId) external view returns (bool, uint256)',
    'function revealTruth(uint256 recipeId) external',
    'function mintFragment(address to, uint256 fragmentId, uint256 amount) external',
    'function getAddress() external view returns (address)'
  ]
  
  return new ethers.Contract(validAddress, abi, signerOrProvider)
}

// 事件类型枚举
export enum EventType {
  Creation = 0,
  Interaction = 1,
  Discovery = 2,
  Conflict = 3,
  Memory = 4
}

// NPC类型枚举
export enum NPCType {
  Archivist = 0,
  Architect = 1,
  Mercantile = 2,
  Oracle = 3,
  Entropy = 4
}

// 世界状态枚举
export enum WorldState {
  Genesis = 0,
  Emergence = 1,
  Flourish = 2,
  Entropy = 3,
  Collapsed = 4
}

