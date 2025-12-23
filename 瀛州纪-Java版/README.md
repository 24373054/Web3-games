# 瀛州纪 Java版 (Immortal Ledger - Java Edition)

> 一个永恒存续的数字文明史诗 - Java实现版本

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![JavaFX](https://img.shields.io/badge/JavaFX-21-green.svg)](https://openjfx.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 简介

瀛州纪是一个独特的数字文明模拟游戏，讲述了一个自我演化的数字生命文明的故事。在这个世界里，没有物质，没有语言，只有逻辑、合约与数据流。

本项目是瀛州纪的Java实现版本，使用JavaFX构建，提供了与原版Web3版本高度一致的游戏体验。

## ✨ 主要特性

### 🎮 核心功能
- **完整的游戏引擎**: 60 FPS稳定运行，流畅的游戏体验
- **3D场景渲染**: 基于JavaFX 3D的第一人称视角
- **5个AI-NPC**: 史官、工匠、商序、先知、遗忘者
- **对话系统**: 实时对话界面，消息气泡显示
- **纪元系统**: 5个纪元的文明演化（创世→萌芽→繁盛→熵化→毁灭）
- **记忆碎片**: 18个碎片收集（8个主要 + 10个隐藏）

### 🎨 视觉效果
- **青色主题**: 统一的赛博朋克风格（rgb(6, 182, 212)）
- **发光效果**: DropShadow实现的霓虹发光
- **渐变背景**: 多层次的渐变色背景
- **悬停动画**: 缩放、颜色变化等交互效果
- **纪元颜色**: 每个纪元独特的颜色主题

### 🆕 最新功能 (v1.0)
- **📚 记忆碎片收藏馆**: 可视化展示所有碎片，双进度条统计
- **🌌 纪元系统面板**: 时间线显示，推进条件检查
- **🎯 快捷按钮**: 左侧面板新增快速访问按钮
- **💬 优化对话界面**: 消息气泡、时间戳、实时更新

## 🚀 快速开始

### 系统要求
- **操作系统**: Windows 10+, macOS 10.14+, Linux (GUI环境)
- **JDK**: Liberica Full JDK 17+ 或 Azul Zulu JDK FX 17+
- **内存**: 2GB+ RAM
- **显卡**: 支持OpenGL 2.0+

### 安装JDK

#### Windows
1. 下载 [Liberica Full JDK 17](https://bell-sw.com/pages/downloads/#jdk-17-lts)
2. 选择 "Full JDK" 版本（包含JavaFX）
3. 运行安装程序
4. 验证安装: `java -version`

#### macOS
```bash
brew install --cask liberica-jdk17-full
```

#### Linux
```bash
# Ubuntu/Debian
wget https://download.bell-sw.com/java/17.0.9+11/bellsoft-jdk17.0.9+11-linux-amd64-full.deb
sudo dpkg -i bellsoft-jdk17.0.9+11-linux-amd64-full.deb
```

### 运行游戏

#### 方式1: 直接运行JAR
```bash
java -jar yingzhou-java-1.0.jar
```

#### 方式2: 从源码编译
```bash
# 克隆仓库
git clone <repository-url>
cd 瀛州纪-Java版

# 编译
mvn clean compile

# 打包
mvn package -DskipTests

# 运行
java -jar target/yingzhou-java-1.0.jar
```

## 🎮 游戏操作

### 基础控制
- **W/A/S/D**: 移动
- **鼠标**: 视角控制
- **E**: 与最近的NPC交互
- **ESC**: 打开/关闭菜单

### UI交互
- **左侧面板**: 
  - 查看世界状态
  - 点击"📚 记忆碎片"打开收藏馆
  - 点击"🌌 纪元系统"打开纪元面板
- **右侧面板**: 
  - 查看NPC列表
  - 点击NPC卡片开始对话
- **对话界面**: 
  - 输入问题与NPC交流
  - 查看对话历史

## 📚 文档

- [最新优化说明](最新优化说明.md) - 详细的更新内容和技术说明
- [新功能快速指南](新功能快速指南.md) - 新功能使用教程
- [功能对比表](功能对比表.md) - 与Web3版的详细对比
- [Windows运行指南](Windows运行指南.md) - Windows系统运行指南

## 🏗️ 项目结构

```
瀛州纪-Java版/
├── src/main/java/com/yingzhou/
│   ├── Main.java                    # 程序入口
│   ├── launcher/
│   │   └── VersionSelector.java    # 版本选择器
│   ├── game/
│   │   ├── GameEngine.java          # 游戏引擎
│   │   ├── GameLauncher.java        # 游戏启动器
│   │   ├── epoch/
│   │   │   └── EpochManager.java    # 纪元管理器
│   │   └── player/
│   │       └── Player.java          # 玩家控制器
│   ├── npc/
│   │   ├── BaseNPC.java             # NPC基类
│   │   ├── NPCManager.java          # NPC管理器
│   │   ├── Historian.java           # 史官
│   │   ├── Craftsman.java           # 工匠
│   │   ├── Merchant.java            # 商序
│   │   ├── Prophet.java             # 先知
│   │   └── Forgetter.java           # 遗忘者
│   ├── scene3d/
│   │   └── Scene3DManager.java      # 3D场景管理器
│   ├── ui/
│   │   ├── GameUI.java              # 主UI管理器
│   │   ├── DialoguePanel.java       # 对话面板
│   │   ├── FragmentGallery.java     # 碎片收藏馆 ⭐
│   │   └── EpochPanel.java          # 纪元面板 ⭐
│   └── data/
│       └── GameData.java            # 数据管理
├── src/main/resources/
│   ├── icon.png                     # 应用图标
│   └── web3_version/                # Web3版本文件
├── pom.xml                          # Maven配置
└── README.md                        # 本文件
```

## 🎯 功能完成度

```
整体进度:     ██████████████████░░  90%

核心功能:     ███████████████████░  95%
UI系统:       ███████████████████░  95%
3D场景:       ████████████████░░░░  80%
NPC系统:      ██████████████████░░  90%
纪元系统:     ███████████████████░  95%
碎片系统:     ███████████████████░  95%
小游戏:       ░░░░░░░░░░░░░░░░░░░░   0%
AI集成:       ██████░░░░░░░░░░░░░░  30%
音效系统:     ░░░░░░░░░░░░░░░░░░░░   0%
```

## 🔮 开发路线图

### ✅ v1.0 (当前版本)
- [x] 完整的游戏引擎
- [x] 3D场景渲染
- [x] 5个NPC系统
- [x] 对话系统
- [x] 纪元系统
- [x] 碎片收藏馆
- [x] 纪元面板
- [x] 优化视觉效果

### 🚧 v1.5 (开发中)
- [ ] 记忆排序游戏
- [ ] 握手协议游戏
- [ ] 资源平衡游戏
- [ ] AI对话集成
- [ ] 音效系统

### 📋 v2.0 (计划中)
- [ ] 粒子效果系统
- [ ] 成就系统
- [ ] 云存档
- [ ] 多语言支持
- [ ] 模组支持

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发环境设置
```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
mvn clean install

# 运行测试
mvn test

# 启动开发模式
mvn javafx:run
```

## 📊 技术栈

- **语言**: Java 17
- **UI框架**: JavaFX 21
- **3D渲染**: JavaFX 3D
- **构建工具**: Maven 3.8+
- **打包插件**: Maven Shade Plugin

## 📝 更新日志

### v1.0 (2025-12-23)
- ✨ 新增记忆碎片收藏馆
- ✨ 新增纪元系统面板
- 🎨 优化UI布局和视觉效果
- 🐛 修复数据绑定编译错误
- 📝 完善文档和使用指南

### v0.5 (2025-12-20)
- ✨ 实现完整UI系统
- ✨ 添加对话界面
- 🎨 统一视觉风格
- 🐛 修复3D渲染问题

### v0.1 (2025-12-15)
- 🎉 初始版本发布
- ✨ 基础游戏引擎
- ✨ 简单3D场景
- ✨ 5个NPC

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 原版Web3版本设计
- JavaFX社区
- 所有贡献者和测试者

## 📞 联系方式

- **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)
- **讨论**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**在瀛州的旅程中，你将见证一个文明的诞生、繁荣与终焉。** 🌌

**合约即生命 · 账本即史书 · 毁灭为纪元终点** ⚡
