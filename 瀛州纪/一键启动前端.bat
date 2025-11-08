@echo off
chcp 65001 >nul
echo ========================================
echo    瀛州纪 - 启动前端服务
echo ========================================
echo.
echo 🚀 启动中...
echo.
echo 💡 提示：
echo    - 访问地址: http://localhost:3000
echo    - 按 Ctrl+C 停止服务
echo.
echo ========================================
echo.

call npm run dev

