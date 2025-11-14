// Babylon.js 通过 CDN 加载

// 初始化 Babylon.js
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// 场景设置
const scene = new BABYLON.Scene(engine);
scene.collisionsEnabled = true;
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

// 光源
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.8;

const sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3(50, 100, 50), scene);
sunLight.intensity = 0.6;

// 玩家控制状态
const playerState = {
    isFirstPerson: true,
    velocity: new BABYLON.Vector3(0, 0, 0),
    isJumping: false,
    moveDirection: new BABYLON.Vector3(0, 0, 0),
    speed: 0.25,
    jumpForce: 0.5,
    groundLevel: 0,
    playerHeight: 1.8,
    playerRadius: 0.3,
    // 出生点配置
    spawnPoint: new BABYLON.Vector3(50, 10, 50),  // 默认出生点（场景外部）
    // 多段跳跃配置
    maxJumps: 3,  // 最多可以跳 3 次
    currentJumps: 0,  // 当前已跳的次数
};

// 键盘输入
const keys = {};
const keyPressed = {};  // 用于检测按键是否刚按下（只触发一次）

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Space 键用于跳跃，不要被摄像机系统拦截
    if (key === ' ') {
        e.preventDefault();
        // 只有在之前没有按下时才标记为新按下
        if (!keys[' ']) {
            keyPressed[' '] = true;
        }
        keys[' '] = true;
    } else {
        keys[key] = true;
    }
    
    // C 键切换视角
    if (key === 'c') {
        toggleCameraMode();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === ' ') {
        e.preventDefault();
    }
    keys[key] = false;
    keyPressed[key] = false;
});

// 创建玩家胶囊体（第三人称时显示）
function createPlayerCapsule(scene) {
    const capsule = new BABYLON.TransformNode('playerCapsule', scene);
    
    // 身体
    const body = BABYLON.MeshBuilder.CreateCylinder('body', { height: 1.5, diameter: 0.6 }, scene);
    body.parent = capsule;
    body.position.y = 0.75;
    const bodyMat = new BABYLON.StandardMaterial('bodyMat', scene);
    bodyMat.diffuse = new BABYLON.Color3(0.2, 0.5, 0.8);
    body.material = bodyMat;

    // 头部
    const head = BABYLON.MeshBuilder.CreateSphere('head', { diameter: 0.5 }, scene);
    head.parent = capsule;
    head.position.y = 1.5;
    const headMat = new BABYLON.StandardMaterial('headMat', scene);
    headMat.diffuse = new BABYLON.Color3(0.9, 0.7, 0.6);
    head.material = headMat;

    // 左臂
    const leftArm = BABYLON.MeshBuilder.CreateCylinder('leftArm', { height: 1.2, diameter: 0.25 }, scene);
    leftArm.parent = capsule;
    leftArm.position.set(-0.5, 1, 0);
    leftArm.rotation.z = Math.PI / 6;
    const armMat = new BABYLON.StandardMaterial('armMat', scene);
    armMat.diffuse = new BABYLON.Color3(0.9, 0.7, 0.6);
    leftArm.material = armMat;

    // 右臂
    const rightArm = BABYLON.MeshBuilder.CreateCylinder('rightArm', { height: 1.2, diameter: 0.25 }, scene);
    rightArm.parent = capsule;
    rightArm.position.set(0.5, 1, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.material = armMat;

    // 左腿
    const leftLeg = BABYLON.MeshBuilder.CreateCylinder('leftLeg', { height: 1, diameter: 0.3 }, scene);
    leftLeg.parent = capsule;
    leftLeg.position.set(-0.2, 0.25, 0);
    const legMat = new BABYLON.StandardMaterial('legMat', scene);
    legMat.diffuse = new BABYLON.Color3(0.2, 0.2, 0.3);
    leftLeg.material = legMat;

    // 右腿
    const rightLeg = BABYLON.MeshBuilder.CreateCylinder('rightLeg', { height: 1, diameter: 0.3 }, scene);
    rightLeg.parent = capsule;
    rightLeg.position.set(0.2, 0.25, 0);
    rightLeg.material = legMat;

    return capsule;
}

// 创建摄像机
let camera;
let playerCapsule;

function createCameras() {
    // 第一人称摄像机
    camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0, 1.7, 0), scene);
    camera.attachControl(canvas, true);
    camera.inertia = 0.7;
    camera.angularSensibility = 1000;
    camera.speed = 0;
    camera.keysUp = [];
    camera.keysDown = [];
    camera.keysLeft = [];
    camera.keysRight = [];

    // 创建玩家胶囊体
    playerCapsule = createPlayerCapsule(scene);
    playerCapsule.position = playerState.spawnPoint.clone();
}

// 切换摄像机模式
function toggleCameraMode() {
    playerState.isFirstPerson = !playerState.isFirstPerson;
    
    if (playerState.isFirstPerson) {
        playerCapsule.getChildren().forEach(child => child.isVisible = false);
        document.getElementById('cameraType').textContent = '第一人称';
    } else {
        playerCapsule.getChildren().forEach(child => child.isVisible = true);
        document.getElementById('cameraType').textContent = '第三人称';
    }
}

// 寻找安全的出生点
function findSafeSpawnPoint(sceneModel) {
    // 获取场景模型的边界
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let maxY = -Infinity;
    
    sceneModel.meshes.forEach(mesh => {
        if (mesh.getBoundingInfo) {
            const boundingInfo = mesh.getBoundingInfo();
            const min = boundingInfo.minimum;
            const max = boundingInfo.maximum;
            
            minX = Math.min(minX, min.x);
            maxX = Math.max(maxX, max.x);
            minZ = Math.min(minZ, min.z);
            maxZ = Math.max(maxZ, max.z);
            maxY = Math.max(maxY, max.y);
        }
    });
    
    // 在场景外部找一个安全的出生点
    const spawnX = maxX + 20;  // 在场景右侧 20 单位
    const spawnY = maxY + 10;  // 在最高点上方 10 单位
    const spawnZ = (minZ + maxZ) / 2;  // 在场景中心的 Z 轴
    
    console.log('场景边界:', { minX, maxX, minZ, maxZ, maxY });
    console.log('自动出生点:', { spawnX, spawnY, spawnZ });
    
    return new BABYLON.Vector3(spawnX, spawnY, spawnZ);
}

// 创建地面平面
function createGround() {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 500, height: 500 }, scene);
    ground.position.y = 0;
    
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene);
    groundMat.diffuse = new BABYLON.Color3(0.3, 0.6, 0.3);
    ground.material = groundMat;
    ground.checkCollisions = true;
    
    console.log('地面已创建');
    return ground;
}

// 加载场景模型
async function loadSceneModel() {
    try {
        const result = await BABYLON.SceneLoader.ImportMeshAsync(
            '',
            './test1/',
            'test1_0.glb',
            scene
        );
        
        // 放大场景模型 5 倍
        const scaleAmount = 5;
        result.meshes.forEach(mesh => {
            mesh.scaling = new BABYLON.Vector3(scaleAmount, scaleAmount, scaleAmount);
            mesh.checkCollisions = true;  // 启用碰撞检测
        });
        
        // 获取场景的最小 Y 值，将其放在地面上
        let minY = Infinity;
        result.meshes.forEach(mesh => {
            if (mesh.getBoundingInfo) {
                const boundingInfo = mesh.getBoundingInfo();
                minY = Math.min(minY, boundingInfo.minimum.y);
            }
        });
        
        // 调整场景位置，使其底部在 Y=0
        const offset = -minY;
        result.meshes.forEach(mesh => {
            mesh.position.y += offset;
        });
        
        // 自动寻找安全的出生点（在场景外部）
        const safeSpawnPoint = findSafeSpawnPoint(result);
        playerState.spawnPoint = safeSpawnPoint;
        playerCapsule.position = safeSpawnPoint.clone();
        
        console.log('场景已加载，碰撞检测已启用');
        
        // 调试：可视化网格几何
        console.log(`=== 加载了 ${result.meshes.length} 个网格 ===`);
        result.meshes.forEach((mesh, index) => {
            console.log(`网格 ${index}: ${mesh.name}, 碰撞启用: ${mesh.checkCollisions}`);
            if (mesh.checkCollisions) {
                visualizeVertices(mesh);  // 可视化实际顶点和面
            }
        });
        
        document.getElementById('status').textContent = '已加载场景 (5x 放大)';
        return result;
    } catch (error) {
        console.error('加载模型失败:', error);
        document.getElementById('status').textContent = '加载失败: ' + error.message;
    }
}

