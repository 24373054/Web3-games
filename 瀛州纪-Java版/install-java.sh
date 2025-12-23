#!/bin/bash

echo "========================================"
echo "  瀛州纪 - Java环境安装脚本"
echo "========================================"
echo ""

# 检查是否有root权限
if [ "$EUID" -ne 0 ]; then 
    echo "请使用sudo运行此脚本"
    echo "用法: sudo ./install-java.sh"
    exit 1
fi

echo "正在更新软件包列表..."
apt update

echo ""
echo "正在安装OpenJDK 17和JavaFX..."
apt install -y openjdk-17-jdk openjdk-17-jre

echo ""
echo "正在安装Maven..."
apt install -y maven

echo ""
echo "========================================"
echo "  安装完成！"
echo "========================================"
echo ""

# 验证安装
echo "Java版本："
java -version

echo ""
echo "Maven版本："
mvn -version

echo ""
echo "========================================"
echo "  环境配置成功！"
echo "========================================"
echo ""
echo "现在可以运行游戏了："
echo "  ./run.sh"
echo ""
