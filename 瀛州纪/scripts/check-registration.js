const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 检查合约注册状态...\n");

  // 从 .env.local 读取合约地址
  const envPath = path.join(__dirname, "..", ".env.local");
  let worldLedgerAddress, digitalBeingAddress, ainpcAddress;

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.includes('NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=')) {
        worldLedgerAddress = line.split('=')[1].trim();
      }
      if (line.includes('NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=')) {
        digitalBeingAddress = line.split('=')[1].trim();
      }
      if (line.includes('NEXT_PUBLIC_AINPC_ADDRESS=')) {
        ainpcAddress = line.split('=')[1].trim();
      }
    });
  } catch (error) {
    console.error("❌ 无法读取 .env.local 文件");
    process.exit(1);
  }

  console.log("合约地址:");
  console.log("WorldLedger:", worldLedgerAddress);
  console.log("DigitalBeing:", digitalBeingAddress);
  console.log("AINPC:", ainpcAddress);
  console.log("");

  // 获取合约实例
  const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
  const worldLedger = WorldLedger.attach(worldLedgerAddress);

  // 检查注册状态
  console.log("📋 检查注册状态:");
  
  const isDigitalBeingRegistered = await worldLedger.isDigitalBeing(digitalBeingAddress);
  console.log("DigitalBeing 已注册:", isDigitalBeingRegistered ? "✅ 是" : "❌ 否");
  
  const isAINPCRegistered = await worldLedger.isDigitalBeing(ainpcAddress);
  console.log("AINPC 已注册:", isAINPCRegistered ? "✅ 是" : "❌ 否");
  
  console.log("");
  
  if (!isDigitalBeingRegistered || !isAINPCRegistered) {
    console.log("⚠️  发现未注册的合约！");
    console.log("");
    console.log("修复方法：");
    
    if (!isDigitalBeingRegistered) {
      console.log("1. 注册 DigitalBeing:");
      console.log(`   npx hardhat console --network localhost`);
      console.log(`   > const wl = await ethers.getContractAt("WorldLedger", "${worldLedgerAddress}")`);
      console.log(`   > await wl.registerDigitalBeing("${digitalBeingAddress}")`);
    }
    
    if (!isAINPCRegistered) {
      console.log("2. 注册 AINPC:");
      console.log(`   npx hardhat console --network localhost`);
      console.log(`   > const wl = await ethers.getContractAt("WorldLedger", "${worldLedgerAddress}")`);
      console.log(`   > await wl.registerDigitalBeing("${ainpcAddress}")`);
    }
  } else {
    console.log("✅ 所有合约都已正确注册！");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 检查失败:", error);
    process.exit(1);
  });

