#!/bin/bash
# 一键启动所有服务

cd "$(dirname "$0")"

echo "🚀 启动瀛州纪完整环境..."
echo "================================"
echo ""

# 1. 启动 Hardhat 节点
echo "📍 步骤 1/2: 启动 Hardhat 本地节点"
./start-hardhat.sh
if [ $? -ne 0 ]; then
    echo "❌ Hardhat 节点启动失败"
    exit 1
fi

echo ""
echo "================================"
echo ""

# 2. 启动前端应用
echo "📍 步骤 2/2: 启动前端应用"
./start-prod-daemon.sh
if [ $? -ne 0 ]; then
    echo "❌ 前端应用启动失败"
    exit 1
fi

echo ""
echo "================================"
echo "✅ 所有服务已成功启动!"
echo "================================"
echo ""
echo "🌐 访问地址: https://immortal.matrixlab.work"
echo ""
echo "📊 服务状态:"
echo "  - Hardhat 节点: http://127.0.0.1:8545 (Chain ID: 31337)"
echo "  - 前端应用: http://localhost:3106"
echo ""
echo "📋 下一步:"
echo "  1. 打开 MetaMask"
echo "  2. 添加 Hardhat Local 网络 (参考 METAMASK-SETUP.md)"
echo "  3. 导入测试账户私钥"
echo "  4. 访问 https://immortal.matrixlab.work"
echo ""
echo "📄 查看日志:"
echo "  - Hardhat: tail -f logs/hardhat.log"
echo "  - 应用: tail -f logs/app.log"
echo ""
echo "🛑 停止所有服务: ./stop-all.sh"
