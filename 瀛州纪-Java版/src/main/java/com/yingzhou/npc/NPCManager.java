package com.yingzhou.npc;

import com.yingzhou.game.GameEngine;
import javafx.geometry.Point3D;

import java.util.ArrayList;
import java.util.List;

/**
 * NPC管理器
 * 管理所有NPC的创建、更新和交互
 */
public class NPCManager {
    
    private GameEngine gameEngine;
    private List<BaseNPC> npcs;
    private static final double INTERACTION_DISTANCE = 5.0;

    public NPCManager(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        this.npcs = new ArrayList<>();
        initializeNPCs();
    }

    private void initializeNPCs() {
        // 创建5个AI-NPC
        npcs.add(new ArchivistNPC(new Point3D(20, 0, 0)));   // 史官 - 东方
        npcs.add(new ArchitectNPC(new Point3D(0, 0, -20)));  // 工匠 - 北方
        npcs.add(new MercantileNPC(new Point3D(0, 0, 0)));   // 商序 - 中央
        npcs.add(new OracleNPC(new Point3D(0, 0, 20)));      // 先知 - 南方
        npcs.add(new EntropyNPC(new Point3D(-20, 0, 0)));    // 遗忘者 - 西方
    }

    public void update(double deltaTime) {
        for (BaseNPC npc : npcs) {
            npc.update(deltaTime);
        }
    }

    public void checkPlayerProximity(Point3D playerPosition) {
        for (BaseNPC npc : npcs) {
            double distance = playerPosition.distance(npc.getPosition());
            npc.setPlayerNearby(distance < INTERACTION_DISTANCE);
        }
    }

    public void interactWithNearest(Point3D playerPosition) {
        BaseNPC nearest = null;
        double minDistance = Double.MAX_VALUE;
        
        for (BaseNPC npc : npcs) {
            double distance = playerPosition.distance(npc.getPosition());
            if (distance < INTERACTION_DISTANCE && distance < minDistance) {
                minDistance = distance;
                nearest = npc;
            }
        }
        
        if (nearest != null) {
            nearest.interact();
        }
    }

    public List<BaseNPC> getNPCs() {
        return npcs;
    }
}
