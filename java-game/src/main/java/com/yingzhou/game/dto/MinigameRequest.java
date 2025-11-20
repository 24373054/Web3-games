package com.yingzhou.game.dto;

public class MinigameRequest {
    private String npcId;
    private String minigameId;
    private String playerId;
    private double timeUsed;
    private double accuracy;
    private int mistakes;

    public MinigameRequest() {}

    public String getNpcId() { return npcId; }
    public void setNpcId(String npcId) { this.npcId = npcId; }

    public String getMinigameId() { return minigameId; }
    public void setMinigameId(String minigameId) { this.minigameId = minigameId; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public double getTimeUsed() { return timeUsed; }
    public void setTimeUsed(double timeUsed) { this.timeUsed = timeUsed; }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public int getMistakes() { return mistakes; }
    public void setMistakes(int mistakes) { this.mistakes = mistakes; }
}
