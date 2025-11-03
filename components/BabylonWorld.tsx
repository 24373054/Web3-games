/**
 * 瀛州纪 - Babylon.js 3D 世界组件
 * 完整的几何世界实现
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import * as BABYLON from '@babylonjs/core'
import type { AINPC, EraConfig } from '@/lib/gameData'

interface BabylonWorldProps {
  eraConfig: EraConfig
  availableNPCs: AINPC[]
  onNPCClick: (npcId: string) => void
}

export default function BabylonWorld({ eraConfig, availableNPCs, onNPCClick }: BabylonWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<BABYLON.Engine | null>(null)
  const sceneRef = useRef<BABYLON.Scene | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // 创建引擎
    const engine = new BABYLON.Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })
    engineRef.current = engine

    // 创建场景
    const scene = new BABYLON.Scene(engine)
    sceneRef.current = scene
    
    // 设置背景颜色
    scene.clearColor = BABYLON.Color4.FromHexString(eraConfig.backgroundColor + 'FF')
    
    // 创建第一人称相机
    const camera = new BABYLON.UniversalCamera(
      'camera',
      new BABYLON.Vector3(0, 2, -10), // 起始位置
      scene
    )
    camera.attachControl(canvasRef.current, true)
    
    // 设置相机参数
    camera.speed = 0.5 // 移动速度
    camera.angularSensibility = 1000 // 鼠标灵敏度
    camera.keysUp = [87] // W
    camera.keysDown = [83] // S
    camera.keysLeft = [65] // A
    camera.keysRight = [68] // D
    camera.minZ = 0.1
    
    // 添加碰撞检测
    camera.checkCollisions = true
    camera.applyGravity = false
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1)
    
    // 创建环境光
    const ambientLight = new BABYLON.HemisphericLight(
      'ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    )
    ambientLight.intensity = 0.7
    ambientLight.diffuse = BABYLON.Color3.FromHexString(eraConfig.ambientLight)
    
    // 创建主光源
    const mainLight = new BABYLON.DirectionalLight(
      'mainLight',
      new BABYLON.Vector3(-1, -2, -1),
      scene
    )
    mainLight.intensity = 0.5
    
    // 创建地面
    createGround(scene, eraConfig)
    
    // 创建 NPC
    createNPCs(scene, availableNPCs, onNPCClick, eraConfig)
    
    // 创建背景几何体
    createBackgroundGeometry(scene, eraConfig)
    
    // 渲染循环
    engine.runRenderLoop(() => {
      scene.render()
    })
    
    // 窗口调整
    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)
    
    setIsReady(true)
    
    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)
      scene.dispose()
      engine.dispose()
    }
  }, [eraConfig, availableNPCs, onNPCClick])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full outline-none"
      style={{ touchAction: 'none' }}
    />
  )
}

/**
 * 创建地面
 */
function createGround(scene: BABYLON.Scene, eraConfig: any) {
  // 扩大地面到 200x200
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 200, height: 200, subdivisions: 8 },
    scene
  )
  
  // 启用碰撞检测
  ground.checkCollisions = true
  
  const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene)
  groundMaterial.diffuseColor = BABYLON.Color3.FromHexString('#111111')
  groundMaterial.specularColor = BABYLON.Color3.Black()
  groundMaterial.alpha = 0.5
  
  groundMaterial.wireframe = false
  ground.material = groundMaterial
  
  // 创建网格线（更大范围）
  const gridSize = 200
  const gridDivisions = 20
  const gridColor = BABYLON.Color3.FromHexString(eraConfig.ambientLight)
  
  for (let i = 0; i <= gridDivisions; i++) {
    const offset = (i / gridDivisions) * gridSize - gridSize / 2
    
    // 横线
    const lineH = BABYLON.MeshBuilder.CreateLines(
      `gridLineH${i}`,
      {
        points: [
          new BABYLON.Vector3(-gridSize / 2, 0.01, offset),
          new BABYLON.Vector3(gridSize / 2, 0.01, offset),
        ],
      },
      scene
    )
    lineH.color = gridColor.scale(0.3)
    
    // 竖线
    const lineV = BABYLON.MeshBuilder.CreateLines(
      `gridLineV${i}`,
      {
        points: [
          new BABYLON.Vector3(offset, 0.01, -gridSize / 2),
          new BABYLON.Vector3(offset, 0.01, gridSize / 2),
        ],
      },
      scene
    )
    lineV.color = gridColor.scale(0.3)
  }
}

/**
 * 创建 NPCs
 */
