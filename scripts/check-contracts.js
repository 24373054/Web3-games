// 检查合约部署状态的诊断脚本

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("? 开始检查合约部署状态...\n");

  // 检查 contractAddresses.json
  const addressPath = path.join(__dirname, "..", "lib", "contractAddresses.json");
  
  if (!fs.existsSync(addressPath)) {
    console.log("? lib/contractAddresses.json 文件不存在！");
    console.log("\n解决方案：");
    console.log("1. 确保 Hardhat node 正在运行：npx hardhat node");
    console.log("2. 运行部署脚本：npx hardhat run scripts/deploy.js --network localhost\n");
    return;
  }

  console.log("? 找到 contractAddresses.json");
  
  // 读取地址
  const addresses = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
  console.log("\n? 合约地址：");
  console.log("  WorldLedger:", addresses.worldLedger || "? 未配置");
  console.log("  DigitalBeing:", addresses.digitalBeing || "? 未配置");
  console.log("  AINPC:", addresses.ainpc || "? 未配置");
  console.log("  MemoryFragment:", addresses.memoryFragment || "? 未配置");

  // 尝试连接并检查合约
  try {
    console.log("\n? 测试连接到本地网络...");
    const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    const network = await provider.getNetwork();
    console.log("? 连接成功！链ID:", network.chainId.toString());

    // 检查DigitalBeing合约
    if (addresses.digitalBeing) {
      console.log("\n? 测试 DigitalBeing 合约...");
      
      const code = await provider.getCode(addresses.digitalBeing);
      if (code === '0x') {
        console.log("? DigitalBeing 合约未部署在此地址！");
        console.log("   可能原因：Hardhat node 重启后合约地址失效");
        console.log("   解决方案：重新部署合约");
      } else {
        console.log("? DigitalBeing 合约已部署");
        
        // 尝试读取 beingCounter
        const DigitalBeing = await hre.ethers.getContractFactory("DigitalBeing");
        const contract = DigitalBeing.attach(addresses.digitalBeing);
        
        try {
          const counter = await contract.beingCounter();
          console.log("   当前 Being 数量:", counter.toString());
        } catch (e) {
          console.log("   ??  无法读取 beingCounter（可能是ABI不匹配）");
        }
      }
    }

    // 检查账户
    console.log("\n? 检查账户余额...");
    const accounts = await hre.ethers.getSigners();
    const balance = await provider.getBalance(accounts[0].address);
    console.log("  账户:", accounts[0].address);
    console.log("  余额:", hre.ethers.formatEther(balance), "ETH");

    if (balance < hre.ethers.parseEther("1")) {
      console.log("  ??  余额不足！可能无法支付gas费");
    } else {
      console.log("  ? 余额充足");
    }

  } catch (error) {
    console.log("? 无法连接到 Hardhat node！");
    console.log("   错误:", error.message);
    console.log("\n解决方案：");
    console.log("1. 启动 Hardhat node：npx hardhat node");
    console.log("2. 等待节点完全启动");
    console.log("3. 重新运行此脚本\n");
    return;
  }

  console.log("\n====================================");
  console.log("? 检查完成！");
  console.log("====================================\n");

  // 总结
  let hasIssues = false;

  if (!addresses.digitalBeing) {
    hasIssues = true;
    console.log("? 问题：DigitalBeing 地址未配置");
  }

  if (hasIssues) {
    console.log("\n? 建议：");
    console.log("1. 重新部署合约：npx hardhat run scripts/deploy.js --network localhost");
    console.log("2. 重启前端：npm run dev");
    console.log("3. 刷新浏览器\n");
  } else {
    console.log("? 所有检查通过！");
    console.log("\n? 如果仍然无法创建数字生命：");
    console.log("1. 检查MetaMask是否连接到 Localhost 8545");
    console.log("2. 检查MetaMask账户余额");
    console.log("3. 查看浏览器控制台错误信息（F12）");
    console.log("4. 查看MetaMask交易详情\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



