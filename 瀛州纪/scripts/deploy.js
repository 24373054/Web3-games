const hre = require("hardhat");

async function main() {
  console.log("开始部署瀛州纪智能合约...\n");

  // 部署 WorldLedger
  console.log("部署 WorldLedger...");
  const WorldLedger = await hre.ethers.getContractFactory("WorldLedger");
  const worldLedger = await WorldLedger.deploy();
  await worldLedger.waitForDeployment();
  const worldLedgerAddress = await worldLedger.getAddress();
  console.log("WorldLedger 部署到:", worldLedgerAddress);

  // 部署 DigitalBeing
  console.log("\n部署 DigitalBeing...");
  const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
  const digitalBeing = await DigitalBeing.deploy(worldLedgerAddress);
  await digitalBeing.waitForDeployment();
  const digitalBeingAddress = await digitalBeing.getAddress();
  console.log("DigitalBeing 部署到:", digitalBeingAddress);

  // 注册 DigitalBeing 到世界账本（由部署者调用）
  console.log("\n注册 DigitalBeing 到世界账本...");
  const tx1 = await worldLedger.registerDigitalBeing(digitalBeingAddress);
  await tx1.wait();
  console.log("DigitalBeing 已注册");

  // 部署 AINPC
  console.log("\n部署 AINPC...");
  const AINPC = await hre.ethers.getContractFactory("AINPC");
  const ainpc = await AINPC.deploy(worldLedgerAddress);
  await ainpc.waitForDeployment();
  const ainpcAddress = await ainpc.getAddress();
  console.log("AINPC 部署到:", ainpcAddress);

  // 部署 Resource1155
  console.log("\n部署 Resource1155...");
  const Resource1155 = await hre.ethers.getContractFactory("Resource1155");
  const resource = await Resource1155.deploy("https://metadata.yingzhou/{id}.json");
  await resource.waitForDeployment();
  const resourceAddress = await resource.getAddress();
  console.log("Resource1155 部署到:", resourceAddress);

  // 部署 Market
  console.log("\n部署 Market...");
  const Market = await hre.ethers.getContractFactory("Market");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("Market 部署到:", marketAddress);

  // 注册 AINPC 为数字生命
  console.log("\n注册 AINPC 到世界账本...");
  const tx2 = await worldLedger.registerDigitalBeing(ainpcAddress);
  await tx2.wait();
  console.log("AINPC 已注册");

  console.log("\n=================================");
  console.log("部署完成！");
  console.log("=================================");
  console.log("WorldLedger:", worldLedgerAddress);
  console.log("DigitalBeing:", digitalBeingAddress);
  console.log("AINPC:", ainpcAddress);
  console.log("Resource1155:", resourceAddress);
  console.log("Market:", marketAddress);
  console.log("=================================\n");

  console.log("请将以下地址添加到 .env 文件:");
  console.log(`NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=${worldLedgerAddress}`);
  console.log(`NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=${digitalBeingAddress}`);
  console.log(`NEXT_PUBLIC_AINPC_ADDRESS=${ainpcAddress}`);
  console.log(`NEXT_PUBLIC_RESOURCE1155_ADDRESS=${resourceAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

