package com.yingzhou.npc;

import javafx.geometry.Point3D;
import javafx.scene.paint.Color;

/**
 * NPC基类
 * 所有NPC的抽象基类
 */
public abstract class BaseNPC {
    
    protected String name;
    protected Point3D position;
    protected Color color;
    protected double size;
    protected boolean playerNearby;
    protected double rotationAngle;

    public BaseNPC(String name, Point3D position, Color color, double size) {
        this.name = name;
        this.position = position;
        this.color = color;
        this.size = size;
        this.playerNearby = false;
        this.rotationAngle = 0;
    }

    public void update(double deltaTime) {
        // 旋转动画
        rotationAngle += deltaTime * 30; // 每秒旋转30度
        if (rotationAngle >= 360) {
            rotationAngle -= 360;
        }
    }

    public abstract void interact();
    
    public abstract String getDialogue(String playerMessage);
    
    public abstract void startMiniGame();

    // Getters and Setters
    public String getName() {
        return name;
    }

    public Point3D getPosition() {
        return position;
    }

    public Color getColor() {
        return color;
    }

    public double getSize() {
        return size;
    }

    public boolean isPlayerNearby() {
        return playerNearby;
    }

    public void setPlayerNearby(boolean nearby) {
        this.playerNearby = nearby;
    }

    public double getRotationAngle() {
        return rotationAngle;
    }
}
