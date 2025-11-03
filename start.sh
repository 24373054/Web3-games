#!/bin/bash

# 瀛州纪 - 启动脚本 (Unix/Linux/macOS)

echo ""
echo "======================================================"
echo "  瀛州纪 - Immortal Ledger"
echo "  自动化启动脚本"
echo "======================================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "? 未检测到 Node.js!"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

echo "? Node.js 已安装"
node --version

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "? 未检测到 npm!"
    exit 1
fi

echo "? npm 已安装"
npm --version

echo ""
echo "正在启动开发环境..."
echo ""

# 运行启动脚本
node start-dev.js

