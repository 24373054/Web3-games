'use client'

import { useState, useCallback } from 'react'
import BabylonScene from './BabylonScene'
import type { Scene, Engine } from '@babylonjs/core'
import { ethers } from 'ethers'

interface YingzhouWorldProps {
  provider: ethers.BrowserProvider | null
  account: string | null
  beingId: number | null
  onNPCInteract: (npcId: string) => void
  onToggleUI: () => void
}

export default function YingzhouWorld({
  provider,
  account,
  beingId,
  onNPCInteract,
  onToggleUI
}: YingzhouWorldProps) {
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null)

  const onSceneReady = useCallback(async (scene: Scene, engine: Engine) => {
    // 动态导入 Babylon.js 和 Cannon
    const BABYLON = await import('@babylonjs/core')
    const CANNON = await import('cannon-es')

    // 设置场景
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1)
    
    // 启用物理引擎
    const gravityVector = new BABYLON.Vector3(0, -9.81, 0)
    const physicsPlugin = new BABYLON.CannonJSPlugin(true, 10, CANNON)
    scene.enablePhysics(gravityVector, physicsPlugin)

    // 创建相机（第一人称）
    const camera = new BABYLON.UniversalCamera(
      'playerCamera',
      new BABYLON.Vector3(0, 1.8, -10),
      scene
    )
    camera.setTarget(new BABYLON.Vector3(0, 1.8, 0))
    camera.attachControl(engine.getRenderingCanvas()!, true)
    
    // 相机设置
    camera.speed = 0.3
    camera.angularSensibility = 1000
    camera.minZ = 0.1
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5)
    camera.checkCollisions = true

    // 设置键盘控制（WASD）
    camera.keysUp = [87]    // W
    camera.keysDown = [83]  // S
    camera.keysLeft = [65]  // A
    camera.keysRight = [68] // D

    // 创建环境光
    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    )
    hemiLight.intensity = 0.6
    hemiLight.diffuse = new BABYLON.Color3(0.5, 0.7, 0.9)
    hemiLight.groundColor = new BABYLON.Color3(0.1, 0.2, 0.3)

    // 创建主光源
    const dirLight = new BABYLON.DirectionalLight(
      'dirLight',
      new BABYLON.Vector3(-1, -2, 1),
      scene
    )
    dirLight.intensity = 0.8
    dirLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1)

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100, subdivisions: 4 },
      scene
    )
    
    // 地面材质（赛博朋克风格）
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
    groundMat.diffuseColor = new BABYLON.Color3(0.05, 0.1, 0.15)
    groundMat.specularColor = new BABYLON.Color3(0, 0.3, 0.5)
    groundMat.emissiveColor = new BABYLON.Color3(0, 0.05, 0.1)
    ground.material = groundMat
    ground.checkCollisions = true
    
    // 添加物理
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.1 },
      scene
    )

    // 创建网格地面效果
    createGridFloor(scene, BABYLON)

    // 创建天空盒
    createSkybox(scene, BABYLON)

    // 创建中央平台/世界账本
    createWorldLedger(scene, BABYLON)

    // 创建 NPC 实体（异步加载真实数据）
    await createNPCEntities(scene, BABYLON, (npcId) => {
      console.log('🎯 完整版3D场景 - 交互NPC:', npcId)
      setInteractionTarget(npcId)
      onNPCInteract(npcId)
    })

    // 创建粒子效果
    createParticleEffects(scene, BABYLON)

    // 添加发光层
    const gl = new BABYLON.GlowLayer('glow', scene)
    gl.intensity = 0.5

    // 交互检测（E键）
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === 'e' || kbInfo.event.key === 'E') {
          checkNPCInteraction(scene, camera)
        }
        // Tab键切换UI
        if (kbInfo.event.key === 'Tab') {
          kbInfo.event.preventDefault()
          onToggleUI()
        }
      }
    })

  }, [onNPCInteract, onToggleUI])

  const checkNPCInteraction = (scene: any, camera: any) => {
    // 射线检测
    const ray = camera.getForwardRay(5)
    const pickInfo = scene.pickWithRay(ray)

    if (pickInfo?.hit && pickInfo.pickedMesh?.metadata?.isNPC) {
      const npcId = pickInfo.pickedMesh.metadata.npcId
      setInteractionTarget(npcId)
      onNPCInteract(npcId)
    }
  }

  return (
    <div className="relative w-full h-screen">
      <BabylonScene onSceneReady={onSceneReady} className="w-full h-full" />
      
      {/* 3D HUD */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 准星 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-yingzhou-cyan rounded-full opacity-50" />
        </div>

        {/* 控制提示 */}
        <div className="absolute bottom-4 left-4 bg-black/70 border border-yingzhou-cyan p-4 text-xs pointer-events-auto">
          <div className="text-yingzhou-cyan font-bold mb-2">控制</div>
          <div className="space-y-1 text-gray-300">
            <div>WASD - 移动</div>
            <div>鼠标 - 视角</div>
            <div>E - 与NPC交互</div>
            <div>Tab - 切换2D界面</div>
          </div>
        </div>

        {/* 交互提示 */}
        {interactionTarget && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 bg-black/80 border border-yingzhou-cyan px-6 py-3 rounded">
            <div className="text-yingzhou-cyan text-center animate-pulse">
              按 E 与 NPC 交互
            </div>
          </div>
        )}

        {/* 玩家信息简化版 */}
        {account && (
          <div className="absolute top-4 right-4 bg-black/70 border border-yingzhou-cyan p-3 text-xs pointer-events-auto">
            <div className="text-yingzhou-cyan">数字生命 #{beingId}</div>
            <div className="text-gray-400 mt-1">{account.slice(0, 8)}...</div>
          </div>
        )}
      </div>
    </div>
  )
}

