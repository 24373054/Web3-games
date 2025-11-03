import * as BABYLON from '@babylonjs/core';

export class Player {
    constructor(scene, camera) {
        console.log('创建玩家...');
        this.scene = scene;
        this.camera = camera;
        
        // 生成唯一的合约地址
        this.address = this.generateAddress();
        this.birthBlock = Math.floor(Math.random() * 1000000) + 9999000000;
        this.interactionCount = 0;
        this.status = '就绪';
        
        console.log('玩家地址:', this.address);
        
        // 创建玩家的视觉表示（第一人称，所以是隐形的碰撞体）
        this.createPlayerBody();
        
        console.log('玩家创建完成');
        
        // 移动参数
        this.moveSpeed = 10;
        this.jumpPower = 8;
        this.isGrounded = true;
        
        // 设置键盘输入
        this.setupControls();
    }

    generateAddress() {
        // 生成类似以太坊的地址
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    createPlayerBody() {
        // 创建玩家碰撞体（使用球体而非胶囊体，因为Cannon.js兼容性更好）
        this.body = BABYLON.MeshBuilder.CreateSphere(
            'player',
            { diameter: 1.6 },
            this.scene
        );
        
        // 设置初始位置（在地面上方一点）
        this.body.position = new BABYLON.Vector3(0, 3, 0);
        
        // 调试时可见，方便查看位置
        this.body.isVisible = true; // 改为true可以看到玩家碰撞体
        
        // 给碰撞体添加明显的颜色
        const debugMat = new BABYLON.StandardMaterial('playerDebugMat', this.scene);
        debugMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        debugMat.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        debugMat.alpha = 0.5;
        this.body.material = debugMat;
        
        // 添加物理（降低摩擦力，增加质量）
        this.body.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.body,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { 
                mass: 10,           // 增加质量使其更稳定
                friction: 0.1,      // 降低摩擦力便于移动
                restitution: 0.1    // 低弹性
            },
            this.scene
        );
        
        // 禁用物理体的自动休眠
        if (this.body.physicsImpostor.physicsBody) {
            this.body.physicsImpostor.physicsBody.allowSleep = false;
        }
        
        // 不要将相机设为子对象，而是在update中手动同步位置
        console.log('✅ 玩家物理体已创建');
        console.log('   初始位置:', this.body.position);
        console.log('   质量:', 10);
        console.log('   摩擦力:', 0.1);
        console.log('   调试模式: 红色半透明球体可见');
    }

    setupControls() {
        this.inputMap = {};
        
        // 调试面板显示状态
        this.debugPanelVisible = false;
        
        // 使用window事件监听，更可靠
        window.addEventListener('keydown', (evt) => {
            const key = evt.key.toLowerCase();
            
            // F1 切换调试面板
            if (evt.key === 'F1') {
                evt.preventDefault();
                this.debugPanelVisible = !this.debugPanelVisible;
                document.getElementById('debugPanel').style.display = 
                    this.debugPanelVisible ? 'block' : 'none';
                console.log('调试面板:', this.debugPanelVisible ? '开启' : '关闭');
                return;
            }
            
            // 阻止WASD和空格的默认行为
            if (['w', 'a', 's', 'd', ' '].includes(key)) {
                evt.preventDefault();
            }
            
            this.inputMap[key] = true;
            
            // 只在首次按下时打印日志，避免刷屏
            if (!this._lastLoggedKey || this._lastLoggedKey !== key) {
                console.log('按键按下:', key);
                this._lastLoggedKey = key;
            }
        });
        
        window.addEventListener('keyup', (evt) => {
            const key = evt.key.toLowerCase();
            
            // 阻止默认行为
            if (['w', 'a', 's', 'd', ' '].includes(key)) {
                evt.preventDefault();
            }
            
            this.inputMap[key] = false;
            this._lastLoggedKey = null;
        });
        
        console.log('✅ 控制系统已设置');
        console.log('   WASD - 移动');
        console.log('   鼠标 - 视角');
        console.log('   空格 - 跳跃');
        console.log('   E - 交互');
    }

