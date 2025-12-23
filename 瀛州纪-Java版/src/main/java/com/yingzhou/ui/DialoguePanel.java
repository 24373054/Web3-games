package com.yingzhou.ui;

import com.yingzhou.game.GameEngine;
import com.yingzhou.npc.BaseNPC;
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
import javafx.stage.StageStyle;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * 对话面板
 * 显示与NPC的对话界面
 */
public class DialoguePanel {
    
    private GameEngine gameEngine;
    private Stage dialogueStage;
    private BaseNPC currentNPC;
    private VBox messagesContainer;
    private TextField inputField;
    private Button sendButton;
    private List<Message> messages;
    private ScrollPane scrollPane;
    
    private static class Message {
        String role; // "user" or "npc"
        String content;
        LocalDateTime timestamp;
        
        Message(String role, String content) {
            this.role = role;
            this.content = content;
            this.timestamp = LocalDateTime.now();
        }
    }

    public DialoguePanel(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        this.messages = new ArrayList<>();
        createDialogueWindow();
    }

    private void createDialogueWindow() {
        dialogueStage = new Stage();
        dialogueStage.initModality(Modality.NONE);
        dialogueStage.initStyle(StageStyle.DECORATED);
        dialogueStage.setTitle("对话界面");
        
        // 主容器
        BorderPane root = new BorderPane();
        root.setStyle(
            "-fx-background-color: linear-gradient(to bottom, #111827, #1f2937);" +
            "-fx-border-color: rgb(6, 182, 212);" +
            "-fx-border-width: 2;"
        );
        
        // 顶部 - NPC信息
        HBox header = createHeader();
        root.setTop(header);
        
        // 中间 - 消息列表
        messagesContainer = new VBox(10);
        messagesContainer.setPadding(new Insets(15));
        messagesContainer.setStyle("-fx-background-color: rgba(0, 0, 0, 0.3);");
        
        scrollPane = new ScrollPane(messagesContainer);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: rgba(0, 0, 0, 0.5);");
        scrollPane.setPrefHeight(400);
        root.setCenter(scrollPane);
        
        // 底部 - 输入框
        VBox footer = createFooter();
        root.setBottom(footer);
        
        Scene scene = new Scene(root, 600, 550);
        dialogueStage.setScene(scene);
    }

    private HBox createHeader() {
        HBox header = new HBox(15);
        header.setPadding(new Insets(15));
        header.setAlignment(Pos.CENTER_LEFT);
        header.setStyle("-fx-background-color: rgba(17, 24, 39, 0.9);");
        
        Label titleLabel = new Label("对话：");
        titleLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
        titleLabel.setTextFill(Color.rgb(6, 182, 212));
        
        Label npcNameLabel = new Label("未选择");
        npcNameLabel.setFont(Font.font("Microsoft YaHei", FontWeight.BOLD, 16));
        npcNameLabel.setTextFill(Color.WHITE);
        npcNameLabel.setId("npcNameLabel");
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        Button closeButton = new Button("✕");
        closeButton.setStyle(
            "-fx-background-color: transparent;" +
            "-fx-text-fill: #9ca3af;" +
            "-fx-font-size: 18;" +
            "-fx-cursor: hand;"
        );
        closeButton.setOnMouseEntered(e -> closeButton.setStyle(
            "-fx-background-color: transparent;" +
            "-fx-text-fill: white;" +
            "-fx-font-size: 18;" +
            "-fx-cursor: hand;"
        ));
        closeButton.setOnMouseExited(e -> closeButton.setStyle(
            "-fx-background-color: transparent;" +
            "-fx-text-fill: #9ca3af;" +
            "-fx-font-size: 18;" +
            "-fx-cursor: hand;"
        ));
        closeButton.setOnAction(e -> hide());
        
        header.getChildren().addAll(titleLabel, npcNameLabel, spacer, closeButton);
        return header;
    }

