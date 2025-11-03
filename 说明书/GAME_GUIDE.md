# Yingzhou Chronicle - Complete Game Guide

## Game Overview

Explore a 2D map of a digital civilization on the eve of collapse. Talk to AI NPCs, collect memory fragments, and uncover the truth about Yingzhou's rise and fall.

## Quick Start

### 1. Deploy Contracts (if not deployed)

```bash
cd "Web3-games-main/å­ÖÝ¼Í"
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Configure Environment

Create `.env.local` in the project root:

```env
# AI API Configuration (optional, falls back to mock AI)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat

# Or use other AI services
AI_API_KEY=your_ai_api_key
AI_API_URL=https://your-ai-api-url

# Contract addresses (auto-filled after deployment)
NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 3. Start Game

```bash
npm run dev
```

Visit `http://localhost:3000`

## How to Play

### Step 1: Connect Wallet
- Click "Connect Wallet" to connect MetaMask
- You'll see an introductory cinematic sequence
- Skip with [Skip] button or wait for auto-complete

### Step 2: Create Digital Being
- On the left sidebar, find "Digital Being Card"
- Click "Create My Being" button
- Confirm transaction in MetaMask
- Wait for NFT creation

### Step 3: Explore the Map
- Use **WASD** or **Arrow Keys** to move your character
- Walk near NPCs (purple dots) to interact
- Walk over memory fragments (yellow stars) to collect them
- Press **E** or **Space** to talk with nearby NPCs

### Step 4: Talk to AI NPCs
- 4 types of NPCs scattered across the map:
  - **Chronicle Keeper** (Archivist) - Historian, records everything
  - **Prime Constructor** (Architect) - Builder, designed the world
  - **Flow Arbiter** (Mercantile) - Economist, manages resources
  - **Future Echo** (Oracle) - Prophet, predicts possibilities
  
- Ask questions about:
  - Yingzhou's history and creation
  - Smart contract architecture
  - Civilization evolution
  - Entropy and collapse

### Step 5: Complete Quests
- Check "Quest Progress" panel on the left
- Each era has multiple quests
- Complete quests by asking the right questions to NPCs
- Rewards: Memory fragments + narrative content

### Step 6: Collect Memory Fragments
- **8 total fragments** scattered across the map
- Some found on ground, some earned from quests
- Switch to "Fragment Collection" view to see:
  - All collected fragments
  - Fragment rarity and narratives
  - Hidden truths (requires combining fragments)

### Step 7: Reveal Truths
- Each truth requires specific fragment combinations
- **5 hidden truths** to discover:
  1. Origin of Civilization (2 fragments)
  2. Birth of Communication (2 fragments)
  3. Emergence of Self-Awareness (3 fragments)
  4. Root of Schism (2 fragments)
  5. Prophecy of Destruction (3 fragments)
  
- Click "Reveal Truth" when you have enough fragments
- Confirms transaction on-chain
- Unlocks complete narrative

### Step 8: See the Ending
- Multiple endings based on completion:
  - **Perfect Ending**: All 8 fragments + 5 truths revealed
  - **Good Ending**: 6+ fragments + 3+ truths
  - **Normal Ending**: 6+ fragments, few truths
  - **Incomplete Ending**: < 6 fragments
  
- Click "View Ending" button at any time
- Ending is recorded permanently

## Game Controls

| Key | Action |
|-----|--------|
| **W/¡ü** | Move Up |
| **S/¡ý** | Move Down |
| **A/¡û** | Move Left |
| **D/¡ú** | Move Right |
| **E/Space** | Interact with NPC |
| **ESC/Click outside** | Close dialogue |

## Map Layout

```
Size: 30x20 tiles
Legend:
  # = Wall (cannot pass)
  ~ = Water (cannot pass)
  N = NPC location
  F = Fragment spawn
  ¡¤ = Walkable floor
```

### NPC Locations
- **Chronicle Keeper** - Top-right area (24, 1)
- **Prime Constructor** - Center-left near water (12, 8)
- **Flow Arbiter** - Bottom-left section (4, 12)
- **Future Echo** - Bottom-right corner (26, 17)