function createNPCs(
  scene: BABYLON.Scene,
  npcs: AINPC[],
  onNPCClick: (npcId: string) => void,
  eraConfig: any
) {
  // NPC 位置映射（分散在更大的世界中）
  const positionMap: { [key: string]: BABYLON.Vector3 } = {
    east: new BABYLON.Vector3(40, 2, 15),
    north: new BABYLON.Vector3(-20, 2, 50),
    center: new BABYLON.Vector3(5, 2, -5),
    south: new BABYLON.Vector3(30, 2, -45),
    west: new BABYLON.Vector3(-50, 2, -20),
  }
  
  // 创建普通居民NPC（30-50个）
  createResidents(scene, 40, eraConfig)
  
  npcs.forEach((npc) => {
    const position = positionMap[npc.position] || BABYLON.Vector3.Zero()
    let mesh: BABYLON.Mesh
    
    // 根据几何类型创建不同的形状
    switch (npc.geometryType) {
      case 'cube':
        mesh = BABYLON.MeshBuilder.CreateBox(
          npc.id,
          { size: 2 },
          scene
        )
        break
        
      case 'octahedron':
        mesh = BABYLON.MeshBuilder.CreatePolyhedron(
          npc.id,
          { type: 1, size: 1.2 },
          scene
        )
        break
        
      case 'sphere':
        mesh = BABYLON.MeshBuilder.CreateSphere(
          npc.id,
          { diameter: 2, segments: 16 },
          scene
        )
        break
        
      case 'nested-cube':
        // 嵌套立方体
        mesh = BABYLON.MeshBuilder.CreateBox(
          npc.id,
          { size: 2 },
          scene
        )
        const innerCube = BABYLON.MeshBuilder.CreateBox(
          `${npc.id}_inner`,
          { size: 1.2 },
          scene
        )
        innerCube.parent = mesh
        const innerMat = new BABYLON.StandardMaterial(`${npc.id}_innerMat`, scene)
        innerMat.diffuseColor = BABYLON.Color3.FromHexString(npc.color).scale(0.5)
        innerMat.alpha = 0.5
        innerCube.material = innerMat
        break
        
      case 'corrupted':
        // 损坏的几何体
        mesh = BABYLON.MeshBuilder.CreateIcoSphere(
          npc.id,
          { radius: 1, subdivisions: 2 },
          scene
        )
        // 添加随机扰动
        const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)
        if (positions) {
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.3
            positions[i + 1] += (Math.random() - 0.5) * 0.3
            positions[i + 2] += (Math.random() - 0.5) * 0.3
          }
          mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions)
        }
        break
        
      default:
        mesh = BABYLON.MeshBuilder.CreateBox(
          npc.id,
          { size: 2 },
          scene
        )
    }
    
    mesh.position = position
    
    // 创建材质
    const material = new BABYLON.StandardMaterial(`${npc.id}Mat`, scene)
    material.diffuseColor = BABYLON.Color3.FromHexString(npc.color)
    material.emissiveColor = BABYLON.Color3.FromHexString(npc.color).scale(0.2)
    material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5)
    mesh.material = material
    
    // 添加发光效果
    const glow = new BABYLON.GlowLayer('glow', scene)
    glow.addIncludedOnlyMesh(mesh)
    glow.intensity = 0.5
    
    // 悬浮动画
    const hoverAnimation = new BABYLON.Animation(
      `${npc.id}Hover`,
      'position.y',
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    )
    
    const keys = [
      { frame: 0, value: position.y },
      { frame: 60, value: position.y + 0.5 },
      { frame: 120, value: position.y },
    ]
    
    hoverAnimation.setKeys(keys)
    mesh.animations = [hoverAnimation]
    scene.beginAnimation(mesh, 0, 120, true)
    
    // 旋转动画
    const rotateAnimation = new BABYLON.Animation(
      `${npc.id}Rotate`,
      'rotation.y',
      30,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    )
    
    const rotateKeys = [
      { frame: 0, value: 0 },
      { frame: 240, value: Math.PI * 2 },
    ]
    
    rotateAnimation.setKeys(rotateKeys)
    mesh.animations.push(rotateAnimation)
    scene.beginAnimation(mesh, 0, 240, true, 0.3)
    
    // 点击事件
    mesh.actionManager = new BABYLON.ActionManager(scene)
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
          onNPCClick(npc.id)
        }
      )
    )
    
    // 鼠标悬停效果
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          material.emissiveColor = BABYLON.Color3.FromHexString(npc.color).scale(0.6)
          document.body.style.cursor = 'pointer'
        }
      )
    )
    
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          material.emissiveColor = BABYLON.Color3.FromHexString(npc.color).scale(0.2)
          document.body.style.cursor = 'default'
        }
      )
    )
    
    // 创建名称标签
    createNameTag(scene, mesh, npc.chineseName, npc.color)
  })
}

/**
 * 创建名称标签（简化版，使用HTML overlay）
 */
function createNameTag(
  scene: BABYLON.Scene,
  parent: BABYLON.Mesh,
  name: string,
  color: string
) {
  // 简化版：在鼠标悬停时通过回调显示名称
  // HTML overlay 会在 Explore3DWorld 组件中处理
}

/**
 * 创建普通居民NPC
 */
