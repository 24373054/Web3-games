#!/bin/bash
# 启动 Hardhat 本地节点

cd "$(dirname "$0")"

echo "🔗 启动 Hardhat 本地节点..."
echo "📍 工作目录: $(pwd)"
echo "🌐 RPC URL: http://127.0.0.1:8545"
echo "🆔 Chain ID: 31337"
echo ""

# 检查端口 8545 是否被占用
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 8545 已被占用"
    PID=$(lsof -ti:8545)
    echo "现有进程 PID: $PID"
    read -p "是否停止现有进程? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill -9 $PID
        sleep 2
    else
        echo "❌ 取消启动"
        exit 1
    fi
fi

# 后台启动 Hardhat 节点
echo "🚀 启动中..."
nohup npx hardhat node > logs/hardhat.log 2>&1 &
PID=$!

# 保存 PID
echo $PID > .hardhat.pid

# 等待节点启动
sleep 5

# 检查是否成功启动
if ps -p $PID > /dev/null 2>&1; then
    if curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://127.0.0.1:8545 > /dev/null 2>&1; then
        echo "✅ Hardhat 节点已成功启动"
        echo "📝 进程 ID: $PID (已保存到 .hardhat.pid)"
        echo "📄 日志文件: logs/hardhat.log"
        echo ""
        echo "📊 节点信息:"
        echo "  RPC URL: http://127.0.0.1:8545"
        echo "  Chain ID: 31337"
        echo "  Network: Hardhat Local"
        echo ""
        echo "📋 常用命令:"
        echo "  查看日志: tail -f logs/hardhat.log"
        echo "  停止节点: ./stop-hardhat.sh"
        echo "  部署合约: npm run deploy"
    else
        echo "⚠️  节点进程存在但无法连接,请查看日志"
        tail -10 logs/hardhat.log
    fi
else
    echo "❌ 节点启动失败,请查看日志"
    tail -20 logs/hardhat.log
    rm -f .hardhat.pid
fi
