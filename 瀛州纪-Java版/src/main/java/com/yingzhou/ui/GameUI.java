package com.yingzhou.ui;

import com.yingzhou.game.GameEngine;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

/**
 * 游戏UI管理器
 * 管理所有UI元素
 */
public class GameUI {
    
    private GameEngine gameEngine;
    private HBox topBar;
    private HBox bottomBar;
    private VBox rightPanel;
    private boolean menuVisible;

    public GameUI(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        this.menuVisible = false;
        initialize();
    }

    private void initialize() {
        createTopBar();
        createBottomBar();
        createRightPanel();
    }

    private void createTopBar() {
        topBar = new HBox(20);
        topBar.setPadding(new Insets(10));
        topBar.setStyle("-fx-background-color: rgba(17, 24, 39, 0.8);");
        
        // 纪元显示
        Label epochLabel = new Label();
        epochLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 18));
        epochLabel.setTextFill(Color.rgb(6, 182, 212));
        updateEpochLabel(epochLabel);
        
        // 碎片计数
        Label fragmentLabel = new Label();
        fragmentLabel.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 16));
        fragmentLabel.setTextFill(Color.rgb(209, 213, 219));
        updateFragmentLabel(fragmentLabel);
        
        // 熵化程度
        Label entropyLabel = new Label();
        entropyLabel.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 16));
        entropyLabel.setTextFill(Color.rgb(239, 68, 68));
        updateEntropyLabel(entropyLabel);
        
        topBar.getChildren().addAll(epochLabel, fragmentLabel, entropyLabel);
        
        // 启动定时更新
        startUIUpdateTimer(epochLabel, fragmentLabel, entropyLabel);
    }
    
    private void updateEpochLabel(Label label) {
        label.setText("当前纪元: " + gameEngine.getEpochManager().getCurrentEpoch().getName());
    }
    
    private void updateFragmentLabel(Label label) {
        label.setText("记忆碎片: " + gameEngine.getEpochManager().getFragmentsCollected() + "/18");
    }
    
    private void updateEntropyLabel(Label label) {
        label.setText(String.format("熵化程度: %.1f%%", gameEngine.getEpochManager().getEntropyLevel()));
    }
    
    private void startUIUpdateTimer(Label epochLabel, Label fragmentLabel, Label entropyLabel) {
        javafx.animation.AnimationTimer timer = new javafx.animation.AnimationTimer() {
            private long lastUpdate = 0;
            
            @Override
            public void handle(long now) {
                // 每秒更新一次UI
                if (now - lastUpdate >= 1_000_000_000) {
                    updateEpochLabel(epochLabel);
                    updateFragmentLabel(fragmentLabel);
                    updateEntropyLabel(entropyLabel);
                    lastUpdate = now;
                }
            }
        };
        timer.start();
    }

    private void createBottomBar() {
        bottomBar = new HBox(10);
        bottomBar.setPadding(new Insets(10));
        bottomBar.setAlignment(Pos.CENTER);
        bottomBar.setStyle("-fx-background-color: rgba(17, 24, 39, 0.8);");
        
        Label controlsLabel = new Label("控制: WASD移动 | 鼠标视角 | E交互 | ESC菜单");
        controlsLabel.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 14));
        controlsLabel.setTextFill(Color.rgb(156, 163, 175));
        
        bottomBar.getChildren().add(controlsLabel);
    }

    private void createRightPanel() {
        rightPanel = new VBox(10);
        rightPanel.setPadding(new Insets(10));
        rightPanel.setPrefWidth(250);
        rightPanel.setStyle("-fx-background-color: rgba(17, 24, 39, 0.9);");
        
        Label titleLabel = new Label("任务目标");
        titleLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
        titleLabel.setTextFill(Color.rgb(6, 182, 212));
        
        Label task1 = new Label("• 寻找史官");
        task1.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 14));
        task1.setTextFill(Color.rgb(209, 213, 219));
        
        Label task2 = new Label("• 收集记忆碎片");
        task2.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 14));
        task2.setTextFill(Color.rgb(209, 213, 219));
        
        Label task3 = new Label("• 见证文明历史");
        task3.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 14));
        task3.setTextFill(Color.rgb(209, 213, 219));
        
        rightPanel.getChildren().addAll(titleLabel, task1, task2, task3);
    }

    public void toggleMenu() {
        menuVisible = !menuVisible;
        // TODO: 显示/隐藏菜单
        System.out.println("菜单切换: " + (menuVisible ? "显示" : "隐藏"));
    }

    // Getters
    public HBox getTopBar() {
        return topBar;
    }

    public HBox getBottomBar() {
        return bottomBar;
    }

    public VBox getRightPanel() {
        return rightPanel;
    }
}
