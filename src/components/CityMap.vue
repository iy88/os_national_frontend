<template>
  <div class="city-map">
    <h2 class="section-title">电竞文旅地图</h2>
    <div class="map-wrapper">
      <!-- 可缩放拖拽的地图容器 -->
      <div
        class="map-container"
        ref="containerRef"
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <svg
          class="china-map-svg"
          :viewBox="computeViewBox()"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- 省份路径层 -->
          <g class="provinces">
            <path
              v-for="(path, index) in provincePaths"
              :key="index"
              :d="path"
              class="province-path"
            />
          </g>

          <!-- 城市标记层 -->
          <g class="city-markers">
            <g
              v-for="marker in cityMarkers"
              :key="marker.city"
              :transform="`translate(${marker.x}, ${marker.y})`"
              class="city-marker"
              @click="handleCityClick(marker.city)"
            >
              <circle class="pulse-ring" r="10" />
              <circle class="marker-dot" r="5" />
              <text class="city-label" y="22">{{ marker.name }}</text>
            </g>
          </g>
        </svg>
      </div>

      <!-- 恢复按钮 -->
      <button
        class="reset-btn"
        @click="resetView"
        title="恢复初始视图"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      <!-- 缩放提示 -->
      <div class="zoom-hint" v-if="showHint">
        滚轮缩放 · 拖拽移动
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select-city'])

// SVG原始viewBox
const ORIGIN_VIEW_BOX = '0 0 795 500'
const SVG_WIDTH = 795
const SVG_HEIGHT = 500

// 视图状态 - 使用独立的状态变量
const vbX = ref(0)  // viewBox x起点
const vbY = ref(0)  // viewBox y起点
const vbW = ref(SVG_WIDTH)   // viewBox 宽度
const vbH = ref(SVG_HEIGHT)  // viewBox 高度

// 计算当前viewBox字符串
const computeViewBox = () => {
  return `${vbX.value} ${vbY.value} ${vbW.value} ${vbH.value}`
}

// 拖拽状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

// 提示显示
const showHint = ref(true)

// 容器引用
const containerRef = ref(null)

// 城市标记数据
const cityMarkersData = {
  xian:      { name: '西安',   lon: 108.95, lat: 34.27 },
  chengdu:   { name: '成都',   lon: 104.07, lat: 30.66 },
  shanghai:  { name: '上海',   lon: 121.47, lat: 31.23 },
  wuhan:     { name: '武汉',   lon: 114.30, lat: 30.58 },
  guangzhou: { name: '广州',   lon: 113.28, lat: 23.13 },
  hangzhou:  { name: '杭州',   lon: 120.15, lat: 30.29 }
}

// 地理坐标转SVG坐标
const geoToSvg = (lon, lat) => {
  const x = 7.242 * lon - 366.12
  const y = -10.06 * lat + 540.06
  return { x, y }
}

// 计算城市标记坐标
const cityMarkers = Object.entries(cityMarkersData).map(([key, info]) => {
  const { x, y } = geoToSvg(info.lon, info.lat)
  return { city: key, name: info.name, x, y }
})

// 省份路径数据
const provincePaths = ref([])

// 提取SVG路径数据
const extractSvgPaths = async () => {
  try {
    const response = await fetch('/China_map.svg')
    const svgText = await response.text()
    const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g
    const paths = []
    let match
    while ((match = pathRegex.exec(svgText)) !== null) {
      paths.push(match[1])
    }
    provincePaths.value = paths
  } catch (error) {
    console.error('Failed to load SVG paths:', error)
  }
}

// 获取容器到SVG的缩放比例
const getContainerScale = () => {
  const container = containerRef.value
  if (!container) return { scaleX: 1, scaleY: 1 }
  const rect = container.getBoundingClientRect()
  return {
    scaleX: rect.width / vbW.value,
    scaleY: rect.height / vbH.value
  }
}

