/**
 * 游戏扩展示例
 * 这些是可选的功能示例，可以集成到主游戏中
 */

// ============================================
// 示例 1: 添加简单的 NPC
// ============================================

export function createNPC(scene, position, name = 'NPC') {
    const npc = BABYLON.MeshBuilder.CreateCylinder(name, { height: 1.8, diameter: 0.6 }, scene);
    npc.position = position;
    
    const mat = new BABYLON.StandardMaterial(name + '_mat', scene);
    mat.diffuse = new BABYLON.Color3(0.5, 0.2, 0.8);  // 紫色
    npc.material = mat;
    
    // 添加简单的巡逻 AI
    npc.moveSpeed = 0.05;
    npc.direction = 1;
    npc.updateNPC = function() {
        this.position.x += this.moveSpeed * this.direction;
        if (Math.abs(this.position.x) > 10) {
            this.direction *= -1;
        }
    };
    
    return npc;
}

// ============================================
// 示例 2: 添加可交互的物体
// ============================================

export function createInteractiveObject(scene, position, type = 'box') {
    let mesh;
    
    if (type === 'box') {
        mesh = BABYLON.MeshBuilder.CreateBox('interactive', { size: 1 }, scene);
    } else if (type === 'sphere') {
        mesh = BABYLON.MeshBuilder.CreateSphere('interactive', { diameter: 1 }, scene);
    }
    
    mesh.position = position;
    
    const mat = new BABYLON.StandardMaterial('interactive_mat', scene);
    mat.diffuse = new BABYLON.Color3(0, 1, 0);  // 绿色
    mat.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
    mesh.material = mat;
    
    // 添加交互属性
    mesh.isInteractive = true;
    mesh.onInteract = function() {
        console.log('与物体交互！');
        this.scaling.scaleInPlace(1.1);
    };
    
    return mesh;
}

// ============================================
// 示例 3: 添加传送门
// ============================================

export function createPortal(scene, position, targetPosition) {
    const portal = BABYLON.MeshBuilder.CreateTorus('portal', { diameter: 2, thickness: 0.2 }, scene);
    portal.position = position;
    
    const mat = new BABYLON.StandardMaterial('portal_mat', scene);
    mat.diffuse = new BABYLON.Color3(0, 1, 1);  // 青色
    mat.emissiveColor = new BABYLON.Color3(0, 1, 1);
    mat.alpha = 0.7;
    portal.material = mat;
    
    // 旋转动画
    portal.rotation.x = Math.PI / 4;
    
    portal.targetPosition = targetPosition;
    portal.isPortal = true;
    
    return portal;
}

// ============================================
// 示例 4: 添加粒子效果
// ============================================

export function createParticleEffect(scene, position, color = new BABYLON.Color3(1, 1, 0)) {
    const particleSystem = new BABYLON.ParticleSystem('particles', 100, scene);
    
    // 创建纹理
    const particleTexture = new BABYLON.DynamicTexture('particleTexture', 64, scene);
    const ctx = particleTexture.getContext();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    particleTexture.update();
    
    particleSystem.particleTexture = particleTexture;
    particleSystem.emitter = position;
    
    particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
    particleSystem.maxEmitBox = new BABYLON.Vector3(1, 2, 1);
    
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 2;
    
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    
    particleSystem.start();
    
    return particleSystem;
}

// ============================================
// 示例 5: 添加简单的库存系统
// ============================================

export class Inventory {
    constructor(maxSlots = 20) {
        this.items = [];
        this.maxSlots = maxSlots;
    }
    
    addItem(item) {
        if (this.items.length < this.maxSlots) {
            this.items.push(item);
            console.log(`添加物品: ${item.name}`);
            return true;
        }
        console.log('库存已满！');
        return false;
    }
    
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items.splice(index, 1);
            console.log(`移除物品: ${item[0].name}`);
            return item[0];
        }
        return null;
    }
    
    getItems() {
        return this.items;
    }
    
    isFull() {
        return this.items.length >= this.maxSlots;
    }
}

