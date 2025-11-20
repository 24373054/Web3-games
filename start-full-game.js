#!/usr/bin/env node

/**
 * 瀛州纪 - 完整版一键启动脚本
 * 
 * 功能:
 * 1. 启动 Java 后端 (Spring Boot)
 * 2. 启动 Hardhat 本地节点
 * 3. 自动部署合约
 * 4. 启动 Next.js 前端
 */

const { spawn } = require('child_process');
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 进程管理
let javaBackendProcess = null;
let hardhatProcess = null;
let nextProcess = null;

// 清理函数
function cleanup() {
  log('\n正在关闭所有进程...', 'yellow');
  
  if (javaBackendProcess) {
    javaBackendProcess.kill();
    log('✓ Java 后端已关闭', 'green');
  }
  
  if (hardhatProcess) {
    hardhatProcess.kill();
    log('✓ Hardhat 节点已关闭', 'green');
  }
  
  if (nextProcess) {
    nextProcess.kill();
    log('✓ Next.js 服务器已关闭', 'green');
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

// 检查HTTP端点是否可用
function checkEndpoint(url, timeout = 2000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'GET',
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
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

// 1. 启动 Java 后端
async function startJavaBackend() {
  log('\n' + '='.repeat(60), 'cyan');
  log('步骤 1/4: 启动 Java 后端 (Spring Boot)', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 检查后端是否已运行
  const backendRunning = await checkEndpoint('http://localhost:8080/api/eras');
  if (backendRunning) {
    log('✓  Java 后端已在运行 (http://localhost:8080)', 'green');
    log('跳过启动...', 'yellow');
    return true;
  }
  
  log('正在启动 Java 后端...', 'yellow');
  
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';
    
    javaBackendProcess = spawn(gradlewCmd, ['bootRun'], {
      cwd: path.join(__dirname, 'java-game'),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let startupComplete = false;
    
    javaBackendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Started YingzhouGameApplication')) {
        if (!startupComplete) {
          startupComplete = true;
          log('\n✓ Java 后端启动成功！', 'green');
          log('  后端地址: http://localhost:8080', 'blue');
          log('  API 端点: http://localhost:8080/api/eras', 'blue');
          resolve(true);
        }
      }
      // 可选：输出后端日志
      // process.stdout.write(`[Java] ${output}`);
    });
    
    javaBackendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ERROR') || output.includes('Exception')) {
        log(`[Java 错误] ${output}`, 'red');
      }
    });
    
    javaBackendProcess.on('error', (error) => {
      log(`启动 Java 后端失败: ${error.message}`, 'red');
      log('请确保已安装 JDK 17', 'yellow');
      resolve(false);
    });
    
    javaBackendProcess.on('close', (code) => {
      if (code !== 0 && !startupComplete) {
        log(`Java 后端进程退出，代码: ${code}`, 'red');
        resolve(false);
      }
    });
    
    // 超时检查
    setTimeout(async () => {
      if (!startupComplete) {
        const running = await checkEndpoint('http://localhost:8080/api/eras');
        if (running) {
          startupComplete = true;
          log('\n✓ Java 后端启动成功！', 'green');
          resolve(true);
        } else {
          log('\n⚠️  Java 后端启动超时，继续后续步骤...', 'yellow');
          log('   后端可能需要更长时间，请稍后访问 http://localhost:8080', 'yellow');
          resolve(false);
        }
      }
    }, 30000); // 30秒超时
  });
}

