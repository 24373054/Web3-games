package com.yingzhou.game;

import com.yingzhou.data.GameData;
import com.yingzhou.game.epoch.EpochManager;
import com.yingzhou.game.player.Player;
import com.yingzhou.npc.NPCManager;
import javafx.animation.AnimationTimer;

/**
 * 游戏引擎核心
 * 管理游戏状态、更新逻辑和数据
 */
public class GameEngine {
    
    private Player player;
    private EpochManager epochManager;
    private NPCManager npcManager;
    private GameData gameData;
    private AnimationTimer gameLoop;
    private boolean running;

    public GameEngine() {
        initialize();
    }

    private void initialize() {
        // 初始化游戏数据
        gameData = new GameData();
        
        // 初始化玩家
        player = new Player();
        
        // 初始化纪元管理器
        epochManager = new EpochManager();
        epochManager.setCurrentEpoch(EpochManager.Epoch.GENESIS);
        
        // 初始化NPC管理器
        npcManager = new NPCManager(this);
        
        // 创建游戏循环
        createGameLoop();
    }

    private void createGameLoop() {
        gameLoop = new AnimationTimer() {
            private long lastUpdate = 0;
            
            @Override
            public void handle(long now) {
                if (lastUpdate == 0) {
                    lastUpdate = now;
                    return;
                }
                
                double deltaTime = (now - lastUpdate) / 1_000_000_000.0;
                lastUpdate = now;
                
                update(deltaTime);
            }
        };
    }

    private void update(double deltaTime) {
        // 更新玩家状态
        player.update(deltaTime);
        
        // 更新NPC
        npcManager.update(deltaTime);
        
        // 更新纪元状态
        epochManager.update(deltaTime);
        
        // 检查玩家与NPC的距离
        npcManager.checkPlayerProximity(player.getPosition());
    }

    public void start() {
        if (!running) {
            running = true;
            gameLoop.start();
            System.out.println("游戏引擎已启动");
        }
    }

    public void stop() {
        if (running) {
            running = false;
            gameLoop.stop();
            System.out.println("游戏引擎已停止");
        }
    }

    public void interactWithNearestNPC() {
        npcManager.interactWithNearest(player.getPosition());
    }

    // Getters
    public Player getPlayer() {
        return player;
    }

    public EpochManager getEpochManager() {
        return epochManager;
    }

    public NPCManager getNPCManager() {
        return npcManager;
    }

    public GameData getGameData() {
        return gameData;
    }

    public boolean isRunning() {
        return running;
    }
}
