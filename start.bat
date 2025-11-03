@echo off
chcp 65001 >nul
title 瀛州纪 - 启动脚本

echo.
echo ======================================================
echo   瀛州纪 - Immortal Ledger
echo   自动化启动脚本 (Windows)
echo ======================================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js!
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)

echo [?] Node.js 已安装
node --version

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm!
    pause
    exit /b 1
)

echo [?] npm 已安装
npm --version

echo.
echo 正在启动开发环境...
echo.

REM 运行启动脚本
node start-dev.js

pause

