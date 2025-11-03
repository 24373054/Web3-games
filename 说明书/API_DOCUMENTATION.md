# Yingzhou Contract API Documentation

## For External Developers

This document provides a comprehensive guide for developers who want to integrate with Yingzhou's smart contracts.

---

## Contract Addresses

After deploying to localhost:

```javascript
const CONTRACTS = {
  WorldLedger: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  DigitalBeing: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  AINPC: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  MemoryFragment: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  Market: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  Resource1155: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
}
```

---

## 1. MemoryFragment Contract

### Overview
ERC1155 contract for memory fragment collection and truth revelation.

### ABI Location
`/public/contracts/MemoryFragment.json`

### Key Functions

#### Get Fragment Information
```solidity
function getFragment(uint256 fragmentId) 
  external 
  view 
  returns (
    string memory title,
    string memory narrative,
    FragmentType fragmentType,
    Rarity rarity,
    uint256 timestamp,
    bool isCorrupted,
    uint256 relatedEra
  )
```

**JavaScript Example:**
```javascript
const fragment = await memoryFragmentContract.getFragment(1)
console.log({
  title: fragment.title,        // "Genesis Seed"
  narrative: fragment.narrative, // Code snippet
  type: fragment.fragmentType,   // 0 = Genesis, 1 = Evolution, etc.
  rarity: fragment.rarity,       // 0-4 (Common to Legendary)
  timestamp: fragment.timestamp, // Block number
  corrupted: fragment.isCorrupted,
  era: fragment.relatedEra
})
```

#### Get Truth Recipe
```solidity
function getTruthRecipe(uint256 recipeId)
  external
  view
  returns (
    string memory truthTitle,
    string memory revealedNarrative,
    uint256[] memory requiredFragments,
    uint256 minFragmentCount,
    bool isRevealed,
    address revealer
  )
```

**JavaScript Example:**
```javascript
const truth = await memoryFragmentContract.getTruthRecipe(1)
console.log({
  title: truth.truthTitle,
  narrative: truth.revealedNarrative,
  required: truth.requiredFragments, // [1, 2]
  minCount: truth.minFragmentCount,
  revealed: truth.isRevealed,
  revealer: truth.revealer
})
```

#### Check if Player Can Reveal Truth
```solidity
function canRevealTruth(address player, uint256 recipeId)
  external
  view
  returns (bool canReveal, uint256 ownedCount)
```

**JavaScript Example:**
```javascript
const [canReveal, ownedCount] = await memoryFragmentContract.canRevealTruth(
  playerAddress,
  1 // recipeId
)

if (canReveal) {
  console.log(`Player has ${ownedCount} required fragments - can reveal!`)
}
```

#### Reveal Truth (Transaction)
```solidity
function revealTruth(uint256 recipeId) external
```

**JavaScript Example:**
```javascript
const tx = await memoryFragmentContract.revealTruth(1)
const receipt = await tx.wait()
console.log('Truth revealed!', receipt)

// Listen for event
memoryFragmentContract.on('TruthRevealed', (revealer, recipeId, title) => {
  console.log(`${revealer} revealed: ${title}`)
})
```

#### Mint Fragment (Owner Only)
```solidity
function mintFragment(address to, uint256 fragmentId, uint256 amount)
  external
  onlyOwner
```

**JavaScript Example:**
```javascript
const tx = await memoryFragmentContract.mintFragment(
  playerAddress,
  5, // fragmentId
  1  // amount
)
await tx.wait()
```

### Events

```solidity
event FragmentMinted(address indexed to, uint256 indexed fragmentId, string title)
event TruthRevealed(address indexed revealer, uint256 indexed recipeId, string truthTitle)
event FragmentCorrupted(uint256 indexed fragmentId, uint256 entropyLevel)
```

**Listening to Events:**
```javascript
memoryFragmentContract.on('TruthRevealed', (revealer, recipeId, title, event) => {
  console.log(`Truth #${recipeId} revealed by ${revealer}: ${title}`)
})
```

---

## 2. AINPC Contract

### Overview
AI-powered NPC system with dialogue recording and entropy-based degradation.

### ABI Location
`/public/contracts/AINPC.json`

### Key Functions

#### Get NPC Information
```solidity
function getNPC(uint256 npcId)
  external
  view
  returns (
    uint256 id,
    string memory name,
    NPCType npcType,
    uint256 degradationLevel,
    uint256 lastInteraction,
    uint256 interactionCount
  )
