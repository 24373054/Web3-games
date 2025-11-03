# Yingzhou Contract ABIs

This directory contains all contract ABIs for external developers to integrate with Yingzhou game.

## Available Contracts

### 1. WorldLedger.json
The main ledger contract that records all world events and entropy levels.

**Key Functions:**
- `getEntropyLevel()` - Get current world entropy (0-100)
- `getCurrentEra()` - Get current era
- `recordEvent(type, contentHash, metadata)` - Record events on-chain

### 2. DigitalBeing.json
NFT contract for player digital beings.

**Key Functions:**
- `mint()` - Create a new digital being
- `getBeingData(tokenId)` - Get being metadata
- `interact(beingId, target, data)` - Interact with other contracts

### 3. AINPC.json
AI-powered NPC contract for dialogues.

**Key Functions:**
- `getNPC(npcId)` - Get NPC information
- `interact(npcId, questionHash)` - Trigger NPC interaction
- `getDialogueHistory(npcId)` - Get all dialogues with an NPC

### 4. MemoryFragment.json
ERC1155 memory fragment collection system.

**Key Functions:**
- `mintFragment(to, fragmentId, amount)` - Mint fragments (owner only)
- `getFragment(fragmentId)` - Get fragment metadata
- `revealTruth(recipeId)` - Reveal truth by combining fragments
- `canRevealTruth(player, recipeId)` - Check if player can reveal truth

### 5. Market.json
Marketplace for trading resources and fragments.

**Key Functions:**
- `createListing(tokenContract, tokenId, price)` - List item for sale
- `buyListing(listingId)` - Purchase listed item
- `cancelListing(listingId)` - Cancel your listing

## Usage Example

```javascript
import { ethers } from 'ethers'
import MemoryFragmentABI from './public/contracts/MemoryFragment.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const contract = new ethers.Contract(
  'CONTRACT_ADDRESS_HERE',
  MemoryFragmentABI,
  provider
)

// Get fragment info
const fragment = await contract.getFragment(1)
console.log(fragment.title, fragment.narrative)
```

## Contract Addresses

Update these after deployment:

```json
{
  "worldLedger": "0x...",
  "digitalBeing": "0x...",
  "ainpc": "0x...",
  "memoryFragment": "0x...",
  "market": "0x...",
  "resource1155": "0x..."
}
```

## License

MIT

