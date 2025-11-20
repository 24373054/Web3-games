package com.yingzhou.game.engine;

import com.yingzhou.game.model.*;

import java.util.*;
import java.util.stream.Collectors;

public class GameEngine {
    private final StoryData data;
    private final GameState state = new GameState();
    private final Map<Integer, EraConfig> eraById;
    private final Map<String, AINPC> npcById;
    private final Map<String, MiniGame> miniById;

    private final Random random = new Random();

    public GameEngine(StoryData data) {
        this.data = data;
        this.eraById = data.getEras().stream().collect(Collectors.toMap(EraConfig::getId, e -> e));
        this.npcById = data.getNpcs().stream().collect(Collectors.toMap(AINPC::getId, n -> n));
        this.miniById = data.getMinigames().stream().collect(Collectors.toMap(MiniGame::getId, m -> m));
    }

    public GameState getState() { return state; }

    public List<EraConfig> listEras() { return data.getEras(); }

    public List<AINPC> npcsInCurrentEra() {
        int era = state.getCurrentEra();
        return data.getNpcs().stream()
                .filter(n -> n.getAvailableEras() != null && n.getAvailableEras().contains(era))
                .collect(Collectors.toList());
    }

    public Optional<AINPC> getNpc(String id) { return Optional.ofNullable(npcById.get(id)); }

    public Optional<MemoryFragment> talkToNpc(String npcId, String input) {
        AINPC npc = npcById.get(npcId);
        if (npc == null) return Optional.empty();
        state.addDialogue(npcId);
        int era = state.getCurrentEra();
        return KeywordMatcher.match(npc, input).flatMap(kw -> data.getFragments().stream()
                .filter(f -> f.getEra() == era)
                .filter(f -> f.getTriggerMethod() == TriggerMethod.KEYWORD)
                .filter(f -> Objects.equals(f.getNpcId(), npcId))
                .filter(f -> Objects.equals(f.getKeyword(), kw))
                .findFirst())
                .map(f -> {
                    state.getCollectedFragments().add(f.getId());
                    return f;
                });
    }

    public MiniGameResult playFirstMiniGame(String npcId) {
        AINPC npc = npcById.get(npcId);
        if (npc == null || npc.getMinigames() == null || npc.getMinigames().isEmpty()) {
            return MiniGameResult.none();
        }
        String mgId = npc.getMinigames().get(0);
        MiniGame mg = miniById.get(mgId);
        if (mg == null) return MiniGameResult.none();

        // simulate
        double timeUsed = mg.getTimeLimit() * (0.5 + random.nextDouble() * 0.5);
        double accuracy = 0.7 + random.nextDouble() * 0.3;
        int mistakes = random.nextInt(3);
        double score = ScoreCalculator.calculate(timeUsed, mg.getTimeLimit(), accuracy, mistakes);
        double p = FragmentDropCalculator.probability(score);

        Optional<MemoryFragment> drop = data.getFragments().stream()
                .filter(f -> f.getEra() == state.getCurrentEra())
                .filter(f -> f.getTriggerMethod() == TriggerMethod.MINIGAME)
                .filter(f -> Objects.equals(f.getNpcId(), npcId))
                .filter(f -> Objects.equals(f.getMinigame(), mgId))
                .findFirst();

        MemoryFragment awarded = null;
        if (drop.isPresent() && random.nextDouble() <= p) {
            awarded = drop.get();
            state.getCollectedFragments().add(awarded.getId());
            state.getCompletedMinigames().add(mgId);
        }
        return MiniGameResult.of(mg, timeUsed, accuracy, mistakes, score, p, awarded);
    }

    public void nextEra() {
        int era = state.getCurrentEra();
        if (era < data.getEras().size() - 1) state.setCurrentEra(era + 1);
    }

    public static class MiniGameResult {
        public final MiniGame game;
        public final double timeUsed;
        public final double accuracy;
        public final int mistakes;
        public final double score;
        public final double probability;
        public final MemoryFragment awarded;

        private MiniGameResult(MiniGame game, double timeUsed, double accuracy, int mistakes, double score, double probability, MemoryFragment awarded) {
            this.game = game; this.timeUsed = timeUsed; this.accuracy = accuracy; this.mistakes = mistakes; this.score = score; this.probability = probability; this.awarded = awarded;
        }
        public static MiniGameResult of(MiniGame g, double t, double a, int m, double s, double p, MemoryFragment f) { return new MiniGameResult(g,t,a,m,s,p,f);}        
        public static MiniGameResult none() { return new MiniGameResult(null,0,0,0,0,0,null);}        
    }
}
