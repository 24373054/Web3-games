# Auto Deploy Guide - Automatic Contract Address Management

## Problem Solved

Previously, you had to manually update contract addresses in `.env.local` every time you restarted Hardhat node and redeployed contracts. This was tedious and error-prone.

**Now: Contract addresses are automatically saved and loaded!**

---

## How It Works

### 1. Deploy Script Auto-Saves Addresses

When you run the deploy script:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

It automatically:
- Deploys all contracts
- Saves all addresses to `lib/contractAddresses.json`
- Shows you the addresses in console

### 2. Frontend Auto-Loads Addresses

The frontend (`lib/contracts.ts`) automatically:
- Reads from `lib/contractAddresses.json`
- Falls back to `.env.local` if file doesn't exist
- Provides all contract instances with correct addresses

---

## Quick Start Workflow

### Terminal 1 - Blockchain

```bash
cd "Web3-games-main/瀛州纪"
npx hardhat node
```

Keep this running!

### Terminal 2 - Deploy (One Command!)

```bash
cd "Web3-games-main/瀛州纪"
npx hardhat run scripts/deploy.js --network localhost
```

**That's it!** Addresses are automatically saved.

### Terminal 3 - Frontend

```bash
cd "Web3-games-main/瀛州纪"
npm run dev
```

**No manual configuration needed!** The app will use the deployed addresses automatically.

---

## File Structure

```
Web3-games-main/瀛州纪/
  lib/
    contractAddresses.json          # Auto-generated, DO NOT edit manually
    contractAddresses.example.json  # Template (for reference)
    contracts.ts                    # Auto-reads addresses
  scripts/
    deploy.js                       # Auto-saves addresses
```

---

## Generated File Example

After deployment, `lib/contractAddresses.json` looks like:

```json
{
  "chainId": 31337,
  "rpcUrl": "http://127.0.0.1:8545",
  "worldLedger": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "digitalBeing": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "ainpc": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  "memoryFragment": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "explorer": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  "personalizedAINPC": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  "resource1155": "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  "market": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  "deployedAt": "2025-10-29T12:34:56.789Z"
}
```

---

## Restart Workflow (After Hardhat Restart)

If you restart Hardhat node, simply:

1. Keep Terminal 1 (hardhat node) running
2. In Terminal 2, run:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
3. Restart Terminal 3 (npm run dev):
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

**Addresses automatically updated!**

---

## Fallback to Environment Variables

If `lib/contractAddresses.json` doesn't exist, the system will:
1. Look for addresses in `.env.local`
2. Show helpful error messages if neither exists

You can still use `.env.local` if you prefer:

```env
NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=0x...
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=0x...
# etc.
```

But the auto-save method is **much easier**!

---

## Troubleshooting

### "Contract address not configured" error?

**Solution:**
```bash
# 1. Make sure Hardhat node is running
npx hardhat node

# 2. Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# 3. Restart dev server
npm run dev
```

### File doesn't exist after deployment?

Check:
- Deploy script ran successfully?
- Check console output for errors
- File should be at: `Web3-games-main/瀛州纪/lib/contractAddresses.json`

### Still using old addresses?

```bash
# Clear Next.js cache
rd /s /q .next    # Windows
rm -rf .next      # Mac/Linux

# Restart dev server
npm run dev
```

---

## Benefits

### Before (Manual Method)
1. Deploy contracts
2. Copy each address from console
3. Open `.env.local`
4. Paste 8+ addresses manually
5. Restart dev server
6. Easy to make mistakes!

### After (Auto Method)
1. Deploy contracts
2. Done! ?

---

## Git Ignore

The `lib/contractAddresses.json` file is **git-ignored** by default, so:
- Each developer has their own local deployment
- No conflicts in version control
- Template file (`contractAddresses.example.json`) is committed for reference

---

## Advanced: Multiple Networks

You can extend this for multiple networks:

```javascript
// In scripts/deploy.js
const network = hre.network.name
const configPath = path.join(__dirname, "..", "lib", `contractAddresses.${network}.json`)
```

Then in `lib/contracts.ts`:
```typescript
const network = process.env.NEXT_PUBLIC_NETWORK || 'localhost'
deployedAddresses = require(`./contractAddresses.${network}.json`)
```

---

## Summary

**No more manual address updates!**

1. Run `npx hardhat node`
2. Run `npx hardhat run scripts/deploy.js --network localhost`
3. Run `npm run dev`
4. Play! ?

The system automatically:
- Saves addresses on deployment
- Loads addresses in frontend
- Falls back to env vars if needed

**Happy coding!** ?