// ============================================
// 示例 6: 添加简单的对话系统
// ============================================

export class DialogueSystem {
    constructor() {
        this.dialogues = new Map();
        this.currentDialogue = null;
        this.currentLine = 0;
    }
    
    addDialogue(id, lines) {
        this.dialogues.set(id, lines);
    }
    
    startDialogue(id) {
        if (this.dialogues.has(id)) {
            this.currentDialogue = this.dialogues.get(id);
            this.currentLine = 0;
            return this.getCurrentLine();
        }
        return null;
    }
    
    getCurrentLine() {
        if (this.currentDialogue && this.currentLine < this.currentDialogue.length) {
            return this.currentDialogue[this.currentLine];
        }
        return null;
    }
    
    nextLine() {
        if (this.currentDialogue && this.currentLine < this.currentDialogue.length - 1) {
            this.currentLine++;
            return this.getCurrentLine();
        }
        this.endDialogue();
        return null;
    }
    
    endDialogue() {
        this.currentDialogue = null;
        this.currentLine = 0;
    }
}

// ============================================
// 示例 7: 添加简单的计分系统
// ============================================

export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.multiplier = 1;
        this.highScore = localStorage.getItem('highScore') || 0;
    }
    
    addScore(points) {
        const actualPoints = points * this.multiplier;
        this.score += actualPoints;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        
        return actualPoints;
    }
    
    setMultiplier(multiplier) {
        this.multiplier = multiplier;
    }
    
    getScore() {
        return this.score;
    }
    
    getHighScore() {
        return this.highScore;
    }
    
    reset() {
        this.score = 0;
        this.multiplier = 1;
    }
}

// ============================================
// 示例 8: 添加简单的计时器
// ============================================

export class GameTimer {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
    }
    
    start() {
        this.startTime = Date.now();
        this.isRunning = true;
    }
    
    stop() {
        if (this.isRunning) {
            this.elapsedTime += Date.now() - this.startTime;
            this.isRunning = false;
        }
    }
    
    getElapsedTime() {
        if (this.isRunning) {
            return this.elapsedTime + (Date.now() - this.startTime);
        }
        return this.elapsedTime;
    }
    
    getFormattedTime() {
        const ms = this.getElapsedTime();
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    
    reset() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
    }
}

// ============================================
// 示例 9: 添加简单的敌人系统
// ============================================

export class Enemy {
    constructor(scene, position, playerCapsule) {
        this.mesh = BABYLON.MeshBuilder.CreateBox('enemy', { size: 1 }, scene);
        this.mesh.position = position;
        
        const mat = new BABYLON.StandardMaterial('enemy_mat', scene);
        mat.diffuse = new BABYLON.Color3(1, 0, 0);
        this.mesh.material = mat;
        
        this.playerCapsule = playerCapsule;
        this.speed = 0.1;
        this.health = 100;
        this.detectionRange = 20;
    }
    
    update() {
        const distance = BABYLON.Vector3.Distance(this.mesh.position, this.playerCapsule.position);
        
        if (distance < this.detectionRange) {
            // 追踪玩家
            const direction = BABYLON.Vector3.Normalize(
                this.playerCapsule.position.subtract(this.mesh.position)
            );
            this.mesh.position.addInPlace(direction.scale(this.speed));
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        return this.health > 0;
    }
    
    dispose() {
        this.mesh.dispose();
    }
}

// ============================================
// 示例 10: 添加简单的关卡系统
// ============================================

export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.levels = new Map();
    }
    
    addLevel(levelNumber, config) {
        this.levels.set(levelNumber, config);
    }
    
    getCurrentLevel() {
        return this.levels.get(this.currentLevel);
    }
    
    nextLevel() {
        this.currentLevel++;
        return this.getCurrentLevel();
    }
    
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        return this.getCurrentLevel();
    }
}

export default {
    createNPC,
    createInteractiveObject,
    createPortal,
    createParticleEffect,
    Inventory,
    DialogueSystem,
    ScoreSystem,
    GameTimer,
    Enemy,
    LevelManager,
};
