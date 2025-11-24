#!/bin/bash
# 瀛州纪启动脚本

cd "$(dirname "$0")"

echo "🚀 启动瀛州纪..."
echo "📍 工作目录: $(pwd)"
echo "🌐 访问地址: https://immortal.matrixlab.work"
echo "🔧 本地端口: 3106"
echo ""

# 检查端口是否被占用
if lsof -Pi :3106 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3106 已被占用"
    echo "正在停止旧进程..."
    lsof -ti:3106 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 启动应用
npm run dev
