'use client'

import { useEffect, useRef, useState } from 'react'
import type { Engine, Scene } from '@babylonjs/core'

interface BabylonSceneProps {
  onSceneReady: (scene: Scene, engine: Engine) => void
  onRender?: (scene: Scene) => void
  className?: string
}

export default function BabylonScene({ onSceneReady, onRender, className }: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    let engine: Engine | null = null
    let scene: Scene | null = null

    const initBabylon = async () => {
      try {
        console.log('🎮 开始初始化 Babylon.js...')
        
        // 动态导入 Babylon.js（仅在客户端）
        const BABYLON = await import('@babylonjs/core')
        console.log('✅ Babylon.js 加载成功')
        
        const canvas = canvasRef.current!
        
        // 创建引擎时使用更宽松的配置
        engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          disableWebGL2Support: false,
          powerPreference: 'high-performance',
        })
        console.log('✅ 引擎创建成功')

        scene = new BABYLON.Scene(engine)
        console.log('✅ 场景创建成功')

        // 调用场景设置回调
        if (onSceneReady) {
          await onSceneReady(scene, engine)
        }
        console.log('✅ 场景设置完成')

        // 启动渲染循环
        engine.runRenderLoop(() => {
          if (!scene) return
          if (onRender) {
            onRender(scene)
          }
          scene.render()
        })
        console.log('✅ 渲染循环启动')

        // 响应窗口大小变化
        const handleResize = () => {
          engine?.resize()
        }
        window.addEventListener('resize', handleResize)

        // 清理函数
        return () => {
          console.log('🧹 清理 Babylon.js 资源...')
          window.removeEventListener('resize', handleResize)
          scene?.dispose()
          engine?.dispose()
        }
      } catch (err: any) {
        console.error('❌ Babylon.js 初始化失败:', err)
        setError(err.message)
        throw err
      }
    }

    const cleanup = initBabylon()

    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn()
      }).catch(err => {
        console.error('清理时出错:', err)
      })
    }
  }, [isClient, onSceneReady, onRender])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-red-400 p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2">3D引擎加载失败</div>
          <div className="text-sm text-gray-400 mb-4">{error}</div>
          <div className="text-xs text-gray-500">
            请尝试刷新页面或使用其他浏览器
          </div>
        </div>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={className || 'w-full h-full'} />
}

