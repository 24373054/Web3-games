/**
 * 纪元视觉系统
 * 根据纪元调整3D场景的颜色和视觉效果
 */

import * as BABYLON from '@babylonjs/core'

export interface EpochTheme {
  epoch: number
  name: string
  primaryColor: BABYLON.Color3
  secondaryColor: BABYLON.Color3
  accentColor: BABYLON.Color3
  fogColor: BABYLON.Color3
  ambientIntensity: number
  particleColor: BABYLON.Color4
  glowIntensity: number
}

export const EPOCH_THEMES: EpochTheme[] = [
  {
    // 创世纪元
    epoch: 0,
    name: '创世',
    primaryColor: new BABYLON.Color3(0, 1, 1), // 青色 #00FFFF
    secondaryColor: new BABYLON.Color3(0, 0.5, 0.8),
    accentColor: new BABYLON.Color3(0.2, 0.8, 1),
    fogColor: new BABYLON.Color3(0.05, 0.1, 0.2),
    ambientIntensity: 0.3,
    particleColor: new BABYLON.Color4(0, 1, 1, 0.8),
    glowIntensity: 0.5
  },
  {
    // 萌芽纪元
    epoch: 1,
    name: '萌芽',
    primaryColor: new BABYLON.Color3(0, 1, 0), // 绿色 #00FF00
    secondaryColor: new BABYLON.Color3(0.2, 0.8, 0.2),
    accentColor: new BABYLON.Color3(0.4, 1, 0.4),
    fogColor: new BABYLON.Color3(0.05, 0.15, 0.05),
    ambientIntensity: 0.4,
    particleColor: new BABYLON.Color4(0, 1, 0, 0.8),
    glowIntensity: 0.6
  },
  {
    // 繁盛纪元
    epoch: 2,
    name: '繁盛',
    primaryColor: new BABYLON.Color3(1, 1, 0), // 黄色 #FFFF00
    secondaryColor: new BABYLON.Color3(1, 0.8, 0),
    accentColor: new BABYLON.Color3(1, 0.9, 0.3),
    fogColor: new BABYLON.Color3(0.2, 0.15, 0.05),
    ambientIntensity: 0.6,
    particleColor: new BABYLON.Color4(1, 1, 0, 0.8),
    glowIntensity: 0.8
  },
  {
    // 熵化纪元
    epoch: 3,
    name: '熵化',
    primaryColor: new BABYLON.Color3(1, 0, 0), // 红色 #FF0000
    secondaryColor: new BABYLON.Color3(0.8, 0.2, 0.2),
    accentColor: new BABYLON.Color3(1, 0.3, 0.3),
    fogColor: new BABYLON.Color3(0.2, 0.05, 0.05),
    ambientIntensity: 0.4,
    particleColor: new BABYLON.Color4(1, 0, 0, 0.8),
    glowIntensity: 0.7
  },
  {
    // 毁灭纪元
    epoch: 4,
    name: '毁灭',
    primaryColor: new BABYLON.Color3(1, 1, 1), // 白色 #FFFFFF
    secondaryColor: new BABYLON.Color3(0.8, 0.8, 0.8),
    accentColor: new BABYLON.Color3(0.9, 0.9, 0.9),
    fogColor: new BABYLON.Color3(0.1, 0.1, 0.1),
    ambientIntensity: 0.5,
    particleColor: new BABYLON.Color4(1, 1, 1, 0.6),
    glowIntensity: 0.4
  }
]

/**
 * 应用纪元主题到场景
 */
export function applyEpochTheme(
  scene: BABYLON.Scene,
  epoch: number,
  duration: number = 2000 // 过渡动画时长（毫秒）
) {
  const theme = EPOCH_THEMES[epoch] || EPOCH_THEMES[0]
  
  // 更新场景背景色（平滑过渡）
  if (scene.clearColor) {
    animateColor(
      scene.clearColor as BABYLON.Color4,
      new BABYLON.Color4(theme.fogColor.r, theme.fogColor.g, theme.fogColor.b, 1),
      duration
    )
  }
  
  // 更新环境光
  const ambientLight = scene.lights.find(l => l.name === 'ambient') as BABYLON.HemisphericLight
  if (ambientLight) {
    animateFloat(ambientLight, 'intensity', theme.ambientIntensity, duration)
  }
  
  return theme
}

/**
 * 更新泡泡材质颜色
 */