// 可视化网格的实际顶点和面
function visualizeVertices(mesh) {
    // 检查网格是否有顶点数据
    if (!mesh.getVerticesData) {
        console.warn(`网格 ${mesh.name} 没有顶点数据`);
        return;
    }
    
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (!positions) {
        console.warn(`网格 ${mesh.name} 无法获取顶点位置数据`);
        return;
    }
    
    console.log(`网格 ${mesh.name} 有 ${positions.length / 3} 个顶点`);
    
    // 获取索引数据（三角形面）
    const indices = mesh.getIndices();
    
    if (indices && indices.length > 0) {
        // 创建可视化网格来显示面
        visualizeMeshFaces(mesh, positions, indices);
    }
    
    // 为每个顶点创建一个小点
    for (let i = 0; i < positions.length; i += 3) {
        const vertexPos = new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        
        // 创建小球标记顶点
        const sphere = BABYLON.MeshBuilder.CreateSphere(`vertex_${mesh.name}_${i}`, {
            diameter: 0.05,
            segments: 4
        }, scene);
        
        sphere.position = vertexPos;
        sphere.parent = mesh;
        
        // 绿色材质（与边框区分）
        const mat = new BABYLON.StandardMaterial(`vertexMat_${mesh.name}_${i}`, scene);
        mat.emissiveColor = new BABYLON.Color3(0, 1, 0);  // 绿色
        mat.alpha = 0.9;
        sphere.material = mat;
    }
    
    console.log(`已为 ${mesh.name} 的所有顶点创建可视化标记`);
}

// 可视化网格的面
function visualizeMeshFaces(originalMesh, positions, indices) {
    // 创建新的网格来显示面
    const visualMesh = new BABYLON.Mesh(`visualFaces_${originalMesh.name}`, scene);
    
    // 创建顶点数据
    const vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    
    // 计算法线
    BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals = []);
    
    // 应用顶点数据
    vertexData.applyToMesh(visualMesh);
    
    // 设置为原网格的子对象
    visualMesh.parent = originalMesh;
    
    // 半透明绿色材质
    const mat = new BABYLON.StandardMaterial(`faceMat_${originalMesh.name}`, scene);
    mat.diffuse = new BABYLON.Color3(0, 1, 0);  // 绿色
    mat.emissiveColor = new BABYLON.Color3(0, 0.5, 0);  // 暗绿色自发光
    mat.alpha = 0.4;  // 半透明
    mat.backFaceCulling = false;  // 显示背面
    
    visualMesh.material = mat;
    
    console.log(`已为 ${originalMesh.name} 创建面可视化，共 ${indices.length / 3} 个三角形`);
}


