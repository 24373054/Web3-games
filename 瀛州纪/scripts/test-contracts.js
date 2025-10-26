const hre = require("hardhat");

async function main() {
  const addresses = {
    worldLedger: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    digitalBeing: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ainpc: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  };

  try {
    console.log("测试合约是否存在...\n");
    
    const provider = hre.ethers.provider;
    
    // 测试 WorldLedger
    console.log("检查 WorldLedger...");
    const worldCode = await provider.getCode(addresses.worldLedger);
    console.log("代码长度:", worldCode.length);
    if (worldCode === "0x") {
      console.log("❌ WorldLedger 不存在！需要重新部署\n");
    } else {
      console.log("✅ WorldLedger 存在\n");
    }

    // 测试 DigitalBeing
    console.log("检查 DigitalBeing...");
    const beingCode = await provider.getCode(addresses.digitalBeing);
    console.log("代码长度:", beingCode.length);
    if (beingCode === "0x") {
      console.log("❌ DigitalBeing 不存在！需要重新部署\n");
    } else {
      console.log("✅ DigitalBeing 存在\n");
    }

    // 测试 AINPC
    console.log("检查 AINPC...");
    const ainpcCode = await provider.getCode(addresses.ainpc);
    console.log("代码长度:", ainpcCode.length);
    if (ainpcCode === "0x") {
      console.log("❌ AINPC 不存在！需要重新部署\n");
    } else {
      console.log("✅ AINPC 存在\n");
    }

    // 尝试调用合约
    if (worldCode !== "0x") {
      console.log("\n测试调用 WorldLedger.currentState()...");
      const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
      const worldLedger = WorldLedger.attach(addresses.worldLedger);
      const state = await worldLedger.currentState();
      console.log("✅ 当前状态:", state.toString());
    }

  } catch (error) {
    console.error("测试失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

