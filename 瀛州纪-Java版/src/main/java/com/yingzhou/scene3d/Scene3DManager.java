package com.yingzhou.scene3d;

import com.yingzhou.game.GameEngine;
import com.yingzhou.npc.BaseNPC;
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
    
    private static final int SCENE_WIDTH = 1280;
    private static final int SCENE_HEIGHT = 720;

    public Scene3DManager(GameEngine gameEngine) {
        this.gameEngine = gameEngine;
        initialize();
    }

    private void initialize() {
        // 创建3D根节点
        root3D = new Group();
        
        // 创建相机
        camera = new PerspectiveCamera(true);
        camera.setNearClip(0.1);
        camera.setFarClip(1000.0);
        camera.setFieldOfView(70);
        
        // 创建SubScene
        subScene = new SubScene(root3D, SCENE_WIDTH, SCENE_HEIGHT, true, SceneAntialiasing.BALANCED);
        subScene.setFill(gameEngine.getEpochManager().getCurrentEpoch().getBackgroundColor());
        subScene.setCamera(camera);
        
        // 添加环境光
        AmbientLight ambientLight = new AmbientLight(Color.rgb(100, 100, 100));
        root3D.getChildren().add(ambientLight);
        
        // 添加点光源
        PointLight pointLight = new PointLight(Color.WHITE);
        pointLight.setTranslateY(-50);
        root3D.getChildren().add(pointLight);
        
        // 创建地面
        createGround();
        
        // 创建NPC几何体
        createNPCGeometry();
        
        // 创建渲染循环
        createRenderLoop();
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
                updateCamera();
                updateNPCs();
                updateBackground();
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
        renderLoop.start();
    }

    public void stop() {
        renderLoop.stop();
    }

    public SubScene getSubScene() {
        return subScene;
    }
}