// 辅助函数
function getNPCName(npcId: string): string {
  const names: Record<string, string> = {
    'archivist': '史官',
    'architect': '构筑师',
    'oracle': '预言者',
    'merchant': '商人',
  }
  return names[npcId] || '未知实体'
}

// 创建网格地面
function createGridFloor(scene: any, BABYLON: any) {
  const gridSize = 100
  const gridSpacing = 5
  const lines = []

  for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSpacing) {
    // X方向线条
    lines.push([
      new BABYLON.Vector3(-gridSize / 2, 0.01, i),
      new BABYLON.Vector3(gridSize / 2, 0.01, i),
    ])
    // Z方向线条
    lines.push([
      new BABYLON.Vector3(i, 0.01, -gridSize / 2),
      new BABYLON.Vector3(i, 0.01, gridSize / 2),
    ])
  }

  const gridLines = BABYLON.MeshBuilder.CreateLineSystem(
    'gridLines',
    { lines },
    scene
  )
  gridLines.color = new BABYLON.Color3(0, 0.5, 0.7)
  gridLines.alpha = 0.3
}

// 创建天空盒
function createSkybox(scene: any, BABYLON: any) {
  const skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1000 }, scene)
  const skyboxMat = new BABYLON.StandardMaterial('skyboxMat', scene)
  skyboxMat.backFaceCulling = false
  skyboxMat.disableLighting = true
  skyboxMat.diffuseColor = new BABYLON.Color3(0, 0, 0)
  skyboxMat.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.1)
  skybox.material = skyboxMat
  skybox.infiniteDistance = true
}

// 创建世界账本中央结构
function createWorldLedger(scene: any, BABYLON: any) {
  // 中央柱子
  const pillar = BABYLON.MeshBuilder.CreateCylinder(
    'ledgerPillar',
    { height: 10, diameter: 3 },
    scene
  )
  pillar.position.y = 5

  const pillarMat = new BABYLON.StandardMaterial('pillarMat', scene)
  pillarMat.diffuseColor = new BABYLON.Color3(0, 0.2, 0.3)
  pillarMat.emissiveColor = new BABYLON.Color3(0, 0.3, 0.5)
  pillarMat.specularColor = new BABYLON.Color3(0.5, 0.8, 1)
  pillar.material = pillarMat

  // 旋转的能量环
  for (let i = 0; i < 3; i++) {
    const ring = BABYLON.MeshBuilder.CreateTorus(
      `ring${i}`,
      { diameter: 4 + i * 2, thickness: 0.1, tessellation: 64 },
      scene
    )
    ring.position.y = 3 + i * 2
    
    const ringMat = new BABYLON.StandardMaterial(`ringMat${i}`, scene)
    ringMat.emissiveColor = new BABYLON.Color3(0, 0.5 + i * 0.2, 0.7 + i * 0.1)
    ringMat.alpha = 0.7
    ring.material = ringMat

    // 动画
    scene.registerBeforeRender(() => {
      ring.rotation.y += 0.01 * (i + 1)
    })
  }
}

