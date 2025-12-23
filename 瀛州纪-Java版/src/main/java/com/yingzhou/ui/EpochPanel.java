package com.yingzhou.ui;

import com.yingzhou.game.GameEngine;
import com.yingzhou.game.epoch.EpochManager;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Modality;
import javafx.stage.Stage;

/**
 * 纪元面板
 * 显示纪元进度和推进系统
 */
public class EpochPanel {
    
    private GameEngine gameEngine;
    private Stage epochStage;
    private Label currentEpochLabel;
    private Label epochDescLabel;
    private ProgressBar epochProgress;
    private Label progressLabel;
    private Button advanceButton;
    private HBox timelineBox;
    
    private static final String[] EPOCH_NAMES = {"创世", "萌芽", "繁盛", "熵化", "毁灭"};
    private static final String[] EPOCH_ICONS = {"🌌", "🌱", "✨", "⚡", "💀"};
    private static final Color[] EPOCH_COLORS = {
        Color.CYAN, Color.LIME, Color.YELLOW, Color.RED, Color.WHITE
    };
    private static final String[] EPOCH_DESCRIPTIONS = {
        "在混沌之初，第一个智能合约被部署，瀛州文明由此诞生。",
        "文明开始生长，数字生命逐渐觉醒，秩序从混沌中涌现。",
        "瀛州达到巅峰，无数智能体共同创造出辉煌的数字文明。",
        "秩序开始崩溃，熵化蔓延，文明走向不可逆的衰败。",
        "终焉已至，一切归于虚无，但账本将永远记录这段历史。"
    };

    public EpochPanel(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        createEpochWindow();
    }

    private void createEpochWindow() {
        epochStage = new Stage();
        epochStage.initModality(Modality.NONE);
        epochStage.setTitle("纪元系统");
        
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom, #000000, #1f2937);");
        root.setPadding(new Insets(20));
        
        // 顶部 - 标题
        VBox header = createHeader();
        root.setTop(header);
        
        // 中间 - 当前纪元信息和时间线
        VBox center = createCenter();
        root.setCenter(center);
        
        // 底部 - 推进条件和按钮
        VBox footer = createFooter();
        root.setBottom(footer);
        
        Scene scene = new Scene(root, 800, 700);
        epochStage.setScene(scene);
    }

