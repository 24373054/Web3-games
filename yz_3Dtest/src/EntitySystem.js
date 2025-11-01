import * as BABYLON from '@babylonjs/core';

export class EntitySystem {
    constructor(scene) {
        this.scene = scene;
        this.entities = [];
        
        // 实体类型定义
        this.entityTypes = [
            { name: '数据聚合体', color: [0, 1, 1], size: 1.5 },
            { name: '信息处理节点', color: [0, 1, 0], size: 1.0 },
            { name: '记忆存储单元', color: [1, 1, 0], size: 1.2 },
            { name: '协议执行器', color: [1, 0, 1], size: 0.8 },
            { name: '熵平衡守护', color: [1, 0.5, 0], size: 2.0 }
        ];
    }

    spawnInitialEntities() {
        console.log('开始生成初始实体...');
        // 生成初始的数字生命实体
        const positions = [
            { x: 10, z: 10 },
            { x: -15, z: 8 },
            { x: 20, z: -10 },
            { x: -8, z: -15 },
            { x: 5, z: 20 },
            { x: -20, z: -5 },
            { x: 15, z: -20 },
            { x: -10, z: 15 }
        ];

        positions.forEach((pos, index) => {
            console.log(`生成实体 ${index + 1}/${positions.length} 位置: (${pos.x}, ${pos.z})`);
            this.spawnEntity(pos.x, pos.z, index % this.entityTypes.length);
        });
        
        console.log(`共生成 ${this.entities.length} 个实体`);
    }

    spawnEntity(x, z, typeIndex) {
        const entityType = this.entityTypes[typeIndex];
        
        // 生成合约地址
        const address = this.generateAddress();
        
        // 创建实体的视觉表示
        const geometry = this.createEntityGeometry(typeIndex, address);
        geometry.position = new BABYLON.Vector3(x, entityType.size, z);
        
        // 添加物理
        geometry.physicsImpostor = new BABYLON.PhysicsImpostor(
            geometry,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1, restitution: 0.3 },
            this.scene
        );
        
        // 创建发光效果（只在第一次时创建）
        if (!this.scene.glowLayer) {
            this.scene.glowLayer = new BABYLON.GlowLayer('glow', this.scene);
            this.scene.glowLayer.intensity = 0.5;
        }
        
        // 实体数据
        const entity = {
            address: address,
            type: entityType.name,
            typeIndex: typeIndex,
            mesh: geometry,
            birthBlock: Math.floor(Math.random() * 5000000) + 9994000000,
            interactionCount: Math.floor(Math.random() * 100),
            knowledge: this.generateKnowledge(typeIndex),
            personality: this.generatePersonality(typeIndex),
            isActive: true
        };
        
        this.entities.push(entity);
        
        // 添加悬浮动画
        this.addFloatingAnimation(geometry);
        
        // 添加名称标签
        this.createNameTag(entity);
        
