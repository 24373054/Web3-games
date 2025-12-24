'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import BabylonScene from './BabylonScene'
import type { Scene, Engine } from '@babylonjs/core'
import { ethers } from 'ethers'
import { getAINPCContract } from '@/lib/contracts'
import { getRpcProvider } from '@/lib/provider'

interface SimpleWorldProps {
  provider: ethers.BrowserProvider | null
  account: string | null
  beingId: number | null
  onNPCInteract: (npcId: string) => void
  onEnterPortal: () => void
}

interface NPCData {
  id: string
  type: number
  name: string
}

const npcTypeNames = ['史官', '工匠', '商序', '先知', '遗忘']

export default function SimpleWorld({
  provider,
  account,
  beingId,
  onNPCInteract,
  onEnterPortal
}: SimpleWorldProps) {
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null)
  const [nearPortal, setNearPortal] = useState<boolean>(false)
  const [npcsData, setNpcsData] = useState<NPCData[]>([])
  const npcsLoaded = useRef(false)

  // 加载真实的 NPC 数据
  useEffect(() => {
    const loadNPCs = async () => {
      if (npcsLoaded.current) return
      try {
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

        const data = await Promise.all(npcDataPromises)
        setNpcsData(data)
        npcsLoaded.current = true
        console.log('✅ NPC数据加载成功:', data)
      } catch (error) {
        console.error('❌ 加载NPC数据失败:', error)
      }
    }
    loadNPCs()
  }, [])

  const onSceneReady = useCallback(async (scene: Scene, engine: Engine) => {
    console.log('🎮 SimpleWorld: 开始设置场景')
    
    // 动态导入 Babylon.js（不导入物理引擎）
    const BABYLON = await import('@babylonjs/core')
    console.log('✅ Babylon.js 导入成功')

    // 设置场景
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1)
    
    // 创建相机（自由相机，不使用物理）
    const camera = new BABYLON.FreeCamera(
      'camera',
      new BABYLON.Vector3(0, 2, -10),
      scene
    )
    camera.setTarget(new BABYLON.Vector3(0, 2, 0))
    camera.attachControl(engine.getRenderingCanvas()!, true)
    camera.speed = 0.5
    camera.angularSensibility = 1000
    console.log('✅ 相机创建成功')

    // 创建环境光
    const light = new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 1, 0),
      scene
    )
    light.intensity = 0.7
    console.log('✅ 光照创建成功')

    // 创建地面
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50 },
      scene
    )
    const groundMat = new BABYLON.StandardMaterial('groundMat', scene)
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.3)
    groundMat.emissiveColor = new BABYLON.Color3(0, 0.1, 0.2)
    ground.material = groundMat
    console.log('✅ 地面创建成功')

    // 创建中央立方体 - 传送门
    const box = BABYLON.MeshBuilder.CreateBox('centralCube', { size: 3 }, scene)
    box.position.y = 1.5
    
    // 标记为传送门
    box.metadata = {
      isPortal: true,
      portalName: '管理面板传送门'
    }
    
    const boxMat = new BABYLON.StandardMaterial('boxMat', scene)
    boxMat.diffuseColor = new BABYLON.Color3(0, 0.5, 1)
    boxMat.emissiveColor = new BABYLON.Color3(0, 0.2, 0.4)
    box.material = boxMat
    console.log('✅ 中央立方体（传送门）创建成功')

    // 简单的旋转动画
    scene.registerBeforeRender(() => {
      box.rotation.y += 0.01
    })

    // 加载真实的 NPC 数据并创建
    let npcsList: NPCData[] = []
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
      console.log('✅ NPC数据加载成功:', npcsList)
    } catch (error) {
      console.error('❌ 加载NPC数据失败:', error)
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
      new BABYLON.Vector3(-5, 1, 5),
      new BABYLON.Vector3(5, 1, 5),
      new BABYLON.Vector3(0, 1, 8),
      new BABYLON.Vector3(-8, 1, 0),
      new BABYLON.Vector3(8, 1, 0)
    ]

    // 创建 NPC
    npcsList.forEach((npcData, index) => {
      const pos = positions[index % positions.length]
      const color = npcTypeColors[npcData.type]
      
      const npc = BABYLON.MeshBuilder.CreateBox(`npc_${index}`, { size: 1.5 }, scene)
      npc.position = pos.clone()
      const npcMat = new BABYLON.StandardMaterial(`npc_${index}_mat`, scene)
      npcMat.diffuseColor = new BABYLON.Color3(...color)
      npcMat.emissiveColor = new BABYLON.Color3(...color.map(c => c * 0.3) as [number, number, number])
      npc.material = npcMat
      
      npc.metadata = {
        isNPC: true,
        npcId: npcData.id,  // 使用真实的合约 NPC ID
        npcName: npcData.name,
        npcType: npcData.type
      }

      // 悬浮动画
      const initialY = pos.y
      let time = Math.random() * Math.PI * 2
      scene.registerBeforeRender(() => {
        time += 0.02
        npc.position.y = initialY + Math.sin(time) * 0.2
        npc.rotation.y += 0.01
      })
    })
    console.log('✅ NPC 创建成功')

    // 添加发光层
    const gl = new BABYLON.GlowLayer('glow', scene)
    gl.intensity = 0.5
    console.log('✅ 发光层创建成功')

    // 持续检测玩家是否靠近传送门
    scene.registerBeforeRender(() => {
      const centralCube = scene.getMeshByName('centralCube')
      if (centralCube && camera) {
        const distance = BABYLON.Vector3.Distance(camera.position, centralCube.position)
        setNearPortal(distance < 10)
      }
    })

    // 交互检测
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        if (kbInfo.event.key === 'e' || kbInfo.event.key === 'E') {
          const ray = camera.getForwardRay(10)
          const pickInfo = scene.pickWithRay(ray)
          if (pickInfo?.hit && pickInfo.pickedMesh?.metadata) {
            // 检测NPC
            if (pickInfo.pickedMesh.metadata.isNPC) {
              const npcId = pickInfo.pickedMesh.metadata.npcId
              const npcName = pickInfo.pickedMesh.metadata.npcName
              console.log('🎯 3D场景 - 点击NPC:')
              console.log('  NPC ID:', npcId)
              console.log('  NPC Name:', npcName)
              console.log('  ID类型:', typeof npcId)
              console.log('  ID长度:', npcId?.length)
              onNPCInteract(npcId)
            }
            // 检测传送门
            else if (pickInfo.pickedMesh.metadata.isPortal) {
              onEnterPortal()
            }
          }
        }
      }
    })

    console.log('✅ 简化场景设置完成！')
  }, [onNPCInteract, onEnterPortal])

  return (
    <div className="relative w-full h-screen">
      <BabylonScene onSceneReady={onSceneReady} className="w-full h-full" />
      
      {/* HUD */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 准星 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-yingzhou-cyan rounded-full opacity-50" />
        </div>

        {/* 控制提示 */}
        <div className="absolute bottom-4 left-4 bg-black/70 border border-yingzhou-cyan p-4 text-xs pointer-events-auto">
          <div className="text-yingzhou-cyan font-bold mb-2">简化版 3D 场景</div>
          <div className="space-y-1 text-gray-300">
            <div>WASD - 移动</div>
            <div>鼠标 - 视角</div>
            <div>E - 交互</div>
            <div className="text-purple-400 mt-2">💡 靠近中央方块可进入管理面板</div>
          </div>
          <div className="mt-2 text-green-400 text-xs">
            ✅ 无物理引擎版本
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

        {/* 玩家信息 */}
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