    private VBox createFooter() {
        VBox footer = new VBox(10);
        footer.setPadding(new Insets(15));
        footer.setStyle("-fx-background-color: rgba(17, 24, 39, 0.9);");
        
        HBox inputBox = new HBox(10);
        inputBox.setAlignment(Pos.CENTER);
        
        inputField = new TextField();
        inputField.setPromptText("输入你的问题...");
        inputField.setStyle(
            "-fx-background-color: #1f2937;" +
            "-fx-text-fill: white;" +
            "-fx-prompt-text-fill: #6b7280;" +
            "-fx-border-color: rgb(6, 182, 212);" +
            "-fx-border-width: 1;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-padding: 8;"
        );
        inputField.setFont(Font.font("Microsoft YaHei", 13));
        HBox.setHgrow(inputField, Priority.ALWAYS);
        
        inputField.setOnAction(e -> sendMessage());
        
        sendButton = new Button("发送");
        sendButton.setStyle(
            "-fx-background-color: rgb(6, 182, 212);" +
            "-fx-text-fill: black;" +
            "-fx-font-weight: bold;" +
            "-fx-padding: 8 20;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;"
        );
        sendButton.setOnMouseEntered(e -> sendButton.setStyle(
            "-fx-background-color: rgb(8, 145, 178);" +
            "-fx-text-fill: black;" +
            "-fx-font-weight: bold;" +
            "-fx-padding: 8 20;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;"
        ));
        sendButton.setOnMouseExited(e -> sendButton.setStyle(
            "-fx-background-color: rgb(6, 182, 212);" +
            "-fx-text-fill: black;" +
            "-fx-font-weight: bold;" +
            "-fx-padding: 8 20;" +
            "-fx-border-radius: 5;" +
            "-fx-background-radius: 5;" +
            "-fx-cursor: hand;"
        ));
        sendButton.setOnAction(e -> sendMessage());
        
        inputBox.getChildren().addAll(inputField, sendButton);
        
        Label hintLabel = new Label("提示：每次交互都会被记录");
        hintLabel.setFont(Font.font("Microsoft YaHei", 10));
        hintLabel.setTextFill(Color.rgb(107, 114, 128));
        
        footer.getChildren().addAll(inputBox, hintLabel);
        return footer;
    }

    private void sendMessage() {
        String userInput = inputField.getText().trim();
        if (userInput.isEmpty() || currentNPC == null) {
            return;
        }
        
        // 添加用户消息
        Message userMessage = new Message("user", userInput);
        messages.add(userMessage);
        addMessageBubble(userMessage);
        
        // 清空输入框
        inputField.clear();
        
        // 获取NPC回复
        String npcResponse = currentNPC.getDialogue(userInput);
        Message npcMessage = new Message("npc", npcResponse);
        messages.add(npcMessage);
        addMessageBubble(npcMessage);
        
        // 滚动到底部
        scrollToBottom();
    }

    private void addMessageBubble(Message message) {
        HBox messageBox = new HBox();
        messageBox.setPadding(new Insets(5));
        
        VBox bubble = new VBox(5);
        bubble.setPadding(new Insets(10));
        bubble.setMaxWidth(400);
        
        if (message.role.equals("user")) {
            messageBox.setAlignment(Pos.CENTER_RIGHT);
            bubble.setStyle(
                "-fx-background-color: rgba(6, 182, 212, 0.2);" +
                "-fx-border-color: rgb(6, 182, 212);" +
                "-fx-border-width: 1;" +
                "-fx-border-radius: 10;" +
                "-fx-background-radius: 10;"
            );
        } else {
            messageBox.setAlignment(Pos.CENTER_LEFT);
            bubble.setStyle(
                "-fx-background-color: rgba(59, 130, 246, 0.3);" +
                "-fx-border-color: rgba(75, 85, 99, 0.5);" +
                "-fx-border-width: 1;" +
                "-fx-border-radius: 10;" +
                "-fx-background-radius: 10;"
            );
        }
        
        Label contentLabel = new Label(message.content);
        contentLabel.setWrapText(true);
        contentLabel.setFont(Font.font("Microsoft YaHei", 13));
        contentLabel.setTextFill(Color.WHITE);
        
        Label timeLabel = new Label(message.timestamp.format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        timeLabel.setFont(Font.font("Microsoft YaHei", 10));
        timeLabel.setTextFill(Color.rgb(107, 114, 128));
        
        bubble.getChildren().addAll(contentLabel, timeLabel);
        messageBox.getChildren().add(bubble);
        
        messagesContainer.getChildren().add(messageBox);
    }

    private void scrollToBottom() {
        javafx.application.Platform.runLater(() -> {
            scrollPane.setVvalue(1.0);
        });
    }

    public void setNPC(BaseNPC npc) {
        this.currentNPC = npc;
        
        // 更新标题
        Label npcNameLabel = (Label) dialogueStage.getScene().lookup("#npcNameLabel");
        if (npcNameLabel != null) {
            npcNameLabel.setText(npc.getName());
            npcNameLabel.setTextFill(npc.getColor());
        }
        
        // 清空消息
        messages.clear();
        messagesContainer.getChildren().clear();
        
        // 添加欢迎消息
        Message welcomeMessage = new Message("npc", npc.getDialogue("你好"));
        messages.add(welcomeMessage);
        addMessageBubble(welcomeMessage);
    }

    public void show() {
        if (currentNPC == null) {
            System.out.println("请先选择一个NPC");
            return;
        }
        dialogueStage.show();
        dialogueStage.toFront();
        inputField.requestFocus();
    }

    public void hide() {
        dialogueStage.hide();
    }
}
