#!/bin/bash
# 瀛州纪后台启动脚本 (使用 nohup)

cd "$(dirname "$0")"

echo "🚀 启动瀛州纪 (后台模式)..."
echo "📍 工作目录: $(pwd)"
echo "🌐 访问地址: https://immortal.matrixlab.work"
echo "🔧 本地端口: 3106"
echo ""

# 检查端口是否被占用
if lsof -Pi :3106 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3106 已被占用"
    echo "正在停止旧进程..."
    lsof -ti:3106 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 构建应用
echo "📦 构建应用..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"
echo ""

# 后台启动应用
echo "🎮 启动应用 (后台运行)..."
nohup npm run start > logs/app.log 2>&1 &
PID=$!

# 保存 PID 到文件
echo $PID > .app.pid

# 等待应用启动
sleep 5

# 检查应用是否成功启动
if ps -p $PID > /dev/null 2>&1; then
    if curl -s http://localhost:3106 > /dev/null 2>&1; then
        echo "✅ 应用已在后台启动并运行正常"
        echo "📝 进程 ID: $PID (已保存到 .app.pid)"
        echo "📄 日志文件: logs/app.log"
        echo "🌐 访问地址: https://immortal.matrixlab.work"
        echo ""
        echo "📊 常用命令:"
        echo "  查看日志: tail -f logs/app.log"
        echo "  停止应用: ./stop.sh"
        echo "  重启应用: ./stop.sh && ./start-prod-daemon.sh"
    else
        echo "⚠️  应用进程存在但无法访问,请查看日志"
        tail -10 logs/app.log
    fi
else
    echo "❌ 应用启动失败,请查看日志"
    tail -20 logs/app.log
    rm -f .app.pid
fi