// 滚轮缩放 - 以鼠标位置为中心缩放
const handleWheel = (e) => {
  e.preventDefault()
  showHint.value = false

  const container = containerRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // 鼠标在SVG坐标系中的位置（缩放前）
  const { scaleX, scaleY } = getContainerScale()
  const svgX = mouseX / scaleX + vbX.value
  const svgY = mouseY / scaleY + vbY.value

  // 计算新的缩放比例 - 向前滚动放大，向后滚动缩小
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
  const newW = Math.max(SVG_WIDTH / 5, Math.min(SVG_WIDTH * 2, vbW.value * zoomFactor))
  const newH = newW * (SVG_HEIGHT / SVG_WIDTH) // 保持宽高比

  // 缩放后，让鼠标位置仍然是同一个SVG坐标
  // newSvgX = mouseX / newScaleX + newVbX = svgX
  // newVbX = svgX - mouseX / newScaleX
  const newScaleX = rect.width / newW
  const newScaleY = rect.height / newH

  const newVbX = svgX - mouseX / newScaleX
  const newVbY = svgY - mouseY / newScaleY

  vbX.value = newVbX
  vbY.value = newVbY
  vbW.value = newW
  vbH.value = newH
}

// 鼠标按下开始拖拽
const handleMouseDown = (e) => {
  if (e.button !== 0) return

  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY

  showHint.value = false
}

// 鼠标移动拖拽 - 1:1跟随鼠标移动
const handleMouseMove = (e) => {
  if (!isDragging.value) return

  const { scaleX, scaleY } = getContainerScale()

  // 鼠标在屏幕上的移动量（像素）
  const dx = e.clientX - dragStartX.value
  const dy = e.clientY - dragStartY.value

  // 将屏幕像素转换为SVG单位（考虑当前缩放）
  vbX.value = vbX.value - dx / scaleX
  vbY.value = vbY.value - dy / scaleY

  // 更新拖拽起点为当前位置（连续拖拽时保持1:1）
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
}

// 鼠标释放停止拖拽
const handleMouseUp = () => {
  isDragging.value = false
}

// 恢复初始视图
const resetView = () => {
  vbX.value = 0
  vbY.value = 0
  vbW.value = SVG_WIDTH
  vbH.value = SVG_HEIGHT
}

// ===== 移动端触摸支持 =====

// 触摸状态
const lastTouchDistance = ref(0)
const lastTouchCenterX = ref(0)
const lastTouchCenterY = ref(0)

// 计算双指距离
const getTouchDistance = (touches) => {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// 计算双指中心点
const getTouchCenter = (touches) => {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  }
}

// 触摸开始
const handleTouchStart = (e) => {
  showHint.value = false

  if (e.touches.length === 1) {
    isDragging.value = true
    const touch = e.touches[0]
    dragStartX.value = touch.clientX
    dragStartY.value = touch.clientY
  } else if (e.touches.length === 2) {
    isDragging.value = false
    lastTouchDistance.value = getTouchDistance(e.touches)
    const center = getTouchCenter(e.touches)
    lastTouchCenterX.value = center.x
    lastTouchCenterY.value = center.y
  }
}

// 触摸移动
const handleTouchMove = (e) => {
  e.preventDefault()

  if (e.touches.length === 1 && isDragging.value) {
    const touch = e.touches[0]
    const container = containerRef.value
    if (!container) return

    const { scaleX, scaleY } = getContainerScale()

    // 触摸在屏幕上的移动量（像素）
    const dx = touch.clientX - dragStartX.value
    const dy = touch.clientY - dragStartY.value

    // 将屏幕像素转换为SVG单位
    vbX.value = vbX.value - dx / scaleX
    vbY.value = vbY.value - dy / scaleY

    // 更新拖拽起点
    dragStartX.value = touch.clientX
    dragStartY.value = touch.clientY
  } else if (e.touches.length === 2) {
    // 双指缩放
    const newDistance = getTouchDistance(e.touches)
    const center = getTouchCenter(e.touches)

    if (lastTouchDistance.value > 0) {
      // 捏合缩小（newDistance < lastDistance），展开放大
      const scaleFactor = lastTouchDistance.value / newDistance
      const newW = Math.max(SVG_WIDTH / 5, Math.min(SVG_WIDTH * 2, vbW.value * scaleFactor))
      const newH = newW * (SVG_HEIGHT / SVG_WIDTH)

      // 以双指中心点为缩放中心
      const rect = containerRef.value.getBoundingClientRect()
      const centerSvgX = (center.x - rect.left) / (rect.width / vbW.value) + vbX.value
      const centerSvgY = (center.y - rect.top) / (rect.height / newH) + vbY.value

      vbX.value = centerSvgX - (center.x - rect.left) / (rect.width / newW)
      vbY.value = centerSvgY - (center.y - rect.top) / (rect.height / newH)
      vbW.value = newW
      vbH.value = newH
    }

    lastTouchDistance.value = newDistance
    lastTouchCenterX.value = center.x
    lastTouchCenterY.value = center.y
  }
}

