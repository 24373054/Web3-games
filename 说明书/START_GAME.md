# Start Playing Yingzhou Chronicle

## ? Quick Start (3 Steps) - Auto-Deploy Enabled!

### 1. Start Blockchain

```bash
# Navigate to project
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"

# Start Hardhat node (keep running)
npx hardhat node
```

### 2. Deploy Contracts (Auto-Saves Addresses!)

**In a new terminal:**
```bash
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"
npx hardhat run scripts/deploy.js --network localhost
```

? **Contract addresses are automatically saved to `lib/contractAddresses.json`**

### 3. Start Game

**In another new terminal:**
```bash
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"
npm run dev
```

Visit: **http://localhost:3000**

---

## ? Restart Workflow (After Hardhat Restart)

If you restart Hardhat node:

1. Keep Terminal 1 running (`npx hardhat node`)
2. In Terminal 2:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   ? Addresses auto-updated!
3. In Terminal 3, restart dev server:
   ```bash
   # Press Ctrl+C, then:
   npm run dev
   ```

**No manual configuration needed!** ?

---

## First Time Playing?

### Complete Setup (All 3 Terminals)

**Terminal 1 - Start Local Blockchain:**
```bash
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"
npx hardhat node
```

Keep this running!

**Terminal 2 - Deploy Contracts:**
```bash
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Start Game:**
```bash
cd "d:\edgefile\Web3-games-main\Web3-games-main\瀛州纪"
npm run dev
```

### Configure MetaMask

1. Open MetaMask
2. Add Network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

3. Import Test Account:
   - Copy private key from Hardhat output (Terminal 1)
   - MetaMask → Import Account → Paste key

---

## ? Auto-Deploy Feature

### What Changed?

**Before:** You had to manually copy-paste 8+ contract addresses to `.env.local` every time you redeployed.

**Now:** Addresses are automatically saved and loaded!

### How It Works

1. Deploy script saves addresses to `lib/contractAddresses.json`
2. Frontend automatically reads from this file
3. No manual configuration needed!

See `AUTO_DEPLOY_GUIDE.md` for details.

---

## Game Flow

```
1. Connect Wallet (MetaMask)
   ↓
2. Watch Intro (or skip)
   ↓
3. Create Digital Being NFT
   ↓
4. Explore 2D Map
   ↓
5. Talk to NPCs
   ↓
6. Collect 8 Fragments
   ↓
7. Reveal 5 Truths
   ↓
8. View Ending
```

---

## Controls

- **WASD** or **Arrow Keys** - Move
- **E** or **Space** - Talk to NPC
- **Mouse Click** - UI interactions

---

## Objectives

### Primary Goals:
- ? Collect all 8 memory fragments
- ? Reveal all 5 hidden truths
- ? Complete all era quests
- ? Unlock perfect ending

### Map Exploration:
- Find 4 NPCs (purple dots)
- Collect 4 ground fragments (yellow stars)
- Earn 4 quest fragments (from dialogue)

---

## Troubleshooting

### "Contract address not configured"
```bash
# 1. Make sure Hardhat is running
npx hardhat node

# 2. Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# 3. Restart dev server
npm run dev
```

### "Please install MetaMask!"
→ Install MetaMask browser extension

### "Contract call failed"
→ Check Hardhat node is running
→ Verify network is localhost:8545
→ Redeploy contracts (they auto-save!)

### Addresses not updating?
```bash
# Clear Next.js cache
rd /s /q .next
# Restart dev server
npm run dev
```

### "AI responses not working"
→ Game works with mock AI by default
→ Optional: Add AI API key to `.env.local`

---

## What's New in This Version?

### ? 2D Map Exploration
- 30x20 tile-based world
- Real-time character movement
- Collision detection

### ? Interactive AI NPCs
- 4 unique NPCs with distinct personalities
- Dynamic dialogue based on entropy level
- Quest completion through conversation

### ? Memory Fragment System
- 8 collectible fragments
- 5 hidden truths to reveal
- On-chain verification

### ? Complete Game Loop
- Quest progression system
- Multiple endings (4 variations)
- Save/load progress
- Settings panel

---

## Contract Addresses (Auto-Saved!)

After deployment, addresses are automatically saved to:
```
lib/contractAddresses.json
```

Example file content:
```json
{
  "worldLedger": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "digitalBeing": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "ainpc": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ...
}
```

**No manual updates needed!** Frontend reads this file automatically.

---

## Developer API

### For External Integration

All ABIs available at: `/public/contracts/`

Example usage:
```javascript
import MemoryFragmentABI from '/public/contracts/MemoryFragment.json'

const contract = new ethers.Contract(
  MEMORY_FRAGMENT_ADDRESS,
  MemoryFragmentABI,
  provider
)

const fragment = await contract.getFragment(1)
console.log(fragment.title, fragment.narrative)
```

See `GAME_GUIDE.md` for full API documentation.

---

**Ready to play? Start the dev server and connect your wallet!** ?

