const fs = require('fs');
const path = require('path');

async function main() {
  const contracts = [
    'WorldLedger', 
    'DigitalBeing', 
    'AINPC', 
    'Resource1155', 
    'Market',
    'EpochManager',
    'MemoryFragment',
    'AINPC_Extended',
    'MiniGameManager'
  ];
  
  const abiDir = path.join(__dirname, '..', 'lib', 'abis');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  console.log('🚀 开始导出合约ABI...\n');

  for (const contractName of contracts) {
    try {
      const artifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
      const abiPath = path.join(abiDir, `${contractName}.json`);
      
      fs.writeFileSync(
        abiPath,
        JSON.stringify(artifact.abi, null, 2)
      );
      
      console.log(`✅ ${contractName} ABI 已导出`);
    } catch (error) {
      console.error(`❌ ${contractName} 导出失败:`, error.message);
    }
  }

  console.log('\n🎉 所有 ABI 导出完成！');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

