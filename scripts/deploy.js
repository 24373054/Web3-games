const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始部署瀛州纪智能合约...\n");

  // 部署 WorldLedger
  console.log("📜 部署 WorldLedger...");
  const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
  const worldLedger = await WorldLedger.deploy();
  await worldLedger.waitForDeployment();
  const worldLedgerAddress = await worldLedger.getAddress();
  console.log("✅ WorldLedger 部署到:", worldLedgerAddress);

  // 部署 DigitalBeing
  console.log("\n👤 部署 DigitalBeing...");
  const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
  const digitalBeing = await DigitalBeing.deploy(worldLedgerAddress);
  await digitalBeing.waitForDeployment();
  const digitalBeingAddress = await digitalBeing.getAddress();
  console.log("✅ DigitalBeing 部署到:", digitalBeingAddress);

  // 注册 DigitalBeing 到世界账本
  console.log("\n🔗 注册 DigitalBeing 到世界账本...");
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

  // 注册 AINPC 为数字生命
  console.log("\n🔗 注册 AINPC 到世界账本...");
  const tx2 = await worldLedger.registerDigitalBeing(ainpcAddress);
  await tx2.wait();
  console.log("✅ AINPC 已注册");

  // 部署 MemoryFragment
  console.log("\n🧩 部署 MemoryFragment...");
  const MemoryFragment = await hre.ethers.getContractFactory("MemoryFragment");
  const memoryFragment = await MemoryFragment.deploy(
    worldLedgerAddress,
    "https://metadata.yingzhou/fragment/{id}.json"
  );
  await memoryFragment.waitForDeployment();
  const memoryFragmentAddress = await memoryFragment.getAddress();
  console.log("✅ MemoryFragment 部署到:", memoryFragmentAddress);

  // 注册 MemoryFragment 为数字生命
  console.log("\n🔗 注册 MemoryFragment 到世界账本...");
  const tx3 = await worldLedger.registerDigitalBeing(memoryFragmentAddress);
  await tx3.wait();
  console.log("✅ MemoryFragment 已注册");

  // 部署 Explorer
  console.log("\n🔍 部署 Explorer...");
  const Explorer = await hre.ethers.getContractFactory("Explorer");
  const explorer = await Explorer.deploy(digitalBeingAddress, memoryFragmentAddress);
  await explorer.waitForDeployment();
  const explorerAddress = await explorer.getAddress();
  console.log("✅ Explorer 部署到:", explorerAddress);

  // 部署 PersonalizedAINPC
  console.log("\n💬 部署 PersonalizedAINPC...");
  const PersonalizedAINPC = await hre.ethers.getContractFactory("PersonalizedAINPC");
  const personalizedAINPC = await PersonalizedAINPC.deploy(worldLedgerAddress);
  await personalizedAINPC.waitForDeployment();
  const personalizedAINPCAddress = await personalizedAINPC.getAddress();
  console.log("✅ PersonalizedAINPC 部署到:", personalizedAINPCAddress);

  // 注册 PersonalizedAINPC 为数字生命
  console.log("\n🔗 注册 PersonalizedAINPC 到世界账本...");
  const tx4 = await worldLedger.registerDigitalBeing(personalizedAINPCAddress);
  await tx4.wait();
  console.log("✅ PersonalizedAINPC 已注册");

  // 部署旧的 Resource1155 和 Market（兼容性）
  console.log("\n📦 部署 Resource1155 (兼容)...");
  const Resource1155 = await hre.ethers.getContractFactory("Resource1155");
  const resource = await Resource1155.deploy("https://metadata.yingzhou/{id}.json");
  await resource.waitForDeployment();
  const resourceAddress = await resource.getAddress();
  console.log("✅ Resource1155 部署到:", resourceAddress);

  console.log("\n🏪 部署 Market (兼容)...");
  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("✅ Market 部署到:", marketAddress);

  console.log("\n=================================");
  console.log("🎉 部署完成！");
  console.log("=================================");
  console.log("📜 WorldLedger:        ", worldLedgerAddress);
  console.log("👤 DigitalBeing:       ", digitalBeingAddress);
  console.log("🤖 AINPC:              ", ainpcAddress);
  console.log("🧩 MemoryFragment:     ", memoryFragmentAddress);
  console.log("🔍 Explorer:           ", explorerAddress);
  console.log("💬 PersonalizedAINPC:  ", personalizedAINPCAddress);
  console.log("📦 Resource1155:       ", resourceAddress);
  console.log("🏪 Market:             ", marketAddress);
  console.log("=================================\n");

  console.log("📝 请将以下地址添加到 .env.local 文件:\n");
  console.log(`NEXT_PUBLIC_CHAIN_ID=31337`);
  console.log(`NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545`);
  console.log(`NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=${worldLedgerAddress}`);
  console.log(`NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=${digitalBeingAddress}`);
  console.log(`NEXT_PUBLIC_AINPC_ADDRESS=${ainpcAddress}`);
  console.log(`NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS=${memoryFragmentAddress}`);
  console.log(`NEXT_PUBLIC_EXPLORER_ADDRESS=${explorerAddress}`);
  console.log(`NEXT_PUBLIC_PERSONALIZED_AINPC_ADDRESS=${personalizedAINPCAddress}`);
  console.log(`NEXT_PUBLIC_RESOURCE1155_ADDRESS=${resourceAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);

  // 自动保存合约地址到配置文件
  const addresses = {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    worldLedger: worldLedgerAddress,
    digitalBeing: digitalBeingAddress,
    ainpc: ainpcAddress,
    memoryFragment: memoryFragmentAddress,
    explorer: explorerAddress,
    personalizedAINPC: personalizedAINPCAddress,
    resource1155: resourceAddress,
    market: marketAddress,
    deployedAt: new Date().toISOString()
  };

  const configPath = path.join(__dirname, "..", "lib", "contractAddresses.json");
  fs.writeFileSync(configPath, JSON.stringify(addresses, null, 2));
  console.log(`\n✅ 合约地址已自动保存到: lib/contractAddresses.json`);

  console.log("\n💡 下一步:");
  console.log("1. 运行 'npm run init-game' 初始化游戏数据");
  console.log("2. 运行 'npm run dev' 启动前端");
  console.log("3. 在浏览器访问 http://localhost:3000");
  console.log("\n🎯 合约地址已自动配置，无需手动更新！\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
