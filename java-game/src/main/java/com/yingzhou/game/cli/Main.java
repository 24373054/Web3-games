package com.yingzhou.game.cli;

import com.yingzhou.game.engine.GameEngine;
import com.yingzhou.game.engine.StoryRepository;
import com.yingzhou.game.model.AINPC;
import com.yingzhou.game.model.EraConfig;
import com.yingzhou.game.model.MemoryFragment;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        StoryRepository repo = new StoryRepository();
        GameEngine engine = new GameEngine(repo.load());
        try (Scanner sc = new Scanner(System.in)) {

        System.out.println("==== 瀛州纪 | Yingzhou Java OOP Demo ====");
        loop: while (true) {
            EraConfig era = engine.listEras().get(engine.getState().getCurrentEra());
            System.out.println("\n当前纪元: " + era.getChineseName() + " (" + era.getName() + ")");
            System.out.println("已收集碎片: " + engine.getState().getCollectedFragments().size());
            System.out.println("1) 列出NPC  2) 对话  3) 小游戏  4) 下一纪元  0) 退出");
            System.out.print("> ");
            String line = sc.nextLine();
            switch (line.trim()) {
                case "1":
                    List<AINPC> npcs = engine.npcsInCurrentEra();
                    if (npcs.isEmpty()) System.out.println("(本纪元暂无可交互NPC)");
                    for (AINPC n : npcs) {
                        System.out.println("- " + n.getId() + " | " + n.getChineseName() + " (" + n.getName() + ") - " + n.getRole());
                    }
                    break;
                case "2":
                    System.out.print("输入NPC id: ");
                    String npcId = sc.nextLine().trim();
                    System.out.print("输入对话关键词: ");
                    String msg = sc.nextLine();
                    Optional<MemoryFragment> frag = engine.talkToNpc(npcId, msg);
                    if (frag.isPresent()) {
                        System.out.println("触发碎片#" + frag.get().getId() + " - " + frag.get().getTitle());
                    } else {
                        System.out.println("没有触发碎片，或关键词不匹配。");
                    }
                    break;
                case "3":
                    System.out.print("输入NPC id: ");
                    String npcId2 = sc.nextLine().trim();
                    GameEngine.MiniGameResult r = engine.playFirstMiniGame(npcId2);
                    if (r.game == null) {
                        System.out.println("该NPC无小游戏或未找到。");
                    } else {
                        System.out.printf("小游戏[%s] 用时%.1fs, 准确%.0f%%, 失误%d, 得分%.1f, 掉落几率%.0f%%\n",
                                r.game.getChineseName(), r.timeUsed, r.accuracy*100, r.mistakes, r.score, r.probability*100);
                        if (r.awarded != null) {
                            System.out.println("获得碎片#" + r.awarded.getId() + " - " + r.awarded.getTitle());
                        } else {
                            System.out.println("未掉落碎片，可重试。");
                        }
                    }
                    break;
                case "4":
                    engine.nextEra();
                    break;
                case "0":
                    break loop;
                default:
                    System.out.println("无效选择。");
            }
        }
        }
        System.out.println("再见。");
    }
}

