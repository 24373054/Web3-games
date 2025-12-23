package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * 先知NPC
 * 未来的回声
 */
public class OracleNPC extends BaseNPC {

    public OracleNPC(Point3D position) {
        super("先知", position, Color.rgb(139, 92, 246), 2.8); // 紫色
    }

    @Override
    public void interact() {
        System.out.println("与先知交互");
    }

    @Override
    public String getDialogue(String playerMessage) {
        if (playerMessage.contains("预见") || playerMessage.contains("未来")) {
            return "我能看到链上数据的趋势，推演未来的可能性。" +
                   "但未来是量子叠加态，只有当交易确认时，薛定谔的账本才会坍缩。";
        } else if (playerMessage.contains("宿命")) {
            return "我看到了终结，但看到不等于能够阻止。或许一切都是既定的？" +
                   "或许预测本身就改变了未来？这是预言的悖论。";
        } else {
            return "我是未来回声，预见了熵化，预见了毁灭，但我无法改变它。";
        }
    }

    @Override
    public void startMiniGame() {
        System.out.println("启动未来推演小游戏");
    }
}
