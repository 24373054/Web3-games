#!/usr/bin/env node

/**
 * 瀛州纪 - 一键启动脚本
 * 
 * 功能:
 * 1. 启动Hardhat本地节点
 * 2. 自动部署合约
 * 3. 保存合约地址
 * 4. 启动Next.js开发服务器
 */

const { spawn } = require('child_process');
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

// 进程管理
let hardhatProcess = null;
let nextProcess = null;

// 清理函数
function cleanup() {
  log('\n正在关闭所有进程...', 'yellow');
  
  if (hardhatProcess) {
    hardhatProcess.kill();
    log('? Hardhat 节点已关闭', 'green');
  }
  
  if (nextProcess) {
    nextProcess.kill();
    log('? Next.js 服务器已关闭', 'green');
  }
  
  process.exit(0);
}

// 监听退出信号
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 等待函数
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查端口是否被占用
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// 1. 启动Hardhat节点
async function startHardhatNode() {
  log('\n='.repeat(60), 'cyan');
  log('步骤 1/4: 启动 Hardhat 本地区块链节点', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 检查8545端口
  const portInUse = await isPortInUse(8545);
  if (portInUse) {
    log('??  端口 8545 已被占用', 'yellow');
    log('检测到 Hardhat 节点可能已在运行，跳过启动...', 'yellow');
    return true;
  }
  
  log('正在启动 Hardhat 节点...', 'yellow');
  
  return new Promise((resolve, reject) => {
    hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let started = false;
    
    hardhatProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // 显示账户信息
      if (output.includes('Account') || output.includes('Private Key')) {
        console.log(output.trim());
      }
      
      // 检测启动成功
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        if (!started) {
          started = true;
          log('\n? Hardhat 节点启动成功!', 'green');
          log('  监听地址: http://127.0.0.1:8545', 'cyan');
          resolve(true);
        }
      }
    });
    
    hardhatProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    hardhatProcess.on('error', (error) => {
      log('? Hardhat 节点启动失败', 'red');
      console.error(error);
      reject(error);
    });
    
    // 超时处理
    setTimeout(() => {
      if (!started) {
        reject(new Error('Hardhat 节点启动超时'));
      }
    }, 30000);
  });
}

// 2. 部署合约
async function deployContracts() {
  log('\n='.repeat(60), 'cyan');
  log('步骤 2/4: 部署智能合约', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 检查部署脚本
  const deployScript = path.join(__dirname, 'scripts', 'deploy.js');
  if (!fs.existsSync(deployScript)) {
    log('??  未找到部署脚本，跳过合约部署', 'yellow');
    return true;
  }
  
  log('正在部署合约到本地网络...', 'yellow');
  
  return new Promise((resolve, reject) => {
    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
      shell: process.platform === 'win32',
      stdio: 'inherit'
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        log('\n? 合约部署成功!', 'green');
        
        // 检查合约地址文件
        const addressFile = path.join(__dirname, 'lib', 'contractAddresses.json');
        if (fs.existsSync(addressFile)) {
          const addresses = JSON.parse(fs.readFileSync(addressFile, 'utf-8'));
          log('\n已部署的合约地址:', 'cyan');
          Object.entries(addresses).forEach(([name, address]) => {
            log(`  ${name}: ${address}`, 'bright');
          });
        }
        
        resolve(true);
      } else {
        log('\n? 合约部署失败', 'red');
        reject(new Error('合约部署失败'));
      }
    });
    
    deployProcess.on('error', (error) => {
      log('? 合约部署过程出错', 'red');
      console.error(error);
      reject(error);
    });
  });
}

// 3. 安装依赖（如果需要）
async function checkDependencies() {
  log('\n='.repeat(60), 'cyan');
  log('步骤 3/4: 检查项目依赖', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('正在安装依赖...', 'yellow');
    
    return new Promise((resolve, reject) => {
      const installProcess = spawn('npm', ['install'], {
        shell: process.platform === 'win32',
        stdio: 'inherit'
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          log('? 依赖安装完成', 'green');
          resolve(true);
        } else {
          reject(new Error('依赖安装失败'));
        }
      });
    });
  } else {
    log('? 依赖已安装', 'green');
    return true;
  }
}

