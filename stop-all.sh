#!/bin/bash
# 停止所有服务

cd "$(dirname "$0")"

echo "🛑 停止所有服务..."
echo ""

# 停止前端应用
echo "📍 停止前端应用..."
./stop.sh

echo ""

# 停止 Hardhat 节点
echo "📍 停止 Hardhat 节点..."
./stop-hardhat.sh

echo ""
echo "✅ 所有服务已停止"
