package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Position {
    EAST, NORTH, CENTER, SOUTH, WEST;

    @JsonCreator
    public static Position from(String v) {
        return v == null ? CENTER : Position.valueOf(v.toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
