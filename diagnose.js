#!/usr/bin/env node

/**
 * 瀛州纪 - 环境诊断脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

const diagnostics = { pass: [], warn: [], fail: [] };

function checkItem(name, status, message = '') {
  const icon = status === 'pass' ? '?' : status === 'warn' ? '?' : '?';
  const color = status === 'pass' ? 'green' : status === 'warn' ? 'yellow' : 'red';
  
  diagnostics[status].push({ name, message });
  log(`${icon} ${name}${message ? ': ' + message : ''}`, color);
}

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

function checkSystemEnvironment() {
  log('\n[1] 系统环境检查', 'cyan');
  log('─'.repeat(60), 'cyan');
  
  // Node.js
  const nodeVersion = process.version.replace('v', '');
  const nodeRequired = '18.0.0';
  const nodeOk = compareVersions(nodeVersion, nodeRequired) >= 0;
  checkItem('Node.js', nodeOk ? 'pass' : 'fail', `${nodeVersion} ${nodeOk ? '(?)' : `(需要 ${nodeRequired}+)`}`);
  
  // npm
  const npmVersion = execCommand('npm --version');
  if (npmVersion) {
    checkItem('npm', 'pass', npmVersion);
  } else {
    checkItem('npm', 'fail', '未安装');
  }
}

function checkProjectStructure() {
  log('\n[2] 项目结构检查', 'cyan');
  log('─'.repeat(60), 'cyan');
  
  const files = ['package.json', 'next.config.js', 'tsconfig.json'];
  const dirs = ['app', 'components', 'lib'];
  
  for (const file of files) {
    const exists = fs.existsSync(path.join(__dirname, file));
    checkItem(`文件: ${file}`, exists ? 'pass' : 'fail');
  }
  
  for (const dir of dirs) {
    const exists = fs.existsSync(path.join(__dirname, dir));
    checkItem(`目录: ${dir}/`, exists ? 'pass' : 'fail');
  }
}

function checkDependencies() {
  log('\n[3] 依赖安装检查', 'cyan');
  log('─'.repeat(60), 'cyan');
  
  const nodeModules = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModules)) {
    checkItem('node_modules', 'fail', '未安装，请运行 npm install');
    return;
  }
  
  checkItem('node_modules', 'pass', '已安装');
  
  const deps = ['next', 'react', 'ethers', 'hardhat'];
  for (const dep of deps) {
    const exists = fs.existsSync(path.join(nodeModules, dep));
    checkItem(dep, exists ? 'pass' : 'fail');
  }
}

function generateReport() {
  log('\n' + '='.repeat(60), 'cyan');
  log('诊断报告', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n? 通过: ${diagnostics.pass.length}`, 'green');
  log(`? 警告: ${diagnostics.warn.length}`, 'yellow');
  log(`? 失败: ${diagnostics.fail.length}`, 'red');
  
  if (diagnostics.fail.length > 0) {
    log('\n需要修复的问题:', 'red');
    diagnostics.fail.forEach(({ name, message }) => {
      log(`  ? ${name}${message ? ': ' + message : ''}`, 'red');
    });
  }
  
  if (diagnostics.fail.length === 0) {
    log('\n? 环境配置正常!', 'green');
    log('运行: npm run dev 启动项目\n', 'green');
  } else {
    log('\n建议: 运行 npm install 安装依赖\n', 'yellow');
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('? 瀛州纪 - 环境诊断工具', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  checkSystemEnvironment();
  checkProjectStructure();
  checkDependencies();
  generateReport();
}

main();

