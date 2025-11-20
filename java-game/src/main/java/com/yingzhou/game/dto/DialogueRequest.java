package com.yingzhou.game.dto;

public class DialogueRequest {
    private String npcId;
    private String message;
    private String playerId;
    private int currentEra;

    public DialogueRequest() {}

    public String getNpcId() { return npcId; }
    public void setNpcId(String npcId) { this.npcId = npcId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public int getCurrentEra() { return currentEra; }
    public void setCurrentEra(int currentEra) { this.currentEra = currentEra; }
}
