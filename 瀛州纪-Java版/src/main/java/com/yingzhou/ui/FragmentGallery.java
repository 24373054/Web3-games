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

import java.util.ArrayList;
import java.util.List;

/**
 * 记忆碎片收藏馆
 * 显示玩家收集的记忆碎片
 */
public class FragmentGallery {
    
    private GameEngine gameEngine;
    private Stage galleryStage;
    private GridPane fragmentGrid;
    private ProgressBar mainProgress;
    private ProgressBar hiddenProgress;
    private Label mainProgressLabel;
    private Label hiddenProgressLabel;
    
    private static class Fragment {
        int id;
        String title;
        String content;
        String triggerKeyword;
        int epoch;
        boolean isHidden;
        boolean owned;
        
        Fragment(int id, String title, String content, String keyword, int epoch, boolean hidden, boolean owned) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.triggerKeyword = keyword;
            this.epoch = epoch;
            this.isHidden = hidden;
            this.owned = owned;
        }
    }
    
    private List<Fragment> fragments;
    private static final String[] EPOCH_NAMES = {"创世", "萌芽", "繁盛", "熵化", "毁灭"};
    private static final Color[] EPOCH_COLORS = {
        Color.CYAN, Color.LIME, Color.YELLOW, Color.RED, Color.WHITE
    };

    public FragmentGallery(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        this.fragments = new ArrayList<>();
        initializeFragments();
        createGalleryWindow();
    }

    private void initializeFragments() {
        // 主要碎片 (8个)
        fragments.add(new Fragment(0, "创世之光", "在混沌之初，第一个智能合约被部署...", "创世", 0, false, false));
        fragments.add(new Fragment(1, "萌芽之种", "文明开始生长，第一批数字生命诞生...", "萌芽", 1, false, false));
        fragments.add(new Fragment(2, "繁盛之歌", "瀛州达到巅峰，无数智能体共同创造...", "繁盛", 2, false, false));
        fragments.add(new Fragment(3, "熵化之始", "秩序开始崩溃，混乱逐渐蔓延...", "熵化", 3, false, false));
        fragments.add(new Fragment(4, "毁灭之兆", "终焉即将到来，一切归于虚无...", "毁灭", 4, false, false));
        fragments.add(new Fragment(5, "史官的记忆", "史官记录下的最后文字...", "历史", 0, false, false));
        fragments.add(new Fragment(6, "工匠的遗产", "工匠留下的最后作品...", "创造", 1, false, false));
        fragments.add(new Fragment(7, "商序的账本", "商序保存的交易记录...", "交易", 2, false, false));
        
        // 隐藏碎片 (10个)
        fragments.add(new Fragment(8, "创世密码", "隐藏在创世区块中的秘密...", "密码", 0, true, false));
        fragments.add(new Fragment(9, "先知预言", "先知看到的未来景象...", "预言", 3, true, false));
        fragments.add(new Fragment(10, "遗忘者的真相", "遗忘者隐藏的真实身份...", "真相", 4, true, false));
        fragments.add(new Fragment(11, "时间悖论", "关于时间循环的秘密...", "时间", 2, true, false));
        fragments.add(new Fragment(12, "虚空之眼", "窥视虚空的禁忌知识...", "虚空", 4, true, false));
        fragments.add(new Fragment(13, "永恒契约", "永不消逝的智能合约...", "永恒", 0, true, false));
        fragments.add(new Fragment(14, "熵之源", "熵化的真正起源...", "起源", 3, true, false));
        fragments.add(new Fragment(15, "重生之路", "文明重生的可能性...", "重生", 4, true, false));
        fragments.add(new Fragment(16, "平行世界", "另一个瀛州的存在...", "平行", 2, true, false));
        fragments.add(new Fragment(17, "终极真理", "关于一切的终极答案...", "真理", 4, true, false));
    }

    private void createGalleryWindow() {
        galleryStage = new Stage();
        galleryStage.initModality(Modality.NONE);
        galleryStage.setTitle("记忆碎片收藏馆");
        
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom, #111827, #1f2937);");
        root.setPadding(new Insets(20));
        
        // 顶部 - 标题和进度
        VBox header = createHeader();
        root.setTop(header);
        
        // 中间 - 碎片网格
        ScrollPane scrollPane = new ScrollPane();
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: rgba(0, 0, 0, 0.5);");
        
        fragmentGrid = new GridPane();
        fragmentGrid.setHgap(15);
        fragmentGrid.setVgap(15);
        fragmentGrid.setPadding(new Insets(20));
        fragmentGrid.setAlignment(Pos.CENTER);
        
        updateFragmentGrid();
        scrollPane.setContent(fragmentGrid);
        root.setCenter(scrollPane);
        
        // 底部 - 提示信息
        VBox footer = createFooter();
        root.setBottom(footer);
        
        Scene scene = new Scene(root, 900, 700);
        galleryStage.setScene(scene);
    }

    private VBox createHeader() {
        VBox header = new VBox(15);
        header.setPadding(new Insets(0, 0, 20, 0));
        
        Label title = new Label("📚 记忆碎片收藏");
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 24));
        title.setTextFill(Color.rgb(6, 182, 212));
        addGlowEffect(title);
        
        // 主要碎片进度
        VBox mainProgressBox = new VBox(5);
        mainProgressLabel = new Label("主要碎片: 0/8 (0%)");
        mainProgressLabel.setFont(Font.font("Microsoft YaHei", 13));
        mainProgressLabel.setTextFill(Color.rgb(209, 213, 219));
        
        mainProgress = new ProgressBar(0);
        mainProgress.setPrefWidth(400);
        mainProgress.setStyle("-fx-accent: linear-gradient(to right, #3b82f6, #06b6d4);");
        
        mainProgressBox.getChildren().addAll(mainProgressLabel, mainProgress);
        
        // 隐藏碎片进度
        VBox hiddenProgressBox = new VBox(5);
        hiddenProgressLabel = new Label("隐藏碎片: 0/10 (0%)");
        hiddenProgressLabel.setFont(Font.font("Microsoft YaHei", 13));
        hiddenProgressLabel.setTextFill(Color.rgb(209, 213, 219));
        
        hiddenProgress = new ProgressBar(0);
        hiddenProgress.setPrefWidth(400);
        hiddenProgress.setStyle("-fx-accent: linear-gradient(to right, #eab308, #f97316);");
        
        hiddenProgressBox.getChildren().addAll(hiddenProgressLabel, hiddenProgress);
        
        header.getChildren().addAll(title, mainProgressBox, hiddenProgressBox);
        return header;
    }

    private void updateFragmentGrid() {
        fragmentGrid.getChildren().clear();
        
        int col = 0;
        int row = 0;
        int maxCols = 6;
        
        for (Fragment fragment : fragments) {
            VBox card = createFragmentCard(fragment);
            fragmentGrid.add(card, col, row);
            
            col++;
            if (col >= maxCols) {
                col = 0;
                row++;
            }
        }
        
        updateProgress();
    }

    private VBox createFragmentCard(Fragment fragment) {
        VBox card = new VBox(8);
        card.setPrefSize(120, 140);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(10));
        
        if (fragment.owned) {
            card.setStyle(
                "-fx-background-color: rgba(17, 24, 39, 0.9);" +
                "-fx-border-color: rgb(6, 182, 212);" +
                "-fx-border-width: 2;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;" +
                "-fx-cursor: hand;"
            );
            
            card.setOnMouseEntered(e -> {
                card.setStyle(
                    "-fx-background-color: rgba(6, 182, 212, 0.2);" +
                    "-fx-border-color: rgb(6, 182, 212);" +
                    "-fx-border-width: 2;" +
                    "-fx-border-radius: 8;" +
                    "-fx-background-radius: 8;" +
                    "-fx-cursor: hand;"
                );
                card.setScaleX(1.05);
                card.setScaleY(1.05);
            });
            
            card.setOnMouseExited(e -> {
                card.setStyle(
                    "-fx-background-color: rgba(17, 24, 39, 0.9);" +
                    "-fx-border-color: rgb(6, 182, 212);" +
                    "-fx-border-width: 2;" +
                    "-fx-border-radius: 8;" +
                    "-fx-background-radius: 8;" +
                    "-fx-cursor: hand;"
                );
                card.setScaleX(1.0);
                card.setScaleY(1.0);
            });
            
            card.setOnMouseClicked(e -> showFragmentDetail(fragment));
        } else {
            card.setStyle(
                "-fx-background-color: rgba(31, 41, 55, 0.5);" +
                "-fx-border-color: rgba(75, 85, 99, 0.5);" +
                "-fx-border-width: 2;" +
                "-fx-border-radius: 8;" +
                "-fx-background-radius: 8;" +
                "-fx-opacity: 0.5;"
            );
        }
        
        // 稀有度标识
        Label rarityLabel = new Label(fragment.isHidden ? "🔶" : "🔷");
        rarityLabel.setFont(Font.font(18));
        
        // ID
        Label idLabel = new Label("#" + fragment.id);
        idLabel.setFont(Font.font("Consolas", 10));
        idLabel.setTextFill(Color.rgb(156, 163, 175));
        
        // 图标
        Label iconLabel = new Label(fragment.owned ? "✓" : "❓");
        iconLabel.setFont(Font.font(36));
        iconLabel.setTextFill(fragment.owned ? Color.rgb(6, 182, 212) : Color.rgb(75, 85, 99));
        
        // 标题
        Label titleLabel = new Label(fragment.owned ? fragment.title : "???");
        titleLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 10));
        titleLabel.setTextFill(Color.WHITE);
        titleLabel.setWrapText(true);
        titleLabel.setAlignment(Pos.CENTER);
        titleLabel.setMaxWidth(100);
        
        // 纪元标签
        Label epochLabel = new Label(EPOCH_NAMES[fragment.epoch]);
        epochLabel.setFont(Font.font("Microsoft YaHei", 9));
        epochLabel.setTextFill(EPOCH_COLORS[fragment.epoch]);
        epochLabel.setStyle(
            "-fx-background-color: rgba(" + 
            (int)(EPOCH_COLORS[fragment.epoch].getRed() * 255) + "," +
            (int)(EPOCH_COLORS[fragment.epoch].getGreen() * 255) + "," +
            (int)(EPOCH_COLORS[fragment.epoch].getBlue() * 255) + ",0.2);" +
            "-fx-padding: 2 6;" +
            "-fx-border-radius: 3;" +
            "-fx-background-radius: 3;"
        );
        
        card.getChildren().addAll(rarityLabel, idLabel, iconLabel, titleLabel, epochLabel);
        return card;
    }

    private void showFragmentDetail(Fragment fragment) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("记忆碎片详情");
        alert.setHeaderText(fragment.title + " #" + fragment.id);
        
        VBox content = new VBox(10);
        content.setPadding(new Insets(10));
        
        Label epochInfo = new Label("纪元: " + EPOCH_NAMES[fragment.epoch]);
        epochInfo.setTextFill(EPOCH_COLORS[fragment.epoch]);
        
        Label typeInfo = new Label("类型: " + (fragment.isHidden ? "隐藏碎片🔶" : "主要碎片🔷"));
        
        if (fragment.triggerKeyword != null && !fragment.triggerKeyword.isEmpty()) {
            Label keywordInfo = new Label("触发关键词: 「" + fragment.triggerKeyword + "」");
            keywordInfo.setStyle("-fx-text-fill: #eab308;");
            content.getChildren().add(keywordInfo);
        }
        
        Label contentLabel = new Label(fragment.content);
        contentLabel.setWrapText(true);
        contentLabel.setMaxWidth(400);
        contentLabel.setStyle("-fx-text-fill: #d1d5db;");
        
        content.getChildren().addAll(epochInfo, typeInfo, contentLabel);
        
        alert.getDialogPane().setContent(content);
        alert.showAndWait();
    }

    private void updateProgress() {
        int mainCollected = (int) fragments.stream().filter(f -> !f.isHidden && f.owned).count();
        int hiddenCollected = (int) fragments.stream().filter(f -> f.isHidden && f.owned).count();
        
        mainProgress.setProgress(mainCollected / 8.0);
        mainProgressLabel.setText(String.format("主要碎片: %d/8 (%d%%)", mainCollected, (int)(mainCollected / 8.0 * 100)));
        
        hiddenProgress.setProgress(hiddenCollected / 10.0);
        hiddenProgressLabel.setText(String.format("隐藏碎片: %d/10 (%d%%)", hiddenCollected, (int)(hiddenCollected / 10.0 * 100)));
    }

    private VBox createFooter() {
        VBox footer = new VBox(10);
        footer.setPadding(new Insets(20, 0, 0, 0));
        footer.setStyle(
            "-fx-background-color: rgba(0, 0, 0, 0.3);" +
            "-fx-border-color: rgba(75, 85, 99, 0.5);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 8;" +
            "-fx-background-radius: 8;" +
            "-fx-padding: 15;"
        );
        
        Label tipTitle = new Label("💡 获取碎片的方法：");
        tipTitle.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 12));
        tipTitle.setTextFill(Color.rgb(6, 182, 212));
        
        VBox tips = new VBox(5);
        tips.setPadding(new Insets(5, 0, 0, 10));
        
        String[] tipTexts = {
            "🔷 主要碎片：通过完成AI-NPC的小游戏挑战获得",
            "🔶 隐藏碎片：在对话中提到特定关键词触发",
            "🎯 完成度越高，获得碎片的概率越大",
            "🔍 探索不同纪元，发现更多隐藏秘密"
        };
        
        for (String tipText : tipTexts) {
            Label tip = new Label(tipText);
            tip.setFont(Font.font("Microsoft YaHei", 11));
            tip.setTextFill(Color.rgb(156, 163, 175));
            tips.getChildren().add(tip);
        }
        
        footer.getChildren().addAll(tipTitle, tips);
        return footer;
    }

    private void addGlowEffect(Label label) {
        DropShadow glow = new DropShadow();
        glow.setColor(Color.rgb(6, 182, 212, 0.8));
        glow.setRadius(15);
        label.setEffect(glow);
    }

    public void show() {
        updateFragmentGrid();
        galleryStage.show();
        galleryStage.toFront();
    }

    public void hide() {
        galleryStage.hide();
    }
    
    // 用于测试：解锁碎片
    public void unlockFragment(int id) {
        if (id >= 0 && id < fragments.size()) {
            fragments.get(id).owned = true;
            updateFragmentGrid();
        }
    }
}
