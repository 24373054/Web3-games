#!/bin/bash
# Babylon.js 3D Game - 快速启动脚本（Linux/Mac）

echo ""
echo "========================================"
echo "  Babylon.js 3D Game - 快速启动"
echo "========================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到 Python 3，请先安装"
    exit 1
fi

echo "[✓] Python 已安装"
echo ""

# 启动服务器
echo "[启动] 正在启动 HTTP 服务器..."
echo "[信息] 服务器地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动浏览器（可选）
sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    open http://localhost:5173 &
fi

# 启动 Python HTTP 服务器
python3 -m http.server 5173
