import * as BABYLON from '@babylonjs/core';
import * as CANNON from 'cannon-es';
import { EntitySystem } from './EntitySystem.js';
import { DialogSystem } from './DialogSystem.js';
import { WorldDestruction } from './WorldDestruction.js';
import { Player } from './Player.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = null;
        this.camera = null;
        this.player = null;
        this.entitySystem = null;
        this.dialogSystem = null;
        this.worldDestruction = null;
        
        // 游戏状态
        this.blockHeight = 9999900000;
        this.gameTime = 0;
        
        this.init();
    }

    init() {
        console.log('初始化游戏...');
        
        // 创建场景
        this.scene = new BABYLON.Scene(this.engine);
        // 使用更明亮的背景色便于调试
        this.scene.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);
        
        console.log('场景已创建，背景色:', this.scene.clearColor);
        
        // 启用物理引擎
        try {
            const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
            const physicsPlugin = new BABYLON.CannonJSPlugin(true, 10, CANNON);
            this.scene.enablePhysics(gravityVector, physicsPlugin);
            
            console.log('✅ 物理引擎已启用');
            console.log('   引擎类型:', physicsPlugin.name);
            console.log('   重力:', gravityVector);
            
            // 验证物理引擎
            if (this.scene.getPhysicsEngine()) {
                console.log('   物理引擎实例:', this.scene.getPhysicsEngine());
            } else {
                console.error('❌ 物理引擎实例未创建！');
            }
        } catch (error) {
            console.error('❌ 物理引擎启用失败:', error);
        }
        
        // 创建相机
        this.camera = new BABYLON.UniversalCamera(
            'camera',
            new BABYLON.Vector3(0, 5, -15),
            this.scene
        );
        this.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        
        // 重要：先不要attachControl，让Player类来管理
        // this.camera.attachControl(this.canvas, true);
        
        this.camera.speed = 0.5;
        this.camera.angularSensibility = 2000;
        
        // 禁用默认的键盘输入，我们会自己处理
        this.camera.inputs.clear();
        
        // 只保留鼠标控制（用于视角）
        this.camera.inputs.addMouse();
        this.camera.attachControl(this.canvas, true);
        
        console.log('相机已创建，位置:', this.camera.position);
        
        // 创建环境光 - 提高亮度便于调试
        const ambientLight = new BABYLON.HemisphericLight(
            'ambient',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 1.0;
        ambientLight.diffuse = new BABYLON.Color3(0.7, 0.9, 0.9);
        ambientLight.groundColor = new BABYLON.Color3(0.2, 0.4, 0.4);
        
        console.log('环境光已创建，强度:', ambientLight.intensity);
        
        // 创建定向光
        const light = new BABYLON.DirectionalLight(
            'light',
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        light.intensity = 1.0;
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        
        console.log('定向光已创建');
        
        // 添加点光源用于额外照明
        const pointLight = new BABYLON.PointLight(
            'pointLight',
            new BABYLON.Vector3(0, 10, 0),
            this.scene
        );
        pointLight.intensity = 1.0;
        pointLight.diffuse = new BABYLON.Color3(0.5, 1, 1);
        
        console.log('点光源已创建');
        
        // 创建数字化的世界环境
        console.log('创建世界环境...');
        this.createDigitalWorld();
        
        // 初始化系统
        console.log('初始化玩家...');
        this.player = new Player(this.scene, this.camera);
        
        console.log('初始化实体系统...');
        this.entitySystem = new EntitySystem(this.scene);
        
        console.log('初始化对话系统...');
        this.dialogSystem = new DialogSystem();
        
        console.log('初始化世界毁灭系统...');
        this.worldDestruction = new WorldDestruction(this.scene);
        
        // 生成初始实体
        console.log('生成初始实体...');
        this.entitySystem.spawnInitialEntities();
        
        console.log('游戏初始化完成！');
        
        // 设置UI
        this.setupUI();
        
        // 设置输入
        this.setupInput();
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createDigitalWorld() {
        console.log('创建地面...');
        // 地面 - 网格化的数字地面
        const ground = BABYLON.MeshBuilder.CreateGround(
            'ground',
            { width: 200, height: 200, subdivisions: 40 },
            this.scene
        );
        console.log('地面已创建');
        
        const groundMaterial = new BABYLON.StandardMaterial('groundMat', this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.05, 0.1, 0.15);
        groundMaterial.specularColor = new BABYLON.Color3(0.3, 0.5, 0.5);
        groundMaterial.emissiveColor = new BABYLON.Color3(0, 0.1, 0.1);
        groundMaterial.wireframe = false;
        ground.material = groundMaterial;
        
        // 添加物理（降低地面摩擦力）
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { 
                mass: 0,              // 静态物体
                friction: 0.1,        // 低摩擦力
                restitution: 0.1      // 低弹性
            },
            this.scene
        );
        
        // 使用网格线替代方案
        this.createGridLines();
        
        console.log('创建天空盒...');
        // 天空盒 - 数字化空间
        const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 500 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMat', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.emissiveColor = new BABYLON.Color3(0.01, 0.01, 0.05);
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        console.log('天空盒已创建');
        
        console.log('创建装饰立方体...');
        // 添加悬浮的数据立方体作为装饰
        for (let i = 0; i < 50; i++) {
            const cube = BABYLON.MeshBuilder.CreateBox(
                `dataCube${i}`,
                { size: Math.random() * 2 + 0.5 },
                this.scene
            );
            
            cube.position = new BABYLON.Vector3(
                Math.random() * 180 - 90,
                Math.random() * 30 + 5,
                Math.random() * 180 - 90
            );
            
            const cubeMat = new BABYLON.StandardMaterial(`cubeMat${i}`, this.scene);
            cubeMat.diffuseColor = new BABYLON.Color3(
                Math.random() * 0.2,
                Math.random() * 0.5 + 0.3,
                Math.random() * 0.5 + 0.3
            );
            cubeMat.emissiveColor = cubeMat.diffuseColor.scale(0.3);
            cubeMat.alpha = 0.6;
            cube.material = cubeMat;
            
            // 添加旋转动画
            cube.rotation = new BABYLON.Vector3(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
        }
        
        // 粒子系统 - 数据流
        this.createDataStreams();
    }

    createGridLines() {
        // 创建网格线的替代方案
        const gridSize = 200;
        const gridStep = 5;
        const lines = [];
        
        for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
            lines.push([
                new BABYLON.Vector3(i, 0.1, -gridSize / 2),
                new BABYLON.Vector3(i, 0.1, gridSize / 2)
            ]);
            lines.push([
                new BABYLON.Vector3(-gridSize / 2, 0.1, i),
                new BABYLON.Vector3(gridSize / 2, 0.1, i)
            ]);
        }
        
        const lineSystem = BABYLON.MeshBuilder.CreateLineSystem(
            'grid',
            { lines: lines },
            this.scene
        );
        lineSystem.color = new BABYLON.Color3(0, 1.5, 1.5);
        lineSystem.alpha = 0.5;
        
        console.log('网格线已创建');
    }

    createDataStreams() {
        // 创建多个粒子系统模拟数据流
        for (let i = 0; i < 3; i++) {
            const particleSystem = new BABYLON.ParticleSystem(
                `particles${i}`,
                2000,
                this.scene
            );
            
            // 粒子发射器
            particleSystem.emitter = new BABYLON.Vector3(
                Math.random() * 100 - 50,
                0,
                Math.random() * 100 - 50
            );
            
            particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
            particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
            
            // 粒子颜色
            particleSystem.color1 = new BABYLON.Color4(0, 1, 1, 0.5);
            particleSystem.color2 = new BABYLON.Color4(0, 0.5, 1, 0.3);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.5, 0);
            
            // 粒子大小
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.3;
            
            // 生命周期
            particleSystem.minLifeTime = 2;
            particleSystem.maxLifeTime = 4;
            
            // 发射速率
            particleSystem.emitRate = 100;
            
            // 方向
            particleSystem.direction1 = new BABYLON.Vector3(-1, 5, -1);
            particleSystem.direction2 = new BABYLON.Vector3(1, 8, 1);
            
            // 速度
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 3;
            particleSystem.updateSpeed = 0.01;
            
            // 重力
            particleSystem.gravity = new BABYLON.Vector3(0, -2, 0);
            
            particleSystem.start();
        }
    }

    setupUI() {
        // 更新玩家信息
        document.getElementById('playerAddress').textContent = this.player.address;
        document.getElementById('birthBlock').textContent = this.player.birthBlock;
        
        // 更新实体数量
        const updateEntityCount = () => {
            document.getElementById('entityCount').textContent = 
                this.entitySystem.entities.length;
        };
        updateEntityCount();
    }

    setupInput() {
        // E键交互 - 使用window事件与Player类保持一致
        let eKeyPressed = false;
        
        window.addEventListener('keydown', (evt) => {
            if ((evt.key === 'e' || evt.key === 'E') && !eKeyPressed) {
                eKeyPressed = true;
                this.tryInteract();
                console.log('尝试交互...');
            }
        });
        
        window.addEventListener('keyup', (evt) => {
            if (evt.key === 'e' || evt.key === 'E') {
                eKeyPressed = false;
            }
        });
        
        console.log('✅ 交互系统已设置（按E键交互）');
    }

    tryInteract() {
        // 检测玩家附近的实体
        const playerPos = this.camera.position;
        const nearbyEntity = this.entitySystem.findNearestEntity(playerPos, 5);
        
        if (nearbyEntity) {
            console.log('✅ 找到附近实体:', nearbyEntity.type, nearbyEntity.address.substring(0, 10) + '...');
            
            this.dialogSystem.startDialog(nearbyEntity, (response) => {
                this.handleDialogResponse(nearbyEntity, response);
            });
            
            // 更新交互计数
            this.player.interactionCount++;
            document.getElementById('interactionCount').textContent = 
                this.player.interactionCount;
        } else {
            console.log('❌ 附近没有可交互的实体（距离 < 5）');
            console.log('   玩家位置:', playerPos);
            console.log('   实体数量:', this.entitySystem.entities.length);
        }
    }

    handleDialogResponse(entity, response) {
        // 根据对话选择处理游戏逻辑
        console.log('Dialog response:', response, 'from entity:', entity.address);
        
        // 更新任务
        this.dialogSystem.updateQuests(response);
    }

    start() {
        // 游戏主循环
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });
    }

    update() {
        const deltaTime = this.engine.getDeltaTime() / 1000;
        this.gameTime += deltaTime;
        
        // 更新区块高度
        this.blockHeight += Math.floor(Math.random() * 3);
        document.getElementById('blockHeight').textContent = this.blockHeight;
        
        // 更新实体系统
        this.entitySystem.update(deltaTime);
        
        // 更新世界毁灭系统
        const timeRemaining = this.worldDestruction.update(deltaTime);
        document.getElementById('countdown').textContent = timeRemaining.toFixed(2);
        
        // 检查游戏结束
        if (this.worldDestruction.isDestroyed()) {
            this.endGame();
        }
        
        // 更新玩家状态
        this.player.update(deltaTime);
    }

    endGame() {
        // 游戏结束逻辑
        this.dialogSystem.showEnding();
        
        setTimeout(() => {
            alert('瀛州已陷入熵增临界...\n\n你见证了一个文明的终结。\n\n感谢阅读《瀛州纪》。');
            location.reload();
        }, 3000);
    }
}

