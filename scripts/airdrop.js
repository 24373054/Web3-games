// 简化的空投脚本 - 直接修改这里的地址即可
const hre = require("hardhat");

async function main() {
  // 🔽 在这里修改要空投的目标地址
  const TARGET_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  
  // Resource1155 合约地址（最新部署）
  const RESOURCE_ADDRESS = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
  
  console.log("=================================");
  console.log("瀛州资源空投工具");
  console.log("=================================");
  console.log("目标地址:", TARGET_ADDRESS);
  console.log("Resource1155:", RESOURCE_ADDRESS);
  console.log("");
  
  // 获取合约实例
  const Resource1155 = await hre.ethers.getContractFactory("Resource1155");
  const resource = Resource1155.attach(RESOURCE_ADDRESS);
  
  // 空投配置
  const tokenIds = [0, 1, 2, 3];
  const amounts = [100, 50, 20, 5];
  
  console.log("开始空投...");
  const tx = await resource.mintBatch(TARGET_ADDRESS, tokenIds, amounts, "0x");
  await tx.wait();
  
  console.log("✅ 空投成功！");
  console.log("交易哈希:", tx.hash);
  console.log("\n空投详情:");
  for (let i = 0; i < tokenIds.length; i++) {
    console.log(`  Token #${tokenIds[i]}: ${amounts[i]} 个`);
  }
  
  // 验证余额
  console.log("\n验证余额:");
  for (let i = 0; i < tokenIds.length; i++) {
    const balance = await resource.balanceOf(TARGET_ADDRESS, tokenIds[i]);
    console.log(`  Token #${tokenIds[i]}: ${balance.toString()} 个`);
  }
  
  console.log("\n=================================");
  console.log("提示: 要给其他地址空投，请修改脚本中的 TARGET_ADDRESS");
  console.log("=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

