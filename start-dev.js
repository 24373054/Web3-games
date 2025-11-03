#!/usr/bin/env node

/**
 * 瀛州纪 - 自动化开发环境启动脚本
 * 
 * 功能:
 * 1. 环境检测 (Node.js, npm)
 * 2. 依赖安装
 * 3. 智能合约编译
 * 4. 开发服务器启动
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`? ${message}`, 'green');
}

function logError(message) {
  log(`? ${message}`, 'red');
}

function logWarning(message) {
  log(`? ${message}`, 'yellow');
}

// 执行命令
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      ...options
    });
    return result.trim();
  } catch (error) {
    throw new Error(error.stderr || error.message);
  }
}

// 检查命令是否存在
function commandExists(command) {
  try {
    execCommand(`${command} --version`);
    return true;
  } catch {
    return false;
  }
}

// 比较版本号
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}

// 1. 环境检测
async function checkEnvironment() {
  logStep('1/4', '检测开发环境...');
  
  if (!commandExists('node')) {
    logError('Node.js 未安装!');
    log('请访问 https://nodejs.org 下载安装', 'yellow');
    process.exit(1);
  }
  
  const nodeVersion = execCommand('node --version').replace('v', '');
  const requiredNodeVersion = '18.0.0';
  
  if (compareVersions(nodeVersion, requiredNodeVersion) < 0) {
    logError(`Node.js 版本过低! 当前: ${nodeVersion}, 需要: ${requiredNodeVersion}+`);
    process.exit(1);
  }
  
  logSuccess(`Node.js ${nodeVersion} ?`);
  
  if (!commandExists('npm')) {
    logError('npm 未安装!');
    process.exit(1);
  }
  
  const npmVersion = execCommand('npm --version');
  logSuccess(`npm ${npmVersion} ?`);
  
  return true;
}

// 2. 检查并安装依赖
async function checkDependencies() {
  logStep('2/4', '检查项目依赖...');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('node_modules 不存在，开始安装依赖...', 'yellow');
    return installDependencies();
  }
  
  logSuccess('依赖已安装 ?');
  return true;
}

// 安装依赖
async function installDependencies() {
  log('正在安装依赖... (这可能需要几分钟)', 'yellow');
  
  try {
    execCommand('npm install', { stdio: 'inherit' });
    logSuccess('依赖安装完成 ?');
    return true;
  } catch (error) {
    logError('依赖安装失败!');
    logError(error.message);
    process.exit(1);
  }
}

// 3. 编译智能合约
async function compileContracts() {
  logStep('3/5', '编译智能合约...');
  
  const contractsPath = path.join(__dirname, 'contracts');
  
  if (!fs.existsSync(contractsPath)) {
    logWarning('contracts 目录不存在，跳过合约编译');
    return false;
  }
  
  try {
    log('正在编译合约...', 'yellow');
    execCommand('npx hardhat compile', { stdio: 'inherit' });
    logSuccess('合约编译完成 ?');
    return true;
  } catch (error) {
    logWarning('合约编译失败，如果不需要区块链功能可以忽略');
    return false;
  }
}

// 4. 部署智能合约
async function deployContracts() {
  logStep('4/5', '部署智能合约...');
  
  const deployScriptPath = path.join(__dirname, 'scripts', 'deploy.js');
  const addressFilePath = path.join(__dirname, 'lib', 'contractAddresses.json');
  
  if (!fs.existsSync(deployScriptPath)) {
    logWarning('部署脚本不存在，跳过合约部署');
    return false;
  }
  
  // 检查是否已部署
  if (fs.existsSync(addressFilePath)) {
    try {
      const addresses = JSON.parse(fs.readFileSync(addressFilePath, 'utf-8'));
      if (addresses.DigitalBeing && addresses.MemoryFragment) {
        logSuccess('检测到已部署的合约 ?');
        log(`  Digital Being: ${addresses.DigitalBeing}`, 'cyan');
        log(`  Memory Fragment: ${addresses.MemoryFragment}`, 'cyan');
        logWarning('使用现有合约地址');
        return true;
      }
    } catch (error) {
      logWarning('合约地址文件损坏，将重新部署');
    }
  }
  
  try {
    log('正在部署合约到本地网络...', 'yellow');
    logWarning('提示: 请确保 Hardhat 本地节点正在运行 (npx hardhat node)');
    
    // 尝试部署
    execCommand('npx hardhat run scripts/deploy.js --network localhost', { stdio: 'inherit' });
    logSuccess('合约部署完成 ?');
    return true;
  } catch (error) {
    logWarning('合约部署失败，游戏将使用模拟模式');
    logWarning('如需区块链功能，请在新终端运行: npx hardhat node');
    logWarning('然后重新运行此脚本');
    return false;
  }
}

// 5. 启动开发服务器
async function startDevServer() {
  logStep('5/5', '启动开发服务器...');
  
  log('正在启动 Next.js 开发服务器...', 'yellow');
  
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  
  nextProcess.on('error', (error) => {
    logError('启动开发服务器失败!');
    logError(error.message);
    process.exit(1);
  });
  
  return nextProcess;
}

// 显示启动成功信息
function showSuccessMessage() {
  setTimeout(() => {
    log('\n' + '='.repeat(60), 'green');
    log('? 瀛州纪 开发环境启动成功!', 'green');
    log('='.repeat(60), 'green');
    log('\n? 访问地址:', 'cyan');
    log('   本地: http://localhost:3000', 'bright');
    log('\n? 快速开始:', 'cyan');
    log('   1. 在浏览器中打开 http://localhost:3000', 'bright');
    log('   2. 连接 MetaMask 钱包', 'bright');
    log('   3. 创建数字生命 NFT', 'bright');
    log('   4. 进入历史遗迹开始探索', 'bright');
    log('\n? 提示:', 'cyan');
    log('   - 探索五大纪元的3D世界', 'bright');
    log('   - 体验从创世到毁灭的文明史诗', 'bright');
    log('\n按 Ctrl+C 停止服务器', 'yellow');
    log('='.repeat(60) + '\n', 'green');
  }, 3000);
}

// 主函数
async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('? 瀛州纪 - 自动化开发环境启动', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  try {
    await checkEnvironment();
    await checkDependencies();
    await compileContracts();
    await deployContracts();
    await startDevServer();
    showSuccessMessage();
  } catch (error) {
    logError('启动失败!');
    logError(error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  logError('发生未知错误:');
  logError(error.message);
  process.exit(1);
});

