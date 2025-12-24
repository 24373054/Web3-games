@echo off
chcp 65001 >nul
echo ========================================
echo    瀛州纪 - 一键自动化部署脚本
echo ========================================
echo.

echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
echo.

echo [2/4] 编译智能合约...
call npm run compile
if %errorlevel% neq 0 (
    echo ❌ 编译失败
    pause
    exit /b 1
)
echo ✅ 编译成功
echo.

echo [3/4] 导出 ABI...
call npm run export-abi
if %errorlevel% neq 0 (
    echo ⚠️  导出 ABI 警告（可忽略）
)
echo ✅ ABI 已导出
echo.

echo [4/4] 部署合约并生成配置...
call npm run deploy:auto
if %errorlevel% neq 0 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 💡 常见问题:
    echo    1. 确保 Hardhat 本地节点正在运行
    echo       打开新终端运行: npx hardhat node
    echo.
    echo    2. 如果节点已重启，需要重新部署
    echo.
    echo    3. 检查网络连接配置
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 部署完成！
echo ========================================
echo.
echo 📋 下一步：
echo    1. 确保 Hardhat 节点正在运行
echo    2. 启动前端: npm run dev
echo    3. 配置 MetaMask:
echo       - 网络: Hardhat Local
echo       - RPC: http://127.0.0.1:8545
echo       - Chain ID: 31337
echo    4. 打开浏览器: http://localhost:3000
echo.
pause

