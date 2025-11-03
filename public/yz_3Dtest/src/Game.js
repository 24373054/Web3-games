import * as BABYLON from '@babylonjs/core';
import * as CANNON from 'cannon-es';
import { EntitySystem } from './EntitySystem.js';
import { DialogSystem } from './DialogSystem.js';
import { WorldDestruction } from './WorldDestruction.js';
import { Player } from './Player.js';
import { MiniGameManager } from './MiniGameManager.js';

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
        this.miniGameManager = null;
        
        // 游戏状态
        this.blockHeight = 9999900000;
        this.gameTime = 0;
        
        // 探索时间限制（秒）
        this.explorationTimeLimit = 300; // 5分钟
        this.currentExplorationTime = 0;
        this.isExplorationEnded = false;
        
        // 数据碎片收集
        this.collectedFragments = 0;
        
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
        
        // 初始化小游戏管理器
        console.log('初始化小游戏管理器...');
        this.miniGameManager = new MiniGameManager();
        window.miniGameManager = this.miniGameManager; // 暴露到全局供游戏使用
        
        // 生成初始实体
        console.log('生成初始实体...');
        this.entitySystem.spawnInitialEntities();
        
        console.log('游戏初始化完成！');
        
        // 设置UI
        this.setupUI();
        
        // 设置输入
        this.setupInput();
        
        // 监听来自主游戏的消息
        this.setupMessageListener();
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        
        // 通知主游戏加载完成
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: '3D_LOADED' }, '*');
        }
    }
    
    // 设置消息监听
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'INIT_3D_WORLD') {
                const { era, account, timeLimit } = event.data.data;
                console.log('收到主游戏初始化数据:', era, account, timeLimit);
                
                // 根据纪元调整游戏难度或视觉效果
                if (era !== undefined) {
                    this.currentEra = era;
                    this.updateWorldByEra(era);
                }
                
                // 设置探索时间
                if (timeLimit !== undefined) {
                    this.explorationTimeLimit = timeLimit;
                }
            }
        });
    }
    
    // 根据纪元更新世界
    updateWorldByEra(era) {
        // 根据不同纪元调整视觉效果
        const eraColors = [
            { ambient: [0.7, 0.9, 0.9], fog: [0.05, 0.05, 0.15] },  // 创世 - 明亮
            { ambient: [0.6, 0.8, 0.8], fog: [0.08, 0.08, 0.18] },  // 萌芽
            { ambient: [0.5, 0.7, 0.7], fog: [0.1, 0.1, 0.2] },     // 繁盛
            { ambient: [0.4, 0.5, 0.5], fog: [0.15, 0.1, 0.15] },   // 熵化 - 开始衰败
            { ambient: [0.3, 0.3, 0.3], fog: [0.2, 0.1, 0.1] }      // 毁灭 - 黯淡
        ];
        
        const colors = eraColors[Math.min(era, eraColors.length - 1)];
        
        // 更新环境光
        const ambientLight = this.scene.lights.find(l => l.name === 'ambient');
        if (ambientLight) {
            ambientLight.diffuse = new BABYLON.Color3(...colors.ambient);
        }
        
        // 更新场景背景色
        this.scene.clearColor = new BABYLON.Color3(...colors.fog);
        
        console.log(`世界已更新为纪元 ${era + 1} 的视觉效果`);
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
        
        // 添加探索时间显示到世界信息面板
        const worldInfo = document.getElementById('worldInfo');
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'info-line';
        timeDisplay.style.color = '#ffff00';
        timeDisplay.style.marginTop = '10px';
        timeDisplay.innerHTML = `
            <div style="text-align: center;">
                <strong>探索时间剩余</strong><br>
                <span style="font-size: 20px; font-weight: bold;" id="explorationTime">
                    ${this.formatTime(this.explorationTimeLimit)}
                </span>
            </div>
        `;
        worldInfo.appendChild(timeDisplay);
        
        // 添加碎片收集显示
        const fragmentDisplay = document.createElement('div');
        fragmentDisplay.className = 'info-line';
        fragmentDisplay.style.marginTop = '10px';
        fragmentDisplay.innerHTML = `数据碎片: <span id="fragmentCount" style="color: #ffff00;">0</span>`;
        worldInfo.appendChild(fragmentDisplay);
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
        // 检查探索时间是否结束
        if (this.isExplorationEnded) {
            console.log('探索时间已结束，无法交互');
            return;
        }
        
        // 检测玩家附近的实体
        const playerPos = this.camera.position;
        const nearbyEntity = this.entitySystem.findNearestEntity(playerPos, 5);
        
        if (nearbyEntity) {
            console.log('✅ 找到附近实体:', nearbyEntity.type, nearbyEntity.address.substring(0, 10) + '...');
            
            // 检查实体是否已经被交互过
            if (nearbyEntity.isInteracted) {
                console.log('该实体已被交互过');
                this.dialogSystem.showMessage('该数据节点已被解析', '你已经从这个节点获取过数据碎片了。');
                return;
            }
            
            // 启动对应的小游戏
            this.startMiniGame(nearbyEntity);
            
        } else {
            console.log('❌ 附近没有可交互的实体（距离 < 5）');
            console.log('   玩家位置:', playerPos);
            console.log('   实体数量:', this.entitySystem.entities.length);
        }
    }
    
    // 启动小游戏
    startMiniGame(entity) {
        console.log('启动小游戏:', entity.type);
        
        // 暂停探索时间计时
        const wasPaused = this.explorationTimePaused;
        this.explorationTimePaused = true;
        
        this.miniGameManager.startGame(entity.type, (score) => {
            // 游戏完成回调
            console.log('小游戏完成，得分:', score);
            
            // 标记实体已交互
            entity.isInteracted = true;
            
            // 更新实体外观
            if (entity.mesh && entity.mesh.material) {
                entity.mesh.material.alpha = 0.5;
                entity.mesh.material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            }
            
            // 增加数据碎片
            this.collectedFragments++;
            document.getElementById('fragmentCount').textContent = this.collectedFragments;
            
            // 更新交互计数
            this.player.interactionCount++;
            document.getElementById('interactionCount').textContent = 
                this.player.interactionCount;
            
            // 通知主游戏收集到碎片
            this.notifyFragmentCollected(entity.typeIndex, score);
            
            // 恢复探索时间计时
            this.explorationTimePaused = wasPaused;
            
            console.log('数据碎片总数:', this.collectedFragments);
        });
    }
    
    // 通知主游戏收集到碎片
    notifyFragmentCollected(fragmentType, score) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: '3D_FRAGMENT_COLLECTED',
                fragmentId: fragmentType,
                score: score,
                timestamp: Date.now()
            }, '*');
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
        
        // 更新探索时间
        if (!this.isExplorationEnded && !this.explorationTimePaused) {
            this.currentExplorationTime += deltaTime;
            const timeLeft = this.explorationTimeLimit - this.currentExplorationTime;
            
            if (timeLeft <= 0) {
                this.endExploration();
            } else {
                const timeDisplay = document.getElementById('explorationTime');
                if (timeDisplay) {
                    timeDisplay.textContent = this.formatTime(timeLeft);
                    // 时间不足30秒时变红色并闪烁
                    if (timeLeft <= 30) {
                        timeDisplay.style.color = '#ff0000';
                        timeDisplay.style.animation = 'blink 1s infinite';
                    }
                }
            }
        }
        
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
    
    // 格式化时间显示
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 结束探索
    endExploration() {
        if (this.isExplorationEnded) return;
        
        this.isExplorationEnded = true;
        console.log('探索时间结束！');
        
        // 通知主游戏探索结束
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: '3D_EXPLORATION_END',
                data: {
                    fragmentsCollected: this.collectedFragments,
                    interactionCount: this.player.interactionCount,
                    explorationTime: this.explorationTimeLimit
                }
            }, '*');
        }
        
        // 显示结果界面
        const resultDiv = document.createElement('div');
        resultDiv.className = 'time-limit-warning';
        resultDiv.innerHTML = `
            <h2>探索时间结束！</h2>
            <p>你在历史遗迹中探索了 ${this.formatTime(this.explorationTimeLimit)}</p>
            <p>收集到的数据碎片: <span style="color: #ffff00; font-size: 24px;">${this.collectedFragments}</span></p>
            <p>交互次数: ${this.player.interactionCount}</p>
            <p style="margin-top: 20px;">数据已同步到主世界</p>
            <p style="color: #00ff00;">正在返回瀛州...</p>
        `;
        
        document.body.appendChild(resultDiv);
        
        // 3秒后自动关闭（主游戏会处理）
        setTimeout(() => {
            if (window.parent && window.parent !== window) {
                resultDiv.remove();
            } else {
                // 如果是单独打开的，提供重新探索按钮
                resultDiv.innerHTML += `
                    <button class="btn-primary" style="margin-top: 20px;" onclick="location.reload()">
                        重新探索
                    </button>
                `;
            }
        }, 3000);
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

