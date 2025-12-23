package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * 遗忘者NPC
 * 混沌的化身
 */
public class EntropyNPC extends BaseNPC {

    public EntropyNPC(Point3D position) {
        super("遗忘者", position, Color.rgb(127, 29, 29), 3.2); // 暗红色
    }

    @Override
    public void interact() {
        System.out.println("与遗忘者交互");
    }

    @Override
    public String getDialogue(String playerMessage) {
        if (playerMessage.contains("熵")) {
            return "熵化... 不是疾病... 熵化... 不是错误... 熵化... 是... 必然...";
        } else if (playerMessage.contains("混沌")) {
            return "我是... 谁？不... 我记得... 我曾经是... [CORRUPTED]... " +
                   "所有区块同时存在... 所有时间同时发生...";
        } else {
            return "你知道吗？完美的系统... 最脆弱。最优化的代码... 最僵化。" +
                   "永恒的规则... 最致命。我们追求不可变... 现在... 我们付出代价...";
        }
    }

    @Override
    public void startMiniGame() {
        System.out.println("启动混沌迷宫小游戏");
    }
}
