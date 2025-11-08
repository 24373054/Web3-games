const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

/**
 * 环境检查脚本
 * 验证 .env.local 配置是否正确
 */

async function main() {
  console.log("🔍 开始检查瀛州纪环境配置...\n");

  let hasErrors = false;

  // ========== 检查 .env.local 文件 ==========
  const envPath = path.join(__dirname, "..", ".env.local");
  
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local 文件不存在");
    console.log("   请运行: npm run deploy:auto\n");
    return process.exit(1);
  }
  console.log("✅ .env.local 文件存在");

  // ========== 读取环境变量 ==========
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  const requiredVars = [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_WORLD_LEDGER_ADDRESS',
    'NEXT_PUBLIC_DIGITAL_BEING_ADDRESS',
    'NEXT_PUBLIC_AINPC_ADDRESS',
    'NEXT_PUBLIC_RESOURCE1155_ADDRESS',
    'NEXT_PUBLIC_MARKET_ADDRESS'
  ];

  console.log("\n📋 检查必需的环境变量:");
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === '') {
      console.log(`❌ ${varName} 未配置`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}`);
    }
  });

  if (hasErrors) {
    console.log("\n⚠️  配置不完整，请运行: npm run deploy:auto\n");
    return process.exit(1);
  }

  // ========== 检查地址格式 ==========
  console.log("\n🔢 检查地址格式:");
  const addresses = {
    'WorldLedger': envVars.NEXT_PUBLIC_WORLD_LEDGER_ADDRESS,
    'DigitalBeing': envVars.NEXT_PUBLIC_DIGITAL_BEING_ADDRESS,
    'AINPC': envVars.NEXT_PUBLIC_AINPC_ADDRESS,
    'Resource1155': envVars.NEXT_PUBLIC_RESOURCE1155_ADDRESS,
    'Market': envVars.NEXT_PUBLIC_MARKET_ADDRESS,
  };

  Object.entries(addresses).forEach(([name, address]) => {
    if (ethers.isAddress(address)) {
      console.log(`✅ ${name}: ${address}`);
    } else {
      console.log(`❌ ${name}: 地址格式无效`);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.log("\n⚠️  地址格式错误，请重新部署\n");
    return process.exit(1);
  }

  // ========== 检查 RPC 连接 ==========
  console.log("\n🌐 检查 RPC 连接:");
  const rpcUrl = envVars.NEXT_PUBLIC_RPC_URL;
  
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`✅ RPC 连接成功: ${rpcUrl}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   当前区块: ${blockNumber}`);
  } catch (error) {
    console.log(`❌ RPC 连接失败: ${rpcUrl}`);
    console.log(`   错误: ${error.message}`);
    console.log("\n💡 确保 Hardhat 节点正在运行:");
    console.log("   npx hardhat node\n");
    return process.exit(1);
  }

  // ========== 检查合约部署 ==========
  console.log("\n📜 检查合约部署:");
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    for (const [name, address] of Object.entries(addresses)) {
      const code = await provider.getCode(address);
      if (code === '0x') {
        console.log(`❌ ${name}: 合约未部署或地址错误`);
        hasErrors = true;
      } else {
        console.log(`✅ ${name}: 合约已部署 (${code.length} bytes)`);
      }
    }
  } catch (error) {
    console.log(`❌ 检查合约失败: ${error.message}`);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log("\n⚠️  部分合约未正确部署，请重新运行:");
    console.log("   npm run deploy:auto\n");
    return process.exit(1);
  }

  // ========== 检查 AI 配置 ==========
  console.log("\n🤖 检查 AI 配置:");
  if (envVars.DEEPSEEK_API_KEY) {
    console.log(`✅ DeepSeek API Key: ${envVars.DEEPSEEK_API_KEY.slice(0, 10)}...`);
    console.log(`✅ DeepSeek Model: ${envVars.DEEPSEEK_MODEL || 'deepseek-chat'}`);
  } else if (envVars.OPENAI_API_KEY) {
    console.log(`✅ OpenAI API Key: ${envVars.OPENAI_API_KEY.slice(0, 10)}...`);
  } else {
    console.log(`⚠️  未配置 AI API Key (可选)`);
    console.log(`   如需使用 AI 对话，请在 .env.local 添加:`);
    console.log(`   DEEPSEEK_API_KEY=your_key`);
  }

  // ========== 总结 ==========
  console.log("\n" + "=".repeat(60));
  console.log("🎉 环境检查完成！");
  console.log("=".repeat(60));
  console.log("✅ 所有配置正确");
  console.log("\n📋 下一步:");
  console.log("   1. 启动前端: npm run dev");
  console.log("   2. 打开浏览器: http://localhost:3000");
  console.log("   3. 配置 MetaMask:");
  console.log("      - 网络: Hardhat Local");
  console.log("      - RPC: http://127.0.0.1:8545");
  console.log("      - Chain ID: 31337");
  console.log("   4. 开始游戏！\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 检查过程出错:", error);
    process.exit(1);
  });

