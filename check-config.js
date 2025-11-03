#!/usr/bin/env node

/**
 * 瀛州纪 - 配置检查脚本
 * 快速诊断合约配置是否正确
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkMark(passed) {
  return passed ? '?' : '?';
}

// 检查项目结构
function checkProjectStructure() {
  log('\n1. 检查项目结构', 'cyan');
  
  const requiredFiles = [
    'package.json',
    'hardhat.config.js',
    'scripts/deploy.js',
    'lib/contracts.ts',
    'app/page.tsx'
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    log(`  ${checkMark(exists)} ${file}`, exists ? 'green' : 'red');
    if (!exists) allExist = false;
  }
  
  return allExist;
}

// 检查合约地址文件
function checkContractAddresses() {
  log('\n2. 检查合约地址配置', 'cyan');
  
  const addressFile = path.join(__dirname, 'lib', 'contractAddresses.json');
  
  if (!fs.existsSync(addressFile)) {
    log('  ? contractAddresses.json 不存在', 'red');
    log('    ? 请运行: npm run game', 'yellow');
    return false;
  }
  
  log('  ? contractAddresses.json 存在', 'green');
  
  try {
    const addresses = JSON.parse(fs.readFileSync(addressFile, 'utf8'));
    
    const requiredAddresses = [
      'worldLedger',
      'digitalBeing',
      'ainpc',
      'memoryFragment',
      'explorer',
      'resource1155',
      'market'
    ];
    
    let allValid = true;
    
    for (const key of requiredAddresses) {
      const value = addresses[key];
      const isValid = value && value.startsWith('0x') && value.length === 42;
      log(`  ${checkMark(isValid)} ${key}: ${value ? value.substring(0, 10) + '...' : '(未配置)'}`, isValid ? 'green' : 'red');
      if (!isValid) allValid = false;
    }
    
    if (addresses.deployedAt) {
      const deployTime = new Date(addresses.deployedAt);
      log(`\n  部署时间: ${deployTime.toLocaleString('zh-CN')}`, 'bright');
    }
    
    return allValid;
    
  } catch (e) {
    log('  ? contractAddresses.json 格式错误', 'red');
    log(`    错误: ${e.message}`, 'red');
    return false;
  }
}

// 检查区块链节点
async function checkBlockchainNode() {
  log('\n3. 检查区块链节点', 'cyan');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8545,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, (res) => {
      if (res.statusCode === 405 || res.statusCode === 200) {
        log('  ? Hardhat 节点运行中 (http://127.0.0.1:8545)', 'green');
        resolve(true);
      } else {
        log(`  ? 节点响应异常 (状态码: ${res.statusCode})`, 'red');
        log('    ? 请运行: npm run game', 'yellow');
        resolve(false);
      }
    });
    
    req.on('error', (e) => {
      log('  ? Hardhat 节点未运行', 'red');
      log('    ? 请运行: npm run game', 'yellow');
      resolve(false);
    });
    
    req.write(JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_chainId",
      params: [],
      id: 1
    }));
    
    req.end();
  });
}

// 检查缓存
function checkCache() {
  log('\n4. 检查缓存状态', 'cyan');
  
  const cacheFiles = [
    '.next',
    'node_modules/.cache'
  ];
  
  for (const cache of cacheFiles) {
    const cachePath = path.join(__dirname, cache);
    const exists = fs.existsSync(cachePath);
    
    if (exists) {
      try {
        const stats = fs.statSync(cachePath);
        const modified = stats.mtime.toLocaleString('zh-CN');
        log(`  ? ${cache} 存在 (最后修改: ${modified})`, 'yellow');
      } catch (e) {
        log(`  ? ${cache} 存在`, 'yellow');
      }
    } else {
      log(`  ? ${cache} 不存在 (干净状态)`, 'green');
    }
  }
  
  log('\n  ? 如果遇到配置问题，可以删除缓存:', 'cyan');
  log('    rm -rf .next node_modules/.cache', 'bright');
  
  return true;
}

// 检查环境变量文件
function checkEnvFiles() {
  log('\n5. 检查环境变量文件', 'cyan');
  
  const envFiles = ['.env', '.env.local', '.env.development'];
  let foundEnv = false;
  
  for (const file of envFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`  ? ${file} 存在 (不推荐!)`, 'yellow');
      log(`    本项目不需要环境变量文件，请删除`, 'yellow');
      foundEnv = true;
    }
  }
  
  if (!foundEnv) {
    log('  ? 无环境变量文件 (正确)', 'green');
    log('    配置由 lib/contractAddresses.json 管理', 'bright');
  }
  
  return !foundEnv;
}

// 检查依赖
function checkDependencies() {
  log('\n6. 检查依赖安装', 'cyan');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('  ? node_modules 不存在', 'red');
    log('    ? 请运行: npm install', 'yellow');
    return false;
  }
  
  const criticalPackages = [
    'hardhat',
    'ethers',
    'next',
    'react',
    'framer-motion'
  ];
  
  let allInstalled = true;
  
  for (const pkg of criticalPackages) {
    const pkgPath = path.join(nodeModulesPath, pkg);
    const exists = fs.existsSync(pkgPath);
    log(`  ${checkMark(exists)} ${pkg}`, exists ? 'green' : 'red');
    if (!exists) allInstalled = false;
  }
  
  return allInstalled;
}

// 生成诊断报告
async function generateReport() {
  log('\n' + '='.repeat(60), 'blue');
  log('瀛州纪 - 配置诊断工具', 'bright');
  log('='.repeat(60), 'blue');
  
  const results = {
    projectStructure: checkProjectStructure(),
    contractAddresses: checkContractAddresses(),
    cache: checkCache(),
    envFiles: checkEnvFiles(),
    dependencies: checkDependencies(),
    blockchainNode: await checkBlockchainNode()
  };
  
  // 总结
  log('\n' + '='.repeat(60), 'cyan');
  log('诊断总结', 'bright');
  log('='.repeat(60), 'cyan');
  
  const allPassed = Object.values(results).every(v => v === true);
  
  if (allPassed) {
    log('\n? 所有检查通过！配置正确！', 'green');
    log('\n下一步:', 'cyan');
    log('  1. 访问 http://localhost:3000', 'bright');
    log('  2. 配置 MetaMask (Localhost, http://127.0.0.1:8545, 链ID 31337)', 'bright');
    log('  3. 开始游戏！', 'bright');
  } else {
    log('\n? 发现问题，请根据上述提示修复', 'yellow');
    log('\n推荐操作:', 'cyan');
    
    if (!results.blockchainNode || !results.contractAddresses) {
      log('  1. 运行一键启动脚本:', 'bright');
      log('     npm run game', 'green');
    }
    
    if (!results.dependencies) {
      log('  2. 安装依赖:', 'bright');
      log('     npm install', 'green');
    }
    
    if (!results.envFiles) {
      log('  3. 删除环境变量文件:', 'bright');
      log('     rm .env.local', 'green');
    }
  }
  
  log('\n' + '='.repeat(60), 'blue');
  log('详细文档: ./合约配置说明.md', 'cyan');
  log('='.repeat(60) + '\n', 'blue');
}

// 运行诊断
generateReport().catch(error => {
  log('\n? 诊断过程出错:', 'red');
  console.error(error);
  process.exit(1);
});