// 球体与三角形碰撞检测
function checkSphereTriangleCollision(sphereCenter, sphereRadius, p1, p2, p3) {
    // 计算三角形平面
    const edge1 = p2.subtract(p1);
    const edge2 = p3.subtract(p1);
    const normal = BABYLON.Vector3.Cross(edge1, edge2);
    
    if (normal.length() === 0) return null;  // 退化三角形
    
    normal.normalize();
    
    // 计算球心到平面的距离
    const toSphere = sphereCenter.subtract(p1);
    const distToPlane = BABYLON.Vector3.Dot(toSphere, normal);
    
    if (Math.abs(distToPlane) > sphereRadius) {
        // 球体不与平面相交，但可能与边相交
        // 继续检查边的距离
    }
    
    // 找到球心在平面上的投影点
    const closestPointOnPlane = sphereCenter.subtract(normal.scale(distToPlane));
    
    // 检查投影点是否在三角形内（使用重心坐标）
    const v0 = p3.subtract(p1);
    const v1 = p2.subtract(p1);
    const v2 = closestPointOnPlane.subtract(p1);
    
    const dot00 = BABYLON.Vector3.Dot(v0, v0);
    const dot01 = BABYLON.Vector3.Dot(v0, v1);
    const dot02 = BABYLON.Vector3.Dot(v0, v2);
    const dot11 = BABYLON.Vector3.Dot(v1, v1);
    const dot12 = BABYLON.Vector3.Dot(v1, v2);
    
    const denom = dot00 * dot11 - dot01 * dot01;
    if (Math.abs(denom) < 0.0001) return null;  // 退化三角形
    
    const invDenom = 1 / denom;
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    
    if (u >= -0.01 && v >= -0.01 && u + v <= 1.01) {
        // 在三角形内或边界附近
        const dist = Math.abs(distToPlane);
        if (dist <= sphereRadius) {
            return closestPointOnPlane;
        }
    }
    
    // 检查与三条边的距离
    const edges = [
        { p1: p1, p2: p2 },
        { p1: p2, p2: p3 },
        { p1: p3, p2: p1 }
    ];
    
    let closestPoint = null;
    let minDist = sphereRadius;
    
    edges.forEach(edge => {
        const edgeVec = edge.p2.subtract(edge.p1);
        const edgeLenSq = BABYLON.Vector3.Dot(edgeVec, edgeVec);
        
        if (edgeLenSq < 0.0001) return;  // 退化边
        
        const toSphere = sphereCenter.subtract(edge.p1);
        const t = Math.max(0, Math.min(1, BABYLON.Vector3.Dot(toSphere, edgeVec) / edgeLenSq));
        const pointOnEdge = edge.p1.add(edgeVec.scale(t));
        const dist = BABYLON.Vector3.Distance(sphereCenter, pointOnEdge);
        
        if (dist < minDist) {
            minDist = dist;
            closestPoint = pointOnEdge;
        }
    });
    
    // 检查三个顶点
    [p1, p2, p3].forEach(vertex => {
        const dist = BABYLON.Vector3.Distance(sphereCenter, vertex);
        if (dist < minDist) {
            minDist = dist;
            closestPoint = vertex;
        }
    });
    
    return closestPoint;
}

// 将玩家推离碰撞体（使用详细碰撞信息）
function pushPlayerOutOfCollisionWithDetails(playerPos, collisionDetails) {
    const playerRadius = playerState.playerRadius;
    const pushDistance = 0.15;
    
    // 多次迭代推离，确保完全脱离碰撞
    for (let iteration = 0; iteration < 5; iteration++) {
        let totalPush = new BABYLON.Vector3(0, 0, 0);
        let pushCount = 0;
        
        collisionDetails.forEach(detail => {
            const closestPoint = detail.closestPoint;
            const distance = BABYLON.Vector3.Distance(playerPos, closestPoint);
            
            if (distance < playerRadius && distance > 0.001) {
                const pushDirection = BABYLON.Vector3.Normalize(playerPos.subtract(closestPoint));
                const pushAmount = playerRadius - distance + pushDistance;
                totalPush.addInPlace(pushDirection.scale(pushAmount));
                pushCount++;
            }
        });
        
        // 应用累积的推离
        if (pushCount > 0) {
            playerPos.addInPlace(totalPush.scale(1 / pushCount));
        } else {
            break;  // 没有碰撞了，停止迭代
        }
    }
}

