package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MemoryFragment {
    private int id;
    private String title;
    private int block;
    private int era;
    private String content;
    private boolean isHidden;
    private TriggerMethod triggerMethod;
    private String npcId;
    private String minigame;
    private String keyword;

    public MemoryFragment() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getBlock() { return block; }
    public void setBlock(int block) { this.block = block; }

    public int getEra() { return era; }
    public void setEra(int era) { this.era = era; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isHidden() { return isHidden; }
    public void setHidden(boolean hidden) { isHidden = hidden; }

    public TriggerMethod getTriggerMethod() { return triggerMethod; }
    public void setTriggerMethod(TriggerMethod triggerMethod) { this.triggerMethod = triggerMethod; }

    public String getNpcId() { return npcId; }
    public void setNpcId(String npcId) { this.npcId = npcId; }

    public String getMinigame() { return minigame; }
    public void setMinigame(String minigame) { this.minigame = minigame; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
}