    update(deltaTime) {
        if (!this.body || !this.body.physicsImpostor) {
            console.warn('玩家物理体未初始化');
            return;
        }
        
        // 获取相机方向（在同步位置之前，使用当前相机方向）
        const forward = this.camera.getDirection(BABYLON.Axis.Z);
        const right = this.camera.getDirection(BABYLON.Axis.X);
        
        // 移动向量
        let moveX = 0;
        let moveZ = 0;
        
        if (this.inputMap['w']) {
            moveX += forward.x;
            moveZ += forward.z;
        }
        if (this.inputMap['s']) {
            moveX -= forward.x;
            moveZ -= forward.z;
        }
        if (this.inputMap['a']) {
            moveX -= right.x;
            moveZ -= right.z;
        }
        if (this.inputMap['d']) {
            moveX += right.x;
            moveZ += right.z;
        }
        
        // 标准化移动向量
        const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (moveLength > 0) {
            moveX = (moveX / moveLength) * this.moveSpeed;
            moveZ = (moveZ / moveLength) * this.moveSpeed;
            
            // 调试：打印移动信息（限制频率）
            if (!this._lastMoveLog || Date.now() - this._lastMoveLog > 1000) {
                console.log('正在移动:', { moveX, moveZ, moveSpeed: this.moveSpeed });
                this._lastMoveLog = Date.now();
            }
        }
        
        // 应用速度
        if (this.body.physicsImpostor) {
            const velocity = this.body.physicsImpostor.getLinearVelocity();
            const newVelocity = new BABYLON.Vector3(moveX, velocity.y, moveZ);
            this.body.physicsImpostor.setLinearVelocity(newVelocity);
            
            // 调试：验证速度是否真的被设置
            if (!this._lastVelLog || Date.now() - this._lastVelLog > 2000) {
                const actualVel = this.body.physicsImpostor.getLinearVelocity();
                console.log('设置速度:', newVelocity);
                console.log('实际速度:', actualVel);
                console.log('物体位置:', this.body.position);
                this._lastVelLog = Date.now();
            }
        }
        
        // 跳跃
        if (this.inputMap[' '] && this.isGrounded) {
            this.body.physicsImpostor.applyImpulse(
                new BABYLON.Vector3(0, this.jumpPower, 0),
                this.body.getAbsolutePosition()
            );
            this.isGrounded = false;
        }
        
        // 检查是否在地面
        this.checkGrounded();
        
        // 最后同步相机位置到物理体（在所有物理计算之后）
        this.camera.position.x = this.body.position.x;
        this.camera.position.y = this.body.position.y + 0.5;
        this.camera.position.z = this.body.position.z;
        
        // 更新状态显示
        if (moveLength > 0) {
            this.status = '移动中';
        } else {
            this.status = '静止';
        }
        
        document.getElementById('playerStatus').textContent = this.status;
        
        // 更新调试面板
        if (this.debugPanelVisible) {
            const pos = this.body.position;
            const vel = this.body.physicsImpostor.getLinearVelocity();
            const activeKeys = Object.keys(this.inputMap).filter(k => this.inputMap[k]);
            
            document.getElementById('debugPos').textContent = 
                `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
            document.getElementById('debugVel').textContent = 
                `(${vel.x.toFixed(1)}, ${vel.y.toFixed(1)}, ${vel.z.toFixed(1)})`;
            document.getElementById('debugKeys').textContent = 
                activeKeys.length > 0 ? activeKeys.join(', ') : '无';
            document.getElementById('debugFPS').textContent = 
                this.scene.getEngine().getFps().toFixed(0);
        }
    }

    checkGrounded() {
        // 简单的地面检测
        const velocity = this.body.physicsImpostor.getLinearVelocity();
        if (Math.abs(velocity.y) < 0.1 && this.body.position.y < 2.5) {
            this.isGrounded = true;
        }
    }
}