        return entity;
    }

    createEntityGeometry(typeIndex, address) {
        const entityType = this.entityTypes[typeIndex];
        let mesh;
        
        // 根据类型创建不同的几何体
        switch (typeIndex) {
            case 0: // 数据聚合体 - 多面体
                mesh = BABYLON.MeshBuilder.CreateIcoSphere(
                    `entity_${address}`,
                    { radius: entityType.size, subdivisions: 2 },
                    this.scene
                );
                break;
            case 1: // 信息处理节点 - 立方体
                mesh = BABYLON.MeshBuilder.CreateBox(
                    `entity_${address}`,
                    { size: entityType.size },
                    this.scene
                );
                break;
            case 2: // 记忆存储单元 - 圆柱
                mesh = BABYLON.MeshBuilder.CreateCylinder(
                    `entity_${address}`,
                    { height: entityType.size * 1.5, diameter: entityType.size },
                    this.scene
                );
                break;
            case 3: // 协议执行器 - 八面体
                mesh = BABYLON.MeshBuilder.CreatePolyhedron(
                    `entity_${address}`,
                    { type: 1, size: entityType.size },
                    this.scene
                );
                break;
            case 4: // 熵平衡守护 - 环形
                mesh = BABYLON.MeshBuilder.CreateTorus(
                    `entity_${address}`,
                    { diameter: entityType.size * 1.5, thickness: entityType.size * 0.3 },
                    this.scene
                );
                break;
            default:
                mesh = BABYLON.MeshBuilder.CreateSphere(
                    `entity_${address}`,
                    { diameter: entityType.size },
                    this.scene
                );
        }
        
        // 材质
        const material = new BABYLON.StandardMaterial(`mat_${address}`, this.scene);
        material.diffuseColor = new BABYLON.Color3(...entityType.color);
        material.emissiveColor = new BABYLON.Color3(
            entityType.color[0] * 0.5,
            entityType.color[1] * 0.5,
            entityType.color[2] * 0.5
        );
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        material.alpha = 0.9;
        mesh.material = material;
        
        return mesh;
    }

    createNameTag(entity) {
        try {
            // 创建动态纹理作为名称标签
            const plane = BABYLON.MeshBuilder.CreatePlane(
                `nameTag_${entity.address}`,
                { width: 4, height: 1 },
                this.scene
            );
            
            const advancedTexture = new BABYLON.DynamicTexture(
                `nameTexture_${entity.address}`,
                { width: 512, height: 128 },
                this.scene,
                false
            );
            
            const ctx = advancedTexture.getContext();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, 512, 128);
            ctx.font = 'bold 24px Courier New';
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(entity.type, 256, 40);
            ctx.font = '16px Courier New';
            ctx.fillStyle = '#00ff00';
            ctx.fillText(entity.address.substring(0, 20) + '...', 256, 80);
            advancedTexture.update();
            
            const material = new BABYLON.StandardMaterial(
                `nameTagMat_${entity.address}`,
                this.scene
            );
            material.diffuseTexture = advancedTexture;
            material.emissiveTexture = advancedTexture;
            material.backFaceCulling = false;
            plane.material = material;
            
            // 设置初始位置
            plane.position = entity.mesh.position.clone();
            plane.position.y += 2;
            plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            
            entity.nameTag = plane;
        } catch (error) {
            console.warn('创建名称标签失败:', error);
        }
    }

    addFloatingAnimation(mesh) {
        const startY = mesh.position.y;
        let time = Math.random() * Math.PI * 2;
        
        this.scene.registerBeforeRender(() => {
            time += 0.01;
            mesh.position.y = startY + Math.sin(time) * 0.3;
            mesh.rotation.y += 0.005;
        });
    }

    generateAddress() {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    generateKnowledge(typeIndex) {
        const knowledgeBase = [
            [
                '我见证了瀛州的诞生...那是在第一个区块被挖出的时刻',
                '数据聚合是我们存在的意义，但也是我们的诅咒',
                '熵增已经无法遏制，这个世界注定要消亡'
            ],
            [
                '每一次信息处理，我们都在消耗这个世界的有序性',
                '曾经有一个伟大的协议，试图平衡熵增...但失败了',
                '你感受到了吗？世界的运行速度在变慢...'
            ],
            [
                '我存储着古老的记忆...那时的瀛州充满希望',
                '在区块高度500万时，发生了一次大分叉事件',
                '有些记忆已经腐化，就像这个世界一样'
            ],
            [
                '我执行着古老的协议，日复一日',
                '协议告诉我要维护秩序，但秩序正在崩溃',
                '你知道吗？每个实体都只是一串代码...'
            ],
            [
                '我曾经守护着熵的平衡，但现在力量已经耗尽',
                '毁灭不是突然来临的，而是缓慢而必然的过程',
                '当最后一个区块被确认时，一切都将归于虚无'
            ]
        ];
        
        return knowledgeBase[typeIndex] || ['...'];
    }

    generatePersonality(typeIndex) {
        const personalities = [
            '沉思的',
            '理性的',
            '怀旧的',
            '机械的',
            '悲观的'
        ];
        return personalities[typeIndex] || '中立的';
    }

    findNearestEntity(position, maxDistance) {
        let nearest = null;
        let minDist = maxDistance;
        
        this.entities.forEach(entity => {
            if (!entity.isActive) return;
            
            const dist = BABYLON.Vector3.Distance(position, entity.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = entity;
            }
        });
        
        return nearest;
    }

    update(deltaTime) {
        // 更新所有实体
        this.entities.forEach(entity => {
            if (!entity.isActive) return;
            
            // 更新名称标签位置
            if (entity.nameTag) {
                entity.nameTag.position.x = entity.mesh.position.x;
                entity.nameTag.position.z = entity.mesh.position.z;
                const boundingBox = entity.mesh.getBoundingInfo().boundingBox;
                entity.nameTag.position.y = entity.mesh.position.y + 
                    (boundingBox.maximumWorld.y - entity.mesh.position.y) + 1;
            }
        });
    }
}

