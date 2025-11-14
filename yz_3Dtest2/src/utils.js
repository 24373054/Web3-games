/**
 * 游戏工具函数
 */

/**
 * 创建一个简单的地面检测系统
 */
export function createGroundDetection(scene, playerCapsule, playerRadius) {
    const rayOrigin = playerCapsule.position.clone();
    rayOrigin.y -= playerRadius;
    
    const rayDirection = new BABYLON.Vector3(0, -1, 0);
    const rayLength = 0.5;
    
    const hit = scene.pickWithRay(
        new BABYLON.Ray(rayOrigin, rayDirection, rayLength),
        (mesh) => mesh !== playerCapsule && mesh.checkCollisions
    );
    
    return hit && hit.hit;
}

/**
 * 计算玩家与场景网格的碰撞
 */
export function checkCollisions(scene, playerCapsule, playerRadius) {
    const collisions = [];
    
    scene.meshes.forEach(mesh => {
        if (mesh === playerCapsule || !mesh.checkCollisions) return;
        
        const distance = BABYLON.Vector3.Distance(playerCapsule.position, mesh.position);
        if (distance < playerRadius + 2) {
            collisions.push(mesh);
        }
    });
    
    return collisions;
}

/**
 * 添加足迹效果（可选）
 */
export function createFootstepEffect(scene, position) {
    const particle = BABYLON.MeshBuilder.CreateSphere('footstep', { diameter: 0.1 }, scene);
    particle.position = position.clone();
    particle.position.y = 0.05;
    
    const mat = new BABYLON.StandardMaterial('footstepMat', scene);
    mat.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
    mat.alpha = 0.5;
    particle.material = mat;
    
    // 2秒后消失
    setTimeout(() => {
        particle.dispose();
    }, 2000);
}

/**
 * 创建跳跃粒子效果
 */
export function createJumpEffect(scene, position) {
    const particleSystem = new BABYLON.ParticleSystem('jumpParticles', 20, scene);
    particleSystem.particleTexture = new BABYLON.DynamicTexture('particleTexture', 64, scene);
    
    particleSystem.emitter = position;
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
    
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 1;
    
    particleSystem.minEmitPower = 2;
    particleSystem.maxEmitPower = 4;
    
    particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
    
    particleSystem.start();
    
    setTimeout(() => {
        particleSystem.stop();
        particleSystem.dispose();
    }, 1000);
}

/**
 * 调整游戏难度
 */
export const DifficultyPresets = {
    easy: {
        speed: 0.35,
        jumpForce: 0.7,
        gravity: -0.6,
    },
    normal: {
        speed: 0.25,
        jumpForce: 0.5,
        gravity: -0.9,
    },
    hard: {
        speed: 0.15,
        jumpForce: 0.3,
        gravity: -1.2,
    },
};

/**
 * 格式化数字
 */
export function formatNumber(num, decimals = 2) {
    return parseFloat(num.toFixed(decimals));
}

/**
 * 计算两点之间的距离
 */
export function getDistance(pos1, pos2) {
    return BABYLON.Vector3.Distance(pos1, pos2);
}

/**
 * 生成随机颜色
 */
export function randomColor() {
    return new BABYLON.Color3(
        Math.random(),
        Math.random(),
        Math.random()
    );
}

export default {
    createGroundDetection,
    checkCollisions,
    createFootstepEffect,
    createJumpEffect,
    DifficultyPresets,
    formatNumber,
    getDistance,
    randomColor,
};
