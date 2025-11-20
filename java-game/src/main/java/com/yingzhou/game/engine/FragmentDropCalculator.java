package com.yingzhou.game.engine;

public class FragmentDropCalculator {
    public static double probability(double score) {
        if (score >= 100.0) return 1.0;
        if (score >= 80.0) return 0.6 + (score - 80.0) / 50.0; // 0.6 - 0.8
        if (score >= 60.0) return 0.4 + (score - 60.0) / 50.0; // 0.4 - 0.6
        if (score >= 50.0) return 0.2 + (score - 50.0) / 50.0; // 0.2 - 0.4
        return 0.0;
    }
}