```

**JavaScript Example:**
```javascript
const npc = await ainpcContract.getNPC(0)
console.log({
  id: npc.id,
  name: npc.name,                    // "Chronicle Keeper"
  type: npc.npcType,                 // 0 = Archivist
  degradation: npc.degradationLevel, // 0-100
  lastInteraction: npc.lastInteraction,
  count: npc.interactionCount
})
```

#### Interact with NPC (Transaction)
```solidity
function interact(uint256 npcId, bytes32 questionHash)
  external
  returns (bytes32 requestId)
```

**JavaScript Example:**
```javascript
const question = "What is the origin of Yingzhou?"
const questionHash = ethers.keccak256(ethers.toUtf8Bytes(question))

const tx = await ainpcContract.interact(0, questionHash)
const receipt = await tx.wait()

// Parse requestId from events
const event = receipt.logs.find(log => {
  try {
    return ainpcContract.interface.parseLog(log).name === 'DialogueRecorded'
  } catch { return false }
})

const requestId = event ? ainpcContract.interface.parseLog(event).args[2] : null
```

#### Get Dialogue History
```solidity
function getDialogueHistory(uint256 npcId)
  external
  view
  returns (DialogueRecord[] memory)
```

**JavaScript Example:**
```javascript
const history = await ainpcContract.getDialogueHistory(0)

for (const record of history) {
  const content = await ainpcContract['dialogueContents(bytes32)'](record.responseHash)
  console.log({
    speaker: record.speaker,
    question: content.question,
    response: content.response,
    timestamp: new Date(Number(record.timestamp) * 1000),
    entropy: record.entropyLevel
  })
}
```

### Events

```solidity
event DialogueRecorded(
  address indexed speaker,
  uint256 indexed npcId,
  bytes32 requestId,
  uint256 timestamp
)

event NPCDegraded(uint256 indexed npcId, uint256 newDegradationLevel)
```

---

## 3. DigitalBeing Contract

### Overview
ERC721 NFT representing player avatars with interaction tracking.

### ABI Location
`/public/contracts/DigitalBeing.json`

### Key Functions

#### Mint Digital Being
```solidity
function mint() external returns (uint256 tokenId)
```

**JavaScript Example:**
```javascript
const tx = await digitalBeingContract.mint()
const receipt = await tx.wait()

// Get token ID from event
const event = receipt.logs.find(log => 
  log.topics[0] === ethers.id('Transfer(address,address,uint256)')
)
const tokenId = ethers.toBigInt(event.topics[3])
console.log('Digital Being minted:', tokenId)
```

#### Get Being Data
```solidity
function getBeingData(uint256 tokenId)
  external
  view
  returns (
    address owner,
    uint256 creationTime,
    uint256 lastActive,
    uint256 interactionCount,
    uint256 entropy
  )
```

**JavaScript Example:**
```javascript
const being = await digitalBeingContract.getBeingData(tokenId)
console.log({
  owner: being.owner,
  created: new Date(Number(being.creationTime) * 1000),
  lastActive: new Date(Number(being.lastActive) * 1000),
  interactions: being.interactionCount,
  entropy: being.entropy
})
```

#### Interact with Contract
```solidity
function interact(
  uint256 beingId,
  address targetContract,
  bytes calldata data
) external returns (bytes memory result)
```

**JavaScript Example:**
```javascript
// Encode AINPC interaction
const callData = ainpcContract.interface.encodeFunctionData('interact', [
  npcId,
  questionHash
])

const tx = await digitalBeingContract.interact(
  beingId,
  ainpcAddress,
  callData
)
await tx.wait()
```

---

## 4. WorldLedger Contract

### Overview
Central ledger recording all world events and entropy levels.

### ABI Location
`/public/contracts/WorldLedger.json`

### Key Functions

#### Get Current Entropy
```solidity
function getEntropyLevel() external view returns (uint256)
```

**JavaScript Example:**
```javascript
const entropy = await worldLedgerContract.getEntropyLevel()
console.log(`World entropy: ${entropy}%`)
```

#### Get Current Era
```solidity
function getCurrentEra() external view returns (uint256)
```

#### Record Event (Registered Contracts Only)
```solidity
function recordEvent(
  EventType eventType,
  bytes32 contentHash,
  string calldata metadata
) external
```

#### Get Event History
```solidity
function getEventHistory(uint256 startBlock, uint256 endBlock)
  external
  view
  returns (WorldEvent[] memory)
