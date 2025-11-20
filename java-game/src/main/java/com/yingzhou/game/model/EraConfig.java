package com.yingzhou.game.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EraConfig {
    private int id;
    private String name;
    private String chineseName;
    private int[] blockRange;
    private String backgroundColor;
    private String ambientLight;
    private String fogColor;
    private GeometryComplexity geometryComplexity;
    private ParticleEffect particleEffect;
    private boolean glitchEffect;
    private double transparency;
    private String description;

    public EraConfig() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getChineseName() { return chineseName; }
    public void setChineseName(String chineseName) { this.chineseName = chineseName; }

    public int[] getBlockRange() { return blockRange; }
    public void setBlockRange(int[] blockRange) { this.blockRange = blockRange; }

    public String getBackgroundColor() { return backgroundColor; }
    public void setBackgroundColor(String backgroundColor) { this.backgroundColor = backgroundColor; }

    public String getAmbientLight() { return ambientLight; }
    public void setAmbientLight(String ambientLight) { this.ambientLight = ambientLight; }

    public String getFogColor() { return fogColor; }
    public void setFogColor(String fogColor) { this.fogColor = fogColor; }

    public GeometryComplexity getGeometryComplexity() { return geometryComplexity; }
    public void setGeometryComplexity(GeometryComplexity geometryComplexity) { this.geometryComplexity = geometryComplexity; }

    public ParticleEffect getParticleEffect() { return particleEffect; }
    public void setParticleEffect(ParticleEffect particleEffect) { this.particleEffect = particleEffect; }

    public boolean isGlitchEffect() { return glitchEffect; }
    public void setGlitchEffect(boolean glitchEffect) { this.glitchEffect = glitchEffect; }

    public double getTransparency() { return transparency; }
    public void setTransparency(double transparency) { this.transparency = transparency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
