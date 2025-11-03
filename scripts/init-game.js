const hre = require("hardhat");
require('dotenv').config({ path: '.env.local' });

/**
 * 验证以太坊地址格式
 */
function isValidAddress(address) {
  return address && /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 检查并获取合约地址
 */
function getContractAddresses() {
  const addresses = {
    digitalBeing: process.env.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS,
    memoryFragment: process.env.NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS,
    explorer: process.env.NEXT_PUBLIC_EXPLORER_ADDRESS
  };

  // 检查是否所有地址都已配置
  const missing = [];
  const invalid = [];

  if (!addresses.digitalBeing) {
    missing.push('NEXT_PUBLIC_DIGITAL_BEING_ADDRESS');
  } else if (!isValidAddress(addresses.digitalBeing)) {
    invalid.push('NEXT_PUBLIC_DIGITAL_BEING_ADDRESS');
  }

  if (!addresses.memoryFragment) {
    missing.push('NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS');
  } else if (!isValidAddress(addresses.memoryFragment)) {
    invalid.push('NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS');
  }

  if (!addresses.explorer) {
    missing.push('NEXT_PUBLIC_EXPLORER_ADDRESS');
  } else if (!isValidAddress(addresses.explorer)) {
    invalid.push('NEXT_PUBLIC_EXPLORER_ADDRESS');
  }

  if (missing.length > 0 || invalid.length > 0) {
    console.error("\n? 错误：缺少必要的合约地址配置！\n");
    
    if (missing.length > 0) {
      console.error("以下环境变量未设置：");
      missing.forEach(key => console.error(`  - ${key}`));
    }
    
    if (invalid.length > 0) {
      console.error("\n以下环境变量格式无效（需要以0x开头的40位十六进制地址）：");
      invalid.forEach(key => console.error(`  - ${key}: ${process.env[key]}`));
    }

    console.error("\n? 解决步骤：");
    console.error("1. 确保已运行 'npm run deploy' 部署合约");
    console.error("2. 在项目根目录创建 .env.local 文件");
    console.error("3. 将部署输出的合约地址添加到 .env.local 文件中");
    console.error("\n示例 .env.local 内容：");
    console.error("NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=0x...");
    console.error("NEXT_PUBLIC_MEMORY_FRAGMENT_ADDRESS=0x...");
    console.error("NEXT_PUBLIC_EXPLORER_ADDRESS=0x...\n");
    
    process.exit(1);
  }

  return addresses;
}

async function main() {
  console.log("? 初始化瀛州纪游戏数据...\n");

  // 获取部署者账户
  const [deployer, player1, player2] = await hre.ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  console.log("测试玩家1:", player1.address);
  console.log("测试玩家2:", player2.address);

  // 获取并验证合约地址
  const addresses = getContractAddresses();

  console.log("\n? 使用合约地址:");
  console.log("DigitalBeing:", addresses.digitalBeing);
  console.log("MemoryFragment:", addresses.memoryFragment);
  console.log("Explorer:", addresses.explorer);

  // 获取合约实例
  const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
  const digitalBeing = DigitalBeing.attach(addresses.digitalBeing);

  const MemoryFragment = await hre.ethers.getContractFactory("MemoryFragment");
  const memoryFragment = MemoryFragment.attach(addresses.memoryFragment);

  const Explorer = await hre.ethers.getContractFactory("Explorer");
  const explorer = Explorer.attach(addresses.explorer);

  console.log("\n? 为测试玩家创建数字生命...");
  
  // 为玩家1创建数字生命
  console.log("\n创建玩家1的数字生命...");
  const tx1 = await digitalBeing.createBeing(player1.address);
  await tx1.wait();
  console.log("? 玩家1的数字生命已创建");

  // 为玩家2创建数字生命
  console.log("\n创建玩家2的数字生命...");
  const tx2 = await digitalBeing.createBeing(player2.address);
  await tx2.wait();
  console.log("? 玩家2的数字生命已创建");

  // 为部署者创建数字生命
  console.log("\n创建部署者的数字生命...");
  const tx3 = await digitalBeing.createBeing(deployer.address);
  await tx3.wait();
  console.log("? 部署者的数字生命已创建");

  console.log("\n? 空投记忆碎片给玩家...");
  
  // 定义要空投的碎片
  const fragmentsToAirdrop = [
    { id: 1, name: "创世种子", amount: 1 },
    { id: 2, name: "第一份合约", amount: 1 },
    { id: 3, name: "原初对话", amount: 1 },
    { id: 4, name: "共识诞生", amount: 1 },
    { id: 5, name: "记忆循环", amount: 1 },
  ];

  // 给玩家1空投部分碎片
  console.log("\n空投给玩家1...");
  for (const fragment of fragmentsToAirdrop.slice(0, 3)) {
    const tx = await memoryFragment.mintFragment(player1.address, fragment.id, fragment.amount);
    await tx.wait();
    console.log(`? 空投 ${fragment.name} x${fragment.amount}`);
  }

  // 给玩家2空投部分碎片
  console.log("\n空投给玩家2...");
  for (const fragment of fragmentsToAirdrop.slice(2, 5)) {
    const tx = await memoryFragment.mintFragment(player2.address, fragment.id, fragment.amount);
    await tx.wait();
    console.log(`? 空投 ${fragment.name} x${fragment.amount}`);
  }

  // 给部署者空投所有碎片（用于测试）
  console.log("\n空投给部署者（完整测试集）...");
  for (const fragment of [
    ...fragmentsToAirdrop,
    { id: 6, name: "分歧预兆", amount: 1 },
    { id: 7, name: "熵化信号", amount: 1 },
    { id: 8, name: "最终交易", amount: 1 },
  ]) {
    const tx = await memoryFragment.mintFragment(deployer.address, fragment.id, fragment.amount);
    await tx.wait();
    console.log(`? 空投 ${fragment.name} x${fragment.amount}`);
  }

  console.log("\n=================================");
  console.log("? 游戏初始化完成！");
  console.log("=================================");
  console.log("\n? 测试账户状态:");
  console.log("\n玩家1 (" + player1.address + "):");
  console.log("  - 拥有数字生命 NFT");
  console.log("  - 记忆碎片: 创世种子、第一份合约、原初对话");
  
  console.log("\n玩家2 (" + player2.address + "):");
  console.log("  - 拥有数字生命 NFT");
  console.log("  - 记忆碎片: 原初对话、共识诞生、记忆循环");
  
  console.log("\n部署者 (" + deployer.address + "):");
  console.log("  - 拥有数字生命 NFT");
  console.log("  - 记忆碎片: 全套8个碎片（可揭示所有真相）");

  console.log("\n? 提示:");
  console.log("1. 在 MetaMask 中导入这些测试账户的私钥");
  console.log("2. 运行 'npm run dev' 启动前端");
  console.log("3. 连接钱包并开始探索瀛州的历史！");
  console.log("\n? 欢迎来到瀛州的最后纪元...\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