```

**JavaScript Example:**
```javascript
const events = await worldLedgerContract.getEventHistory(0, 1000)

for (const event of events) {
  console.log({
    type: event.eventType, // 0=Birth, 1=Dialogue, 2=Discovery, etc.
    emitter: event.emitter,
    content: event.contentHash,
    metadata: event.metadata,
    timestamp: new Date(Number(event.timestamp) * 1000),
    block: event.blockNumber
  })
}
```

---

## 5. Market Contract

### Overview
Decentralized marketplace for trading resources and fragments.

### ABI Location
`/public/contracts/Market.json`

### Key Functions

#### Create Listing
```solidity
function createListing(
  address tokenContract,
  uint256 tokenId,
  uint256 price,
  bool isERC1155
) external returns (uint256 listingId)
```

#### Buy Listing
```solidity
function buyListing(uint256 listingId) external payable
```

#### Cancel Listing
```solidity
function cancelListing(uint256 listingId) external
```

---

## Complete Integration Example

```javascript
import { ethers } from 'ethers'
import MemoryFragmentABI from './public/contracts/MemoryFragment.json'
import AINPCABI from './public/contracts/AINPC.json'
import DigitalBeingABI from './public/contracts/DigitalBeing.json'

// Setup
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()

// Contracts
const memoryFragment = new ethers.Contract(
  MEMORY_FRAGMENT_ADDRESS,
  MemoryFragmentABI,
  signer
)

const ainpc = new ethers.Contract(
  AINPC_ADDRESS,
  AINPCABI,
  signer
)

const digitalBeing = new ethers.Contract(
  DIGITAL_BEING_ADDRESS,
  DigitalBeingABI,
  signer
)

// 1. Create digital being
const mintTx = await digitalBeing.mint()
const mintReceipt = await mintTx.wait()
const beingId = /* extract from event */

// 2. Talk to NPC
const question = "Tell me about Yingzhou"
const questionHash = ethers.keccak256(ethers.toUtf8Bytes(question))

const interactData = ainpc.interface.encodeFunctionData('interact', [
  0, // npcId
  questionHash
])

const tx = await digitalBeing.interact(beingId, AINPC_ADDRESS, interactData)
await tx.wait()

// 3. Check fragments
const balance = await memoryFragment.balanceOf(userAddress, 1)
console.log(`Fragment #1 balance: ${balance}`)

// 4. Try to reveal truth
const [canReveal, ownedCount] = await memoryFragment.canRevealTruth(
  userAddress,
  1 // recipeId
)

if (canReveal) {
  const revealTx = await memoryFragment.revealTruth(1)
  await revealTx.wait()
  console.log('Truth revealed!')
}
```

---

## Rate Limits & Best Practices

### Transaction Costs
- Each NPC interaction: ~50,000-100,000 gas
- Fragment minting: ~30,000 gas
- Truth revelation: ~80,000 gas

### Recommendations
1. Batch read operations when possible
2. Cache NPC data locally
3. Use events for real-time updates
4. Implement retry logic for failed transactions

### Event Listeners
```javascript
// Efficient event listening
const filter = memoryFragment.filters.TruthRevealed(null, null)
const events = await memoryFragment.queryFilter(filter, -10000) // Last 10k blocks

// Live updates
memoryFragment.on(filter, (revealer, recipeId, title) => {
  console.log('New truth revealed:', title)
})
```

---

## Testing

### Example Test
```javascript
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('MemoryFragment', function() {
  it('Should allow revealing truth with enough fragments', async function() {
    const [owner, player] = await ethers.getSigners()
    
    // Mint required fragments
    await memoryFragment.mintFragment(player.address, 1, 1)
    await memoryFragment.mintFragment(player.address, 2, 1)
    
    // Check eligibility
    const [canReveal] = await memoryFragment.canRevealTruth(player.address, 1)
    expect(canReveal).to.be.true
    
    // Reveal
    await memoryFragment.connect(player).revealTruth(1)
    
    // Verify
    const recipe = await memoryFragment.getTruthRecipe(1)
    expect(recipe.isRevealed).to.be.true
    expect(recipe.revealer).to.equal(player.address)
  })
})
```

---

## Support & Resources

- **Game Guide:** `GAME_GUIDE.md`
- **Quick Start:** `START_GAME.md`
- **Source Code:** GitHub repository
- **Issues:** Submit via GitHub Issues

---

**Happy building! ??**

