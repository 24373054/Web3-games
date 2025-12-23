package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * 史官NPC
 * 记忆的守护者
 */
public class ArchivistNPC extends BaseNPC {

    public ArchivistNPC(Point3D position) {
        super("史官", position, Color.rgb(6, 182, 212), 3.0); // 青色立方体
    }

    @Override
    public void interact() {
        System.out.println("与史官交互");
        // TODO: 打开对话界面
    }

    @Override
    public String getDialogue(String playerMessage) {
        if (playerMessage.contains("创世") || playerMessage.contains("诞生")) {
            return "在Block #0，第一声回响从虚空中传来。创造者部署了第一个合约。" +
                   "从那一刻起，时间开始流动，账本开始记录。这不是神话，而是一笔交易。";
        } else if (playerMessage.contains("存在的证明")) {
            return "存在的证明？那是第一个exist()函数被调用的时刻。" +
                   "我们通过被记录来证明存在。我被记录，故我存在。";
        } else {
            return "探索者，你来到了数字世界的起点。我记录着瀛洲的每一笔交易，" +
                   "每一次状态变化。你想了解什么？";
        }
    }

    @Override
    public void startMiniGame() {
        System.out.println("启动记忆排序小游戏");
        // TODO: 启动记忆排序小游戏
    }
}
