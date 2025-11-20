package com.yingzhou.game.engine;

import java.util.*;

public class GameState {
    private int currentEra = 0;
    private final Set<Integer> collectedFragments = new HashSet<>();
    private final Set<String> completedMinigames = new HashSet<>();
    private final Map<String, Integer> dialogueHistory = new HashMap<>();

    public int getCurrentEra() { return currentEra; }
    public void setCurrentEra(int currentEra) { this.currentEra = currentEra; }

    public Set<Integer> getCollectedFragments() { return collectedFragments; }

    public Set<String> getCompletedMinigames() { return completedMinigames; }

    public Map<String, Integer> getDialogueHistory() { return dialogueHistory; }

    public void addDialogue(String npcId) {
        dialogueHistory.put(npcId, dialogueHistory.getOrDefault(npcId, 0) + 1);
    }
}
