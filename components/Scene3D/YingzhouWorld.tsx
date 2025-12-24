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
  onEnterPortal: () => void
}

export default function YingzhouWorld({
  provider,
  account,
  beingId,
  onNPCInteract,
  onEnterPortal
}: YingzhouWorldProps) {
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null)
  const [nearPortal, setNearPortal] = useState<boolean>(false)

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

    // 创建能量泡泡空间（取代地面）
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

    // 创建环境装饰元素
    createEnvironmentElements(scene, BABYLON)

    // 添加发光层
    const gl = new BABYLON.GlowLayer('glow', scene)
    gl.intensity = 0.5

    // 持续检测玩家是否靠近传送门
    scene.registerBeforeRender(() => {
      const portalCore = scene.getMeshByName('ledgerCore')
      if (portalCore && camera) {
        const distance = BABYLON.Vector3.Distance(camera.position, portalCore.position)
        setNearPortal(distance < 10)  // 10米范围内显示提示
      }
    })

    // 交互检测（E键）
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === 'e' || kbInfo.event.key === 'E') {
          checkInteraction(scene, camera)
        }
      }
    })

  }, [onNPCInteract, onEnterPortal])

  const checkInteraction = (scene: any, camera: any) => {
    // 射线检测
    const ray = camera.getForwardRay(10)  // 增加检测距离到10米
    const pickInfo = scene.pickWithRay(ray)

    if (pickInfo?.hit && pickInfo.pickedMesh?.metadata) {
      // 检测是否是NPC
      if (pickInfo.pickedMesh.metadata.isNPC) {
        const npcId = pickInfo.pickedMesh.metadata.npcId
        setInteractionTarget(npcId)
        onNPCInteract(npcId)
      }
      // 检测是否是传送门
      else if (pickInfo.pickedMesh.metadata.isPortal) {
        onEnterPortal()
      }
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
            <div>E - 交互</div>
            <div className="text-purple-400 mt-2">💡 靠近中心传送门可进入管理面板</div>
          </div>
        </div>

        {/* 交互提示 */}
        {nearPortal && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 bg-purple-900/90 border-2 border-purple-400 px-8 py-4 rounded-lg">
            <div className="text-purple-200 text-center text-xl font-bold animate-pulse">
              🌀 按 E 进入管理面板
            </div>
          </div>
        )}
        
        {interactionTarget && !nearPortal && (
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

// 创建巨型能量泡泡空间
function createGridFloor(scene: any, BABYLON: any) {
  // 创建巨大的球形泡泡
  const bubble = BABYLON.MeshBuilder.CreateSphere(
    'energyBubble',
    { diameter: 200, segments: 64, updatable: true },  // updatable: true 允许实时变形！
    scene
  )

  // 泡泡材质 - 明显的半透明彩虹泡泡
  const bubbleMat = new BABYLON.StandardMaterial('bubbleMat', scene)
  bubbleMat.alpha = 0.35  // 提高透明度让泡泡更明显
  bubbleMat.backFaceCulling = false // 从内部也能看到
  
  // 鲜明的彩虹般折射效果
  bubbleMat.diffuseColor = new BABYLON.Color3(0.3, 0.7, 1)
  bubbleMat.specularColor = new BABYLON.Color3(1, 1, 1)
  bubbleMat.emissiveColor = new BABYLON.Color3(0.15, 0.25, 0.4)  // 更强的发光
  bubbleMat.specularPower = 64
  bubbleMat.useSpecularOverAlpha = true  // 高光更明显
  
  bubble.material = bubbleMat

  // 创建线框网格覆盖整个泡泡
  const wireframeBubble = BABYLON.MeshBuilder.CreateSphere(
    'wireframeBubble',
    { diameter: 201, segments: 32, updatable: true },  // 稍微大一点，避免Z-fighting，也需要 updatable
    scene
  )
  const wireframeMat = new BABYLON.StandardMaterial('wireframeMat', scene)
  wireframeMat.wireframe = true  // 线框模式
  wireframeMat.emissiveColor = new BABYLON.Color3(0, 0.9, 1)
  wireframeMat.alpha = 0.6
  wireframeBubble.material = wireframeMat

  // 存储原始顶点位置用于变形（主泡泡）
  const positions = bubble.getVerticesData(BABYLON.VertexBuffer.PositionKind)
  const originalPositions = positions ? positions.slice() : []

  // 存储线框泡泡的顶点
  const wirePositions = wireframeBubble.getVerticesData(BABYLON.VertexBuffer.PositionKind)
  const wireOriginalPositions = wirePositions ? wirePositions.slice() : []

  // 泡泡变形动画 - 真正的不规则波浪变形
  scene.registerBeforeRender(() => {
    const time = Date.now() * 0.001
    
    // 变形主泡泡 - 使用球面坐标创建不规则波浪
    if (positions && originalPositions.length > 0) {
      for (let i = 0; i < originalPositions.length; i += 3) {
        const x = originalPositions[i]
        const y = originalPositions[i + 1]
        const z = originalPositions[i + 2]
        
        // 转换为球面坐标
        const radius = Math.sqrt(x * x + y * y + z * z)
        const theta = Math.atan2(z, x)  // 水平角度
        const phi = Math.acos(y / radius)  // 垂直角度
        
        // 创建多个不同频率的波浪，产生复杂的不规则形状
        const wave1 = Math.sin(time + theta * 3) * Math.sin(phi * 2)
        const wave2 = Math.cos(time * 1.3 + phi * 4) * Math.cos(theta * 2)
        const wave3 = Math.sin(time * 0.7 + theta * 5 + phi * 3)
        const wave4 = Math.cos(time * 1.8 + Math.sin(theta * 3) + Math.cos(phi * 4))
        const wave5 = Math.sin(time * 2.2 + theta * 2 - phi * 2)
        
        // 叠加所有波浪，幅度40米（相对100米半径非常明显）
        const deformation = (wave1 * 15 + wave2 * 12 + wave3 * 10 + wave4 * 8 + wave5 * 5)
        
        // 沿法线方向变形
        const normX = x / radius
        const normY = y / radius
        const normZ = z / radius
        
        positions[i] = x + normX * deformation
        positions[i + 1] = y + normY * deformation
        positions[i + 2] = z + normZ * deformation
      }
      
      bubble.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions)
    }

    // 同步变形线框泡泡
    if (wirePositions && wireOriginalPositions.length > 0) {
      for (let i = 0; i < wireOriginalPositions.length; i += 3) {
        const x = wireOriginalPositions[i]
        const y = wireOriginalPositions[i + 1]
        const z = wireOriginalPositions[i + 2]
        
        const radius = Math.sqrt(x * x + y * y + z * z)
        const theta = Math.atan2(z, x)
        const phi = Math.acos(y / radius)
        
        const wave1 = Math.sin(time + theta * 3) * Math.sin(phi * 2)
        const wave2 = Math.cos(time * 1.3 + phi * 4) * Math.cos(theta * 2)
        const wave3 = Math.sin(time * 0.7 + theta * 5 + phi * 3)
        const wave4 = Math.cos(time * 1.8 + Math.sin(theta * 3) + Math.cos(phi * 4))
        const wave5 = Math.sin(time * 2.2 + theta * 2 - phi * 2)
        
        const deformation = (wave1 * 15 + wave2 * 12 + wave3 * 10 + wave4 * 8 + wave5 * 5)
        
        const normX = x / radius
        const normY = y / radius
        const normZ = z / radius
        
        wirePositions[i] = x + normX * deformation
        wirePositions[i + 1] = y + normY * deformation
        wirePositions[i + 2] = z + normZ * deformation
      }
      
      wireframeBubble.updateVerticesData(BABYLON.VertexBuffer.PositionKind, wirePositions)
    }
    
    // 移除闪烁 - 保持恒定的颜色和透明度
    bubbleMat.emissiveColor = new BABYLON.Color3(0.15, 0.25, 0.4)
    bubbleMat.alpha = 0.35
  })

  // 在泡泡内部添加漂浮的小泡泡
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2
    const elevation = (Math.random() - 0.5) * Math.PI
    const radius = 40 + Math.random() * 50
    
    const x = Math.cos(angle) * Math.cos(elevation) * radius
    const y = Math.sin(elevation) * radius
    const z = Math.sin(angle) * Math.cos(elevation) * radius
    
    const smallBubble = BABYLON.MeshBuilder.CreateSphere(
      `smallBubble_${i}`,
      { diameter: 1 + Math.random() * 2, segments: 16 },
      scene
    )
    smallBubble.position = new BABYLON.Vector3(x, y, z)
    
    const smallBubbleMat = new BABYLON.StandardMaterial(`smallBubbleMat_${i}`, scene)
    smallBubbleMat.alpha = 0.4 + Math.random() * 0.3  // 更明显
    smallBubbleMat.emissiveColor = new BABYLON.Color3(
      0.3 + Math.random() * 0.3,
      0.6 + Math.random() * 0.3,
      0.8 + Math.random() * 0.2
    )
    smallBubbleMat.specularColor = new BABYLON.Color3(1, 1, 1)
    smallBubbleMat.specularPower = 32
    smallBubble.material = smallBubbleMat
    
    // 小泡泡也添加边缘线
    smallBubble.enableEdgesRendering()
    smallBubble.edgesWidth = 1
    smallBubble.edgesColor = new BABYLON.Color4(0.5, 1, 1, 0.5)
    
    // 小泡泡慢速漂浮
    const phase = Math.random() * Math.PI * 2
    const driftSpeed = 0.0002 + Math.random() * 0.0003
    scene.registerBeforeRender(() => {
      const time = Date.now() * driftSpeed
      const offset = Math.sin(time + phase) * 3
      smallBubble.position.y = y + offset
      
      // 大小脉动
      const scale = 0.8 + Math.sin(time * 2 + phase) * 0.3
      smallBubble.scaling.setAll(scale)
    })
  }
}

// 创建深邃虚空背景
function createSkybox(scene: any, BABYLON: any) {
  // 设置场景的清除颜色为深邃的虚空
  scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.05, 1)

  // 在泡泡外部添加远处的星云效果（静态粒子）
  const nebula = new BABYLON.ParticleSystem('nebula', 800, scene)
  nebula.particleTexture = new BABYLON.Texture('', scene)
  
  nebula.emitter = new BABYLON.Vector3(0, 0, 0)
  nebula.minEmitBox = new BABYLON.Vector3(-150, -150, -150)
  nebula.maxEmitBox = new BABYLON.Vector3(150, 150, 150)

  // 星云颜色 - 青蓝紫混合
  nebula.color1 = new BABYLON.Color4(0.3, 0.6, 1, 0.3)
  nebula.color2 = new BABYLON.Color4(0.5, 0.3, 0.8, 0.2)
  nebula.colorDead = new BABYLON.Color4(0, 0, 0, 0)

  nebula.minSize = 2
  nebula.maxSize = 6

  nebula.minLifeTime = 999
  nebula.maxLifeTime = 999

  nebula.emitRate = 800

  nebula.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  nebula.gravity = new BABYLON.Vector3(0, 0, 0)
  nebula.direction1 = new BABYLON.Vector3(0, 0, 0)
  nebula.direction2 = new BABYLON.Vector3(0, 0, 0)
  nebula.minEmitPower = 0
  nebula.maxEmitPower = 0
  nebula.updateSpeed = 0.001

  nebula.start()

  // 添加缓慢漂移的星光点
  const stars = new BABYLON.ParticleSystem('distantStars', 300, scene)
  stars.particleTexture = new BABYLON.Texture('', scene)
  
  stars.emitter = new BABYLON.Vector3(0, 0, 0)
  stars.minEmitBox = new BABYLON.Vector3(-180, -180, -180)
  stars.maxEmitBox = new BABYLON.Vector3(180, 180, 180)

  stars.color1 = new BABYLON.Color4(1, 1, 1, 0.8)
  stars.color2 = new BABYLON.Color4(0.7, 0.8, 1, 0.6)
  stars.colorDead = new BABYLON.Color4(0, 0, 0, 0)

  stars.minSize = 0.2
  stars.maxSize = 0.5

  stars.minLifeTime = 999
  stars.maxLifeTime = 999

  stars.emitRate = 300

  stars.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  stars.gravity = new BABYLON.Vector3(0, 0, 0)
  stars.direction1 = new BABYLON.Vector3(0, 0, 0)
  stars.direction2 = new BABYLON.Vector3(0, 0, 0)
  stars.minEmitPower = 0
  stars.maxEmitPower = 0
  stars.updateSpeed = 0.002

  stars.start()
}