function createResidents(scene: BABYLON.Scene, count: number, eraConfig: any) {
  const color = BABYLON.Color3.FromHexString(eraConfig.ambientLight)
  
  const clueMessages = [
    "我看到一个发光的几何体在东边...",
    "北方有奇怪的声音传来...",
    "中心区域有强大的能量波动...",
    "南边的那个存在似乎知道很多事...",
    "西方的混沌之地，小心前往...",
    "寻找闪耀的几何体，它们掌握真相...",
    "这个世界的秘密藏在对话之中...",
    "关键词能解锁隐藏的记忆...",
  ]
  
  for (let i = 0; i < count; i++) {
    // 随机位置（分布在整个世界）
    const x = (Math.random() - 0.5) * 180
    const z = (Math.random() - 0.5) * 180
    const position = new BABYLON.Vector3(x, 1, z)
    
    // 创建简单的几何体（小一些）
    const types = ['box', 'sphere', 'cylinder', 'torus']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let mesh: BABYLON.Mesh
    
    switch (type) {
      case 'box':
        mesh = BABYLON.MeshBuilder.CreateBox(`resident${i}`, { size: 0.8 }, scene)
        break
      case 'sphere':
        mesh = BABYLON.MeshBuilder.CreateSphere(`resident${i}`, { diameter: 0.8 }, scene)
        break
      case 'cylinder':
        mesh = BABYLON.MeshBuilder.CreateCylinder(`resident${i}`, { height: 1, diameter: 0.6 }, scene)
        break
      default:
        mesh = BABYLON.MeshBuilder.CreateTorus(`resident${i}`, { diameter: 0.8, thickness: 0.2 }, scene)
    }
    
    mesh.position = position
    mesh.checkCollisions = true
    
    // 材质（暗淡一些，与AI-NPC区分）
    const material = new BABYLON.StandardMaterial(`resident${i}Mat`, scene)
    material.diffuseColor = color.scale(0.5)
    material.emissiveColor = color.scale(0.05)
    material.alpha = 0.7
    mesh.material = material
    
    // 简单的旋转动画
    scene.registerBeforeRender(() => {
      mesh.rotation.y += 0.01
    })
    
    // 点击事件（显示线索）
    mesh.actionManager = new BABYLON.ActionManager(scene)
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger,
        () => {
          const message = clueMessages[Math.floor(Math.random() * clueMessages.length)]
          console.log(`[居民 ${i}]: ${message}`)
          // 这里可以触发UI显示
          window.postMessage({ type: 'RESIDENT_CLUE', message }, '*')
        }
      )
    )
    
    // 鼠标悬停
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          material.emissiveColor = color.scale(0.2)
          document.body.style.cursor = 'help'
        }
      )
    )
    
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        () => {
          material.emissiveColor = color.scale(0.05)
          document.body.style.cursor = 'default'
        }
      )
    )
  }
}

/**
 * 创建背景几何体
 */
function createBackgroundGeometry(scene: BABYLON.Scene, eraConfig: any) {
  // 将复杂度字符串转换为数字
  const complexityMap: {[key: string]: number} = {
    'simple': 1,
    'medium': 2,
    'complex': 3,
    'broken': 4,
    'frozen': 0
  }
  const complexity = complexityMap[eraConfig.geometryComplexity] || 1
  const color = BABYLON.Color3.FromHexString(eraConfig.ambientLight)
  
  // 创建漂浮的几何体（更多，更分散）
  for (let i = 0; i < complexity * 10; i++) {
    const types = ['box', 'sphere', 'cylinder']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let mesh: BABYLON.Mesh
    
    switch (type) {
      case 'box':
        mesh = BABYLON.MeshBuilder.CreateBox(
          `bg${i}`,
          { size: Math.random() * 2 + 0.5 },
          scene
        )
        break
      case 'sphere':
        mesh = BABYLON.MeshBuilder.CreateSphere(
          `bg${i}`,
          { diameter: Math.random() * 2 + 0.5 },
          scene
        )
        break
      default:
        mesh = BABYLON.MeshBuilder.CreateCylinder(
          `bg${i}`,
          { height: Math.random() * 3 + 1, diameter: Math.random() + 0.5 },
          scene
        )
    }
    
    // 随机位置（更广的范围）
    mesh.position = new BABYLON.Vector3(
      (Math.random() - 0.5) * 200,
      Math.random() * 40 + 10,
      (Math.random() - 0.5) * 200
    )
    
    // 随机旋转
    mesh.rotation = new BABYLON.Vector3(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
    
    // 材质
    const material = new BABYLON.StandardMaterial(`bg${i}Mat`, scene)
    material.diffuseColor = color.scale(0.3)
    material.alpha = 0.1
    material.wireframe = true
    mesh.material = material
    
    // 缓慢旋转
    const rotateSpeed = (Math.random() - 0.5) * 0.01
    scene.registerBeforeRender(() => {
      mesh.rotation.y += rotateSpeed
      mesh.rotation.x += rotateSpeed * 0.5
    })
  }
}

