'use client'

import { useEffect, useState } from 'react'

export default function Test3DPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [cspHeader, setCspHeader] = useState<string>('')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('页面加载完成')

    // 测试 eval
    try {
      eval('1+1')
      addLog('✅ eval() 可用')
    } catch (e: any) {
      addLog('❌ eval() 被阻止: ' + e.message)
    }

    // 测试动态脚本
    try {
      const script = document.createElement('script')
      script.textContent = 'console.log("动态脚本执行")'
      document.head.appendChild(script)
      addLog('✅ 动态脚本可用')
    } catch (e: any) {
      addLog('❌ 动态脚本被阻止: ' + e.message)
    }

    // 获取 CSP 头部
    fetch(window.location.href)
      .then(response => {
        const csp = response.headers.get('content-security-policy')
        if (csp) {
          setCspHeader(csp)
          addLog('📋 CSP 头部: ' + csp.substring(0, 100) + '...')
        } else {
          addLog('⚠️ 未找到 CSP 头部')
        }
      })
      .catch(err => {
        addLog('❌ 获取头部失败: ' + err.message)
      })

    // 测试 Babylon.js 导入
    const testBabylon = async () => {
      try {
        addLog('🎮 尝试加载 Babylon.js...')
        const BABYLON = await import('@babylonjs/core')
        addLog('✅ Babylon.js 加载成功')
        
        // 尝试创建引擎
        const canvas = document.createElement('canvas')
        const engine = new BABYLON.Engine(canvas, true)
        addLog('✅ Babylon 引擎创建成功')
        engine.dispose()
      } catch (e: any) {
        addLog('❌ Babylon.js 失败: ' + e.message)
      }
    }

    testBabylon()
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🔍 3D功能诊断页面
        </h1>

        <div className="bg-gray-900 border border-green-400 p-6 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">CSP 头部信息</h2>
          {cspHeader ? (
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
              {cspHeader}
            </pre>
          ) : (
            <p className="text-yellow-400">加载中...</p>
          )}
        </div>

        <div className="bg-gray-900 border border-green-400 p-6 rounded">
          <h2 className="text-xl font-bold mb-4">测试日志</h2>
          <div className="space-y-2 text-sm">
            {logs.map((log, i) => (
              <div key={i} className={
                log.includes('✅') ? 'text-green-400' :
                log.includes('❌') ? 'text-red-400' :
                log.includes('⚠️') ? 'text-yellow-400' :
                'text-gray-300'
              }>
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-500">等待测试...</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-cyan-400 hover:underline">
            ← 返回主页
          </a>
        </div>

        <div className="mt-8 p-4 bg-gray-900 border border-yellow-400 rounded">
          <h3 className="text-yellow-400 font-bold mb-2">💡 如何修复</h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>确保已重启开发服务器（npm run dev）</li>
            <li>清除浏览器缓存（Ctrl+Shift+Delete）</li>
            <li>使用无痕模式测试</li>
            <li>检查浏览器控制台的 CSP 错误详情</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

