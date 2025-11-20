package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GeometryType {
    CUBE, OCTAHEDRON, SPHERE, NESTED_CUBE, CORRUPTED;

    @JsonCreator
    public static GeometryType from(String v) {
        return v == null ? CUBE : GeometryType.valueOf(v.replace('-', '_').toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
