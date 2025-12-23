# Web2 模式测试指南

## 快速测试步骤

### 1. 启动开发服务器

```bash
cd Web3-games/瀛州纪
npm run dev
```

访问：http://localhost:3000

### 2. 测试模式选择

✅ **预期行为**：
- 首次访问显示模式选择界面
- 显示两个选项：Web2 模式和 Web3 模式
- 鼠标悬停显示详细信息

✅ **测试步骤**：
1. 打开浏览器访问游戏
2. 查看模式选择界面是否正常显示
3. 点击 "选择 Web2 模式" 按钮

### 3. 测试自动钱包创建

✅ **预期行为**：
- 自动创建模拟钱包
- 显示钱包地址（0x...）
- 右上角显示 "🎮 Web2 模式" 标签

✅ **测试步骤**：
1. 选择 Web2 模式后
2. 检查右上角是否显示钱包地址
3. 打开浏览器控制台（F12）
4. 输入：`localStorage.getItem('yingzhou_mock_wallet')`
5. 应该看到 JSON 格式的钱包数据

### 4. 测试创建数字生命

✅ **预期行为**：
- 可以输入名称
- 点击创建后立即成功
- 显示 Token ID 和名称
- 不需要等待区块确认

✅ **测试步骤**：
1. 点击 "开始游戏" 按钮
2. 在左侧找到 "🧬 数字生命" 卡片
3. 输入名称（例如："测试生命"）
4. 点击 "创建数字生命"
5. 应该立即看到成功提示
6. 卡片显示 Token ID #0

### 5. 测试游戏功能

#### 5.1 测试小游戏

✅ **测试步骤**：
1. 点击 "🎮 小游戏" 标签页
2. 玩记忆排序游戏
3. 完成游戏（完成度 ≥ 60%）
4. 应该立即获得碎片奖励
5. 切换到 "💎 记忆碎片" 标签页
6. 应该看到新获得的碎片

#### 5.2 测试 NPC 对话

✅ **测试步骤**：
1. 点击 "💬 AI对话" 标签页
2. 选择一个 NPC
3. 输入消息并发送
4. 应该立即收到回复（模拟）
5. 对话历史应该被保存

#### 5.3 测试 3D 世界

✅ **测试步骤**：
1. 点击 "🌌 进入3D区块链实体世界"
2. 3D 场景应该正常加载
3. 可以移动和探索
4. 与 NPC 交互应该正常工作

### 6. 测试数据持久化

✅ **测试步骤**：
1. 创建数字生命并玩一会游戏
2. 刷新页面（F5）
3. 应该自动恢复到 Web2 模式
4. 数字生命和游戏进度应该保留

### 7. 测试模式切换

✅ **测试步骤**：
1. 点击右上角 "切换模式" 按钮
2. 确认切换
3. 应该返回模式选择界面
4. 可以重新选择模式

### 8. 测试数据导出/导入

#### 导出数据

```javascript
// 在浏览器控制台执行
const data = localStorage.getItem('yingzhou_mock_wallet')
console.log(data)
// 复制输出的 JSON 数据
```

#### 导入数据

```javascript
// 在浏览器控制台执行
const importData = '粘贴你的JSON数据'
localStorage.setItem('yingzhou_mock_wallet', importData)
location.reload()
```

## 测试检查清单

### 基础功能
- [ ] 模式选择界面正常显示
- [ ] 可以选择 Web2 模式
- [ ] 自动创建模拟钱包
- [ ] 显示钱包地址
- [ ] 显示模式标签

### 数字生命
- [ ] 可以创建数字生命
- [ ] 立即创建成功（无需等待）
- [ ] 显示 Token ID
- [ ] 显示名称和属性
- [ ] 数据保存在 localStorage

### 游戏功能
- [ ] 小游戏可以正常玩
- [ ] 完成游戏获得碎片
- [ ] 碎片显示在收藏中
- [ ] NPC 对话正常工作
- [ ] 对话历史被保存
- [ ] 3D 世界正常加载