// 触摸结束
const handleTouchEnd = (e) => {
  if (e.touches.length === 0) {
    isDragging.value = false
    lastTouchDistance.value = 0
  } else if (e.touches.length === 1) {
    isDragging.value = true
    const touch = e.touches[0]
    dragStartX.value = touch.clientX
    dragStartY.value = touch.clientY
    lastTouchDistance.value = 0
  }
}

// 处理城市点击
const handleCityClick = (cityKey) => {
  emit('select-city', cityKey)
}

onMounted(() => {
  extractSvgPaths()

  // 3秒后隐藏提示
  setTimeout(() => {
    showHint.value = false
  }, 3000)
})
</script>

<style scoped>
.city-map {
  background: rgba(30, 45, 80, 0.5);
  border-radius: 10px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.section-title {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.map-wrapper {
  position: relative;
}

.map-container {
  height: 500px;
  background: linear-gradient(145deg, rgba(25, 40, 75, 0.8) 0%, rgba(15, 25, 45, 0.9) 100%);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: grab;
  user-select: none;
}

.map-container:active {
  cursor: grabbing;
}

.china-map-svg {
  width: 100%;
  height: 100%;
}

.province-path {
  fill: rgba(240, 179, 68, 0.08);
  stroke: rgba(240, 179, 68, 0.4);
  stroke-width: 0.5;
  transition: fill 0.2s ease;
}

.province-path:hover {
  fill: rgba(240, 179, 68, 0.25);
  stroke: rgba(240, 179, 68, 0.6);
}

.city-marker {
  cursor: pointer;
}

.city-marker .marker-dot {
  fill: #ff6b6b;
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.8));
  transition: all 0.2s ease;
}

.city-marker:hover .marker-dot {
  fill: #ff4444;
  filter: drop-shadow(0 0 8px rgba(255, 107, 107, 1));
}

.city-marker .pulse-ring {
  fill: none;
  stroke: #ff6b6b;
  stroke-width: 1;
  opacity: 0.5;
  animation: pulse 2s infinite;
}

.city-marker .city-label {
  fill: #fff;
  font-size: 12px;
  font-weight: 500;
  text-anchor: middle;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  opacity: 0.9;
}

@keyframes pulse {
  0% {
    r: 5;
    opacity: 0.6;
  }
  50% {
    r: 12;
    opacity: 0.2;
  }
  100% {
    r: 5;
    opacity: 0.6;
  }
}

/* 恢复按钮 */
.reset-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  background: rgba(30, 45, 80, 0.9);
  border: 1px solid rgba(240, 179, 68, 0.3);
  border-radius: 8px;
  color: #f0b344;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.reset-btn:hover {
  background: rgba(240, 179, 68, 0.2);
  border-color: #f0b344;
  transform: scale(1.05);
}

.reset-btn:active {
  transform: scale(0.95);
}

.reset-btn svg {
  width: 22px;
  height: 22px;
}

/* 缩放提示 */
.zoom-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  pointer-events: none;
  animation: fadeInOut 3s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .city-map {
    padding: 16px;
  }

  .section-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }

  .map-container {
    height: 400px;
    /* 增强触摸反馈 */
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .reset-btn {
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }

  .reset-btn svg {
    width: 20px;
    height: 20px;
  }

  .zoom-hint {
    font-size: 12px;
    padding: 6px 14px;
    bottom: 12px;
  }

  .city-marker .city-label {
    font-size: 10px;
  }

  .city-marker .marker-dot {
    r: 4;
  }

  .city-marker .pulse-ring {
    r: 8;
  }
}

@media (max-width: 480px) {
  .map-container {
    height: 320px;
  }

  .reset-btn {
    bottom: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
  }
}
</style>