// 创建世界账本中央结构 - 纯能量核心
function createWorldLedger(scene: any, BABYLON: any) {
  // 中央巨大能量球 - 传送门
  const core = BABYLON.MeshBuilder.CreateSphere(
    'ledgerCore',
    { diameter: 5, segments: 32 },
    scene
  )
  core.position.y = 10

  // 标记为传送门
  core.metadata = {
    isPortal: true,
    portalName: '管理面板传送门'
  }

  const coreMat = new BABYLON.StandardMaterial('coreMat', scene)
  coreMat.emissiveColor = new BABYLON.Color3(0, 1, 1)
  coreMat.alpha = 0.6
  coreMat.specularPower = 128
  core.material = coreMat

  // 核心强烈脉动
  scene.registerBeforeRender(() => {
    const time = Date.now() * 0.001
    const pulse = 1 + Math.sin(time * 2) * 0.25
    core.scaling.setAll(pulse)
    
    // 颜色变化
    const colorShift = 0.7 + Math.sin(time) * 0.3
    coreMat.emissiveColor = new BABYLON.Color3(0, colorShift, 1)
  })

  // 多层光环（不是立方体，是纯光环）
  for (let i = 0; i < 5; i++) {
    const ring = BABYLON.MeshBuilder.CreateTorus(
      `coreRing_${i}`,
      { diameter: 8 + i * 3, thickness: 0.05, tessellation: 64 },
      scene
    )
    ring.position.y = 10

    const ringMat = new BABYLON.StandardMaterial(`coreRingMat_${i}`, scene)
    ringMat.emissiveColor = new BABYLON.Color3(0, 0.6 + i * 0.08, 0.8 + i * 0.04)
    ringMat.alpha = 0.5 - i * 0.05
    ring.material = ringMat

    // 每层环独立旋转
    const speed = (i % 2 === 0 ? 0.3 : -0.4) * (1 + i * 0.1)
    scene.registerBeforeRender(() => {
      ring.rotation.y += speed * 0.01
      ring.rotation.x = Math.sin(Date.now() * 0.0005 + i) * 0.3
      ring.rotation.z = Math.cos(Date.now() * 0.0007 + i) * 0.2
    })
  }

  // 能量光束（从核心射出）
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const beam = BABYLON.MeshBuilder.CreateCylinder(
      `beam_${i}`,
      { height: 15, diameter: 0.1, tessellation: 16 },
      scene
    )
    
    const direction = new BABYLON.Vector3(
      Math.cos(angle),
      0,
      Math.sin(angle)
    )
    beam.position = core.position.add(direction.scale(10))
    beam.lookAt(core.position)

    const beamMat = new BABYLON.StandardMaterial(`beamMat_${i}`, scene)
    beamMat.emissiveColor = new BABYLON.Color3(0, 0.8, 1)
    beamMat.alpha = 0.3
    beam.material = beamMat

    // 光束脉动
    const phase = i * Math.PI * 0.25
    scene.registerBeforeRender(() => {
      const pulse = 0.2 + Math.sin(Date.now() * 0.002 + phase) * 0.1
      beamMat.alpha = pulse
    })
  }

  // 向上和向下的能量流
  for (let direction of [-1, 1]) {
    const stream = new BABYLON.ParticleSystem(`coreStream_${direction}`, 3000, scene)
    stream.particleTexture = new BABYLON.Texture('', scene)
    
    stream.emitter = core
    stream.minEmitBox = new BABYLON.Vector3(-2, 0, -2)
    stream.maxEmitBox = new BABYLON.Vector3(2, 0, 2)

    stream.color1 = new BABYLON.Color4(0, 1, 1, 1)
    stream.color2 = new BABYLON.Color4(0, 0.6, 1, 0.8)
    stream.colorDead = new BABYLON.Color4(0, 0, 0.3, 0)

    stream.minSize = 0.15
    stream.maxSize = 0.4
    stream.minLifeTime = 3
    stream.maxLifeTime = 5

    stream.emitRate = 200

    stream.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
    stream.gravity = new BABYLON.Vector3(0, direction * 3, 0)
    stream.direction1 = new BABYLON.Vector3(-0.5, direction * 8, -0.5)
    stream.direction2 = new BABYLON.Vector3(0.5, direction * 10, 0.5)
    stream.minEmitPower = 3
    stream.maxEmitPower = 5
    stream.updateSpeed = 0.01

    stream.start()
  }

  // 环绕核心的螺旋粒子
  const spiral = new BABYLON.ParticleSystem('coreSpiral', 1000, scene)
  spiral.particleTexture = new BABYLON.Texture('', scene)
  spiral.emitter = core
  spiral.createSphereEmitter(3)
  
  spiral.color1 = new BABYLON.Color4(0, 0.8, 1, 0.8)
  spiral.color2 = new BABYLON.Color4(0.5, 1, 1, 0.6)
  spiral.colorDead = new BABYLON.Color4(0, 0, 0, 0)
  
  spiral.minSize = 0.1
  spiral.maxSize = 0.3
  spiral.minLifeTime = 4
  spiral.maxLifeTime = 6
  
  spiral.emitRate = 100
  spiral.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  spiral.gravity = new BABYLON.Vector3(0, 0, 0)
  spiral.direction1 = new BABYLON.Vector3(-2, -1, -2)
  spiral.direction2 = new BABYLON.Vector3(2, 1, 2)
  spiral.minAngularSpeed = 0
  spiral.maxAngularSpeed = Math.PI
  spiral.minEmitPower = 1
  spiral.maxEmitPower = 2
  
  spiral.start()
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
    
    // 创建 NPC 能量柱
    const npcGroup = new BABYLON.TransformNode(`npcGroup_${index}`, scene)
    npcGroup.position = position.clone()

    // 中央发光球（更大，更明亮）
    const core = BABYLON.MeshBuilder.CreateSphere(
      `npcCore_${index}`,
      { diameter: 2, segments: 32 },
      scene
    )
    core.parent = npcGroup
    core.position.y = 3

    const coreMat = new BABYLON.StandardMaterial(`npcCoreMat_${index}`, scene)
    coreMat.emissiveColor = new BABYLON.Color3(...color)
    coreMat.alpha = 0.7
    core.material = coreMat

    // 垂直能量柱（从地面到核心）
    const beam = BABYLON.MeshBuilder.CreateCylinder(
      `npcBeam_${index}`,
      { height: 6, diameter: 0.5, tessellation: 32 },
      scene
    )
    beam.parent = npcGroup
    beam.position.y = 1.5

    const beamMat = new BABYLON.StandardMaterial(`npcBeamMat_${index}`, scene)
    beamMat.emissiveColor = new BABYLON.Color3(...color)
    beamMat.alpha = 0.3
    beam.material = beamMat

    // 底部光圈
    const baseRing = BABYLON.MeshBuilder.CreateTorus(
      `npcBase_${index}`,
      { diameter: 4, thickness: 0.08, tessellation: 64 },
      scene
    )
    baseRing.parent = npcGroup
    baseRing.rotation.x = Math.PI / 2

    const baseRingMat = new BABYLON.StandardMaterial(`npcBaseMat_${index}`, scene)
    baseRingMat.emissiveColor = new BABYLON.Color3(...color)
    baseRingMat.alpha = 0.6
    baseRing.material = baseRingMat

    // 向上的粒子流
    const upStream = new BABYLON.ParticleSystem(`npcUpStream_${index}`, 300, scene)
    upStream.particleTexture = new BABYLON.Texture('', scene)
    upStream.emitter = new BABYLON.Vector3(position.x, position.y, position.z)
    upStream.createCylinderEmitter(1, 0, 0.5)
    
    upStream.color1 = new BABYLON.Color4(...color, 1)
    upStream.color2 = new BABYLON.Color4(...color.map(c => c * 0.7) as [number, number, number], 0.8)
    upStream.colorDead = new BABYLON.Color4(0, 0, 0, 0)
    
    upStream.minSize = 0.1
    upStream.maxSize = 0.3
    upStream.minLifeTime = 2
    upStream.maxLifeTime = 3
    
    upStream.emitRate = 80
    upStream.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
    upStream.gravity = new BABYLON.Vector3(0, 5, 0)
    upStream.direction1 = new BABYLON.Vector3(-0.1, 8, -0.1)
    upStream.direction2 = new BABYLON.Vector3(0.1, 10, 0.1)
    upStream.minEmitPower = 2
    upStream.maxEmitPower = 3
    upStream.start()

    // 核心周围的光晕粒子
    const halo = new BABYLON.ParticleSystem(`npcHalo_${index}`, 150, scene)
    halo.particleTexture = new BABYLON.Texture('', scene)
    halo.emitter = core
    halo.createSphereEmitter(1.5)
    
    halo.color1 = new BABYLON.Color4(...color, 0.8)
    halo.color2 = new BABYLON.Color4(...color.map(c => c * 0.5) as [number, number, number], 0.5)
    halo.colorDead = new BABYLON.Color4(0, 0, 0, 0)
    
    halo.minSize = 0.15
    halo.maxSize = 0.4
    halo.minLifeTime = 2
    halo.maxLifeTime = 4
    
    halo.emitRate = 40
    halo.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
    halo.gravity = new BABYLON.Vector3(0, 0, 0)
    halo.direction1 = new BABYLON.Vector3(-1, -1, -1)
    halo.direction2 = new BABYLON.Vector3(1, 1, 1)
    halo.minEmitPower = 0.5
    halo.maxEmitPower = 1
    halo.start()

    // 元数据
    core.metadata = {
      isNPC: true,
      npcId: npcData.id,
      npcName: npcData.name,
      npcType: npcData.type
    }

    // 动画：脉动和光效变化
    const initialY = position.y
    const phase = Math.random() * Math.PI * 2
    scene.registerBeforeRender(() => {
      const time = Date.now() * 0.001
      
      // 整体轻微悬浮
      npcGroup.position.y = initialY + Math.sin(time + phase) * 0.2
      
      // 核心脉动
      const pulse = 1 + Math.sin(time * 2 + phase) * 0.2
      core.scaling.setAll(pulse)
      
      // 能量柱闪烁
      beamMat.alpha = 0.2 + Math.sin(time * 3 + phase) * 0.15
      
      // 底部光圈旋转
      baseRing.rotation.z += 0.01
      
      // 光效颜色微调
      const colorPulse = 0.8 + Math.sin(time + phase) * 0.2
      coreMat.emissiveColor = new BABYLON.Color3(
        color[0] * colorPulse,
        color[1] * colorPulse,
        color[2] * colorPulse
      )
    })

    // 名称标签（使用动态文本纹理）
    createNameTag(scene, BABYLON, npcData.name, position.add(new BABYLON.Vector3(0, 3, 0)))
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
  // 第一层：漂浮的数据碎片
  const dataFragments = new BABYLON.ParticleSystem('dataFragments', 1000, scene)
  dataFragments.particleTexture = new BABYLON.Texture('', scene)

  dataFragments.emitter = new BABYLON.Vector3(0, 15, 0)
  dataFragments.minEmitBox = new BABYLON.Vector3(-80, -10, -80)
  dataFragments.maxEmitBox = new BABYLON.Vector3(80, 10, 80)

  dataFragments.color1 = new BABYLON.Color4(0, 1, 1, 0.8)
  dataFragments.color2 = new BABYLON.Color4(0, 0.7, 1, 0.6)
  dataFragments.colorDead = new BABYLON.Color4(0, 0, 0.3, 0)

  dataFragments.minSize = 0.1
  dataFragments.maxSize = 0.4

  dataFragments.minLifeTime = 8
  dataFragments.maxLifeTime = 15

  dataFragments.emitRate = 80

  dataFragments.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  dataFragments.gravity = new BABYLON.Vector3(0, 0.2, 0)
  dataFragments.direction1 = new BABYLON.Vector3(-0.5, -1, -0.5)
  dataFragments.direction2 = new BABYLON.Vector3(0.5, 1, 0.5)
  dataFragments.minAngularSpeed = 0
  dataFragments.maxAngularSpeed = Math.PI
  dataFragments.minEmitPower = 0.5
  dataFragments.maxEmitPower = 1.5
  dataFragments.updateSpeed = 0.01

  dataFragments.start()

  // 第二层：快速的数据流
  const dataStream = new BABYLON.ParticleSystem('dataStream', 500, scene)
  dataStream.particleTexture = new BABYLON.Texture('', scene)

  dataStream.emitter = new BABYLON.Vector3(0, 0, 0)
  dataStream.minEmitBox = new BABYLON.Vector3(-50, 0, -50)
  dataStream.maxEmitBox = new BABYLON.Vector3(50, 0, 50)

  dataStream.color1 = new BABYLON.Color4(0.5, 1, 1, 1)
  dataStream.color2 = new BABYLON.Color4(0, 0.8, 1, 0.8)
  dataStream.colorDead = new BABYLON.Color4(0, 0, 0, 0)

  dataStream.minSize = 0.05
  dataStream.maxSize = 0.2

  dataStream.minLifeTime = 2
  dataStream.maxLifeTime = 4

  dataStream.emitRate = 100

  dataStream.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  dataStream.gravity = new BABYLON.Vector3(0, 3, 0)
  dataStream.direction1 = new BABYLON.Vector3(-0.2, 5, -0.2)
  dataStream.direction2 = new BABYLON.Vector3(0.2, 8, 0.2)
  dataStream.minEmitPower = 2
  dataStream.maxEmitPower = 4
  dataStream.updateSpeed = 0.01

  dataStream.start()

  // 第三层：环境光点
  const ambientGlow = new BABYLON.ParticleSystem('ambientGlow', 300, scene)
  ambientGlow.particleTexture = new BABYLON.Texture('', scene)

  ambientGlow.emitter = new BABYLON.Vector3(0, 5, 0)
  ambientGlow.minEmitBox = new BABYLON.Vector3(-60, -5, -60)
  ambientGlow.maxEmitBox = new BABYLON.Vector3(60, 5, 60)

  ambientGlow.color1 = new BABYLON.Color4(0.3, 0.8, 1, 0.5)
  ambientGlow.color2 = new BABYLON.Color4(0, 0.5, 0.8, 0.3)
  ambientGlow.colorDead = new BABYLON.Color4(0, 0, 0, 0)

  ambientGlow.minSize = 0.3
  ambientGlow.maxSize = 0.8

  ambientGlow.minLifeTime = 10
  ambientGlow.maxLifeTime = 20

  ambientGlow.emitRate = 30

  ambientGlow.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD
  ambientGlow.gravity = new BABYLON.Vector3(0, 0, 0)
  ambientGlow.direction1 = new BABYLON.Vector3(-0.1, -0.1, -0.1)
  ambientGlow.direction2 = new BABYLON.Vector3(0.1, 0.1, 0.1)
  ambientGlow.minEmitPower = 0.1
  ambientGlow.maxEmitPower = 0.3
  ambientGlow.updateSpeed = 0.005

  ambientGlow.start()
}

