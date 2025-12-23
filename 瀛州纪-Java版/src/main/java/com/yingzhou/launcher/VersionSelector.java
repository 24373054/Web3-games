package com.yingzhou.launcher;

import com.yingzhou.game.GameLauncher;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;

import java.awt.Desktop;
import java.net.URI;

/**
 * 版本选择界面
 * 允许玩家选择原版（Web3）或Java版
 */
public class VersionSelector {
    
    private static final String WEB3_URL = "http://localhost:3000";
    private static final int WINDOW_WIDTH = 800;
    private static final int WINDOW_HEIGHT = 600;

    public void show(Stage primaryStage) {
        // 创建根布局
        VBox root = createRootLayout();
        
        // 创建标题
        Label titleLabel = createTitle();
        
        // 创建副标题
        Label subtitleLabel = createSubtitle();
        
        // 创建版本选择按钮容器
        HBox buttonContainer = createButtonContainer(primaryStage);
        
        // 创建底部信息
        Label infoLabel = createInfoLabel();
        
        // 添加所有元素到根布局
        root.getChildren().addAll(titleLabel, subtitleLabel, buttonContainer, infoLabel);
        
        // 创建场景
        Scene scene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        scene.setFill(Color.rgb(17, 24, 39)); // 深色背景
        
        // 配置舞台
        primaryStage.setTitle("瀛州纪 | Immortal Ledger - 版本选择");
        primaryStage.setScene(scene);
        primaryStage.setResizable(false);
        primaryStage.show();
    }

    private VBox createRootLayout() {
        VBox root = new VBox(40);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(50));
        root.setStyle("-fx-background-color: linear-gradient(to bottom, #111827, #1f2937);");
        return root;
    }

    private Label createTitle() {
        Label title = new Label("瀛州纪");
        title.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 56));
        title.setTextFill(Color.rgb(6, 182, 212)); // 青色
        
        // 添加发光效果
        DropShadow glow = new DropShadow();
        glow.setColor(Color.rgb(6, 182, 212, 0.8));
        glow.setRadius(20);
        title.setEffect(glow);
        
        return title;
    }

    private Label createSubtitle() {
        Label subtitle = new Label("Immortal Ledger");
        subtitle.setFont(Font.font("Arial", FontWeight.NORMAL, 24));
        subtitle.setTextFill(Color.rgb(156, 163, 175)); // 灰色
        return subtitle;
    }

    private HBox createButtonContainer(Stage primaryStage) {
        HBox container = new HBox(30);
        container.setAlignment(Pos.CENTER);
        
        // 原版按钮
        Button web3Button = createVersionButton(
            "原版 (Web3)",
            "区块链驱动\n完整链上体验",
            Color.rgb(139, 92, 246), // 紫色
            () -> launchWeb3Version()
        );
        
        // Java版按钮
        Button javaButton = createVersionButton(
            "Java版",
            "本地运行\n无需钱包",
            Color.rgb(6, 182, 212), // 青色
            () -> launchJavaVersion(primaryStage)
        );
        
        container.getChildren().addAll(web3Button, javaButton);
        return container;
    }

    private Button createVersionButton(String title, String description, Color accentColor, Runnable action) {
        VBox buttonContent = new VBox(10);
        buttonContent.setAlignment(Pos.CENTER);
        buttonContent.setPadding(new Insets(30, 40, 30, 40));
        
        Label titleLabel = new Label(title);
        titleLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 24));
        titleLabel.setTextFill(Color.WHITE);
        
        Label descLabel = new Label(description);
        descLabel.setFont(Font.font("Microsoft YaHei", FontWeight.NORMAL, 14));
        descLabel.setTextFill(Color.rgb(209, 213, 219));
        descLabel.setStyle("-fx-text-alignment: center;");
        
        buttonContent.getChildren().addAll(titleLabel, descLabel);
        
        Button button = new Button();
        button.setGraphic(buttonContent);
        button.setStyle(String.format(
            "-fx-background-color: rgba(%d, %d, %d, 0.1); " +
            "-fx-border-color: rgba(%d, %d, %d, 0.5); " +
            "-fx-border-width: 2; " +
            "-fx-border-radius: 10; " +
            "-fx-background-radius: 10; " +
            "-fx-cursor: hand;",
            (int)(accentColor.getRed() * 255),
            (int)(accentColor.getGreen() * 255),
            (int)(accentColor.getBlue() * 255),
            (int)(accentColor.getRed() * 255),
            (int)(accentColor.getGreen() * 255),
            (int)(accentColor.getBlue() * 255)
        ));
        
        // 悬停效果
        button.setOnMouseEntered(e -> {
            button.setStyle(String.format(
                "-fx-background-color: rgba(%d, %d, %d, 0.2); " +
                "-fx-border-color: rgba(%d, %d, %d, 1); " +
                "-fx-border-width: 2; " +
                "-fx-border-radius: 10; " +
                "-fx-background-radius: 10; " +
                "-fx-cursor: hand;",
                (int)(accentColor.getRed() * 255),
                (int)(accentColor.getGreen() * 255),
                (int)(accentColor.getBlue() * 255),
                (int)(accentColor.getRed() * 255),
                (int)(accentColor.getGreen() * 255),
                (int)(accentColor.getBlue() * 255)
            ));
        });
        
        button.setOnMouseExited(e -> {
            button.setStyle(String.format(
                "-fx-background-color: rgba(%d, %d, %d, 0.1); " +
                "-fx-border-color: rgba(%d, %d, %d, 0.5); " +
                "-fx-border-width: 2; " +
                "-fx-border-radius: 10; " +
                "-fx-background-radius: 10; " +
                "-fx-cursor: hand;",
                (int)(accentColor.getRed() * 255),
                (int)(accentColor.getGreen() * 255),
                (int)(accentColor.getBlue() * 255),
                (int)(accentColor.getRed() * 255),
                (int)(accentColor.getGreen() * 255),
                (int)(accentColor.getBlue() * 255)
            ));
        });
        
        button.setOnAction(e -> action.run());
        
        return button;
    }

    private Label createInfoLabel() {
        Label info = new Label("\"我被记录，故我存在。\"");
        info.setFont(Font.font("Microsoft YaHei", FontWeight.LIGHT, 16));
        info.setTextFill(Color.rgb(107, 114, 128));
        info.setStyle("-fx-font-style: italic;");
        return info;
    }

    private void launchWeb3Version() {
        try {
            // 打开默认浏览器访问Web3版本
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(new URI(WEB3_URL));
                System.out.println("正在打开Web3版本: " + WEB3_URL);
            } else {
                System.err.println("无法打开浏览器，请手动访问: " + WEB3_URL);
            }
        } catch (Exception e) {
            System.err.println("打开Web3版本失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void launchJavaVersion(Stage primaryStage) {
        // 关闭版本选择窗口
        primaryStage.close();
        
        // 启动Java版游戏
        GameLauncher gameLauncher = new GameLauncher();
        Stage gameStage = new Stage();
        gameLauncher.start(gameStage);
    }
}