    private VBox createHeader() {
        VBox header = new VBox(10);
        header.setPadding(new Insets(0, 0, 20, 0));
        
        Label title = new Label("🌌 纪元系统");
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 24));
        title.setTextFill(Color.rgb(6, 182, 212));
        addGlowEffect(title);
        
        header.getChildren().add(title);
        return header;
    }

    private VBox createCenter() {
        VBox center = new VBox(20);
        center.setAlignment(Pos.CENTER);
        
        // 当前纪元信息卡片
        VBox currentEpochCard = createCurrentEpochCard();
        
        // 纪元时间线
        VBox timeline = createTimeline();
        
        center.getChildren().addAll(currentEpochCard, timeline);
        return center;
    }

    private VBox createCurrentEpochCard() {
        VBox card = new VBox(10);
        card.setPadding(new Insets(20));
        card.setAlignment(Pos.CENTER);
        card.setStyle(
            "-fx-background-color: rgba(17, 24, 39, 0.95);" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 10;" +
            "-fx-background-radius: 10;"
        );
        
        HBox titleBox = new HBox(10);
        titleBox.setAlignment(Pos.CENTER);
        
        Label iconLabel = new Label();
        iconLabel.setFont(Font.font(36));
        
        currentEpochLabel = new Label();
        currentEpochLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 28));
        
        Label epochNumLabel = new Label();
        epochNumLabel.setFont(Font.font("Microsoft YaHei", 14));
        epochNumLabel.setTextFill(Color.rgb(156, 163, 175));
        
        titleBox.getChildren().addAll(iconLabel, currentEpochLabel, epochNumLabel);
        
        epochDescLabel = new Label();
        epochDescLabel.setFont(Font.font("Microsoft YaHei", 13));
        epochDescLabel.setTextFill(Color.rgb(209, 213, 219));
        epochDescLabel.setWrapText(true);
        epochDescLabel.setMaxWidth(600);
        epochDescLabel.setAlignment(Pos.CENTER);
        
        card.getChildren().addAll(titleBox, epochDescLabel);
        
        // 更新当前纪元信息
        updateCurrentEpochInfo(card, iconLabel, epochNumLabel);
        
        return card;
    }

    private void updateCurrentEpochInfo(VBox card, Label iconLabel, Label epochNumLabel) {
        EpochManager.Epoch currentEpoch = gameEngine.getEpochManager().getCurrentEpoch();
        int epochIndex = currentEpoch.ordinal();
        
        iconLabel.setText(EPOCH_ICONS[epochIndex]);
        currentEpochLabel.setText(EPOCH_NAMES[epochIndex]);
        currentEpochLabel.setTextFill(EPOCH_COLORS[epochIndex]);
        epochNumLabel.setText("纪元 " + (epochIndex + 1) + "/5");
        epochDescLabel.setText(EPOCH_DESCRIPTIONS[epochIndex]);
        
        // 更新边框颜色
        Color color = EPOCH_COLORS[epochIndex];
        card.setStyle(
            "-fx-background-color: rgba(17, 24, 39, 0.95);" +
            "-fx-border-color: rgb(" + (int)(color.getRed()*255) + "," + 
                                      (int)(color.getGreen()*255) + "," + 
                                      (int)(color.getBlue()*255) + ");" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 10;" +
            "-fx-background-radius: 10;"
        );
        
        // 添加发光效果
        DropShadow glow = new DropShadow();
        glow.setColor(Color.rgb((int)(color.getRed()*255), 
                                (int)(color.getGreen()*255), 
                                (int)(color.getBlue()*255), 0.4));
        glow.setRadius(20);
        card.setEffect(glow);
    }

    private VBox createTimeline() {
        VBox timeline = new VBox(15);
        timeline.setAlignment(Pos.CENTER);
        
        Label timelineTitle = new Label("文明演化进程");
        timelineTitle.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 14));
        timelineTitle.setTextFill(Color.rgb(156, 163, 175));
        
        // 进度条
        ProgressBar overallProgress = new ProgressBar();
        overallProgress.setPrefWidth(600);
        overallProgress.setPrefHeight(8);
        int currentIndex = gameEngine.getEpochManager().getCurrentEpoch().ordinal();
        overallProgress.setProgress(currentIndex / 4.0);
        // 根据当前纪元设置颜色
        String[] epochColors = {"#06b6d4", "#10b981", "#eab308", "#ef4444", "#ffffff"};
        overallProgress.setStyle("-fx-accent: " + epochColors[currentIndex] + ";");
        
        // 纪元节点
        timelineBox = new HBox(0);
        timelineBox.setAlignment(Pos.CENTER);
        timelineBox.setPrefWidth(600);
        
        for (int i = 0; i < 5; i++) {
            VBox node = createTimelineNode(i);
            HBox.setHgrow(node, Priority.ALWAYS);
            timelineBox.getChildren().add(node);
        }
        
        timeline.getChildren().addAll(timelineTitle, overallProgress, timelineBox);
        return timeline;
    }

    private VBox createTimelineNode(int epochIndex) {
        VBox node = new VBox(8);
        node.setAlignment(Pos.CENTER);
        node.setPrefWidth(120);
        
        int currentIndex = gameEngine.getEpochManager().getCurrentEpoch().ordinal();
        boolean isPast = epochIndex < currentIndex;
        boolean isCurrent = epochIndex == currentIndex;
        boolean isFuture = epochIndex > currentIndex;
        
        // 节点圆圈
        StackPane circle = new StackPane();
        circle.setPrefSize(50, 50);
        circle.setMaxSize(50, 50);
        circle.setMinSize(50, 50);
        
        Color color = EPOCH_COLORS[epochIndex];
        String bgColor = isPast || isCurrent ? 
            String.format("rgb(%d,%d,%d)", (int)(color.getRed()*255), 
                                          (int)(color.getGreen()*255), 
                                          (int)(color.getBlue()*255)) : 
            "transparent";
        
        circle.setStyle(
            "-fx-background-color: " + bgColor + ";" +
            "-fx-border-color: rgb(" + (int)(color.getRed()*255) + "," + 
                                      (int)(color.getGreen()*255) + "," + 
                                      (int)(color.getBlue()*255) + ");" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 25;" +
            "-fx-background-radius: 25;"
        );
        
        if (isCurrent) {
            DropShadow glow = new DropShadow();
            glow.setColor(color);
            glow.setRadius(20);
            circle.setEffect(glow);
        }
        
        Label iconLabel = new Label(isPast ? "✓" : EPOCH_ICONS[epochIndex]);
        iconLabel.setFont(Font.font(20));
        iconLabel.setTextFill(isPast || isCurrent ? Color.BLACK : color);
        
        circle.getChildren().add(iconLabel);
        
        // 纪元名称
        Label nameLabel = new Label(EPOCH_NAMES[epochIndex]);
        nameLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 11));
        nameLabel.setTextFill(isPast || isCurrent ? color : Color.rgb(102, 102, 102));
        
        node.getChildren().addAll(circle, nameLabel);
        
        // 设置透明度
        if (isFuture) {
            node.setOpacity(0.4);
        }
        
        return node;
    }

    private VBox createFooter() {
        VBox footer = new VBox(15);
        footer.setPadding(new Insets(20, 0, 0, 0));
        
        int currentIndex = gameEngine.getEpochManager().getCurrentEpoch().ordinal();
        
        if (currentIndex < 4) {
            // 推进条件
            VBox conditionsBox = createConditionsBox(currentIndex);
            
            // 推进按钮
            advanceButton = new Button();
            advanceButton.setPrefWidth(600);
            advanceButton.setPrefHeight(50);
            advanceButton.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
            
            updateAdvanceButton();
            
            advanceButton.setOnAction(e -> handleAdvanceEpoch());
            
            footer.getChildren().addAll(conditionsBox, advanceButton);
        } else {
            // 终焉提示
            VBox finalBox = createFinalEpochBox();
            footer.getChildren().add(finalBox);
        }
        
        // 提示信息
        VBox tipsBox = createTipsBox();
        footer.getChildren().add(tipsBox);
        
        return footer;
    }

    private VBox createConditionsBox(int currentIndex) {
        VBox box = new VBox(10);
        box.setPadding(new Insets(15));
        box.setStyle(
            "-fx-background-color: rgba(17, 24, 39, 0.8);" +
            "-fx-border-color: rgba(75, 85, 99, 0.5);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 8;" +
            "-fx-background-radius: 8;"
        );
        
        Color nextColor = EPOCH_COLORS[currentIndex + 1];
        Label title = new Label("推进到 " + EPOCH_NAMES[currentIndex + 1] + "纪元 " + EPOCH_ICONS[currentIndex + 1]);
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
        title.setTextFill(nextColor);
        
        // 碎片要求
        HBox fragmentReq = new HBox(10);
        fragmentReq.setAlignment(Pos.CENTER_LEFT);
        
        Label fragmentLabel = new Label("📚 收集记忆碎片");
        fragmentLabel.setFont(Font.font("Microsoft YaHei", 13));
        fragmentLabel.setTextFill(Color.rgb(209, 213, 219));
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        int collected = gameEngine.getEpochManager().getFragmentsCollected();
        int required = 3 * (currentIndex + 1); // 每个纪元需要更多碎片
        
        progressLabel = new Label(collected + " / " + required);
        progressLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 13));
        progressLabel.setTextFill(collected >= required ? Color.LIME : Color.YELLOW);
        
        fragmentReq.getChildren().addAll(fragmentLabel, spacer, progressLabel);
        
        epochProgress = new ProgressBar();
        epochProgress.setPrefWidth(Double.MAX_VALUE);
        epochProgress.setProgress(Math.min(1.0, (double)collected / required));
        epochProgress.setStyle(
            "-fx-accent: " + (collected >= required ? "#10b981" : "#eab308") + ";"
        );
        
        if (collected < required) {
            Label hintLabel = new Label("还需收集 " + (required - collected) + " 个碎片");
            hintLabel.setFont(Font.font("Microsoft YaHei", 10));
            hintLabel.setTextFill(Color.rgb(107, 114, 128));
            box.getChildren().addAll(title, fragmentReq, epochProgress, hintLabel);
        } else {
            box.getChildren().addAll(title, fragmentReq, epochProgress);
        }
        
        return box;
    }

    private void updateAdvanceButton() {
        int currentIndex = gameEngine.getEpochManager().getCurrentEpoch().ordinal();
        int collected = gameEngine.getEpochManager().getFragmentsCollected();
        int required = 3 * (currentIndex + 1);
        boolean canAdvance = collected >= required;
        
        Color nextColor = EPOCH_COLORS[currentIndex + 1];
        
        if (canAdvance) {
            advanceButton.setText("✨ 推进到 " + EPOCH_NAMES[currentIndex + 1] + "纪元");
            advanceButton.setStyle(
                "-fx-background-color: linear-gradient(to right, " +
                "rgb(" + (int)(EPOCH_COLORS[currentIndex].getRed()*255) + "," +
                        (int)(EPOCH_COLORS[currentIndex].getGreen()*255) + "," +
                        (int)(EPOCH_COLORS[currentIndex].getBlue()*255) + "), " +
                "rgb(" + (int)(nextColor.getRed()*255) + "," +
                        (int)(nextColor.getGreen()*255) + "," +
                        (int)(nextColor.getBlue()*255) + "));" +
                "-fx-text-fill: black;" +
                "-fx-font-weight: bold;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;" +
                "-fx-cursor: hand;"
            );
            advanceButton.setDisable(false);
        } else {
            advanceButton.setText("🔒 条件未满足");
            advanceButton.setStyle(
                "-fx-background-color: #1f2937;" +
                "-fx-text-fill: #4b5563;" +
                "-fx-font-weight: bold;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;"
            );
            advanceButton.setDisable(true);
        }
    }

    private void handleAdvanceEpoch() {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("推进纪元");
        confirm.setHeaderText("确定要推进到下一个纪元吗？");
        confirm.setContentText("纪元推进不可逆，请谨慎选择！");
        
        confirm.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                gameEngine.getEpochManager().advanceEpoch();
                refresh();
                
                Alert success = new Alert(Alert.AlertType.INFORMATION);
                success.setTitle("纪元推进成功");
                success.setHeaderText("✨ 成功推进到新纪元！");
                success.setContentText("瀛州文明进入了新的阶段...");
                success.showAndWait();
            }
        });
    }

    private VBox createFinalEpochBox() {
        VBox box = new VBox(15);
        box.setPadding(new Insets(20));
        box.setAlignment(Pos.CENTER);
        box.setStyle(
            "-fx-background-color: rgba(255, 255, 255, 0.1);" +
            "-fx-border-color: white;" +
            "-fx-border-width: 2;" +
            "-fx-border-radius: 10;" +
            "-fx-background-radius: 10;"
        );
        
        DropShadow glow = new DropShadow();
        glow.setColor(Color.WHITE);
        glow.setRadius(20);
        box.setEffect(glow);
        
        Label icon = new Label("💀");
        icon.setFont(Font.font(60));
        
        Label title = new Label("⚠️ 毁灭纪元");
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 24));
        title.setTextFill(Color.WHITE);
        
        Label desc = new Label(
            "你已经到达瀛州文明的终点。\n" +
            "所有合约将进入只读状态。\n" +
            "但账本将永远保存这段历史。"
        );
        desc.setFont(Font.font("Microsoft YaHei", 13));
        desc.setTextFill(Color.rgb(209, 213, 219));
        desc.setWrapText(true);
        desc.setMaxWidth(500);
        desc.setAlignment(Pos.CENTER);
        
        box.getChildren().addAll(icon, title, desc);
        return box;
    }

    private VBox createTipsBox() {
        VBox box = new VBox(10);
        box.setPadding(new Insets(15));
        box.setStyle(
            "-fx-background-color: rgba(0, 0, 0, 0.3);" +
            "-fx-border-color: rgba(75, 85, 99, 0.5);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 8;" +
            "-fx-background-radius: 8;"
        );
        
        Label title = new Label("💡 纪元系统说明：");
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 12));
        title.setTextFill(Color.rgb(6, 182, 212));
        
        VBox tips = new VBox(5);
        tips.setPadding(new Insets(5, 0, 0, 10));
        
        String[] tipTexts = {
            "🌌 瀛州文明经历5个纪元：创世 → 萌芽 → 繁盛 → 熵化 → 毁灭",
            "📚 收集记忆碎片可推进纪元",
            "🎨 每个纪元有独特的视觉风格和色调",
            "🤖 AI-NPC在不同纪元有不同的表现和对话",
            "⏰ 纪元推进不可逆，请谨慎选择"
        };
        
        for (String tipText : tipTexts) {
            Label tip = new Label(tipText);
            tip.setFont(Font.font("Microsoft YaHei", 11));
            tip.setTextFill(Color.rgb(156, 163, 175));
            tips.getChildren().add(tip);
        }
        
        box.getChildren().addAll(title, tips);
        return box;
    }

    private void addGlowEffect(Label label) {
        DropShadow glow = new DropShadow();
        glow.setColor(Color.rgb(6, 182, 212, 0.8));
        glow.setRadius(15);
        label.setEffect(glow);
    }

    public void show() {
        refresh();
        epochStage.show();
        epochStage.toFront();
    }

    public void hide() {
        epochStage.hide();
    }
    
    public void refresh() {
        // 重新创建窗口内容以更新所有信息
        createEpochWindow();
    }
}