// 将玩家推离碰撞体（备用方法）
function pushPlayerOutOfCollision(playerPos, collidingMeshes) {
    const playerRadius = playerState.playerRadius;
    const pushDistance = 0.15;
    
    // 多次迭代推离，确保完全脱离碰撞
    for (let iteration = 0; iteration < 5; iteration++) {
        let totalPush = new BABYLON.Vector3(0, 0, 0);
        let pushCount = 0;
        
        collidingMeshes.forEach(mesh => {
            if (!mesh.getVerticesData) return;
            
            const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const indices = mesh.getIndices();
            
            if (!positions || !indices) return;
            
            // 检查每个三角形
            for (let i = 0; i < indices.length; i += 3) {
                const p1 = new BABYLON.Vector3(positions[indices[i] * 3], positions[indices[i] * 3 + 1], positions[indices[i] * 3 + 2]);
                const p2 = new BABYLON.Vector3(positions[indices[i + 1] * 3], positions[indices[i + 1] * 3 + 1], positions[indices[i + 1] * 3 + 2]);
                const p3 = new BABYLON.Vector3(positions[indices[i + 2] * 3], positions[indices[i + 2] * 3 + 1], positions[indices[i + 2] * 3 + 2]);
                
                // 应用网格变换
                BABYLON.Vector3.TransformCoordinatesToRef(p1, mesh.getWorldMatrix(), p1);
                BABYLON.Vector3.TransformCoordinatesToRef(p2, mesh.getWorldMatrix(), p2);
                BABYLON.Vector3.TransformCoordinatesToRef(p3, mesh.getWorldMatrix(), p3);
                
                const closestPoint = checkSphereTriangleCollision(playerPos, playerRadius, p1, p2, p3);
                
                if (closestPoint) {
                    const distance = BABYLON.Vector3.Distance(playerPos, closestPoint);
                    if (distance < playerRadius && distance > 0.001) {
                        const pushDirection = BABYLON.Vector3.Normalize(playerPos.subtract(closestPoint));
                        const pushAmount = playerRadius - distance + pushDistance;
                        totalPush.addInPlace(pushDirection.scale(pushAmount));
                        pushCount++;
                    }
                }
            }
        });
        
        // 应用累积的推离
        if (pushCount > 0) {
            playerPos.addInPlace(totalPush.scale(1 / pushCount));
        } else {
            break;  // 没有碰撞了，停止迭代
        }
    }
}

// 碰撞检测函数 - 返回详细的碰撞信息
function checkCollisions(newPosition) {
    // 检查玩家是否在地面上
    const isOnGround = newPosition.y <= 1.1;
    
    const playerRadius = playerState.playerRadius;
    const horizontalHits = [];
    const collisionDetails = [];  // 存储详细的碰撞信息
    
    // 检查周围是否有碰撞
    scene.meshes.forEach(mesh => {
        // 排除玩家胶囊体和地面
        if (mesh === playerCapsule || mesh.name === 'ground') return;
        
        // 只检查启用了碰撞检测的网格
        if (!mesh.checkCollisions) return;
        
        if (!mesh.getVerticesData) return;
        
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const indices = mesh.getIndices();
        
        if (!positions || !indices) return;
        
        let meshHasCollision = false;
        
        // 检查每个三角形
        for (let i = 0; i < indices.length; i += 3) {
            const p1 = new BABYLON.Vector3(positions[indices[i] * 3], positions[indices[i] * 3 + 1], positions[indices[i] * 3 + 2]);
            const p2 = new BABYLON.Vector3(positions[indices[i + 1] * 3], positions[indices[i + 1] * 3 + 1], positions[indices[i + 1] * 3 + 2]);
            const p3 = new BABYLON.Vector3(positions[indices[i + 2] * 3], positions[indices[i + 2] * 3 + 1], positions[indices[i + 2] * 3 + 2]);
            
            // 应用网格变换
            BABYLON.Vector3.TransformCoordinatesToRef(p1, mesh.getWorldMatrix(), p1);
            BABYLON.Vector3.TransformCoordinatesToRef(p2, mesh.getWorldMatrix(), p2);
            BABYLON.Vector3.TransformCoordinatesToRef(p3, mesh.getWorldMatrix(), p3);
            
            const closestPoint = checkSphereTriangleCollision(newPosition, playerRadius, p1, p2, p3);
            
            if (closestPoint) {
                meshHasCollision = true;
                collisionDetails.push({
                    mesh: mesh,
                    closestPoint: closestPoint,
                    trianglePoints: [p1, p2, p3]
                });
            }
        }
        
        if (meshHasCollision && !horizontalHits.includes(mesh)) {
            horizontalHits.push(mesh);
        }
    });
    
    return {
        downHit: isOnGround,
        horizontalHits: horizontalHits,
        collisionDetails: collisionDetails
    };
}

