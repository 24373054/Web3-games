const hre = require("hardhat");

async function main() {
  const targetAddress = "0xb14fcc3e51815f2c86a8b60ef0987ff810eaa66a";
  const amount = "100"; // 100 ETH 用于测试
  
  console.log(`\n💰 准备转账 ${amount} ETH 到移动端测试地址...\n`);
  
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