// 创建环境装饰元素
function createEnvironmentElements(scene: any, BABYLON: any) {
  // 1. 地面能量网格平台
  const gridPlatform = BABYLON.MeshBuilder.CreateDisc(
    'gridPlatform',
    { radius: 70, tessellation: 64 },
    scene
  )
  gridPlatform.position.y = 0.1
  gridPlatform.rotation.x = Math.PI / 2
  
  const gridMat = new BABYLON.StandardMaterial('gridMat', scene)
  gridMat.emissiveColor = new BABYLON.Color3(0, 0.3, 0.5)
  gridMat.alpha = 0.15
  gridMat.wireframe = true
  gridPlatform.material = gridMat
  
  // 网格脉动
  scene.registerBeforeRender(() => {
    const pulse = 0.1 + Math.sin(Date.now() * 0.0005) * 0.05
    gridMat.alpha = pulse
  })

  // 2. 多层同心能量环（地面）
  for (let i = 0; i < 5; i++) {
    const ring = BABYLON.MeshBuilder.CreateTorus(
      `groundRing_${i}`,
      { diameter: 30 + i * 15, thickness: 0.1, tessellation: 48 },
      scene
    )
    ring.position.y = 0.2 + i * 0.1
    ring.rotation.x = Math.PI / 2
    
    const ringMat = new BABYLON.StandardMaterial(`groundRingMat_${i}`, scene)
    ringMat.emissiveColor = new BABYLON.Color3(0, 0.4 + i * 0.1, 0.6 + i * 0.05)
    ringMat.alpha = 0.3 - i * 0.04
    ring.material = ringMat
    
    // 旋转动画
    const rotSpeed = (i % 2 === 0 ? 0.0002 : -0.0003) * (1 + i * 0.1)
    scene.registerBeforeRender(() => {
      ring.rotation.z += rotSpeed
    })
  }

  // 3. 垂直能量柱（8根，环绕中央）
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = 40
    
    const pillar = BABYLON.MeshBuilder.CreateCylinder(
      `energyPillar_${i}`,
      { height: 30, diameter: 0.3, tessellation: 16 },
      scene
    )
    pillar.position = new BABYLON.Vector3(
      Math.cos(angle) * radius,
      15,
      Math.sin(angle) * radius
    )
    
    const pillarMat = new BABYLON.StandardMaterial(`pillarMat_${i}`, scene)
    pillarMat.emissiveColor = new BABYLON.Color3(0, 0.6, 1)
    pillarMat.alpha = 0.25
    pillar.material = pillarMat
    
    // 脉冲效果
    const phase = i * Math.PI * 0.25
    scene.registerBeforeRender(() => {
      const pulse = 0.15 + Math.sin(Date.now() * 0.003 + phase) * 0.1
      pillarMat.alpha = pulse
    })
  }

  // 4. 漂浮的能量晶体（12个，分布在空间中）
  const crystalPositions = [
    [25, 8, 25], [-25, 12, 25], [25, 15, -25], [-25, 8, -25],
    [35, 10, 0], [-35, 14, 0], [0, 18, 35], [0, 9, -35],
    [20, 20, 15], [-20, 7, -15], [15, 16, -20], [-15, 11, 20]
  ]
  
  crystalPositions.forEach((pos, i) => {
    const crystal = BABYLON.MeshBuilder.CreatePolyhedron(
      `crystal_${i}`,
      { type: 1, size: 1.5 },
      scene
    )
    crystal.position = new BABYLON.Vector3(pos[0], pos[1], pos[2])
    
    const crystalMat = new BABYLON.StandardMaterial(`crystalMat_${i}`, scene)
    const hue = (i / crystalPositions.length) * 0.3
    crystalMat.emissiveColor = new BABYLON.Color3(0, 0.5 + hue, 1 - hue)
    crystalMat.alpha = 0.5
    crystalMat.specularPower = 128
    crystal.material = crystalMat
    
    // 旋转和悬浮
    const phase = Math.random() * Math.PI * 2
    const rotSpeed = (Math.random() - 0.5) * 0.02
    scene.registerBeforeRender(() => {
      const time = Date.now() * 0.001
      crystal.rotation.y += rotSpeed
      crystal.rotation.x += rotSpeed * 0.5
      crystal.position.y = pos[1] + Math.sin(time + phase) * 1.5
      
      // 发光脉动
      const pulse = 0.3 + Math.sin(time * 2 + phase) * 0.2
      crystalMat.alpha = pulse
    })
  })

  // 5. 从中央核心延伸的能量连接线（连接到8个主要方向）
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const points = [
      new BABYLON.Vector3(0, 10, 0),  // 中心点
      new BABYLON.Vector3(
        Math.cos(angle) * 50,
        8,
        Math.sin(angle) * 50
      )  // 外围点
    ]
    
    const line = BABYLON.MeshBuilder.CreateTube(
      `energyLine_${i}`,
      {
        path: points,
        radius: 0.08,
        tessellation: 8,
        updatable: false
      },
      scene
    )
    
    const lineMat = new BABYLON.StandardMaterial(`lineMat_${i}`, scene)
    lineMat.emissiveColor = new BABYLON.Color3(0, 0.8, 1)
    lineMat.alpha = 0.3
    line.material = lineMat
    
    // 能量流动效果（通过alpha变化模拟）
    const phase = i * Math.PI * 0.25
    scene.registerBeforeRender(() => {
      const flow = 0.2 + Math.sin(Date.now() * 0.005 + phase) * 0.15
      lineMat.alpha = flow
    })
  }

  // 6. 环绕式螺旋光带
  const helixPoints: any[] = []
  const helixRadius = 60
  const helixHeight = 40
  const helixTurns = 3
  const helixSegments = 200
  
  for (let i = 0; i <= helixSegments; i++) {
    const t = i / helixSegments
    const angle = t * Math.PI * 2 * helixTurns
    helixPoints.push(new BABYLON.Vector3(
      Math.cos(angle) * helixRadius,
      t * helixHeight - helixHeight / 2 + 10,
      Math.sin(angle) * helixRadius
    ))
  }
  
  const helix = BABYLON.MeshBuilder.CreateTube(
    'helix',
    {
      path: helixPoints,
      radius: 0.15,
      tessellation: 8,
      updatable: false
    },
    scene
  )
  
  const helixMat = new BABYLON.StandardMaterial('helixMat', scene)
  helixMat.emissiveColor = new BABYLON.Color3(0.3, 0.7, 1)
  helixMat.alpha = 0.4
  helix.material = helixMat
  
  // 螺旋旋转
  scene.registerBeforeRender(() => {
    helix.rotation.y += 0.0003
  })

  // 7. 漂浮的数据节点（小球，代表数据）
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 20 + Math.random() * 40
    const height = Math.random() * 25
    
    const dataNode = BABYLON.MeshBuilder.CreateSphere(
      `dataNode_${i}`,
      { diameter: 0.5, segments: 8 },
      scene
    )
    dataNode.position = new BABYLON.Vector3(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    )
    
    const nodeMat = new BABYLON.StandardMaterial(`nodeMat_${i}`, scene)
    nodeMat.emissiveColor = new BABYLON.Color3(0.2, 0.9, 1)
    nodeMat.alpha = 0.6
    dataNode.material = nodeMat
    
    // 环绕旋转
    const orbitSpeed = 0.0001 + Math.random() * 0.0002
    const initialAngle = angle
    scene.registerBeforeRender(() => {
      const time = Date.now() * orbitSpeed
      dataNode.position.x = Math.cos(initialAngle + time) * radius
      dataNode.position.z = Math.sin(initialAngle + time) * radius
    })
  }
}

