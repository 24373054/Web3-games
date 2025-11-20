package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GeometryComplexity {
    SIMPLE, MEDIUM, COMPLEX, BROKEN, FROZEN;

    @JsonCreator
    public static GeometryComplexity from(String v) {
        return v == null ? SIMPLE : GeometryComplexity.valueOf(v.replace('-', '_').toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
