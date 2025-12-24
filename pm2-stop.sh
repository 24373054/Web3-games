#!/bin/bash
# 使用 PM2 停止瀛州纪

echo "🛑 停止瀛州纪..."

if command -v pm2 &> /dev/null; then
    pm2 stop yingzhou-immortal
    echo "✅ 应用已停止"
    echo ""
    echo "查看状态: pm2 status"
else
    echo "⚠️  PM2 未安装，使用普通方式停止..."
    ./stop.sh
fi
