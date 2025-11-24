const hre = require("hardhat");

async function main() {
  const targetAddress = process.argv[2];
  const amount = process.argv[3] || "10"; // 默认 10 ETH
  
  if (\!targetAddress) {
    console.error("❌ 请提供目标地址");
    console.log("用法: npx hardhat run scripts/send-eth.js --network localhost <地址> [金额]");
    process.exit(1);
  }
  
  console.log(`\n�� 准备转账 ${amount} ETH 到 ${targetAddress}...\n`);
  
  // 获取第一个测试账户 (有大量 ETH)
  const [sender] = await hre.ethers.getSigners();
  console.log(`📤 发送方: ${sender.address}`);
  
  // 查询发送方余额
  const senderBalance = await hre.ethers.provider.getBalance(sender.address);
  console.log(`   余额: ${hre.ethers.formatEther(senderBalance)} ETH`);
  
  // 查询接收方余额
  const receiverBalanceBefore = await hre.ethers.provider.getBalance(targetAddress);
  console.log(`\n📥 接收方: ${targetAddress}`);
  console.log(`   转账前余额: ${hre.ethers.formatEther(receiverBalanceBefore)} ETH`);
  
  // 发送 ETH
  const tx = await sender.sendTransaction({
    to: targetAddress,
    value: hre.ethers.parseEther(amount)
  });
  
  console.log(`\n⏳ 交易已发送，等待确认...`);
  console.log(`   交易哈希: ${tx.hash}`);
  
  await tx.wait();
  
  // 查询转账后余额
  const receiverBalanceAfter = await hre.ethers.provider.getBalance(targetAddress);
  console.log(`\n✅ 转账成功！`);
  console.log(`   接收方新余额: ${hre.ethers.formatEther(receiverBalanceAfter)} ETH`);
  console.log(`   增加: ${hre.ethers.formatEther(receiverBalanceAfter - receiverBalanceBefore)} ETH\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
