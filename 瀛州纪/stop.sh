#!/bin/bash
# 停止瀛州纪应用

echo "🛑 停止瀛州纪..."

FOUND=0

# 方法0: 从 PID 文件读取
if [ -f .app.pid ]; then
    PID=$(cat .app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "从 PID 文件找到进程: $PID"
        kill -15 $PID 2>/dev/null
        FOUND=1
        sleep 2
        
        # 如果还在运行，强制停止
        if ps -p $PID > /dev/null 2>&1; then
            echo "强制停止..."
            kill -9 $PID 2>/dev/null
        fi
    fi
    rm -f .app.pid
fi

# 方法1: 查找端口 3106 的进程
if lsof -Pi :3106 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "找到监听端口 3106 的进程..."
    lsof -ti:3106 | xargs kill -15 2>/dev/null
    FOUND=1
    sleep 2
    
    # 如果还在运行，强制停止
    if lsof -Pi :3106 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "强制停止..."
        lsof -ti:3106 | xargs kill -9 2>/dev/null
    fi
fi

# 方法2: 查找 next start 进程
PIDS=$(ps aux | grep "next start" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo "找到 Next.js 进程: $PIDS"
    echo $PIDS | xargs kill -15 2>/dev/null
    FOUND=1
    sleep 2
    
    # 检查是否还在运行
    PIDS=$(ps aux | grep "next start" | grep -v grep | awk '{print $2}')
    if [ ! -z "$PIDS" ]; then
        echo "强制停止..."
        echo $PIDS | xargs kill -9 2>/dev/null
    fi
fi

# 方法3: 查找 node 进程 (端口 3106)
NODE_PIDS=$(lsof -ti:3106 2>/dev/null)
if [ ! -z "$NODE_PIDS" ]; then
    echo "清理残留进程: $NODE_PIDS"
    echo $NODE_PIDS | xargs kill -9 2>/dev/null
    FOUND=1
fi

if [ $FOUND -eq 1 ]; then
    echo "✅ 应用已停止"
else
    echo "ℹ️  没有找到运行中的应用"
fi
