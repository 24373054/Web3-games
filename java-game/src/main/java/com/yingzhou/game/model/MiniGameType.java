package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MiniGameType {
    SORTING, CONNECTION, BALANCE, BUILDING, PREDICTION, MAZE, DIALOGUE;

    @JsonCreator
    public static MiniGameType from(String v) {
        return v == null ? DIALOGUE : MiniGameType.valueOf(v.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
