package com.yingzhou.game.engine;

import com.yingzhou.game.model.AINPC;

import java.util.*;

public class KeywordMatcher {
    public static Optional<String> match(AINPC npc, String input) {
        if (npc == null || npc.getKeywords() == null || input == null) return Optional.empty();
        String normalized = input.trim();
        for (List<String> list : npc.getKeywords().values()) {
            for (String kw : list) {
                if (kw != null && !kw.isBlank() && normalized.contains(kw)) {
                    return Optional.of(kw);
                }
            }
        }
        return Optional.empty();
    }
}
