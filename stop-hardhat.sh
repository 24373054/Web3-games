#!/bin/bash
# 停止 Hardhat 本地节点

echo "🛑 停止 Hardhat 节点..."

FOUND=0

# 从 PID 文件读取
if [ -f .hardhat.pid ]; then
    PID=$(cat .hardhat.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "从 PID 文件找到进程: $PID"
        kill -15 $PID 2>/dev/null
        FOUND=1
        sleep 2
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "强制停止..."
            kill -9 $PID 2>/dev/null
        fi
    fi
    rm -f .hardhat.pid
fi

# 查找端口 8545 的进程
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "找到监听端口 8545 的进程..."
    lsof -ti:8545 | xargs kill -15 2>/dev/null
    FOUND=1
    sleep 2
    
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "强制停止..."
        lsof -ti:8545 | xargs kill -9 2>/dev/null
    fi
fi

# 查找 hardhat node 进程
PIDS=$(ps aux | grep "hardhat node" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo "找到 Hardhat 进程: $PIDS"
    echo $PIDS | xargs kill -15 2>/dev/null
    FOUND=1
    sleep 2
    
    PIDS=$(ps aux | grep "hardhat node" | grep -v grep | awk '{print $2}')
    if [ ! -z "$PIDS" ]; then
        echo "强制停止..."
        echo $PIDS | xargs kill -9 2>/dev/null
    fi
fi

if [ $FOUND -eq 1 ]; then
    echo "✅ Hardhat 节点已停止"
else
    echo "ℹ️  没有找到运行中的 Hardhat 节点"
fi
