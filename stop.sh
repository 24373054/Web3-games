#!/bin/bash
# 停止瀛州纪应用

cd "$(dirname "$0")"

echo "🛑 停止瀛州纪..."

FOUND=0

# 方法0: 从 PID 文件读取
if [ -f .app.pid ]; then
    PID=$(cat .app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "从 PID 文件找到进程: $PID"
        kill -9 $PID 2>/dev/null
        FOUND=1
        sleep 1
    fi
    rm -f .app.pid
fi

# 方法1: 使用 fuser 强制杀死端口 3106 的所有进程
if fuser 3106/tcp >/dev/null 2>&1; then
    echo "找到监听端口 3106 的进程，强制停止..."
    fuser -k 3106/tcp 2>/dev/null
    FOUND=1
    sleep 1
fi

# 方法2: 查找 next start 进程
PIDS=$(ps aux | grep "next start" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo "找到 Next.js 进程: $PIDS，强制停止..."
    echo $PIDS | xargs kill -9 2>/dev/null
    FOUND=1
    sleep 1
fi

# 方法3: 再次检查端口，确保清理干净
if fuser 3106/tcp >/dev/null 2>&1; then
    echo "清理残留进程..."
    fuser -k -9 3106/tcp 2>/dev/null
    FOUND=1
fi

if [ $FOUND -eq 1 ]; then
    echo "✅ 应用已停止"
else
    echo "ℹ️  没有找到运行中的应用"
fi
