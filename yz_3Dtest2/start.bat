@echo off
REM Babylon.js 3D Game - 快速启动脚本
REM 这个脚本会自动启动 HTTP 服务器并打开浏览器

echo.
echo ========================================
echo   Babylon.js 3D Game - 快速启动
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.x
    echo 访问: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [✓] Python 已安装
echo.

REM 启动服务器
echo [启动] 正在启动 HTTP 服务器...
echo [信息] 服务器地址: http://localhost:5173
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动浏览器（可选）
timeout /t 2 /nobreak
start http://localhost:5173

REM 启动 Python HTTP 服务器
python -m http.server 5173

pause