export function updateBubbleColors(
  bubble: BABYLON.Mesh,
  wireframeBubble: BABYLON.Mesh,
  theme: EpochTheme,
  duration: number = 2000
) {
  if (bubble && bubble.material) {
    const mat = bubble.material as BABYLON.StandardMaterial
    
    // 平滑过渡emissive颜色
    animateColor3(mat, 'emissiveColor', theme.primaryColor, duration)
  }
  
  if (wireframeBubble && wireframeBubble.material) {
    const wireMat = wireframeBubble.material as BABYLON.StandardMaterial
    animateColor3(wireMat, 'emissiveColor', theme.primaryColor, duration)
  }
}

/**
 * 更新小泡泡颜色
 */
export function updateSmallBubbles(
  bubbles: BABYLON.Mesh[],
  theme: EpochTheme,
  duration: number = 2000
) {
  bubbles.forEach((bubble, index) => {
    if (bubble && bubble.material) {
      const mat = bubble.material as BABYLON.StandardMaterial
      
      // 每个小泡泡延迟一点开始动画，形成波浪效果
      const delay = index * 50
      setTimeout(() => {
        animateColor3(mat, 'emissiveColor', theme.secondaryColor, duration)
      }, delay)
    }
  })
}

/**
 * 更新粒子系统颜色
 */
export function updateParticleSystems(
  particleSystems: BABYLON.ParticleSystem[],
  theme: EpochTheme
) {
  particleSystems.forEach(ps => {
    ps.color1 = theme.particleColor
    ps.color2 = new BABYLON.Color4(
      theme.particleColor.r * 0.8,
      theme.particleColor.g * 0.8,
      theme.particleColor.b * 0.8,
      theme.particleColor.a
    )
  })
}

/**
 * 更新NPC颜色
 */
export function updateNPCColors(
  npcEntities: Map<string, any>,
  theme: EpochTheme,
  duration: number = 2000
) {
  let index = 0
  npcEntities.forEach((entity) => {
    if (entity.core && entity.core.material) {
      const delay = index * 100
      setTimeout(() => {
        animateColor3(entity.core.material, 'emissiveColor', theme.accentColor, duration)
      }, delay)
    }
    
    if (entity.beam && entity.beam.material) {
      const delay = index * 100
      setTimeout(() => {
        animateColor3(entity.beam.material, 'emissiveColor', theme.secondaryColor, duration / 2)
      }, delay)
    }
    
    index++
  })
}

/**
 * 更新发光层
 */
export function updateGlowLayer(
  glowLayer: BABYLON.GlowLayer | null,
  theme: EpochTheme
) {
  if (glowLayer) {
    glowLayer.intensity = theme.glowIntensity
  }
}

/**
 * 完整的纪元切换动画
 */
export function transitionToEpoch(
  scene: BABYLON.Scene,
  bubble: BABYLON.Mesh | null,
  wireframeBubble: BABYLON.Mesh | null,
  smallBubbles: BABYLON.Mesh[],
  npcEntities: Map<string, any>,
  particleSystems: BABYLON.ParticleSystem[],
  glowLayer: BABYLON.GlowLayer | null,
  epoch: number
) {
  const theme = applyEpochTheme(scene, epoch)
  
  if (bubble && wireframeBubble) {
    updateBubbleColors(bubble, wireframeBubble, theme)
  }
  
  updateSmallBubbles(smallBubbles, theme)
  updateNPCColors(npcEntities, theme)
  updateParticleSystems(particleSystems, theme)
  updateGlowLayer(glowLayer, theme)
  
  return theme
}

// ========== 辅助动画函数 ==========

/**
 * 颜色动画（Color4）
 */
function animateColor(
  target: BABYLON.Color4,
  endColor: BABYLON.Color4,
  duration: number
) {
  const startColor = new BABYLON.Color4(target.r, target.g, target.b, target.a)
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用缓动函数
    const eased = easeInOutCubic(progress)
    
    target.r = startColor.r + (endColor.r - startColor.r) * eased
    target.g = startColor.g + (endColor.g - startColor.g) * eased
    target.b = startColor.b + (endColor.b - startColor.b) * eased
    target.a = startColor.a + (endColor.a - startColor.a) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

/**
 * 颜色动画（Color3，用于材质）
 */
function animateColor3(
  target: any,
  property: string,
  endColor: BABYLON.Color3,
  duration: number
) {
  const startColor = new BABYLON.Color3(
    target[property].r,
    target[property].g,
    target[property].b
  )
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)
    
    target[property].r = startColor.r + (endColor.r - startColor.r) * eased
    target[property].g = startColor.g + (endColor.g - startColor.g) * eased
    target[property].b = startColor.b + (endColor.b - startColor.b) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

/**
 * 数值动画
 */
function animateFloat(
  target: any,
  property: string,
  endValue: number,
  duration: number
) {
  const startValue = target[property]
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)
    
    target[property] = startValue + (endValue - startValue) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

/**
 * 缓动函数 - 三次方缓入缓出
 */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

