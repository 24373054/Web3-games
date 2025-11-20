@echo off
chcp 65001 >nul
title 瀛州纪 - 完整版启动（Java后端 + 前端）

echo.
echo ============================================================
echo   瀛州纪 - Immortal Ledger
echo   完整版启动脚本 (Java后端 + Web前端)
echo ============================================================
echo.

REM 检查 Java
echo [检查] Java 环境...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Java!
    echo 请安装 JDK 17: winget install -e --id EclipseAdoptium.Temurin.17.JDK
    pause
    exit /b 1
)

for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
echo [✓] Java 已安装: %JAVA_VERSION%

REM 检查 Node.js
echo [检查] Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js!
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)

echo [✓] Node.js 已安装
node --version

echo.
echo ============================================================
echo   第 1 步: 启动 Java 后端 (Spring Boot)
echo ============================================================
echo.

REM 检查Java后端是否已在运行
powershell -Command "$response = try { (Invoke-WebRequest -Uri http://localhost:8080/api/eras -TimeoutSec 2 -UseBasicParsing).StatusCode } catch { 0 }; if ($response -eq 200) { exit 0 } else { exit 1 }"
if %errorlevel% equ 0 (
    echo [提示] Java 后端已在运行 (http://localhost:8080)
    echo [跳过] 无需重复启动
) else (
    echo [启动] Java 后端...
    cd /d "%~dp0\java-game"
    
    REM 后台启动Java后端
    start "瀛州纪 - Java 后端" cmd /c "gradlew.bat bootRun"
    
    echo [等待] 后端启动中，请稍候...
    timeout /t 15 /nobreak >nul
    
    REM 验证后端启动
    powershell -Command "$response = try { (Invoke-WebRequest -Uri http://localhost:8080/api/eras -TimeoutSec 2 -UseBasicParsing).StatusCode } catch { 0 }; if ($response -eq 200) { exit 0 } else { exit 1 }"
    if %errorlevel% equ 0 (
        echo [✓] Java 后端启动成功！
    ) else (
        echo [警告] 后端可能需要更长时间启动，请稍后在浏览器检查 http://localhost:8080/api/eras
    )
    
    cd /d "%~dp0"
)

echo.
echo ============================================================
echo   第 2 步: 启动 Web 前端 (Next.js)
echo ============================================================
echo.

REM 检查依赖
if not exist "node_modules" (
    echo [安装] 前端依赖...
    call npm install
)

REM 启动前端（阻塞式，前台运行）
echo [启动] Web 前端...
echo.
echo ============================================================
echo   ? 游戏启动成功！
echo ============================================================
echo   - Java 后端: http://localhost:8080
echo   - Web 前端:  http://localhost:3000
echo ============================================================
echo.
echo [提示] 按 Ctrl+C 可同时关闭所有服务
echo.

call npm run dev

pause
