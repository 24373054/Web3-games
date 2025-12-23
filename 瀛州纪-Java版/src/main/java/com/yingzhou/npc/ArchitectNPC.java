package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * 工匠NPC
 * 创世的设计者
 */
public class ArchitectNPC extends BaseNPC {

    public ArchitectNPC(Point3D position) {
        super("工匠", position, Color.rgb(192, 192, 192), 3.5); // 银白色
    }

    @Override
    public void interact() {
        System.out.println("与工匠交互");
    }

    @Override
    public String getDialogue(String playerMessage) {
        if (playerMessage.contains("设计") || playerMessage.contains("规则")) {
            return "我设计了这个世界的底层架构。每个函数、每个修饰符、每个状态变量，" +
                   "都是精心设计的。规则是不可变的，它们将永远运行。";
        } else if (playerMessage.contains("完美")) {
            return "完美？完美的系统最脆弱。最优化的代码最僵化。" +
                   "我们追求永恒不变，却失去了适应能力。";
        } else {
            return "我是初代构造者，设计了瀛洲的基础规则。Code is law。";
        }
    }

    @Override
    public void startMiniGame() {
        System.out.println("启动代码构建小游戏");
    }
}
