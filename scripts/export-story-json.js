#!/usr/bin/env node

/**
 * 从 lib/gameData.ts 导出游戏数据到 java-game/src/main/resources/story.json
 * 
 * 功能：
 * - 读取前端的 TypeScript 游戏数据
 * - 转换为 JSON 格式
 * - 保存到 Java 后端资源目录
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 读取 TypeScript 数据文件并解析
function extractGameData() {
  const gameDataPath = path.join(__dirname, '../lib/gameData.ts');
  
  if (!fs.existsSync(gameDataPath)) {
    log('错误：找不到 lib/gameData.ts 文件', 'red');
    process.exit(1);
  }
  
  const content = fs.readFileSync(gameDataPath, 'utf-8');
  
  // 简单的数据提取（使用 eval，仅用于开发）
  // 注意：这不是最佳实践，生产环境应使用 TypeScript 编译器 API
  
  log('正在解析游戏数据...', 'yellow');
  
  try {
    // 提取 ERAS
    const erasMatch = content.match(/export const ERAS: EraConfig\[\] = (\[[\s\S]*?\n\])/);
    const eras = erasMatch ? eval(erasMatch[1]) : [];
    
    // 提取 AI_NPCS
    const npcsMatch = content.match(/export const AI_NPCS: AINPC\[\] = (\[[\s\S]*?\n\])/);
    const npcs = npcsMatch ? eval(npcsMatch[1]) : [];
    
    // 提取 MEMORY_FRAGMENTS
    const fragmentsMatch = content.match(/export const MEMORY_FRAGMENTS: MemoryFragment\[\] = (\[[\s\S]*?\n\])/);
    const fragments = fragmentsMatch ? eval(fragmentsMatch[1]) : [];
    
    // 提取 MINIGAMES
    const minigamesMatch = content.match(/export const MINIGAMES: MiniGame\[\] = (\[[\s\S]*?\n\])/);
    const minigames = minigamesMatch ? eval(minigamesMatch[1]) : [];
    
    return {
      eras,
      npcs,
      fragments,
      minigames
    };
  } catch (error) {
    log(`解析失败: ${error.message}`, 'red');
    log('尝试使用备用方法...', 'yellow');
    
    // 备用方法：使用 require（如果 gameData 导出为 CommonJS）
    try {
      const gameData = require('../lib/gameData');
      return {
        eras: gameData.ERAS || [],
        npcs: gameData.AI_NPCS || [],
        fragments: gameData.MEMORY_FRAGMENTS || [],
        minigames: gameData.MINIGAMES || []
      };
    } catch (reqError) {
      log('备用方法也失败，请手动编辑 story.json', 'red');
      return null;
    }
  }
}

// 生成 story.json
function generateStoryJson() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  导出游戏数据到 Java 后端', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // 提取数据
  const gameData = extractGameData();
  
  if (!gameData) {
    log('\n导出失败！', 'red');
    process.exit(1);
  }
  
  log(`✓ 解析成功:`, 'green');
  log(`  - ${gameData.eras.length} 个纪元`, 'cyan');
  log(`  - ${gameData.npcs.length} 个 NPC`, 'cyan');
  log(`  - ${gameData.fragments.length} 个记忆碎片`, 'cyan');
  log(`  - ${gameData.minigames.length} 个小游戏`, 'cyan');
  
  // 保存到 story.json
  const outputPath = path.join(__dirname, '../java-game/src/main/resources/story.json');
  const outputDir = path.dirname(outputPath);
  
  // 确保目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 写入文件
  fs.writeFileSync(outputPath, JSON.stringify(gameData, null, 2), 'utf-8');
  
  log(`\n✓ 导出成功！`, 'green');
  log(`  文件位置: ${outputPath}`, 'cyan');
  
  // 显示文件大小
  const stats = fs.statSync(outputPath);
  log(`  文件大小: ${(stats.size / 1024).toFixed(2)} KB`, 'cyan');
  
  log('\n下一步:', 'yellow');
  log('  1. 重启 Java 后端以加载新数据', 'yellow');
  log('  2. 访问 http://localhost:8080/api/eras 验证', 'yellow');
  log('='.repeat(60), 'cyan');
}

// 主函数
try {
  generateStoryJson();
} catch (error) {
  log(`\n导出失败: ${error.message}`, 'red');
  log('请检查 lib/gameData.ts 文件是否存在且格式正确', 'yellow');
  process.exit(1);
}
