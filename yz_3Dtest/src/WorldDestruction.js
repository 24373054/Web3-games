import * as BABYLON from '@babylonjs/core';

export class WorldDestruction {
    constructor(scene) {
        this.scene = scene;
        
        // 毁灭倒计时（秒）
        this.totalTime = 300; // 5分钟
        this.remainingTime = this.totalTime;
        this.isDestructionStarted = false;
        
        // 毁灭阶段
        this.destructionPhases = [
            { time: 240, name: '初期征兆', triggered: false },
            { time: 180, name: '结构不稳', triggered: false },
            { time: 120, name: '系统崩溃', triggered: false },
            { time: 60, name: '最终倒计时', triggered: false },
            { time: 30, name: '临界边缘', triggered: false },
            { time: 0, name: '完全湮灭', triggered: false }
        ];
        
        this.glitchIntensity = 0;
        this.shakingIntensity = 0;
    }

    update(deltaTime) {
        this.remainingTime -= deltaTime;
        
        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            if (!this.isDestructionStarted) {
                this.triggerFinalDestruction();
            }
        }
        
        // 检查并触发各个阶段
        this.destructionPhases.forEach(phase => {
            if (!phase.triggered && this.remainingTime <= phase.time) {
                this.triggerPhase(phase);
                phase.triggered = true;
            }
        });
        
        // 应用破坏效果
        this.applyDestructionEffects(deltaTime);
        
        return this.remainingTime;
    }

    triggerPhase(phase) {
        console.log(`毁灭阶段触发: ${phase.name}`);
        
        switch(phase.name) {
            case '初期征兆':
                this.phaseInitialSigns();
                break;
            case '结构不稳':
                this.phaseStructuralInstability();
                break;
            case '系统崩溃':
                this.phaseSystemCollapse();
                break;
            case '最终倒计时':
                this.phaseFinalCountdown();
                break;
            case '临界边缘':
                this.phaseCriticalEdge();
                break;
            case '完全湮灭':
                this.phaseCompleteAnnihilation();
                break;
        }
    }

    phaseInitialSigns() {
        // 初期征兆：轻微的视觉故障
        this.glitchIntensity = 0.1;
        
        // 改变环境光
        const ambientLight = this.scene.getLightByName('ambient');
        if (ambientLight) {
            const originalIntensity = ambientLight.intensity;
            let flickerCount = 0;
            
            const flickerInterval = setInterval(() => {
                ambientLight.intensity = originalIntensity * (Math.random() * 0.3 + 0.7);
                flickerCount++;
                
                if (flickerCount > 10) {
                    clearInterval(flickerInterval);
                    ambientLight.intensity = originalIntensity * 0.9;
                }
            }, 200);
        }
    }

    phaseStructuralInstability() {
        // 结构不稳：物体开始抖动
        this.shakingIntensity = 0.3;
        this.glitchIntensity = 0.3;
        
        // 让一些装饰方块开始不规则移动
        this.scene.meshes.forEach(mesh => {
            if (mesh.name.startsWith('dataCube')) {
                const originalPos = mesh.position.clone();
                let time = 0;
                
                this.scene.registerBeforeRender(() => {
                    time += 0.05;
                    mesh.position.x = originalPos.x + Math.sin(time * 3) * 0.5;
                    mesh.position.y = originalPos.y + Math.cos(time * 2) * 0.5;
                    mesh.position.z = originalPos.z + Math.sin(time * 4) * 0.5;
                });
            }
        });
    }

    phaseSystemCollapse() {
        // 系统崩溃：严重的视觉扭曲
        this.shakingIntensity = 0.6;
        this.glitchIntensity = 0.6;
        
        // 改变场景颜色
        this.scene.clearColor = new BABYLON.Color3(0.05, 0.01, 0.01);
        
        // 让一些方块开始消失
        let cubeCount = 0;
        this.scene.meshes.forEach(mesh => {
            if (mesh.name.startsWith('dataCube')) {
                cubeCount++;
                if (cubeCount % 3 === 0) {
                    setTimeout(() => {
                        mesh.dispose();
                    }, Math.random() * 5000);
                }
            }
        });
    }

    phaseFinalCountdown() {
        // 最终倒计时：极端的视觉效果
        this.shakingIntensity = 1.0;
        this.glitchIntensity = 1.0;
        
        // 场景变红
        this.scene.clearColor = new BABYLON.Color3(0.1, 0, 0);
        
        // 所有光源开始闪烁
        this.scene.lights.forEach(light => {
            let time = 0;
            this.scene.registerBeforeRender(() => {
                time += 0.1;
                light.intensity = Math.abs(Math.sin(time)) * 0.5;
            });
        });
    }

    phaseCriticalEdge() {
        // 临界边缘：世界开始解体
        this.shakingIntensity = 2.0;
        this.glitchIntensity = 2.0;
        
        // 粒子系统消失
        this.scene.particleSystems.forEach(ps => {
            ps.stop();
        });
        
        // 地面开始破碎（视觉效果）
        const ground = this.scene.getMeshByName('ground');
        if (ground && ground.material) {
            ground.material.alpha = 0.5;
        }
    }

    phaseCompleteAnnihilation() {
        // 完全湮灭
        this.isDestructionStarted = true;
    }

    applyDestructionEffects(deltaTime) {
        if (this.shakingIntensity > 0 && this.scene.activeCamera) {
            // 相机抖动
            const camera = this.scene.activeCamera;
            const shake = this.shakingIntensity * 0.1;
            
            camera.position.x += (Math.random() - 0.5) * shake;
            camera.position.y += (Math.random() - 0.5) * shake;
            camera.position.z += (Math.random() - 0.5) * shake;
        }
        
        if (this.glitchIntensity > 0) {
            // 随机的视觉故障效果（通过改变材质）
            if (Math.random() < this.glitchIntensity * 0.01) {
                this.scene.meshes.forEach(mesh => {
                    if (mesh.material && Math.random() < 0.1) {
                        const mat = mesh.material;
                        if (mat.emissiveColor) {
                            const originalColor = mat.emissiveColor.clone();
                            mat.emissiveColor = new BABYLON.Color3(
                                Math.random(),
                                Math.random(),
                                Math.random()
                            );
                            
                            setTimeout(() => {
                                mat.emissiveColor = originalColor;
                            }, 50);
                        }
                    }
                });
            }
        }
    }

    triggerFinalDestruction() {
        console.log('触发最终毁灭');
        
        // 渐变到白色（湮灭效果）
        let fadeAlpha = 0;
        const fadeInterval = setInterval(() => {
            fadeAlpha += 0.02;
            
            if (this.scene.clearColor) {
                this.scene.clearColor = new BABYLON.Color3(
                    fadeAlpha,
                    fadeAlpha,
                    fadeAlpha
                );
            }
            
            // 隐藏所有网格
            this.scene.meshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.alpha = 1 - fadeAlpha;
                }
            });
            
            if (fadeAlpha >= 1) {
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    isDestroyed() {
        return this.remainingTime <= 0 && this.isDestructionStarted;
    }

    getDestructionProgress() {
        return 1 - (this.remainingTime / this.totalTime);
    }
}

