const fs = require('fs');
const path = require('path');

async function main() {
  const contracts = ['WorldLedger', 'DigitalBeing', 'AINPC', 'Resource1155', 'Market'];
  
  const abiDir = path.join(__dirname, '..', 'lib', 'abis');
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  for (const contractName of contracts) {
    const artifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    const abiPath = path.join(abiDir, `${contractName}.json`);
    
    fs.writeFileSync(
      abiPath,
      JSON.stringify(artifact.abi, null, 2)
    );
    
    console.log(`✅ ${contractName} ABI 已导出到 ${abiPath}`);
  }

  console.log('\n所有 ABI 导出完成！');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

