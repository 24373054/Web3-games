# Windows运行指南 - 解决JavaFX问题

## 问题：缺少 JavaFX 运行时组件

这是因为从Java 11开始，JavaFX不再包含在JDK中。

## 解决方案

### 方案1：下载包含JavaFX的JDK（推荐，最简单）

#### 下载Liberica JDK Full（包含JavaFX）

1. **访问下载页面：**
   https://bell-sw.com/pages/downloads/#jdk-17-lts

2. **选择版本：**
   - Version: **17 LTS**
   - Operating System: **Windows**
   - Architecture: **x86 64 bit**
   - Package: **Full JDK** ⭐（重要！选择Full版本）

3. **下载并安装：**
   - 下载 `.msi` 安装包
   - 双击安装
   - 一路"下一步"

4. **验证安装：**
   ```powershell
   java -version
   ```

5. **运行游戏：**
   ```powershell
   java -jar yingzhou-java-1.0.jar
   ```

---

### 方案2：使用Maven运行（如果你有Maven）

```powershell
# 在项目目录下运行
mvn javafx:run
```

---

### 方案3：手动添加JavaFX参数

#### 步骤1：下载JavaFX SDK

1. 访问：https://gluonhq.com/products/javafx/
2. 下载 **JavaFX Windows SDK**
3. 解压到：`C:\javafx-sdk-21`

#### 步骤2：使用参数运行

```powershell
java --module-path "C:\javafx-sdk-21\lib" --add-modules javafx.controls,javafx.fxml,javafx.graphics -jar yingzhou-java-1.0.jar
```

---

### 方案4：创建启动脚本（推荐用于方案3）

创建 `启动游戏.bat` 文件：

```batch
@echo off
echo ========================================
echo   瀛州纪 - Java版
echo ========================================
echo.

set JAVAFX_PATH=C:\javafx-sdk-21\lib

java --module-path "%JAVAFX_PATH%" --add-modules javafx.controls,javafx.fxml,javafx.graphics -jar yingzhou-java-1.0.jar

pause
```

双击 `启动游戏.bat` 即可运行。

---

## 推荐方案对比

| 方案 | 难度 | 优点 | 缺点 |
|------|------|------|------|
| **方案1：Liberica Full JDK** | ⭐ 简单 | 一次安装，永久使用 | 需要下载约200MB |
| 方案2：Maven | ⭐⭐ 中等 | 开发者友好 | 需要安装Maven |
| 方案3：手动JavaFX | ⭐⭐⭐ 复杂 | 灵活 | 每次运行需要参数 |

**强烈推荐方案1！** 最简单，一劳永逸。

---

## 快速链接

### Liberica JDK Full 17 下载（推荐）
https://bell-sw.com/pages/downloads/#jdk-17-lts

### 或者使用 Azul Zulu JDK FX（也包含JavaFX）
https://www.azul.com/downloads/?package=jdk-fx#zulu

---

## 验证JavaFX是否可用

安装完成后，运行以下命令验证：

```powershell
java --list-modules | findstr javafx
```

如果看到类似输出，说明JavaFX已安装：
```
javafx.base
javafx.controls
javafx.fxml
javafx.graphics
...
```

---

## 完整步骤（方案1 - 推荐）

### 1. 卸载当前Java（可选）

如果你想完全替换：
- 控制面板 → 程序和功能 → 卸载Java

### 2. 下载Liberica Full JDK 17

访问：https://bell-sw.com/pages/downloads/#jdk-17-lts

选择：
- **Version:** 17 LTS
- **OS:** Windows
- **Architecture:** x86 64 bit  
- **Package:** Full JDK ⭐

下载 `.msi` 文件（约200MB）

### 3. 安装

双击 `.msi` 文件，按提示安装。

### 4. 验证

```powershell
java -version
```

应该看到类似：
```
openjdk version "17.0.x" 2023-xx-xx LTS
OpenJDK Runtime Environment (build 17.0.x+x-LTS)
OpenJDK 64-Bit Server VM (build 17.0.x+x-LTS, mixed mode, sharing)
```

### 5. 运行游戏

```powershell
cd C:\Users\23157\CODE\Web3\JAVA版瀛州纪
java -jar yingzhou-java-1.0.jar
```

---

## 如果还是不行

### 检查Java版本

```powershell
java -version
```

确保是Java 17或更高版本。

### 检查JavaFX模块

```powershell
java --list-modules | findstr javafx
```

如果没有输出，说明JavaFX未安装。

### 重新下载正确的JDK

确保下载的是 **Full JDK** 或 **JDK FX** 版本，不是普通的JDK。

---

## 常见问题

### Q: 我已经安装了Java 17，还需要重新安装吗？

A: 如果你的Java 17不包含JavaFX，需要：
- 选项1：卸载并安装Liberica Full JDK
- 选项2：使用方案3手动添加JavaFX

### Q: Liberica JDK和Oracle JDK有什么区别？

A: 
- Liberica JDK是免费的，包含JavaFX
- Oracle JDK需要商业许可，不包含JavaFX
- 两者功能相同，Liberica更适合JavaFX应用

### Q: 安装后还是提示缺少JavaFX？

A: 检查环境变量：
1. 右键"此电脑" → 属性 → 高级系统设置
2. 环境变量 → 系统变量 → Path
3. 确保Liberica JDK的bin目录在最前面

---

## 总结

**最简单的解决方案：**

1. 下载 Liberica Full JDK 17
2. 安装
3. 运行 `java -jar yingzhou-java-1.0.jar`

就这么简单！🚀
