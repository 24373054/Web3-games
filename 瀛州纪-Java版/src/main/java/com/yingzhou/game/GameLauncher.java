package com.yingzhou.game;

import com.yingzhou.scene3d.Scene3DManager;
import com.yingzhou.ui.GameUI;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

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

    public void start(Stage stage) {
        // 初始化游戏引擎
        gameEngine = new GameEngine();
        
        // 初始化3D场景管理器
        scene3DManager = new Scene3DManager(gameEngine);
        
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
        
        // 创建场景
        Scene scene = new Scene(root, GAME_WIDTH, GAME_HEIGHT);
        
        // 设置键盘和鼠标控制
        setupControls(scene);
        
        // 配置舞台
        stage.setTitle("瀛州纪 | Immortal Ledger - Java版");
        stage.setScene(scene);
        stage.setMaximized(true);
        stage.show();
        
        // 启动游戏循环
        gameEngine.start();
        scene3DManager.start();
    }

    private void setupControls(Scene scene) {
        // 键盘控制
        scene.setOnKeyPressed(event -> {
            switch (event.getCode()) {
                case W -> gameEngine.getPlayer().moveForward();
                case S -> gameEngine.getPlayer().moveBackward();
                case A -> gameEngine.getPlayer().moveLeft();
                case D -> gameEngine.getPlayer().moveRight();
                case SPACE -> gameEngine.getPlayer().jump();
                case ESCAPE -> gameUI.toggleMenu();
                case E -> gameEngine.interactWithNearestNPC();
                default -> {}
            }
        });
        
        scene.setOnKeyReleased(event -> {
            switch (event.getCode()) {
                case W, S, A, D -> gameEngine.getPlayer().stopMoving();
                default -> {}
            }
        });
        
        // 鼠标控制（视角）
        scene.setOnMouseMoved(event -> {
            double deltaX = event.getSceneX() - GAME_WIDTH / 2.0;
            double deltaY = event.getSceneY() - GAME_HEIGHT / 2.0;
            gameEngine.getPlayer().rotateView(deltaX, deltaY);
        });
        
        // 鼠标点击交互
        scene.setOnMouseClicked(event -> {
            if (event.getClickCount() == 2) {
                gameEngine.interactWithNearestNPC();
            }
        });
    }
}
