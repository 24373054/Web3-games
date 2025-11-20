package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AINPC {
    private String id;
    private String name;
    private String chineseName;
    private String address;
    private int birthBlock;
    private String role;
    private GeometryType geometryType;
    private String color;
    private Position position;
    private String description;
    private List<Integer> availableEras;
    private List<String> minigames;
    private Map<String, List<String>> keywords; // era->keywords (string keys for simplicity)
    private String dialogueStyle;

    public AINPC() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getChineseName() { return chineseName; }
    public void setChineseName(String chineseName) { this.chineseName = chineseName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public int getBirthBlock() { return birthBlock; }
    public void setBirthBlock(int birthBlock) { this.birthBlock = birthBlock; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public GeometryType getGeometryType() { return geometryType; }
    public void setGeometryType(GeometryType geometryType) { this.geometryType = geometryType; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Integer> getAvailableEras() { return availableEras; }
    public void setAvailableEras(List<Integer> availableEras) { this.availableEras = availableEras; }

    public List<String> getMinigames() { return minigames; }
    public void setMinigames(List<String> minigames) { this.minigames = minigames; }

    public Map<String, List<String>> getKeywords() { return keywords; }
    public void setKeywords(Map<String, List<String>> keywords) { this.keywords = keywords; }

    public String getDialogueStyle() { return dialogueStyle; }
    public void setDialogueStyle(String dialogueStyle) { this.dialogueStyle = dialogueStyle; }
}