// 2. 启动Hardhat节点
async function startHardhatNode() {
  log('\n' + '='.repeat(60), 'cyan');
  log('步骤 2/4: 启动 Hardhat 本地区块链节点', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const portInUse = await isPortInUse(8545);
  if (portInUse) {
    log('✓  端口 8545 已被占用', 'yellow');
    log('检测到 Hardhat 节点可能已在运行，跳过启动...', 'yellow');
    return true;
  }
  
  log('正在启动 Hardhat 节点...', 'yellow');
  
  return new Promise((resolve) => {
    hardhatProcess = spawn('npx', ['hardhat', 'node'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    let nodeStarted = false;
    
    hardhatProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        if (!nodeStarted) {
          nodeStarted = true;
          log('\n✓ Hardhat 节点启动成功！', 'green');
          log('  RPC URL: http://127.0.0.1:8545', 'blue');
          
          // 提取测试账户信息
          setTimeout(() => resolve(true), 2000);
        }
      }
      
      if (output.includes('Account #0')) {
        log('\n测试账户信息:', 'cyan');
      }
      
      if (output.includes('0x') && output.includes('10000 ETH')) {
        log(output.trim(), 'yellow');
      }
    });
    
    hardhatProcess.stderr.on('data', (data) => {
      log(`Hardhat 错误: ${data}`, 'red');
    });
    
    hardhatProcess.on('error', (error) => {
      log(`启动 Hardhat 失败: ${error.message}`, 'red');
      resolve(false);
    });
  });
}

// 3. 部署合约
async function deployContracts() {
  log('\n' + '='.repeat(60), 'cyan');
  log('步骤 3/4: 部署智能合约', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log('正在部署合约...', 'yellow');
  
  return new Promise((resolve) => {
    const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    deployProcess.stdout.on('data', (data) => {
      const output = data.toString();
      log(output.trim(), 'blue');
      
      if (output.includes('DigitalBeing deployed to:')) {
        log('\n✓ 合约部署成功！', 'green');
      }
    });
    
    deployProcess.stderr.on('data', (data) => {
      log(`部署错误: ${data}`, 'red');
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        log('✓ 合约地址已保存到 lib/contractAddresses.json', 'green');
        resolve(true);
      } else {
        log('合约部署失败', 'red');
        resolve(false);
      }
    });
  });
}

// 4. 启动Next.js
async function startNextJS() {
  log('\n' + '='.repeat(60), 'cyan');
  log('步骤 4/4: 启动 Next.js 前端', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log('正在启动 Next.js...', 'yellow');
  
  return new Promise((resolve) => {
    nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    nextProcess.on('error', (error) => {
      log(`启动 Next.js 失败: ${error.message}`, 'red');
      resolve(false);
    });
    
    // Next.js 启动后会一直运行，不会resolve
  });
}

// 主函数
async function main() {
  log('\n' + '='.repeat(60), 'magenta');
  log('       瀛州纪 - Immortal Ledger', 'magenta');
  log('     完整版一键启动（Java后端 + Web前端）', 'magenta');
  log('='.repeat(60), 'magenta');
  
  // 启动 Java 后端
  const javaStarted = await startJavaBackend();
  if (javaStarted) {
    await wait(2000); // 等待后端稳定
  }
  
  // 启动 Hardhat
  const hardhatStarted = await startHardhatNode();
  if (!hardhatStarted) {
    log('\n⚠️  Hardhat 启动失败，继续前端启动...', 'yellow');
  }
  
  await wait(2000);
  
  // 部署合约
  if (hardhatStarted) {
    await deployContracts();
    await wait(1000);
  }
  
  // 显示启动成功信息
  log('\n' + '='.repeat(60), 'green');
  log('       ✓ 游戏启动成功！', 'green');
  log('='.repeat(60), 'green');
  log('  Java 后端:  http://localhost:8080', 'cyan');
  log('  Web 前端:   http://localhost:3000', 'cyan');
  log('  区块链节点: http://127.0.0.1:8545', 'cyan');
  log('='.repeat(60), 'green');
  log('\n提示: 按 Ctrl+C 可同时关闭所有服务\n', 'yellow');
  
  // 启动 Next.js (阻塞式)
  await startNextJS();
}

// 运行
main().catch(error => {
  log(`启动失败: ${error.message}`, 'red');
  cleanup();
});
