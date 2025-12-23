package com.yingzhou.scene3d;

import com.yingzhou.game.GameEngine;
import com.yingzhou.npc.BaseNPC;
import com.yingzhou.util.Logger;
import javafx.animation.AnimationTimer;
import javafx.scene.*;
import javafx.scene.paint.Color;
import javafx.scene.paint.PhongMaterial;
import javafx.scene.shape.Box;
import javafx.scene.shape.Sphere;
import javafx.scene.transform.Rotate;
import javafx.scene.transform.Translate;

/**
 * 3D场景管理器
 * 管理3D渲染和场景更新
 */
public class Scene3DManager {
    
    private GameEngine gameEngine;
    private Group root3D;
    private SubScene subScene;
    private PerspectiveCamera camera;
    private AnimationTimer renderLoop;
    private long lastUpdate = 0;
    
    private static final int SCENE_WIDTH = 1280;
    private static final int SCENE_HEIGHT = 720;

    public Scene3DManager(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        try {
            Logger.info("初始化3D场景管理器...");
            initialize();
            Logger.info("3D场景管理器初始化成功");
        } catch (Exception e) {
            Logger.error("3D场景管理器初始化失败", e);
            throw e;
        }
    }

    private void initialize() {
        try {
            // 创建3D根节点
            root3D = new Group();
            Logger.debug("3D根节点创建成功");
            
            // 创建相机
            camera = new PerspectiveCamera(true);
            camera.setNearClip(0.1);
            camera.setFarClip(1000.0);
            camera.setFieldOfView(70);
            camera.setTranslateZ(-20); // 初始相机位置
            Logger.debug("相机创建成功");
            
            // 创建SubScene
            subScene = new SubScene(root3D, SCENE_WIDTH, SCENE_HEIGHT, true, SceneAntialiasing.BALANCED);
            subScene.setFill(gameEngine.getEpochManager().getCurrentEpoch().getBackgroundColor());
            subScene.setCamera(camera);
            subScene.widthProperty().bind(subScene.getParent() != null ? 
                ((javafx.scene.layout.Region)subScene.getParent()).widthProperty() : 
                javafx.beans.binding.Bindings.createDoubleBinding(() -> (double)SCENE_WIDTH));
            subScene.heightProperty().bind(subScene.getParent() != null ? 
                ((javafx.scene.layout.Region)subScene.getParent()).heightProperty() : 
                javafx.beans.binding.Bindings.createDoubleBinding(() -> (double)SCENE_HEIGHT));
            Logger.debug("SubScene创建成功");
            
            // 添加环境光
            AmbientLight ambientLight = new AmbientLight(Color.rgb(150, 150, 150));
            root3D.getChildren().add(ambientLight);
            Logger.debug("环境光添加成功");
            
            // 添加点光源
            PointLight pointLight = new PointLight(Color.WHITE);
            pointLight.setTranslateY(-50);
            root3D.getChildren().add(pointLight);
            Logger.debug("点光源添加成功");
            
            // 创建地面
            createGround();
            Logger.debug("地面创建成功");
            
            // 创建NPC几何体
            createNPCGeometry();
            Logger.debug("NPC几何体创建成功，共" + gameEngine.getNPCManager().getNPCs().size() + "个");
            
            // 创建渲染循环
            createRenderLoop();
            Logger.debug("渲染循环创建成功");
            
        } catch (Exception e) {
            Logger.error("初始化3D场景时出错", e);
            throw e;
        }
    }

    private void createGround() {
        Box ground = new Box(100, 0.1, 100);
        PhongMaterial groundMaterial = new PhongMaterial();
        groundMaterial.setDiffuseColor(Color.rgb(30, 30, 30));
        ground.setMaterial(groundMaterial);
        ground.setTranslateY(0);
        root3D.getChildren().add(ground);
    }

    private void createNPCGeometry() {
        for (BaseNPC npc : gameEngine.getNPCManager().getNPCs()) {
            Node npcNode = createNPCNode(npc);
            root3D.getChildren().add(npcNode);
        }
    }

    private Node createNPCNode(BaseNPC npc) {
        Group npcGroup = new Group();
        
        // 创建几何体（立方体或球体）
        Box box = new Box(npc.getSize(), npc.getSize(), npc.getSize());
        PhongMaterial material = new PhongMaterial();
        material.setDiffuseColor(npc.getColor());
        material.setSpecularColor(Color.WHITE);
        box.setMaterial(material);
        
        // 设置位置
        npcGroup.setTranslateX(npc.getPosition().getX());
        npcGroup.setTranslateY(npc.getPosition().getY() + npc.getSize() / 2);
        npcGroup.setTranslateZ(npc.getPosition().getZ());
        
        npcGroup.getChildren().add(box);
        
        // 存储NPC引用用于更新
        npcGroup.setUserData(npc);
        
        return npcGroup;
    }

    private void createRenderLoop() {
        renderLoop = new AnimationTimer() {
            @Override
            public void handle(long now) {
                try {
                    // 计算deltaTime
                    if (lastUpdate == 0) {
                        lastUpdate = now;
                        return;
                    }
                    double deltaTime = (now - lastUpdate) / 1_000_000_000.0;
                    lastUpdate = now;
                    
                    // 限制deltaTime避免大跳跃
                    deltaTime = Math.min(deltaTime, 0.1);
                    
                    updateCamera();
                    updateNPCs();
                    updateBackground();
                } catch (Exception e) {
                    Logger.error("渲染循环出错", e);
                }
            }
        };
    }

    private void updateCamera() {
        // 更新相机位置和旋转
        var player = gameEngine.getPlayer();
        var pos = player.getPosition();
        
        camera.setTranslateX(pos.getX());
        camera.setTranslateY(pos.getY());
        camera.setTranslateZ(pos.getZ());
        
        // 设置相机旋转
        camera.setRotationAxis(Rotate.Y_AXIS);
        camera.setRotate(player.getYaw());
        
        // 俯仰角
        Rotate pitchRotate = new Rotate(player.getPitch(), Rotate.X_AXIS);
        camera.getTransforms().clear();
        camera.getTransforms().add(pitchRotate);
    }

    private void updateNPCs() {
        for (Node node : root3D.getChildren()) {
            if (node.getUserData() instanceof BaseNPC npc) {
                // 更新NPC旋转
                node.setRotate(npc.getRotationAngle());
                node.setRotationAxis(Rotate.Y_AXIS);
                
                // 如果玩家靠近，添加高亮效果
                if (npc.isPlayerNearby()) {
                    node.setScaleX(1.1);
                    node.setScaleY(1.1);
                    node.setScaleZ(1.1);
                } else {
                    node.setScaleX(1.0);
                    node.setScaleY(1.0);
                    node.setScaleZ(1.0);
                }
            }
        }
    }

    private void updateBackground() {
        // 根据当前纪元更新背景色
        Color bgColor = gameEngine.getEpochManager().getCurrentEpoch().getBackgroundColor();
        subScene.setFill(bgColor);
    }

    public void start() {
        try {
            Logger.info("启动3D渲染循环");
            renderLoop.start();
        } catch (Exception e) {
            Logger.error("启动渲染循环失败", e);
        }
    }

    public void stop() {
        try {
            Logger.info("停止3D渲染循环");
            renderLoop.stop();
        } catch (Exception e) {
            Logger.error("停止渲染循环失败", e);
        }
    }

    public SubScene getSubScene() {
        return subScene;
    }
}
