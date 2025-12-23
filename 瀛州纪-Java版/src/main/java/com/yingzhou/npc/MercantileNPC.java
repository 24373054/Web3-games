package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * 商序NPC
 * 流动的仲裁者
 */
public class MercantileNPC extends BaseNPC {

    public MercantileNPC(Point3D position) {
        super("商序", position, Color.rgb(217, 119, 6), 2.5); // 金黄色
    }

    @Override
    public void interact() {
        System.out.println("与商序交互");
    }

    @Override
    public String getDialogue(String playerMessage) {
        if (playerMessage.contains("信任")) {
            return "在物质世界，信任建立在情感和历史上。在数字世界，信任写在代码里。" +
                   "不需要握手，不需要眼神接触。只需要一个布尔值，一个require。";
        } else if (playerMessage.contains("流动") || playerMessage.contains("平衡")) {
            return "我管理瀛洲的资源分配与价值流动。每笔交易都由我验证，" +
                   "每次转账都在我的监督下完成。";
        } else {
            return "我是流动仲裁者，维护系统的经济平衡。";
        }
    }

    @Override
    public void startMiniGame() {
        System.out.println("启动资源平衡小游戏");
    }
}