// 更新玩家移动
function updatePlayerMovement() {
    // 获取移动输入
    playerState.moveDirection = new BABYLON.Vector3(0, 0, 0);
    
    if (keys['w']) playerState.moveDirection.z += 1;
    if (keys['s']) playerState.moveDirection.z -= 1;
    if (keys['a']) playerState.moveDirection.x -= 1;
    if (keys['d']) playerState.moveDirection.x += 1;

    // 归一化移动方向
    if (playerState.moveDirection.length() > 0) {
        playerState.moveDirection.normalize();
    }

    // 简化移动：直接应用速度，不考虑摄像机方向
    // 这样可以避免复杂的矩阵计算导致的问题
    playerState.velocity.x = playerState.moveDirection.x * playerState.speed;
    playerState.velocity.z = playerState.moveDirection.z * playerState.speed;

    // 检测当前是否在地面上（在应用重力之前）
    const currentCollisions = checkCollisions(playerCapsule.position);
    const isCurrentlyOnGround = currentCollisions.downHit;
    
    // 如果在地面上，重置跳跃计数
    if (isCurrentlyOnGround) {
        playerState.currentJumps = 0;
        playerState.isJumping = false;
    }
    
    // 按住 Space 时持续上升
    if (keys[' ']) {
        // 如果刚开始按住（从地面或空中），标记为跳跃状态
        if (!playerState.isJumping) {
            playerState.currentJumps++;
            playerState.isJumping = true;
            console.log(`✓ 开始跳跃！(${playerState.currentJumps}/${playerState.maxJumps})`);
        }
        
        // 只要还有跳跃次数，就持续上升
        if (playerState.currentJumps <= playerState.maxJumps) {
            playerState.velocity.y = playerState.jumpForce;  // 持续向上
        }
    } else {
        // 松开 Space 时，停止上升，开始抛体运动
        if (playerState.isJumping) {
            playerState.isJumping = false;
            console.log('✓ 松开 Space，开始抛体运动');
        }
        
        // 应用重力
        playerState.velocity.y -= 0.02;
    }

    // 计算新位置
    const newPosition = playerCapsule.position.clone();
    newPosition.addInPlace(playerState.velocity);
    
    // 检测碰撞
    const collisions = checkCollisions(newPosition);
    
    // 处理碰撞 - 对所有轴都进行碰撞检测
    if (collisions.horizontalHits.length > 0) {
        // 有碰撞时，尝试只沿一个轴移动
        
        // 尝试只移动 X
        const testX = playerCapsule.position.clone();
        testX.x = newPosition.x;
        const collisionsX = checkCollisions(testX);
        
        // 尝试只移动 Y
        const testY = playerCapsule.position.clone();
        testY.y = newPosition.y;
        const collisionsY = checkCollisions(testY);
        
        // 尝试只移动 Z
        const testZ = playerCapsule.position.clone();
        testZ.z = newPosition.z;
        const collisionsZ = checkCollisions(testZ);
        
        // 如果 X 方向没有碰撞，允许移动 X
        if (collisionsX.horizontalHits.length === 0) {
            playerCapsule.position.x = newPosition.x;
        } else {
            // X 方向有碰撞，清除 X 速度
            playerState.velocity.x = 0;
        }
        
        // 如果 Y 方向没有碰撞，允许移动 Y
        if (collisionsY.horizontalHits.length === 0) {
            playerCapsule.position.y = newPosition.y;
        } else {
            // Y 方向有碰撞，清除 Y 速度
            playerState.velocity.y = 0;
        }
        
        // 如果 Z 方向没有碰撞，允许移动 Z
        if (collisionsZ.horizontalHits.length === 0) {
            playerCapsule.position.z = newPosition.z;
        } else {
            // Z 方向有碰撞，清除 Z 速度
            playerState.velocity.z = 0;
        }
        
        // 碰撞后重新检测当前位置是否还在碰撞中
        const finalCollisions = checkCollisions(playerCapsule.position);
        if (finalCollisions.horizontalHits.length > 0) {
            // 如果仍然在碰撞中，使用推离算法
            if (finalCollisions.collisionDetails && finalCollisions.collisionDetails.length > 0) {
                // 使用详细碰撞信息进行精确推离
                pushPlayerOutOfCollisionWithDetails(playerCapsule.position, finalCollisions.collisionDetails);
            } else {
                // 备用方法
                pushPlayerOutOfCollision(playerCapsule.position, finalCollisions.horizontalHits);
            }
            
            // 推离后再次检测，确保完全脱离
            const afterPushCollisions = checkCollisions(playerCapsule.position);
            if (afterPushCollisions.horizontalHits.length > 0) {
                // 仍有碰撞，再推一次
                if (afterPushCollisions.collisionDetails && afterPushCollisions.collisionDetails.length > 0) {
                    pushPlayerOutOfCollisionWithDetails(playerCapsule.position, afterPushCollisions.collisionDetails);
                } else {
                    pushPlayerOutOfCollision(playerCapsule.position, afterPushCollisions.horizontalHits);
                }
            }
        }
    } else {
        // 没有碰撞，更新所有位置
        playerCapsule.position = newPosition;
    }

    // 处理垂直碰撞（地面检测）
    if (collisions.downHit) {
        // 在地面上
        if (playerCapsule.position.y < 1) {
            playerCapsule.position.y = 1;
        }
        playerState.velocity.y = 0;
        playerState.isJumping = false;
    } else {
        // 不在地面上，检查是否低于最低点
        if (playerCapsule.position.y < 1) {
            playerCapsule.position.y = 1;
            playerState.velocity.y = 0;
            playerState.isJumping = false;
        }
    }

    // 更新摄像机位置
    if (playerState.isFirstPerson) {
        // 第一人称：摄像机在玩家头部
        camera.position = playerCapsule.position.add(new BABYLON.Vector3(0, 0.6, 0));
    } else {
        // 第三人称：摄像机跟随在玩家后面上方
        const cameraDistance = 4;
        const cameraHeight = 1.5;
        
        // 获取摄像机看向的方向
        const cameraDir = BABYLON.Vector3.Forward();
        const rotMatrix = BABYLON.Matrix.RotationYawPitchRoll(camera.rotation.y, 0, 0);
        BABYLON.Vector3.TransformCoordinatesToRef(cameraDir, rotMatrix, cameraDir);
        cameraDir.scaleInPlace(-cameraDistance);
        
        // 计算目标摄像机位置
        const targetCamPos = playerCapsule.position.add(new BABYLON.Vector3(0, cameraHeight, 0)).add(cameraDir);
        
        // 平滑摄像机移动
        const smoothFactor = 0.1;
        camera.position.x += (targetCamPos.x - camera.position.x) * smoothFactor;
        camera.position.y += (targetCamPos.y - camera.position.y) * smoothFactor;
        camera.position.z += (targetCamPos.z - camera.position.z) * smoothFactor;
        
        // 设置摄像机看向玩家
        camera.setTarget(playerCapsule.position.add(new BABYLON.Vector3(0, 0.8, 0)));
    }

    // 更新UI
    document.getElementById('posX').textContent = playerCapsule.position.x.toFixed(2);
    document.getElementById('posY').textContent = playerCapsule.position.y.toFixed(2);
    document.getElementById('posZ').textContent = playerCapsule.position.z.toFixed(2);
    document.getElementById('velocity').textContent = playerState.velocity.length().toFixed(2);
    document.getElementById('jumps').textContent = `${playerState.currentJumps}/${playerState.maxJumps}`;
}

// 初始化
async function init() {
    try {
        document.getElementById('status').textContent = '初始化摄像机...';
        createCameras();
        
        document.getElementById('status').textContent = '创建地面...';
        createGround();
        
        document.getElementById('status').textContent = '加载场景模型...';
        await loadSceneModel();
        
        document.getElementById('status').textContent = '就绪';
        
        // 游戏循环
        engine.runRenderLoop(() => {
            updatePlayerMovement();
            scene.render();
            
            // 更新 FPS
            document.getElementById('fps').textContent = engine.getFps().toFixed(0);
        });

        // 窗口大小调整
        window.addEventListener('resize', () => {
            engine.resize();
        });
    } catch (error) {
        console.error('初始化失败:', error);
        document.getElementById('status').textContent = '初始化失败: ' + error.message;
    }
}

// 等待 Babylon.js 加载完成后启动
if (typeof BABYLON !== 'undefined') {
    init();
} else {
    // 如果 Babylon.js 还没加载，等待
    window.addEventListener('load', init);
}

// 切换按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('cameraMode');
    if (btn) {
        btn.addEventListener('click', toggleCameraMode);
    }
});
