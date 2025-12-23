package com.yingzhou.ui;

import com.yingzhou.game.GameEngine;
import com.yingzhou.npc.BaseNPC;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
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
    private VBox leftPanel;
    private boolean menuVisible;
    private DialoguePanel dialoguePanel;
    private FragmentGallery fragmentGallery;
    private EpochPanel epochPanel;

    public GameUI(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        this.menuVisible = false;
        initialize();
    }

    private void initialize() {
        createTopBar();
        createBottomBar();
        createRightPanel();
        createLeftPanel();
        createDialoguePanel();
        createFragmentGallery();
        createEpochPanel();
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
        rightPanel = new VBox(15);
        rightPanel.setPadding(new Insets(15));
        rightPanel.setPrefWidth(280);
        rightPanel.setStyle(
            "-fx-background-color: rgba(17, 24, 39, 0.95);" +
            "-fx-border-color: rgba(6, 182, 212, 0.3);" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 10;" +
            "-fx-background-radius: 10;"
        );
        
        // NPC列表标题
        Label npcTitle = new Label("智能体 (AI-NPC)");
        npcTitle.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 18));
        npcTitle.setTextFill(Color.rgb(6, 182, 212));
        addGlowEffect(npcTitle);
        
        Label npcDesc = new Label("选择一个智能体进行交互");
        npcDesc.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 11));
        npcDesc.setTextFill(Color.rgb(156, 163, 175));
        
        // NPC按钮列表
        VBox npcList = new VBox(8);
        for (BaseNPC npc : gameEngine.getNPCManager().getNPCs()) {
            Button npcButton = createNPCButton(npc);
            npcList.getChildren().add(npcButton);
        }
        
        ScrollPane scrollPane = new ScrollPane(npcList);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scrollPane.setPrefHeight(400);
        
        rightPanel.getChildren().addAll(npcTitle, npcDesc, scrollPane);
    }
    
    private Button createNPCButton(BaseNPC npc) {
        VBox content = new VBox(5);
        content.setPadding(new Insets(10));
        
        Label nameLabel = new Label(npc.getName());
        nameLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 14));
        nameLabel.setTextFill(npc.getColor());
        
        Label statusLabel = new Label("交互次数: 0 | 距离: " + 
            String.format("%.1f", gameEngine.getPlayer().getPosition().distance(npc.getPosition())));
        statusLabel.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 10));
        statusLabel.setTextFill(Color.rgb(156, 163, 175));
        
        content.getChildren().addAll(nameLabel, statusLabel);
        
        Button button = new Button();
        button.setGraphic(content);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setStyle(
            "-fx-background-color: rgba(31, 41, 55, 0.8);" +
            "-fx-border-color: rgba(75, 85, 99, 0.5);" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 8;" +
            "-fx-background-radius: 8;" +
            "-fx-cursor: hand;"
        );
        
        button.setOnMouseEntered(e -> {
            button.setStyle(
                "-fx-background-color: rgba(6, 182, 212, 0.2);" +
                "-fx-border-color: rgb(6, 182, 212);" +
                "-fx-border-width: 2;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;" +
                "-fx-cursor: hand;"
            );
        });
        
        button.setOnMouseExited(e -> {
            button.setStyle(
                "-fx-background-color: rgba(31, 41, 55, 0.8);" +
                "-fx-border-color: rgba(75, 85, 99, 0.5);" +
                "-fx-border-width: 2;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;" +
                "-fx-cursor: hand;"
            );
        });
        
        button.setOnAction(e -> {
            if (dialoguePanel != null) {
                dialoguePanel.setNPC(npc);
                dialoguePanel.show();
            }
        });
        
        return button;
    }
    
    private void createLeftPanel() {
        leftPanel = new VBox(15);
        leftPanel.setPadding(new Insets(15));
        leftPanel.setPrefWidth(280);
        leftPanel.setStyle(
            "-fx-background-color: rgba(17, 24, 39, 0.95);" +
            "-fx-border-color: rgba(6, 182, 212, 0.3);" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 10;" +
            "-fx-background-radius: 10;"
        );
        
        // 世界状态
        Label worldTitle = new Label("世界状态");
        worldTitle.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 18));
        worldTitle.setTextFill(Color.rgb(6, 182, 212));
        addGlowEffect(worldTitle);
        
        VBox worldInfo = new VBox(8);
        worldInfo.setPadding(new Insets(10));
        worldInfo.setStyle(
            "-fx-background-color: rgba(0, 0, 0, 0.3);" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;"
        );
        
        Label epochInfo = new Label("当前纪元: " + gameEngine.getEpochManager().getCurrentEpoch().getName());
        epochInfo.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 12));
        epochInfo.setTextFill(Color.rgb(209, 213, 219));
        
        Label entropyInfo = new Label(String.format("熵化程度: %.1f%%", 
            gameEngine.getEpochManager().getEntropyLevel()));
        entropyInfo.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 12));
        entropyInfo.setTextFill(Color.rgb(239, 68, 68));
        
        worldInfo.getChildren().addAll(epochInfo, entropyInfo);
        
        // 快捷按钮
        VBox quickActions = new VBox(8);
        quickActions.setPadding(new Insets(10, 0, 0, 0));
        
        Button fragmentButton = createQuickButton("📚 记忆碎片", e -> fragmentGallery.show());
        Button epochButton = createQuickButton("🌌 纪元系统", e -> epochPanel.show());
        
        quickActions.getChildren().addAll(fragmentButton, epochButton);
        
        // 玩家信息
        Label playerTitle = new Label("玩家信息");
        playerTitle.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
        playerTitle.setTextFill(Color.rgb(6, 182, 212));
        
        VBox playerInfo = new VBox(8);
        playerInfo.setPadding(new Insets(10));
        playerInfo.setStyle(
            "-fx-background-color: rgba(0, 0, 0, 0.3);" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;"
        );
        
        Label posLabel = new Label(String.format("位置: (%.1f, %.1f, %.1f)",
            gameEngine.getPlayer().getPosition().getX(),
            gameEngine.getPlayer().getPosition().getY(),
            gameEngine.getPlayer().getPosition().getZ()));
        posLabel.setFont(Font.font("Consolas", FontWeight.NORMAL, 11));
        posLabel.setTextFill(Color.rgb(156, 163, 175));
        
        playerInfo.getChildren().add(posLabel);
        
        leftPanel.getChildren().addAll(worldTitle, worldInfo, quickActions, playerTitle, playerInfo);
    }
    
    private Button createQuickButton(String text, javafx.event.EventHandler<javafx.event.ActionEvent> handler) {
        Button button = new Button(text);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 12));
        button.setStyle(
            "-fx-background-color: rgba(6, 182, 212, 0.2);" +
            "-fx-text-fill: rgb(6, 182, 212);" +
            "-fx-border-color: rgb(6, 182, 212);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;" +
            "-fx-padding: 8;"
        );
        
        button.setOnMouseEntered(e -> button.setStyle(
            "-fx-background-color: rgb(6, 182, 212);" +
            "-fx-text-fill: black;" +
            "-fx-border-color: rgb(6, 182, 212);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;" +
            "-fx-padding: 8;"
        ));
        
        button.setOnMouseExited(e -> button.setStyle(
            "-fx-background-color: rgba(6, 182, 212, 0.2);" +
            "-fx-text-fill: rgb(6, 182, 212);" +
            "-fx-border-color: rgb(6, 182, 212);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;" +
            "-fx-padding: 8;"
        ));
        
        button.setOnAction(handler);
        return button;
    }
    
    private void createDialoguePanel() {
        dialoguePanel = new DialoguePanel(gameEngine);
    }
    
    private void createFragmentGallery() {
        fragmentGallery = new FragmentGallery(gameEngine);
    }
    
    private void createEpochPanel() {
        epochPanel = new EpochPanel(gameEngine);
    }
    
    private void addGlowEffect(Label label) {
        DropShadow glow = new DropShadow();
        glow.setColor(Color.rgb(6, 182, 212, 0.8));
        glow.setRadius(15);
        label.setEffect(glow);
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
    
    public VBox getLeftPanel() {
        return leftPanel;
    }
    
    public DialoguePanel getDialoguePanel() {
        return dialoguePanel;
    }
    
    public FragmentGallery getFragmentGallery() {
        return fragmentGallery;
    }
    
    public EpochPanel getEpochPanel() {
        return epochPanel;
    }
}
