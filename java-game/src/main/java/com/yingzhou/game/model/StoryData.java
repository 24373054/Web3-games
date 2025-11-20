package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StoryData {
    private List<EraConfig> eras;
    private List<AINPC> npcs;
    private List<MiniGame> minigames;
    private List<MemoryFragment> fragments;

    public StoryData() {}

    public List<EraConfig> getEras() { return eras; }
    public void setEras(List<EraConfig> eras) { this.eras = eras; }

    public List<AINPC> getNpcs() { return npcs; }
    public void setNpcs(List<AINPC> npcs) { this.npcs = npcs; }

    public List<MiniGame> getMinigames() { return minigames; }
    public void setMinigames(List<MiniGame> minigames) { this.minigames = minigames; }

    public List<MemoryFragment> getFragments() { return fragments; }
    public void setFragments(List<MemoryFragment> fragments) { this.fragments = fragments; }
}
