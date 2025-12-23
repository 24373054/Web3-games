package com.yingzhou.game.player;

import com.yingzhou.util.Logger;
import javafx.geometry.Point3D;

/**
 * 玩家类
 * 管理玩家的位置、移动和视角
 */
public class Player {
    
    private Point3D position;
    private Point3D velocity;
    private double yaw;   // 水平旋转角度
    private double pitch; // 垂直旋转角度
    
    private boolean movingForward;
    private boolean movingBackward;
    private boolean movingLeft;
    private boolean movingRight;
    private boolean jumping;
    
    private static final double MOVE_SPEED = 0.1;
    private static final double JUMP_FORCE = 0.3;
    private static final double GRAVITY = -0.5;
    private static final double MOUSE_SENSITIVITY = 0.2;
    private static final double GROUND_LEVEL = 2.0;

    public Player() {
        position = new Point3D(0, GROUND_LEVEL, 10); // 初始位置
        velocity = Point3D.ZERO;
        yaw = 0;
        pitch = 0;
        Logger.info("玩家初始化完成，位置: " + position);
    }

    public void update(double deltaTime) {
        try {
            // 计算移动方向
            double moveX = 0;
            double moveZ = 0;
            
            if (movingForward) moveZ -= 1;
            if (movingBackward) moveZ += 1;
            if (movingLeft) moveX -= 1;
            if (movingRight) moveX += 1;
            
            // 根据视角旋转移动方向
            if (moveX != 0 || moveZ != 0) {
                double angle = Math.toRadians(yaw);
                double cos = Math.cos(angle);
                double sin = Math.sin(angle);
                
                double newX = moveX * cos - moveZ * sin;
                double newZ = moveX * sin + moveZ * cos;
                
                // 归一化并应用速度
                double length = Math.sqrt(newX * newX + newZ * newZ);
                if (length > 0) {
                    velocity = new Point3D(
                        newX / length * MOVE_SPEED,
                        velocity.getY(),
                        newZ / length * MOVE_SPEED
                    );
                }
            } else {
                velocity = new Point3D(0, velocity.getY(), 0);
            }
            
            // 应用重力
            double newY = velocity.getY() + GRAVITY * deltaTime;
            velocity = new Point3D(velocity.getX(), newY, velocity.getZ());
            
            // 更新位置
            position = position.add(velocity);
            
            // 地面碰撞检测
            if (position.getY() < GROUND_LEVEL) {
                position = new Point3D(position.getX(), GROUND_LEVEL, position.getZ());
                velocity = new Point3D(velocity.getX(), 0, velocity.getZ());
                jumping = false;
            }
        } catch (Exception e) {
            Logger.error("玩家更新出错", e);
        }
    }

    public void moveForward() {
        movingForward = true;
        Logger.debug("玩家开始向前移动");
    }

    public void moveBackward() {
        movingBackward = true;
        Logger.debug("玩家开始向后移动");
    }

    public void moveLeft() {
        movingLeft = true;
        Logger.debug("玩家开始向左移动");
    }

    public void moveRight() {
        movingRight = true;
        Logger.debug("玩家开始向右移动");
    }

    public void stopMoving() {
        movingForward = false;
        movingBackward = false;
        movingLeft = false;
        movingRight = false;
        Logger.debug("玩家停止移动");
    }

    public void jump() {
        if (!jumping && Math.abs(position.getY() - GROUND_LEVEL) < 0.1) {
            velocity = new Point3D(velocity.getX(), JUMP_FORCE, velocity.getZ());
            jumping = true;
            Logger.debug("玩家跳跃");
        }
    }

    public void rotateView(double deltaX, double deltaY) {
        yaw += deltaX * MOUSE_SENSITIVITY;
        pitch = Math.max(-89, Math.min(89, pitch + deltaY * MOUSE_SENSITIVITY));
        
        // 归一化yaw到0-360度
        while (yaw < 0) yaw += 360;
        while (yaw >= 360) yaw -= 360;
    }

    // Getters
    public Point3D getPosition() {
        return position;
    }

    public double getYaw() {
        return yaw;
    }

    public double getPitch() {
        return pitch;
    }

    public Point3D getVelocity() {
        return velocity;
    }
}
