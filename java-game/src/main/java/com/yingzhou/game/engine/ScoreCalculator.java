package com.yingzhou.game.engine;

public class ScoreCalculator {
    public static double calculate(double timeUsed, int timeLimit, double accuracy, int mistakes) {
        double timeScore = Math.max(0, ((timeLimit - timeUsed) / timeLimit) * 40.0);
        double accuracyScore = accuracy * 40.0;
        double smoothScore = Math.max(0, 20.0 - mistakes * 5.0);
        return Math.min(100.0, timeScore + accuracyScore + smoothScore);
    }
}
