const fs = require('fs');
const path = require('path');

/**
 * 自动创建 .env.local 文件
 * 使用方法：
 * node scripts/setup-env.js [WorldLedger地址] [DigitalBeing地址] [AINPC地址] [Resource地址] [Market地址]
 */

function main() {
  const args = process.argv.slice(2);
  
  const envContent = `# 区块链网络配置
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# 合约地址
NEXT_PUBLIC_WORLD_LEDGER_ADDRESS=${args[0] || ''}
NEXT_PUBLIC_DIGITAL_BEING_ADDRESS=${args[1] || ''}
NEXT_PUBLIC_AINPC_ADDRESS=${args[2] || ''}
NEXT_PUBLIC_RESOURCE1155_ADDRESS=${args[3] || ''}
NEXT_PUBLIC_MARKET_ADDRESS=${args[4] || ''}

# AI 配置（可选）
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_BASE_URL=https://api.openai.com/v1
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local 文件已创建:', envPath);
    console.log('\n内容:');
    console.log(envContent);
    
    if (!args[0]) {
      console.log('\n⚠️  提示：合约地址为空，请先部署合约，然后运行：');
      console.log('node scripts/setup-env.js [地址1] [地址2] [地址3] [地址4] [地址5]');
    }
  } catch (error) {
    console.error('❌ 创建 .env.local 失败:', error.message);
    process.exit(1);
  }
}

main();

