package com.yingzhou.data;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * 游戏数据管理
 * 负责保存和加载游戏进度
 */
public class GameData {
    
    private static final String SAVE_FILE = "yingzhou_save.json";
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    
    private SaveData saveData;

    public GameData() {
        loadOrCreate();
    }

    private void loadOrCreate() {
        File file = new File(SAVE_FILE);
        if (file.exists()) {
            try (Reader reader = new FileReader(file)) {
                saveData = gson.fromJson(reader, SaveData.class);
                System.out.println("游戏数据已加载");
            } catch (IOException e) {
                System.err.println("加载游戏数据失败: " + e.getMessage());
                saveData = new SaveData();
            }
        } else {
            saveData = new SaveData();
            System.out.println("创建新游戏数据");
        }
    }

    public void save() {
        try (Writer writer = new FileWriter(SAVE_FILE)) {
            gson.toJson(saveData, writer);
            System.out.println("游戏数据已保存");
        } catch (IOException e) {
            System.err.println("保存游戏数据失败: " + e.getMessage());
        }
    }

    public SaveData getSaveData() {
        return saveData;
    }

    /**
     * 保存数据结构
     */
    public static class SaveData {
        private String currentEpoch = "GENESIS";
        private int fragmentsCollected = 0;
        private List<String> collectedFragments = new ArrayList<>();
        private List<String> completedMiniGames = new ArrayList<>();
        private List<String> unlockedDialogues = new ArrayList<>();
        private double playTime = 0;

        // Getters and Setters
        public String getCurrentEpoch() {
            return currentEpoch;
        }

        public void setCurrentEpoch(String currentEpoch) {
            this.currentEpoch = currentEpoch;
        }

        public int getFragmentsCollected() {
            return fragmentsCollected;
        }

        public void setFragmentsCollected(int fragmentsCollected) {
            this.fragmentsCollected = fragmentsCollected;
        }

        public List<String> getCollectedFragments() {
            return collectedFragments;
        }

        public List<String> getCompletedMiniGames() {
            return completedMiniGames;
        }

        public List<String> getUnlockedDialogues() {
            return unlockedDialogues;
        }

        public double getPlayTime() {
            return playTime;
        }

        public void setPlayTime(double playTime) {
            this.playTime = playTime;
        }
    }
}
