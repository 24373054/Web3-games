package com.yingzhou.game.epoch;

import javafx.scene.paint.Color;

/**
 * 纪元管理器
 * 管理游戏的五个纪元状态
 */
public class EpochManager {
    
    public enum Epoch {
        GENESIS("创世纪元", Color.rgb(30, 41, 59)),      // 深蓝紫色
        EMERGENCE("萌芽纪元", Color.rgb(21, 128, 61)),   // 青绿色
        FLOURISH("繁盛纪元", Color.rgb(217, 119, 6)),    // 金黄色
        ENTROPY("熵化纪元", Color.rgb(127, 29, 29)),     // 暗红灰色
        COLLAPSE("毁灭纪元", Color.rgb(55, 65, 81));     // 黑白灰
        
        private final String name;
        private final Color backgroundColor;
        
        Epoch(String name, Color backgroundColor) {
            this.name = name;
            this.backgroundColor = backgroundColor;
        }
        
        public String getName() {
            return name;
        }
        
        public Color getBackgroundColor() {
            return backgroundColor;
        }
    }
    
    private Epoch currentEpoch;
    private double epochTime;
    private int fragmentsCollected;

    public EpochManager() {
        currentEpoch = Epoch.GENESIS;
        epochTime = 0;
        fragmentsCollected = 0;
    }

    public void update(double deltaTime) {
        epochTime += deltaTime;
    }

    public boolean canAdvanceToNextEpoch() {
        return switch (currentEpoch) {
            case GENESIS -> fragmentsCollected >= 1;
            case EMERGENCE -> fragmentsCollected >= 3;
            case FLOURISH -> fragmentsCollected >= 5;
            case ENTROPY -> fragmentsCollected >= 7;
            case COLLAPSE -> false;
        };
    }

    public void advanceEpoch() {
        if (canAdvanceToNextEpoch()) {
            currentEpoch = switch (currentEpoch) {
                case GENESIS -> Epoch.EMERGENCE;
                case EMERGENCE -> Epoch.FLOURISH;
                case FLOURISH -> Epoch.ENTROPY;
                case ENTROPY -> Epoch.COLLAPSE;
                case COLLAPSE -> Epoch.COLLAPSE;
            };
            epochTime = 0;
            System.out.println("进入新纪元: " + currentEpoch.getName());
        }
    }

    public void collectFragment() {
        fragmentsCollected++;
        System.out.println("收集碎片，当前数量: " + fragmentsCollected);
    }

    // Getters and Setters
    public Epoch getCurrentEpoch() {
        return currentEpoch;
    }

    public void setCurrentEpoch(Epoch epoch) {
        this.currentEpoch = epoch;
    }

    public double getEpochTime() {
        return epochTime;
    }

    public int getFragmentsCollected() {
        return fragmentsCollected;
    }

    public double getEntropyLevel() {
        // 熵化程度随纪元和时间增加
        return switch (currentEpoch) {
            case GENESIS -> 0;
            case EMERGENCE -> Math.min(20, epochTime / 10);
            case FLOURISH -> Math.min(50, 20 + epochTime / 8);
            case ENTROPY -> Math.min(90, 50 + epochTime / 5);
            case COLLAPSE -> 100;
        };
    }
}
