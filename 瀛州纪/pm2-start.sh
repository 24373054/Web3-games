#!/bin/bash
# 使用 PM2 启动瀛州纪 (推荐方式)

cd "$(dirname "$0")"

echo "🚀 使用 PM2 启动瀛州纪..."
echo "📍 工作目录: $(pwd)"
echo "🌐 访问地址: https://immortal.matrixlab.work"
echo "🔧 本地端口: 3106"
echo ""

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "❌ PM2 安装失败，请手动安装: npm install -g pm2"
        exit 1
    fi
    echo "✅ PM2 安装成功"
fi

# 停止旧进程
echo "🔍 检查现有进程..."
pm2 delete yingzhou-immortal 2>/dev/null || true

# 构建应用
echo "📦 构建应用..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"
echo ""

# 使用 PM2 启动
echo "🎮 启动应用..."
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 应用已成功启动!"
    echo ""
    echo "📊 常用命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs yingzhou-immortal"
    echo "  停止应用: pm2 stop yingzhou-immortal"
    echo "  重启应用: pm2 restart yingzhou-immortal"
    echo "  删除应用: pm2 delete yingzhou-immortal"
    echo ""
    echo "💾 设置开机自启:"
    echo "  pm2 startup"
    echo "  pm2 save"
    echo ""
    pm2 status
else
    echo "❌ 启动失败"
    exit 1
fi
