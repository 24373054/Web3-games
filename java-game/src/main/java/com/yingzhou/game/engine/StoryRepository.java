package com.yingzhou.game.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yingzhou.game.model.StoryData;

import java.io.InputStream;

public class StoryRepository {
    public StoryData load() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getResourceAsStream("/story.json");
            if (is == null) throw new IllegalStateException("story.json not found in resources");
            return mapper.readValue(is, StoryData.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load story.json", e);
        }
    }
}
