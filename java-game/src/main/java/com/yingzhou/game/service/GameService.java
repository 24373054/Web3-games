package com.yingzhou.game.service;

import com.yingzhou.game.engine.*;
import com.yingzhou.game.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GameService {
    private final StoryData storyData;
    private final Map<String, GameState> playerStates = new ConcurrentHashMap<>();

    public GameService() {
        StoryRepository repo = new StoryRepository();
        this.storyData = repo.load();
    }

    public List<EraConfig> getAllEras() {
        return storyData.getEras();
    }

    public List<AINPC> getNpcsByEra(int eraId) {
        return storyData.getNpcs().stream()
                .filter(npc -> npc.getAvailableEras().contains(eraId))
                .collect(Collectors.toList());
    }

    public List<MemoryFragment> getAllFragments() {
        return storyData.getFragments();
    }

    public List<MiniGame> getAllMinigames() {
        return storyData.getMinigames();
    }

    public GameState getOrCreatePlayerState(String playerId) {
        return playerStates.computeIfAbsent(playerId, id -> new GameState());
    }

    public Optional<MemoryFragment> handleDialogue(String playerId, String npcId, String message, int currentEra) {
        GameState state = getOrCreatePlayerState(playerId);
        state.setCurrentEra(currentEra);
        
        AINPC npc = storyData.getNpcs().stream()
                .filter(n -> n.getId().equals(npcId))
                .findFirst()
                .orElse(null);
        
        if (npc == null) return Optional.empty();

        // 记录对话历史
        state.addDialogue(npcId);

        // 检查关键词匹配
        Optional<String> matchedKeyword = KeywordMatcher.match(npc, message);

        if (matchedKeyword.isEmpty()) return Optional.empty();

        // 查找触发的碎片
        Optional<MemoryFragment> fragment = storyData.getFragments().stream()
                .filter(f -> f.getNpcId().equals(npcId))
                .filter(f -> f.getEra() == currentEra)
                .filter(f -> f.getTriggerMethod() == TriggerMethod.KEYWORD)
                .filter(f -> !state.getCollectedFragments().contains(f.getId()))
                .findFirst();

        fragment.ifPresent(f -> state.getCollectedFragments().add(f.getId()));
        return fragment;
    }

    public Map<String, Object> handleMinigame(String playerId, String npcId, String minigameId,
                                               double timeUsed, double accuracy, int mistakes) {
        GameState state = getOrCreatePlayerState(playerId);

        MiniGame game = storyData.getMinigames().stream()
                .filter(g -> g.getId().equals(minigameId))
                .findFirst()
                .orElse(null);

        if (game == null) {
            return Map.of("success", false, "error", "Minigame not found");
        }

        // 计算得分
        double score = ScoreCalculator.calculate(timeUsed, game.getTimeLimit(), accuracy, mistakes);
        double probability = FragmentDropCalculator.probability(score);

        // 标记为已完成
        state.getCompletedMinigames().add(minigameId);

        // 判断是否掉落碎片
        MemoryFragment awarded = null;
        if (Math.random() < probability) {
            Optional<MemoryFragment> fragment = storyData.getFragments().stream()
                    .filter(f -> f.getNpcId().equals(npcId))
                    .filter(f -> f.getTriggerMethod() == TriggerMethod.MINIGAME)
                    .filter(f -> !state.getCollectedFragments().contains(f.getId()))
                    .findFirst();

            if (fragment.isPresent()) {
                awarded = fragment.get();
                state.getCollectedFragments().add(awarded.getId());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("game", game);
        result.put("score", score);
        result.put("probability", probability);
        result.put("awarded", awarded);
        return result;
    }

    public void advanceEra(String playerId) {
        GameState state = getOrCreatePlayerState(playerId);
        if (state.getCurrentEra() < storyData.getEras().size() - 1) {
            state.setCurrentEra(state.getCurrentEra() + 1);
        }
    }
}