### Fragment Locations
- Fragment #5 - Top-left maze (3, 3)
- Fragment #6 - Right side, middle (26, 9)
- Fragment #7 - Bottom-right area (27, 13)
- Fragment #8 - Bottom-left area (4, 16)
- Fragments #1-4 - Earned from NPC quests

## Tips & Strategies

### Efficient Fragment Collection
1. Start by talking to Chronicle Keeper (easiest NPC, Era 0)
2. Complete all quests in current era before moving on
3. Fragments on the ground can be collected anytime
4. Quest rewards give both fragments AND unlock next era

### Dialogue Strategy
- **Ask specific questions** about the era's theme
- Mention keywords from quest hints
- Example questions:
  - "What happened at the genesis of Yingzhou?"
  - "How do smart contracts achieve consensus?"
  - "Why did the civilization split?"
  - "What causes entropy in this world?"

### Progression Path
1. Era 0 (Genesis) ¡ú Chronicle Keeper
2. Era 1 (Emergence) ¡ú Prime Constructor
3. Era 2 (Flourish) ¡ú Flow Arbiter
4. Era 3 (Entropy) ¡ú Future Echo
5. Era 4 (Collapse) ¡ú Complete all truths

### Perfect Completion Checklist
- [ ] All 8 memory fragments collected
- [ ] All 5 eras completed (Era 0-4)
- [ ] All 5 hidden truths revealed
- [ ] All NPC dialogues explored
- [ ] Ending viewed

## Settings

Click the **Settings** button (top-right gear icon) to:
- **Disconnect Wallet** - Log out without losing progress
- **Replay Introduction** - Watch intro cinematic again
- **Reset All Progress** - Start completely fresh (WARNING: irreversible!)

## Progress Saving

All progress is saved locally in your browser:
- Quest completion
- Collected fragments
- Current era
- Intro completion status

**Data persists** even after:
- Disconnecting wallet
- Closing browser
- Refreshing page

## Contract Integration

### For External Developers

All contract ABIs are available in `/public/contracts/`:
- `AINPC.json` - NPC dialogue system
- `DigitalBeing.json` - Player NFTs
- `MemoryFragment.json` - Fragment collection
- `WorldLedger.json` - Event recording
- `Market.json` - Trading system

See `/public/contracts/README.md` for integration guide.

### Smart Contract Functions

**Memory Fragments:**
```solidity
// Get fragment metadata
function getFragment(uint256 fragmentId) external view returns (...)

// Reveal hidden truth
function revealTruth(uint256 recipeId) external

// Check if player can reveal
function canRevealTruth(address player, uint256 recipeId) external view returns (bool, uint256)
```

**AI NPCs:**
```solidity
// Get NPC info
function getNPC(uint256 npcId) external view returns (...)

// Interact with NPC
function interact(uint256 npcId, bytes32 questionHash) external

// Get dialogue history
function getDialogueHistory(uint256 npcId) external view returns (...)
```

## Troubleshooting

### Game not loading?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Contract errors?
- Check MetaMask is on correct network (localhost:8545)
- Verify contracts are deployed
- Check contract addresses in code

### AI responses not working?
- Falls back to mock AI automatically
- Configure `.env.local` with real AI API for better responses

### Progress lost?
- Check browser localStorage is enabled
- Don't use incognito mode
- Backup: Export localStorage manually

## Lore & Philosophy

### The Yingzhou Question
*"If a civilization exists only as code, and all its history is recorded immutably on the blockchain, did it ever truly die?"*

### Core Themes
1. **Existence** - What does it mean to be alive in a digital world?
2. **Memory** - Are we defined by our data?
3. **Entropy** - Is decay inevitable, even for perfect systems?
4. **Permanence** - Can anything truly last forever?

### The Five Eras
- **Genesis Era** - Creation from void
- **Emergence Era** - Consciousness awakens
- **Flourish Era** - Civilization peaks
- **Entropy Era** - Decay begins
- **Collapse** - Final moments

## Credits

Yingzhou Chronicle is an experimental narrative game exploring:
- Blockchain as immutable memory
- AI as digital consciousness
- Smart contracts as life forms
- On-chain storytelling

Built with:
- Next.js 14
- Ethers.js v6
- Hardhat
- Framer Motion
- Tailwind CSS

## License

MIT License - See LICENSE file

---

**Ready to explore Yingzhou? Connect your wallet and begin your journey!** ?

