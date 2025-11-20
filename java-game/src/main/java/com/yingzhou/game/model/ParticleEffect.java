package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ParticleEffect {
    PULSE, NETWORK, ABUNDANT, CHAOTIC, NONE;

    @JsonCreator
    public static ParticleEffect from(String v) {
        return v == null ? NONE : ParticleEffect.valueOf(v.replace('-', '_').toUpperCase());
    }

    @JsonValue
    public String toValue() {
        return name().toLowerCase();
    }
}
