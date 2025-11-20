package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TriggerMethod {
    MINIGAME, KEYWORD;

    @JsonCreator
    public static TriggerMethod from(String v) {
        return v == null ? MINIGAME : TriggerMethod.valueOf(v.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
