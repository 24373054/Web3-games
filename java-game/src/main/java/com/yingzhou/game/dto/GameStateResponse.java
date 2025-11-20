package com.yingzhou.game.dto;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class GameStateResponse {
    private int currentEra;
    private List<Integer> collectedFragmentIds;
    private Set<String> completedMinigames;
    private Map<String, Integer> dialogueHistory;

    public GameStateResponse() {}

    public GameStateResponse(int currentEra, List<Integer> collectedFragmentIds, 
                            Set<String> completedMinigames, Map<String, Integer> dialogueHistory) {
        this.currentEra = currentEra;
        this.collectedFragmentIds = collectedFragmentIds;
        this.completedMinigames = completedMinigames;
        this.dialogueHistory = dialogueHistory;
    }

    public int getCurrentEra() { return currentEra; }
    public void setCurrentEra(int currentEra) { this.currentEra = currentEra; }

    public List<Integer> getCollectedFragmentIds() { return collectedFragmentIds; }
    public void setCollectedFragmentIds(List<Integer> collectedFragmentIds) { 
        this.collectedFragmentIds = collectedFragmentIds; 
    }

    public Set<String> getCompletedMinigames() { return completedMinigames; }
    public void setCompletedMinigames(Set<String> completedMinigames) { 
        this.completedMinigames = completedMinigames; 
    }

    public Map<String, Integer> getDialogueHistory() { return dialogueHistory; }
    public void setDialogueHistory(Map<String, Integer> dialogueHistory) { 
        this.dialogueHistory = dialogueHistory; 
    }
}
