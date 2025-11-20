# 瀛州纪 Java 后端 API

## 简介
本模块是《瀛州纪》Web 游戏的 Java 后端，使用 Spring Boot 提供 REST API，为前端提供游戏逻辑支持。

## 技术栈
- **Java 17**
- **Spring Boot 3.2**
- **Jackson** (JSON 序列化)
- **Gradle** (构建工具)

## 运行方式

### 使用 Gradle Wrapper（推荐）
```bash
.\gradlew.bat bootRun
```

### 在 IntelliJ IDEA 中运行
1. 确保已安装 JDK 17
2. File > Open 打开 `java-game` 目录
3. 等待 Gradle 同步完成
4. 运行 `YingzhouGameApplication` 主类

后端将在 `http://localhost:8080` 启动。

## API 端点

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/eras` | 获取所有纪元配置 |
| GET | `/api/eras/{eraId}/npcs` | 获取指定纪元的 NPC 列表 |
| GET | `/api/fragments` | 获取所有记忆碎片定义 |
| GET | `/api/minigames` | 获取所有小游戏配置 |
| POST | `/api/dialogue` | 与 NPC 对话（可能触发碎片） |
| POST | `/api/minigame` | 提交小游戏结果 |
| GET | `/api/game-state/{playerId}` | 获取玩家状态 |
| POST | `/api/game-state/{playerId}/advance-era` | 推进到下一纪元 |

## OOP 设计亮点
- **分层架构**：Controller（控制层）、Service（业务层）、Engine（引擎层）、Model（模型层）
- **依赖注入**：Spring IoC 容器管理组件生命周期
- **RESTful 设计**：标准 HTTP 方法 + JSON 数据交换
- **策略模式**：`ScoreCalculator`、`FragmentDropCalculator`、`KeywordMatcher`
- **数据驱动**：游戏配置从 `story.json` 加载
- **状态管理**：每个玩家独立的 `GameState`（内存存储）

## 前端集成
前端（Next.js）运行在 `http://localhost:3000`，通过 `fetch` 调用本后端 API。CORS 已配置允许跨域访问。`story.json` 可替换/扩展