// 创建 NPC 实体（异步加载真实数据）
async function createNPCEntities(scene: any, BABYLON: any, onInteract: (npcId: string) => void) {
  // 从合约加载真实的 NPC 数据
  let npcsList: Array<{ id: string; type: number; name: string }> = []
  try {
    const { getAINPCContract } = await import('@/lib/contracts')
    const { getRpcProvider } = await import('@/lib/provider')
    const rpc = getRpcProvider()
    const contract = getAINPCContract(rpc)
    const npcIds = await contract.getAllNPCs()
    
    const npcDataPromises = npcIds.map(async (id: string) => {
      const npc = await contract.getNPC(id)
      return {
        id,
        type: Number(npc.npcType),
        name: npc.name
      }
    })

    npcsList = await Promise.all(npcDataPromises)
    console.log('✅ 完整版场景 - NPC数据加载成功:', npcsList)
  } catch (error) {
    console.error('❌ 加载NPC数据失败:', error)
    return
  }

  // NPC 类型对应的颜色
  const npcTypeColors: [number, number, number][] = [
    [0, 1, 1],      // 史官 - 青色
    [1, 0.5, 0],    // 工匠 - 橙色
    [1, 1, 0],      // 商序 - 黄色
    [0.8, 0, 1],    // 先知 - 紫色
    [0.5, 0.5, 0.5] // 遗忘 - 灰色
  ]

  // NPC 位置配置
  const positions = [
    new BABYLON.Vector3(-15, 1, 15),
    new BABYLON.Vector3(15, 1, 15),
    new BABYLON.Vector3(0, 1, 20),
    new BABYLON.Vector3(0, 1, -20),
    new BABYLON.Vector3(-20, 1, 0)
  ]

  npcsList.forEach((npcData, index) => {
    const position = positions[index % positions.length]
    const color = npcTypeColors[npcData.type]
    // NPC 身体
    const npc = BABYLON.MeshBuilder.CreateBox(
      `npc_${index}`,
      { size: 1.5, height: 2 },
      scene
    )
    npc.position = position.clone()

    const npcMat = new BABYLON.StandardMaterial(`npc_${index}_mat`, scene)
    npcMat.diffuseColor = new BABYLON.Color3(...color)
    npcMat.emissiveColor = new BABYLON.Color3(...color.map(c => c * 0.3) as [number, number, number])
    npc.material = npcMat

    // 元数据（使用真实的 NPC ID）
    npc.metadata = {
      isNPC: true,
      npcId: npcData.id,  // 真实的合约 NPC ID (哈希值)
      npcName: npcData.name,
      npcType: npcData.type
    }

    // 悬浮动画
    const initialY = position.y
    let time = Math.random() * Math.PI * 2
    scene.registerBeforeRender(() => {
      time += 0.02
      npc.position.y = initialY + Math.sin(time) * 0.2
      npc.rotation.y += 0.01
    })

    // 名称标签（使用动态文本纹理）
    createNameTag(scene, BABYLON, npcData.name, npc.position.add(new BABYLON.Vector3(0, 2, 0)))
  })
}

// 创建名称标签
function createNameTag(scene: any, BABYLON: any, text: string, position: any) {
  const plane = BABYLON.MeshBuilder.CreatePlane('nameTag', { size: 2 }, scene)
  plane.position = position
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL

  const mat = new BABYLON.StandardMaterial('nameTagMat', scene)
  mat.emissiveColor = new BABYLON.Color3(0, 1, 1)
  mat.disableLighting = true
  mat.alpha = 0.8
  plane.material = mat

  // 简化：使用简单的颜色而不是动态纹理
  // 在实际项目中可以使用 DynamicTexture 添加文字
}

// 创建粒子效果
function createParticleEffects(scene: any, BABYLON: any) {
  const particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene)
  
  // 粒子纹理（使用简单的点）
  particleSystem.particleTexture = new BABYLON.Texture(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    scene
  )

  particleSystem.emitter = new BABYLON.Vector3(0, 0, 0)
  particleSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50)
  particleSystem.maxEmitBox = new BABYLON.Vector3(50, 10, 50)

  particleSystem.color1 = new BABYLON.Color4(0, 0.5, 1, 1)
  particleSystem.color2 = new BABYLON.Color4(0, 1, 1, 1)
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0)

  particleSystem.minSize = 0.05
  particleSystem.maxSize = 0.15

  particleSystem.minLifeTime = 3
  particleSystem.maxLifeTime = 6

  particleSystem.emitRate = 50

  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD

  particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0)

  particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1)
  particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1)

  particleSystem.minEmitPower = 0.5
  particleSystem.maxEmitPower = 1
  particleSystem.updateSpeed = 0.01

  particleSystem.start()
}

