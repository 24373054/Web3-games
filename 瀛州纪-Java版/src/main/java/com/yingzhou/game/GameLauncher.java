package com.yingzhou.game;

import com.yingzhou.scene3d.Scene3DManager;
import com.yingzhou.ui.GameUI;
import com.yingzhou.util.Logger;
import javafx.scene.Scene;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

import java.util.HashSet;
import java.util.Set;

/**
 * 游戏启动器
 * 负责初始化游戏场景和UI
 */
public class GameLauncher {
    
    private static final int GAME_WIDTH = 1280;
    private static final int GAME_HEIGHT = 720;
    
    private GameEngine gameEngine;
    private Scene3DManager scene3DManager;
    private GameUI gameUI;
    private Set<KeyCode> pressedKeys = new HashSet<>();
    private double lastMouseX = 0;
    private double lastMouseY = 0;
    private boolean mouseInitialized = false;

    public void start(Stage stage) {
        try {
            Logger.info("开始启动游戏...");
            
            // 初始化游戏引擎
            gameEngine = new GameEngine();
            Logger.info("游戏引擎初始化完成");
            
            // 初始化3D场景管理器
            scene3DManager = new Scene3DManager(gameEngine);
            Logger.info("3D场景管理器初始化完成");
            
            // 创建根布局
            BorderPane root = new BorderPane();
            root.setStyle("-fx-background-color: linear-gradient(to bottom, #000000, #1f2937);");
            
            // 设置3D场景为中心
            root.setCenter(scene3DManager.getSubScene());
            
            // 初始化游戏UI
            gameUI = new GameUI(gameEngine);
            root.setTop(gameUI.getTopBar());
            root.setBottom(gameUI.getBottomBar());
            root.setRight(gameUI.getRightPanel());
            root.setLeft(gameUI.getLeftPanel());
            Logger.info("游戏UI初始化完成");
            
            // 创建场景
            Scene scene = new Scene(root, GAME_WIDTH, GAME_HEIGHT);
            
            // 设置键盘和鼠标控制
            setupControls(scene);
            Logger.info("控制系统初始化完成");
            
            // 配置舞台
            stage.setTitle("瀛州纪 | Immortal Ledger - Java版");
            stage.setScene(scene);
            stage.setMaximized(true);
            
            // 设置关闭事件
            stage.setOnCloseRequest(event -> {
                Logger.info("游戏正在关闭...");
                gameEngine.stop();
                scene3DManager.stop();
                Logger.close();
            });
            
            stage.show();
            Logger.info("游戏窗口显示完成");
            
            // 启动游戏循环
            gameEngine.start();
            scene3DManager.start();
            Logger.info("游戏循环启动完成");
            
            Logger.info("=== 游戏启动成功！===");
            Logger.info("日志文件位置: yingzhou-game.log");
            Logger.info("控制说明: WASD移动, 鼠标控制视角, E交互, ESC菜单");
            
        } catch (Exception e) {
            Logger.error("游戏启动失败", e);
            throw e;
        }
    }

    private void setupControls(Scene scene) {
        // 键盘按下
        scene.setOnKeyPressed(event -> {
            try {
                KeyCode code = event.getCode();
                
                // 避免重复处理
                if (pressedKeys.contains(code)) {
                    return;
                }
                pressedKeys.add(code);
                
                Logger.debug("按键按下: " + code);
                
                switch (code) {
                    case W -> gameEngine.getPlayer().moveForward();
                    case S -> gameEngine.getPlayer().moveBackward();
                    case A -> gameEngine.getPlayer().moveLeft();
                    case D -> gameEngine.getPlayer().moveRight();
                    case SPACE -> gameEngine.getPlayer().jump();
                    case ESCAPE -> {
                        gameUI.toggleMenu();
                        Logger.info("切换菜单");
                    }
                    case E -> {
                        gameEngine.interactWithNearestNPC();
                        Logger.info("尝试与NPC交互");
                    }
                    default -> {}
                }
            } catch (Exception e) {
                Logger.error("处理按键按下事件出错", e);
            }
        });
        
        // 键盘释放
        scene.setOnKeyReleased(event -> {
            try {
                KeyCode code = event.getCode();
                pressedKeys.remove(code);
                
                Logger.debug("按键释放: " + code);
                
                switch (code) {
                    case W, S, A, D -> {
                        // 检查是否所有移动键都已释放
                        if (!pressedKeys.contains(KeyCode.W) && 
                            !pressedKeys.contains(KeyCode.S) && 
                            !pressedKeys.contains(KeyCode.A) && 
                            !pressedKeys.contains(KeyCode.D)) {
                            gameEngine.getPlayer().stopMoving();
                        }
                    }
                    default -> {}
                }
            } catch (Exception e) {
                Logger.error("处理按键释放事件出错", e);
            }
        });
        
        // 鼠标移动（视角控制）
        scene.setOnMouseMoved(event -> {
            try {
                if (!mouseInitialized) {
                    lastMouseX = event.getSceneX();
                    lastMouseY = event.getSceneY();
                    mouseInitialized = true;
                    return;
                }
                
                double deltaX = event.getSceneX() - lastMouseX;
                double deltaY = event.getSceneY() - lastMouseY;
                
                lastMouseX = event.getSceneX();
                lastMouseY = event.getSceneY();
                
                gameEngine.getPlayer().rotateView(deltaX, deltaY);
            } catch (Exception e) {
                Logger.error("处理鼠标移动事件出错", e);
            }
        });
        
        // 鼠标拖拽（视角控制）
        scene.setOnMouseDragged(event -> {
            try {
                if (!mouseInitialized) {
                    lastMouseX = event.getSceneX();
                    lastMouseY = event.getSceneY();
                    mouseInitialized = true;
                    return;
                }
                
                double deltaX = event.getSceneX() - lastMouseX;
                double deltaY = event.getSceneY() - lastMouseY;
                
                lastMouseX = event.getSceneX();
                lastMouseY = event.getSceneY();
                
                gameEngine.getPlayer().rotateView(deltaX, deltaY);
            } catch (Exception e) {
                Logger.error("处理鼠标拖拽事件出错", e);
            }
        });
        
        // 鼠标点击交互
        scene.setOnMouseClicked(event -> {
            try {
                if (event.getClickCount() == 2) {
                    Logger.info("双击鼠标，尝试与NPC交互");
                    gameEngine.interactWithNearestNPC();
                }
            } catch (Exception e) {
                Logger.error("处理鼠标点击事件出错", e);
            }
        });
        
        Logger.info("控制系统设置完成");
    }
}
