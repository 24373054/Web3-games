const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * 自动化部署脚本
 * 1. 部署所有合约
 * 2. 自动更新 .env.local 文件
 */

async function main() {
  console.log("🚀 开始自动化部署瀛州纪智能合约...\n");

  // ========== 部署合约 ==========
  
  // 部署 WorldLedger
  console.log("📜 部署 WorldLedger...");
  const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
  const worldLedger = await WorldLedger.deploy();
  await worldLedger.waitForDeployment();
  const worldLedgerAddress = await worldLedger.getAddress();
  console.log("✅ WorldLedger 部署到:", worldLedgerAddress);

  // 部署 DigitalBeing
  console.log("\n🧬 部署 DigitalBeing...");
  const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
  const digitalBeing = await DigitalBeing.deploy(worldLedgerAddress);
  await digitalBeing.waitForDeployment();
  const digitalBeingAddress = await digitalBeing.getAddress();
  console.log("✅ DigitalBeing 部署到:", digitalBeingAddress);

  // 注册 DigitalBeing 到世界账本
  console.log("\n📝 注册 DigitalBeing 到世界账本...");
  const tx1 = await worldLedger.registerDigitalBeing(digitalBeingAddress);
  await tx1.wait();
  console.log("✅ DigitalBeing 已注册");

  // 部署 AINPC
  console.log("\n🤖 部署 AINPC...");
  const AINPC = await hre.ethers.getContractFactory("AINPC");
  const ainpc = await AINPC.deploy(worldLedgerAddress);
  await ainpc.waitForDeployment();
  const ainpcAddress = await ainpc.getAddress();
  console.log("✅ AINPC 部署到:", ainpcAddress);

  // 部署 Resource1155
  console.log("\n💎 部署 Resource1155...");
  const Resource1155 = await hre.ethers.getContractFactory("Resource1155");
  const resource = await Resource1155.deploy("https://metadata.yingzhou/{id}.json");
  await resource.waitForDeployment();
  const resourceAddress = await resource.getAddress();
  console.log("✅ Resource1155 部署到:", resourceAddress);

  // 部署 Market
  console.log("\n🏪 部署 Market...");
  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("✅ Market 部署到:", marketAddress);

  // 部署 EpochManager (新增)
  console.log("\n⏳ 部署 EpochManager...");
  const EpochManager = await hre.ethers.getContractFactory("EpochManager");
  const epochManager = await EpochManager.deploy(
    worldLedgerAddress,
    digitalBeingAddress,
    ainpcAddress
  );
  await epochManager.waitForDeployment();
  const epochManagerAddress = await epochManager.getAddress();
  console.log("✅ EpochManager 部署到:", epochManagerAddress);

  // 部署 MemoryFragment (新增)
  console.log("\n💎 部署 MemoryFragment...");
  const MemoryFragment = await hre.ethers.getContractFactory("MemoryFragment");
  const memoryFragment = await MemoryFragment.deploy();
  await memoryFragment.waitForDeployment();
  const memoryFragmentAddress = await memoryFragment.getAddress();
  console.log("✅ MemoryFragment 部署到:", memoryFragmentAddress);

  // 部署 AINPC_Extended (新增)
  console.log("\n🤖 部署 AINPC_Extended...");
  const AINPCExtended = await hre.ethers.getContractFactory("AINPC_Extended");
  const ainpcExtended = await AINPCExtended.deploy(
    worldLedgerAddress,
    epochManagerAddress,
    memoryFragmentAddress
  );
  await ainpcExtended.waitForDeployment();
  const ainpcExtendedAddress = await ainpcExtended.getAddress();
  console.log("✅ AINPC_Extended 部署到:", ainpcExtendedAddress);

  // 部署 MiniGameManager (新增)
  console.log("\n🎮 部署 MiniGameManager...");
  const MiniGameManager = await hre.ethers.getContractFactory("MiniGameManager");
  const miniGameManager = await MiniGameManager.deploy(epochManagerAddress);
  await miniGameManager.waitForDeployment();
  const miniGameManagerAddress = await miniGameManager.getAddress();
  console.log("✅ MiniGameManager 部署到:", miniGameManagerAddress);

  // 设置授权
  console.log("\n🔐 配置授权关系...");
  
  // 注册 AINPC 为数字生命
  console.log("  - 注册 AINPC 到世界账本...");
  const tx2 = await worldLedger.registerDigitalBeing(ainpcAddress);
  await tx2.wait();
  console.log("  ✅ AINPC 已注册");

  // 注册 AINPC_Extended 为数字生命
  console.log("  - 注册 AINPC_Extended 到世界账本...");
  const tx2b = await worldLedger.registerDigitalBeing(ainpcExtendedAddress);
  await tx2b.wait();
  console.log("  ✅ AINPC_Extended 已注册");

  // 设置 EpochManager 的授权合约地址
  console.log("  - 设置 EpochManager 的授权合约...");
  const tx3 = await epochManager.setAuthorizedContracts(
    memoryFragmentAddress,
    ainpcExtendedAddress
  );
  await tx3.wait();
  console.log("  ✅ EpochManager 授权配置完成");

  // 授权 EpochManager 铸造碎片
  console.log("  - 授权 EpochManager 铸造碎片...");
  const tx4 = await memoryFragment.setAuthorizedMinter(epochManagerAddress, true);
  await tx4.wait();
  console.log("  ✅ EpochManager 已授权");

  // 授权 AINPC 铸造碎片（用于基础功能）
  console.log("  - 授权 AINPC 铸造碎片...");
  const tx5 = await memoryFragment.setAuthorizedMinter(ainpcAddress, true);
  await tx5.wait();
  console.log("  ✅ AINPC 已授权");

  // 授权 AINPC_Extended 铸造碎片（用于关键词触发）
  console.log("  - 授权 AINPC_Extended 铸造碎片...");
  const tx6 = await memoryFragment.setAuthorizedMinter(ainpcExtendedAddress, true);
  await tx6.wait();
  console.log("  ✅ AINPC_Extended 已授权");

  // 授权 MiniGameManager 铸造碎片（用于游戏奖励）
  console.log("  - 授权 MiniGameManager 铸造碎片...");
  const tx7 = await memoryFragment.setAuthorizedMinter(miniGameManagerAddress, true);
  await tx7.wait();
  console.log("  ✅ MiniGameManager 已授权");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 部署完成！");
  console.log("=".repeat(60));
  console.log("WorldLedger:       ", worldLedgerAddress);
  console.log("DigitalBeing:      ", digitalBeingAddress);
  console.log("AINPC:             ", ainpcAddress);
  console.log("AINPC_Extended:    ", ainpcExtendedAddress);
  console.log("Resource1155:      ", resourceAddress);
  console.log("Market:            ", marketAddress);
  console.log("EpochManager:      ", epochManagerAddress);
  console.log("MemoryFragment:    ", memoryFragmentAddress);
  console.log("MiniGameManager:   ", miniGameManagerAddress);
  console.log("=".repeat(60) + "\n");

  // ========== 更新 .env.local 文件 ==========
  
  console.log("📝 更新 .env.local 文件...\n");
  
  const envPath = path.join(__dirname, "..", ".env.local");
  let envContent = "";
  let existingEnv = {};

  // 读取现有的 .env.local 文件（如果存在）
  if (fs.existsSync(envPath)) {
    console.log("📄 读取现有的 .env.local 文件...");
    const existingContent = fs.readFileSync(envPath, "utf8");
    
    // 解析现有配置
    existingContent.split("\n").forEach(line => {
      line = line.trim();
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          existingEnv[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
    console.log("✅ 已读取现有配置\n");
  }

  // 创建新的配置内容
  const newAddresses = {
    NEXT_PUBLIC_WORLD_LEDGER_ADDRESS: worldLedgerAddress,
    NEXT_PUBLIC_DIGITAL_BEING_ADDRESS: digitalBeingAddress,
    NEXT_PUBLIC_AINPC_ADDRESS: ainpcAddress,
    NEXT_PUBLIC_AINPC_EXTENDED_ADDRESS: ainpcExtendedAddress,
    NEXT_PUBLIC_RESOURCE1155_ADDRESS: resourceAddress,
    NEXT_PUBLIC_MARKET_ADDRESS: marketAddress,
    NEXT_PUBLIC_EPOCH_MANAGER_ADDRESS: epochManagerAddress,
    NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS: memoryFragmentAddress,
    NEXT_PUBLIC_MINIGAME_MANAGER_ADDRESS: miniGameManagerAddress,
  };

  // 合并配置（新地址覆盖旧地址，保留其他配置）
  const finalEnv = {
    ...existingEnv,
    ...newAddresses,
    NEXT_PUBLIC_CHAIN_ID: existingEnv.NEXT_PUBLIC_CHAIN_ID || "31337",
    NEXT_PUBLIC_RPC_URL: existingEnv.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
  };

  // 生成 .env.local 内容
  envContent = `# 智能合约地址（自动生成 - ${new Date().toLocaleString()}）
NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=${finalEnv.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS}
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=${finalEnv.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS}
NEXT_PUBLIC_AINPC_ADDRESS=${finalEnv.NEXT_PUBLIC_AINPC_ADDRESS}
NEXT_PUBLIC_RESOURCE1155_ADDRESS=${finalEnv.NEXT_PUBLIC_RESOURCE1155_ADDRESS}
NEXT_PUBLIC_MARKET_ADDRESS=${finalEnv.NEXT_PUBLIC_MARKET_ADDRESS}

# 剧情系统合约地址
NEXT_PUBLIC_EPOCH_MANAGER_ADDRESS=${finalEnv.NEXT_PUBLIC_EPOCH_MANAGER_ADDRESS}
NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS=${finalEnv.NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS}
NEXT_PUBLIC_AINPC_EXTENDED_ADDRESS=${finalEnv.NEXT_PUBLIC_AINPC_EXTENDED_ADDRESS}
NEXT_PUBLIC_MINIGAME_MANAGER_ADDRESS=${finalEnv.NEXT_PUBLIC_MINIGAME_MANAGER_ADDRESS}

# 网络配置
NEXT_PUBLIC_CHAIN_ID=${finalEnv.NEXT_PUBLIC_CHAIN_ID}
NEXT_PUBLIC_RPC_URL=${finalEnv.NEXT_PUBLIC_RPC_URL}
`;

  // 保留 DeepSeek AI 配置
  if (finalEnv.DEEPSEEK_API_KEY) {
    envContent += `
# DeepSeek AI 配置（从现有配置保留）
DEEPSEEK_API_KEY=${finalEnv.DEEPSEEK_API_KEY}
DEEPSEEK_MODEL=${finalEnv.DEEPSEEK_MODEL || "deepseek-chat"}
`;
  } else {
    envContent += `
# DeepSeek AI 配置（可选）
# 从 https://platform.deepseek.com/ 获取 API Key
# DEEPSEEK_API_KEY=
# DEEPSEEK_MODEL=deepseek-chat
`;
  }

  // 保留后端私钥
  if (finalEnv.PRIVATE_KEY) {
    envContent += `
# 后端私钥（仅开发环境，从现有配置保留）
PRIVATE_KEY=${finalEnv.PRIVATE_KEY}
`;
  } else {
    envContent += `
# 后端私钥（从 npx hardhat node 输出中复制）
# ⚠️ 仅用于本地测试，不要使用真实资金的私钥
# PRIVATE_KEY=
`;
  }

  // 写入文件
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local 文件已更新:", envPath);
  console.log("\n" + "=".repeat(60));
  console.log("📋 最终配置:");
  console.log("=".repeat(60));
  console.log(envContent);
  console.log("=".repeat(60) + "\n");

  console.log("🎊 全部完成！");
  console.log("\n📌 下一步：");
  console.log("   1. 重启前端服务: npm run dev");
  console.log("   2. 打开浏览器: http://localhost:3000");
  console.log("   3. 连接 MetaMask 到 Hardhat Local (Chain ID: 31337)");
  console.log("   4. 开始游戏！\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });

