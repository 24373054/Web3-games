# 瀛州纪 - Java版

## 项目简介

这是《瀛州纪》游戏的Java实现版本，使用JavaFX进行3D渲染和UI开发。

## 技术栈

- **Java**: 17+
- **JavaFX**: 3D图形渲染
- **Maven**: 项目管理
- **LWJGL**: 可选的高性能3D渲染

## 项目结构

```
瀛州纪-Java版/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/yingzhou/
│   │   │       ├── Main.java                 # 主入口
│   │   │       ├── launcher/                 # 启动器（版本选择）
│   │   │       ├── game/                     # 游戏核心
│   │   │       ├── scene3d/                  # 3D场景
│   │   │       ├── npc/                      # NPC系统
│   │   │       ├── minigame/                 # 小游戏
│   │   │       ├── data/                     # 数据管理
│   │   │       └── ui/                       # UI组件
│   │   └── resources/
│   │       ├── fxml/                         # FXML布局文件
│   │       ├── css/                          # 样式文件
│   │       ├── data/                         # 游戏数据
│   │       └── assets/                       # 资源文件
│   └── test/
│       └── java/
└── pom.xml
```

## 快速开始

### 环境要求

- JDK 17 或更高版本
- Maven 3.6+

### 编译运行

```bash
# 编译项目
mvn clean compile

# 运行游戏
mvn javafx:run

# 打包
mvn package
```

### 运行打包后的JAR

```bash
java -jar target/yingzhou-java-1.0.jar
```

## 游戏特性

### 版本选择界面

启动游戏时会显示版本选择界面：
- **原版（Web3版）**: 打开浏览器访问Web3版本
- **Java版**: 启动Java本地版本

### 核心功能

1. **3D几何世界探索**
   - 第一人称视角
   - WASD移动，鼠标视角控制
   - 五个纪元的视觉变化

2. **NPC交互系统**
   - 5个AI-NPC（史官、工匠、商序、先知、遗忘者）
   - 动态对话系统
   - 关键词触发机制

3. **小游戏系统**
   - 记忆排序
   - 握手协议
   - 资源平衡
   - 代码构建
   - 未来推演
   - 混沌迷宫

4. **记忆碎片收集**
   - 8个主要碎片
   - 10个隐藏碎片
   - 进度追踪

## 开发说明

### 添加新NPC

1. 在 `com.yingzhou.npc` 包中创建新的NPC类
2. 继承 `BaseNPC` 类
3. 实现对话逻辑和小游戏

### 添加新纪元

1. 在 `com.yingzhou.game.epoch` 包中创建新纪元类
2. 定义视觉风格和环境参数
3. 在 `EpochManager` 中注册

## 许可证

MIT License