### 数据管理
- [ ] 刷新页面后数据保留
- [ ] 可以导出数据
- [ ] 可以导入数据
- [ ] 可以切换模式
- [ ] 切换模式后数据清除

### UI/UX
- [ ] 模式标签清晰可见
- [ ] Web2 提示信息正确
- [ ] 按钮状态正确
- [ ] 加载状态正确
- [ ] 错误提示友好

## 常见问题排查

### 问题：模式选择界面不显示

**检查**：
```javascript
// 控制台检查
localStorage.getItem('yingzhou_game_mode')
// 如果有值，清除它
localStorage.removeItem('yingzhou_game_mode')
location.reload()
```

### 问题：创建数字生命失败

**检查**：
1. 打开浏览器控制台查看错误
2. 检查 localStorage 是否可用
3. 尝试清除缓存

### 问题：数据丢失

**原因**：
- 清除了浏览器数据
- 使用了隐私模式
- localStorage 被禁用

**解决**：
- 定期导出数据备份
- 不要在隐私模式下玩
- 检查浏览器设置

### 问题：3D 场景不加载

**检查**：
1. 是否已创建数字生命
2. 浏览器是否支持 WebGL
3. 控制台是否有错误

## 性能测试

### 测试大量数据

```javascript
// 在控制台创建测试数据
const mockWallet = JSON.parse(localStorage.getItem('yingzhou_mock_wallet'))

// 添加 100 个碎片
for (let i = 0; i < 100; i++) {
  mockWallet.fragments.push(i)
}

// 添加 100 条交互记录
for (let i = 0; i < 100; i++) {
  mockWallet.interactions.push({
    npcId: `NPC${i}`,
    message: `测试消息${i}`,
    response: `测试回复${i}`,
    timestamp: Date.now()
  })
}

localStorage.setItem('yingzhou_mock_wallet', JSON.stringify(mockWallet))
location.reload()
```

检查：
- [ ] 页面加载速度
- [ ] 列表渲染性能
- [ ] 数据查询速度

## 浏览器兼容性测试

测试以下浏览器：
- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] 移动端浏览器

## 自动化测试脚本

```javascript
// 完整测试流程
async function testWeb2Mode() {
  console.log('🧪 开始 Web2 模式测试...')
  
  // 1. 清除旧数据
  localStorage.clear()
  console.log('✓ 清除旧数据')
  
  // 2. 刷新页面
  location.reload()
  
  // 等待页面加载后手动执行以下步骤：
  // - 选择 Web2 模式
  // - 创建数字生命
  // - 玩小游戏
  // - 检查数据
  
  setTimeout(() => {
    const wallet = localStorage.getItem('yingzhou_mock_wallet')
    if (wallet) {
      console.log('✓ 钱包数据已创建')
      const data = JSON.parse(wallet)
      console.log('  地址:', data.address)
      console.log('  NFT 数量:', data.nfts.length)
      console.log('  碎片数量:', data.fragments.length)
      console.log('  交互次数:', data.interactions.length)
    } else {
      console.log('✗ 钱包数据未创建')
    }
  }, 5000)
}

// 运行测试
testWeb2Mode()
```

## 测试报告模板

```
# Web2 模式测试报告

测试日期：____________________
测试人员：____________________
浏览器：____________________

## 测试结果

### 基础功能
- 模式选择：[ ] 通过 [ ] 失败
- 钱包创建：[ ] 通过 [ ] 失败
- 数字生命：[ ] 通过 [ ] 失败

### 游戏功能
- 小游戏：[ ] 通过 [ ] 失败
- NPC 对话：[ ] 通过 [ ] 失败
- 3D 世界：[ ] 通过 [ ] 失败

### 数据管理
- 数据持久化：[ ] 通过 [ ] 失败
- 数据导出：[ ] 通过 [ ] 失败
- 模式切换：[ ] 通过 [ ] 失败

## 发现的问题

1. ____________________
2. ____________________
3. ____________________

## 建议改进

1. ____________________
2. ____________________
3. ____________________
```

---

**测试完成后，请填写测试报告并提交给开发团队！** ✅
