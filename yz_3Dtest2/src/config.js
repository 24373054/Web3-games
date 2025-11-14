/**
 * 游戏配置文件
 * 修改这些参数来调整游戏体验
 */

export const GameConfig = {
    // 玩家移动
    player: {
        speed: 0.25,           // 移动速度（0.1-0.5）
        jumpForce: 0.5,        // 跳跃力度（0.3-1.0）
        height: 1.8,           // 玩家高度
        radius: 0.3,           // 玩家碰撞半径
    },

    // 物理
    physics: {
        gravity: -0.9,         // 重力加速度（-0.5 到 -1.5）
        friction: 0.02,        // 空气阻力
        groundLevel: 1,        // 地面高度
    },

    // 摄像机
    camera: {
        // 第一人称
        firstPerson: {
            height: 0.6,       // 摄像机相对于玩家的高度
            sensitivity: 1000, // 鼠标灵敏度
        },
        // 第三人称
        thirdPerson: {
            distance: 4,       // 摄像机距离玩家的距离
            height: 1.5,       // 摄像机高度
            smoothFactor: 0.1, // 摄像机跟随平滑度（0-1）
        },
    },

    // 光源
    lighting: {
        ambient: {
            intensity: 0.8,    // 环境光强度
        },
        sun: {
            intensity: 0.6,    // 太阳光强度
            position: [50, 100, 50],
        },
    },

    // 场景
    scene: {
        modelPath: './test1/',
        modelFile: 'test1_0.glb',
        enableCollisions: true,
    },

    // UI
    ui: {
        showDebugInfo: true,   // 显示调试信息
        showControls: true,    // 显示控制提示
    },
};

export default GameConfig;
