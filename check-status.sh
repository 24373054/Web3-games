#!/bin/bash
# 检查所有服务状态

cd "$(dirname "$0")"

echo "🔍 检查服务状态..."
echo "================================"
echo ""

# 检查 Hardhat 节点
echo "📍 Hardhat 本地节点:"
if [ -f .hardhat.pid ]; then
    PID=$(cat .hardhat.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "  ✅ 运行中 (PID: $PID)"
        
        # 测试 RPC 连接
        CHAIN_ID=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
            http://127.0.0.1:8545 2>/dev/null | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
        
        if [ ! -z "$CHAIN_ID" ]; then
            CHAIN_ID_DEC=$((CHAIN_ID))
            echo "  ✅ RPC 可访问 (Chain ID: $CHAIN_ID_DEC)"
        else
            echo "  ⚠️  RPC 无响应"
        fi
    else
        echo "  ❌ 未运行"
    fi
else
    echo "  ❌ 未运行 (无 PID 文件)"
fi

echo ""

# 检查前端应用
echo "📍 前端应用:"
if [ -f .app.pid ]; then
    PID=$(cat .app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "  ✅ 运行中 (PID: $PID)"
        
        # 测试应用连接
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3106 2>/dev/null)
        if [ "$HTTP_CODE" = "200" ]; then
            echo "  ✅ 应用可访问 (HTTP 200)"
        else
            echo "  ⚠️  应用无响应 (HTTP $HTTP_CODE)"
        fi
    else
        echo "  ❌ 未运行"
    fi
else
    echo "  ❌ 未运行 (无 PID 文件)"
fi

echo ""

# 检查 Nginx
echo "📍 Nginx 反向代理:"
if systemctl is-active --quiet nginx; then
    echo "  ✅ 运行中"
    
    # 测试 HTTPS 访问
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://immortal.matrixlab.work 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ HTTPS 可访问 (HTTP 200)"
    else
        echo "  ⚠️  HTTPS 无响应 (HTTP $HTTP_CODE)"
    fi
else
    echo "  ❌ 未运行"
fi

echo ""
echo "================================"
echo ""

# 给出建议
if [ -f .hardhat.pid ] && [ -f .app.pid ]; then
    HARDHAT_PID=$(cat .hardhat.pid)
    APP_PID=$(cat .app.pid)
    
    if ps -p $HARDHAT_PID > /dev/null 2>&1 && ps -p $APP_PID > /dev/null 2>&1; then
        echo "✅ 所有服务运行正常!"
        echo ""
        echo "📋 下一步:"
        echo "  1. 打开 MetaMask"
        echo "  2. 确保已添加 Hardhat Local 网络 (Chain ID: 31337)"
        echo "  3. 确保已导入测试账户"
        echo "  4. 在 MetaMask 中切换到 Hardhat Local 网络"
        echo "  5. 访问 https://immortal.matrixlab.work"
        echo "  6. 点击网站上的'连接钱包'按钮"
        echo ""
        echo "📚 详细配置: cat METAMASK-SETUP.md"
    else
        echo "⚠️  部分服务未运行"
        echo ""
        echo "🔧 修复方法:"
        echo "  ./stop-all.sh"
        echo "  ./start-all.sh"
    fi
else
    echo "⚠️  服务未启动"
    echo ""
    echo "🚀 启动所有服务:"
    echo "  ./start-all.sh"
fi
