@echo off
chcp 65001 >nul
echo ========================================
echo   瀛州纪 - Java版启动器
echo ========================================
echo.

echo 正在检查Java环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Java环境！
    echo 请安装JDK 17或更高版本
    pause
    exit /b 1
)

echo Java环境检测成功！
echo.

echo 正在检查Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 未检测到Maven，将尝试使用已编译的JAR文件
    if exist target\yingzhou-java-1.0.jar (
        echo 找到已编译的JAR文件，正在启动...
        java -jar target\yingzhou-java-1.0.jar
    ) else (
        echo [错误] 未找到编译后的JAR文件
        echo 请先安装Maven并运行: mvn package
        pause
        exit /b 1
    )
) else (
    echo Maven检测成功！
    echo.
    echo 正在编译并运行游戏...
    mvn clean javafx:run
)

pause