// 4. 启动Next.js开发服务器
async function startNextServer() {
  log('\n='.repeat(60), 'cyan');
  log('步骤 4/4: 启动 Next.js 开发服务器', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 清理Next.js缓存
  log('清理Next.js缓存...', 'yellow');
  const cacheDirs = ['.next', path.join('node_modules', '.cache')];
  for (const dir of cacheDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        log(`  ? 已删除: ${dir}`, 'green');
      } catch (e) {
        log(`  ? 跳过: ${dir} (可能正在使用)`, 'yellow');
      }
    }
  }
  
  log('正在启动开发服务器...', 'yellow');
  
  return new Promise((resolve) => {
    nextProcess = spawn('npm', ['run', 'dev'], {
      shell: process.platform === 'win32',
      stdio: 'inherit'
    });
    
    nextProcess.on('error', (error) => {
      log('? Next.js 服务器启动失败', 'red');
      console.error(error);
    });
    
    // Next.js需要时间启动，等待一下
    setTimeout(() => {
      resolve(true);
    }, 3000);
  });
}

// 显示成功信息
function showSuccessMessage() {
  log('\n' + '='.repeat(60), 'green');
  log('? 瀛州纪 启动成功！', 'green');
  log('='.repeat(60), 'green');
  
  log('\n? 访问地址:', 'cyan');
  log('   游戏: http://localhost:3000', 'bright');
  log('   区块链节点: http://localhost:8545', 'bright');
  
  log('\n? MetaMask 配置步骤:', 'cyan');
  log('   1. 在浏览器中打开 http://localhost:3000', 'bright');
  log('   2. 确保 MetaMask 切换到 Localhost 网络 (链ID 31337)', 'bright');
  log('', 'reset');
  log('   ??  【重要】每次重启都需要重置 MetaMask 账户!', 'yellow');
  log('   ? MetaMask → 设置 → 高级 → 重置账户', 'yellow');
  log('   （这不会删除账户，只是清除交易历史）', 'yellow');
  log('', 'reset');
  log('   3. 如果是首次使用，导入测试账户（私钥见上方）', 'bright');
  log('   4. 创建数字生命 NFT 开始游戏！', 'bright');
  
  log('\n? 提示:', 'cyan');
  log('   - 所有进程运行在同一终端', 'reset');
  log('   - 按 Ctrl+C 将关闭所有服务', 'reset');
  log('   - 合约地址已保存到 lib/contractAddresses.json', 'reset');
  log('   - 详细 MetaMask 使用说明: ./MetaMask使用说明.md', 'cyan');
  
  log('\n' + '='.repeat(60), 'green');
  log('"我被记录，故我存在"', 'cyan');
  log('='.repeat(60) + '\n', 'green');
}

// 主函数
async function main() {
  log('\n' + '█'.repeat(60), 'blue');
  log('█' + ' '.repeat(58) + '█', 'blue');
  log('█' + '  瀛州纪 - Immortal Ledger'.padEnd(58) + '█', 'blue');
  log('█' + '  一键启动脚本'.padEnd(58) + '█', 'blue');
  log('█' + ' '.repeat(58) + '█', 'blue');
  log('█'.repeat(60) + '\n', 'blue');
  
  try {
    // 检查依赖
    await checkDependencies();
    
    // 等待一下
    await wait(1000);
    
    // 启动Hardhat节点
    await startHardhatNode();
    
    // 等待节点完全启动
    log('\n等待区块链节点稳定...', 'yellow');
    await wait(3000);
    
    // 部署合约
    await deployContracts();
    
    // 等待一下
    await wait(1000);
    
    // 启动Next.js
    await startNextServer();
    
    // 显示成功信息
    showSuccessMessage();
    
    // 保持运行
    log('服务器正在运行中...\n', 'cyan');
    
  } catch (error) {
    log('\n? 启动失败！', 'red');
    console.error(error);
    cleanup();
  }
}

// 运行主函数
main().catch(error => {
  console.error(error);
  cleanup();
});

