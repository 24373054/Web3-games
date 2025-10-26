const hre = require("hardhat");

async function main() {
  // 使用最新部署的地址
  const resourceAddress = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
  
  // 获取合约实例
  const Resource1155 = await hre.ethers.getContractFactory("Resource1155");
  const resource = Resource1155.attach(resourceAddress);
  
  // 获取部署者账户
  const [deployer] = await hre.ethers.getSigners();
  
  // 从命令行参数获取目标地址
  // 使用方式: npm run airdrop 0xYourAddress
  const targetAddress = process.argv[2] || deployer.address;
  
  console.log("空投资源给:", targetAddress);
  console.log("Resource1155 合约:", resourceAddress);
  
  // 空投示例：
  // Token ID 0: 基础资源 x 100
  // Token ID 1: 稀有资源 x 50
  // Token ID 2: 史诗资源 x 20
  // Token ID 3: 传奇资源 x 5
  
  const ids = [0, 1, 2, 3];
  const amounts = [100, 50, 20, 5];
  
  console.log("\n开始空投...");
  const tx = await resource.mintBatch(targetAddress, ids, amounts, "0x");
  await tx.wait();
  
  console.log("✅ 空投成功！");
  console.log("交易哈希:", tx.hash);
  console.log("\n空投详情:");
  for (let i = 0; i < ids.length; i++) {
    console.log(`  Token #${ids[i]}: ${amounts[i]} 个`);
  }
  
  // 查询余额确认
  console.log("\n验证余额:");
  for (let i = 0; i < ids.length; i++) {
    const balance = await resource.balanceOf(targetAddress, ids[i]);
    console.log(`  Token #${ids[i]}: ${balance.toString()} 个`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

