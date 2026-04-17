<template>
    <div class="city-map">
        <div class="map-wrapper">
            <!-- 可缩放拖拽的地图容器 -->
            <div
                ref="containerRef"
                :class="['map-container', {interacting: isInteracting}]"
                @mousedown="handleMouseDown"
                @mouseleave="handleMouseUp"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @touchend="handleTouchEnd"
                @touchstart="handleTouchStart"
                @wheel.prevent="handleWheel"
                @touchmove.prevent="handleTouchMove"
            >
                <svg
                    :viewBox="computeViewBox()"
                    class="china-map-svg"
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
                            @touchend.stop.prevent="handleCityTouch(marker.city)"
                        >
                            <circle class="pulse-ring" r="10"/>
                            <circle class="marker-dot" r="5"/>
                            <text class="city-label" y="22">{{ marker.name }}</text>
                        </g>
                    </g>
                </svg>
            </div>

            <!-- 恢复按钮 -->
            <button
                class="reset-btn"
                title="恢复初始视图"
                @click="resetView"
            >
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                </svg>
            </button>

            <!-- 缩放提示 -->
            <div v-if="showHint" class="zoom-hint">
                滚轮缩放 · 拖拽移动
            </div>
        </div>
    </div>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import citiesData from '../data/cities.json'

const emit = defineEmits(['select-city'])

// SVG原始viewBox
const SVG_WIDTH = 795
const SVG_HEIGHT = 500

// 视图状态 - 使用独立的状态变量
const vbX = ref(0)  // viewBox x起点
const vbY = ref(0)  // viewBox y起点
const vbW = ref(SVG_WIDTH)   // viewBox 宽度
const vbH = ref(SVG_HEIGHT)  // viewBox 高度

// 初始大陆视图（用于重置）
const initialMainlandView = ref({x: 0, y: 0, w: SVG_WIDTH, h: SVG_HEIGHT})

// 缩放范围（基于初始大陆视图宽度）
const MIN_VIEW_WIDTH_RATIO = 0.35
const MAX_VIEW_WIDTH_RATIO = 2.2
const INITIAL_VIEW_ZOOM_OUT_RATIO = 1.08
const MAP_VISUAL_UPSHIFT_RATIO = 0.06

// 计算当前viewBox字符串
const computeViewBox = () => {
    const safeX = Number.isFinite(vbX.value) ? vbX.value : 0
    const safeY = Number.isFinite(vbY.value) ? vbY.value : 0
    const safeW = Number.isFinite(vbW.value) && vbW.value > 0 ? vbW.value : SVG_WIDTH
    const safeH = Number.isFinite(vbH.value) && vbH.value > 0 ? vbH.value : SVG_HEIGHT
    return `${safeX} ${safeY} ${safeW} ${safeH}`
}

// 基于初始大陆视图计算当前设备下的动态缩放上下限
const getZoomWidthLimits = () => {
    const baseWidth = initialMainlandView.value?.w || SVG_WIDTH
    return {
        minW: baseWidth * MIN_VIEW_WIDTH_RATIO,
        maxW: baseWidth * MAX_VIEW_WIDTH_RATIO
    }
}

const clampViewWidth = (nextWidth) => {
    const {minW, maxW} = getZoomWidthLimits()
    return Math.max(minW, Math.min(maxW, nextWidth))
}

// 拖拽状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const isInteracting = ref(false)

// 交互更新节流：将高频移动/缩放合并到每帧一次
let panRafId = 0
let panPointerX = 0
let panPointerY = 0
let pinchRafId = 0
let pinchDistance = 0
let pinchCenterX = 0
let pinchCenterY = 0

// 提示显示
const showHint = ref(true)

// 容器引用
const containerRef = ref(null)
let containerResizeObserver = null

// Resize 优化：忽略微小抖动；宽度-only 变化走快速路径，避免重算 fitView
let lastContainerWidth = 0
let lastContainerHeight = 0
const RESIZE_THRESHOLD_PX = 4

// 城市标记数据（从 cities.json 导入）
const cityMarkersData = Object.entries(citiesData).reduce((acc, [key, city]) => {
    if (city.center) {
        acc[key] = {
            name: city.displayName,
            lon: city.center[0],
            lat: city.center[1]
        }
    }
    return acc
}, {})

// 地理坐标转SVG坐标
const geoToSvg = (lon, lat) => {
    const x = 7.242 * lon - 366.12
    const y = -10.06 * lat + 540.06
    return {x, y}
}

// 计算城市标记坐标
const cityMarkers = Object.entries(cityMarkersData).map(([key, info]) => {
    const {x, y} = geoToSvg(info.lon, info.lat)
    return {city: key, name: info.name, x, y}
})

// 省份路径数据
const provincePaths = ref([])

// 大陆边界（排除海南岛后）
const mainlandBounds = ref({minX: 0, minY: 0, maxX: 795, maxY: 500})

// 从路径数据中提取坐标范围
const extractPathBounds = (d) => {
    const coords = d.match(/[\d.]+/g)
    if (!coords) return null
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let i = 0; i < coords.length; i += 2) {
        const x = parseFloat(coords[i])
        const y = parseFloat(coords[i + 1])
        if (!isNaN(x) && !isNaN(y)) {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
        }
    }
    return {minX, minY, maxX, maxY}
}

// 提取SVG路径数据并计算大陆边界
const extractSvgPaths = async () => {
    try {
        const response = await fetch('/China_map.svg')
        const svgText = await response.text()
        const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g
        const paths = []
        let match

        // 海南岛的Y坐标阈值（大于此值认为是岛屿）
        const HAINAN_Y_THRESHOLD = 380

        // 计算所有大陆路径的边界
        let mainlandMinX = Infinity, mainlandMinY = Infinity
        let mainlandMaxX = -Infinity, mainlandMaxY = -Infinity

        while ((match = pathRegex.exec(svgText)) !== null) {
            const pathD = match[1]
            paths.push(pathD)

            const bounds = extractPathBounds(pathD)
            if (bounds) {
                // 计算路径质心的Y坐标
                const centroidY = (bounds.minY + bounds.maxY) / 2
                // 如果路径质心在阈值以上，认为是岛屿（海南），跳过
                if (centroidY > HAINAN_Y_THRESHOLD) continue
                // 否则纳入大陆边界计算
                mainlandMinX = Math.min(mainlandMinX, bounds.minX)
                mainlandMinY = Math.min(mainlandMinY, bounds.minY)
                mainlandMaxX = Math.max(mainlandMaxX, bounds.maxX)
                mainlandMaxY = Math.max(mainlandMaxY, bounds.maxY)
            }
        }

        // 如果没有找到大陆路径，使用默认值
        if (mainlandMinX === Infinity) {
            mainlandMinX = 50
            mainlandMinY = 20
            mainlandMaxX = 750
            mainlandMaxY = 400
        }

        // 添加一定padding
        const padding = 25
        mainlandBounds.value = {
            minX: mainlandMinX - padding,
            minY: mainlandMinY - padding,
            maxX: mainlandMaxX + padding,
            maxY: mainlandMaxY + padding
        }

        provincePaths.value = paths

        // 初始化视图到大陆区域
        initializeMainlandView()
    } catch (error) {
        console.error('Failed to load SVG paths:', error)
    }
}

// 获取容器到SVG的缩放比例
const getContainerScale = () => {
    const container = containerRef.value
    if (!container) return {scaleX: 1, scaleY: 1}
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0 || vbW.value <= 0 || vbH.value <= 0) {
        return {scaleX: 1, scaleY: 1}
    }
    return {
        scaleX: rect.width / vbW.value,
        scaleY: rect.height / vbH.value
    }
}

const flushPanMove = () => {
    panRafId = 0
    const {scaleX, scaleY} = getContainerScale()
    if (scaleX === 0 || scaleY === 0) return

    const dx = panPointerX - dragStartX.value
    const dy = panPointerY - dragStartY.value

    vbX.value = vbX.value - dx / scaleX
    vbY.value = vbY.value - dy / scaleY

    dragStartX.value = panPointerX
    dragStartY.value = panPointerY
}

const queuePanMove = (x, y) => {
    panPointerX = x
    panPointerY = y
    if (panRafId) return
    panRafId = requestAnimationFrame(flushPanMove)
}

const flushPinchZoom = () => {
    pinchRafId = 0
    if (vbW.value === 0 || vbH.value === 0 || lastTouchDistance.value <= 0 || pinchDistance <= 0) return

    const scaleFactor = lastTouchDistance.value / pinchDistance
    const aspect = vbH.value / vbW.value
    const newW = clampViewWidth(vbW.value * scaleFactor)
    const newH = newW * aspect

    const container = containerRef.value
    if (!container) return
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0 || newW === 0 || newH === 0) return

    const oldScaleX = rect.width / vbW.value
    const oldScaleY = rect.height / vbH.value
    const newScaleX = rect.width / newW
    const newScaleY = rect.height / newH
    if (oldScaleX === 0 || oldScaleY === 0 || newScaleX === 0 || newScaleY === 0) return

    const centerSvgX = (pinchCenterX - rect.left) / oldScaleX + vbX.value
    const centerSvgY = (pinchCenterY - rect.top) / oldScaleY + vbY.value

    vbX.value = centerSvgX - (oldScaleX / newScaleX) * (centerSvgX - vbX.value)
    vbY.value = centerSvgY - (oldScaleY / newScaleY) * (centerSvgY - vbY.value)
    vbW.value = newW
    vbH.value = newH

    lastTouchDistance.value = pinchDistance
    lastTouchCenterX.value = pinchCenterX
    lastTouchCenterY.value = pinchCenterY
}

const queuePinchZoom = (distance, centerX, centerY) => {
    pinchDistance = distance
    pinchCenterX = centerX
    pinchCenterY = centerY
    if (pinchRafId) return
    pinchRafId = requestAnimationFrame(flushPinchZoom)
}

// 滚轮缩放 - 以鼠标位置为中心缩放
const handleWheel = (e) => {
    e.preventDefault()
    showHint.value = false

    const container = containerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()
    // 防止容器尺寸为0时出现除零错误
    if (rect.width === 0 || rect.height === 0 || vbW.value === 0 || vbH.value === 0) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const {scaleX, scaleY} = getContainerScale()

    // 防止scale为0
    if (scaleX === 0 || scaleY === 0) return

    // 鼠标在SVG坐标系中的绝对位置
    const svgX = vbX.value + mouseX / scaleX
    const svgY = vbY.value + mouseY / scaleY

    // 计算缩放因子
    // deltaY > 0 表示向下滚动（手指向前滑动）-> 放大内容（viewBox变小）
    // deltaY < 0 表示向上滚动 -> 缩小内容（viewBox变大）
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const aspect = vbH.value / vbW.value
    const newW = clampViewWidth(vbW.value * zoomFactor)
    const newH = newW * aspect
    const newScaleX = rect.width / newW
    const newScaleY = rect.height / newH

    // 防止newScale为0
    if (newScaleX === 0 || newScaleY === 0) return

    // 计算新的viewBox起点，使鼠标位置保持不变
    vbX.value = svgX - mouseX / newScaleX
    vbY.value = svgY - mouseY / newScaleY
    vbW.value = newW
    vbH.value = newH
}

// 鼠标按下开始拖拽
const handleMouseDown = (e) => {
    if (e.button !== 0) return

    isDragging.value = true
    isInteracting.value = true
    dragStartX.value = e.clientX
    dragStartY.value = e.clientY

    showHint.value = false
}

// 鼠标移动拖拽 - 1:1跟随鼠标移动
const handleMouseMove = (e) => {
    if (!isDragging.value) return
    queuePanMove(e.clientX, e.clientY)
}

// 鼠标释放停止拖拽
const handleMouseUp = () => {
    isDragging.value = false
    isInteracting.value = false
}

// 恢复初始视图
const resetView = () => {
    const init = initialMainlandView.value
    vbX.value = init.x
    vbY.value = init.y
    vbW.value = init.w
    vbH.value = init.h
}

// ===== 移动端触摸支持 =====

// 触摸状态
const lastTouchDistance = ref(0)
const lastTouchCenterX = ref(0)
const lastTouchCenterY = ref(0)
const ignoreNextClick = ref(false)

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
    isInteracting.value = true

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
        queuePanMove(touch.clientX, touch.clientY)
    } else if (e.touches.length === 2) {
        const newDistance = getTouchDistance(e.touches)
        const center = getTouchCenter(e.touches)
        queuePinchZoom(newDistance, center.x, center.y)
    }
}

// 触摸结束
const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
        isDragging.value = false
        isInteracting.value = false
        lastTouchDistance.value = 0
    } else if (e.touches.length === 1) {
        isDragging.value = true
        isInteracting.value = true
        const touch = e.touches[0]
        dragStartX.value = touch.clientX
        dragStartY.value = touch.clientY
        lastTouchDistance.value = 0
    }
}

// 处理城市点击
const handleCityClick = (cityKey) => {
    if (ignoreNextClick.value) {
        ignoreNextClick.value = false
        return
    }
    emit('select-city', cityKey)
}

// 处理城市触摸，避免 touch 触发后的重复 click
const handleCityTouch = (cityKey) => {
    ignoreNextClick.value = true
    emit('select-city', cityKey)
}

/**
 * 判断尺寸变化是否超过阈值，避免微小抖动触发重计算
 */
const shouldUpdateForResize = (w, h) => {
    if (lastContainerWidth <= 0 || lastContainerHeight <= 0) return true
    const dw = Math.abs(w - lastContainerWidth)
    const dh = Math.abs(h - lastContainerHeight)
    return dw >= RESIZE_THRESHOLD_PX || dh >= RESIZE_THRESHOLD_PX
}

// 根据容器尺寸计算“大陆基准视图”（未考虑当前缩放/中心）
const computeMainlandFitView = (containerWidth, containerHeight) => {
    if (containerWidth <= 0 || containerHeight <= 0) return null
    const containerAspect = containerWidth / containerHeight
    if (!Number.isFinite(containerAspect) || containerAspect <= 0) return null

    const bounds = mainlandBounds.value
    const boundsWidth = bounds.maxX - bounds.minX
    const boundsHeight = bounds.maxY - bounds.minY
    if (boundsWidth <= 0 || boundsHeight <= 0) return null

    const boundsAspect = boundsWidth / boundsHeight
    let fitW, fitH

    if (containerAspect > boundsAspect) {
        fitH = boundsHeight
        fitW = fitH * containerAspect
    } else {
        fitW = boundsWidth
        fitH = fitW / containerAspect
    }

    const initialW = fitW * INITIAL_VIEW_ZOOM_OUT_RATIO
    const initialH = fitH * INITIAL_VIEW_ZOOM_OUT_RATIO

    return {
        x: bounds.minX - (initialW - boundsWidth) / 2,
        y: bounds.minY - (initialH - boundsHeight) / 2 + initialH * MAP_VISUAL_UPSHIFT_RATIO,
        w: initialW,
        h: initialH
    }
}

const applyViewByContainerSize = (containerWidth, containerHeight, reset = false) => {
    // 非重置场景下，若尺寸变化微小则跳过
    if (!reset && !shouldUpdateForResize(containerWidth, containerHeight)) {
        return
    }

    lastContainerWidth = containerWidth
    lastContainerHeight = containerHeight

    // 每次 resize 都重新计算 fitView，保证与 reset 按钮行为一致
    const fitView = computeMainlandFitView(containerWidth, containerHeight)
    if (!fitView) return

    initialMainlandView.value = fitView

    vbX.value = fitView.x
    vbY.value = fitView.y
    vbW.value = fitView.w
    vbH.value = fitView.h
}

// 初始化视图，使大陆区域居中并适应容器
const initializeMainlandView = () => {
    const container = containerRef.value
    if (!container) return
    const rect = container.getBoundingClientRect()
    applyViewByContainerSize(rect.width, rect.height, true)
}

onMounted(() => {
    nextTick(() => {
        extractSvgPaths()

        const container = containerRef.value
        if (container && typeof ResizeObserver !== 'undefined') {
            containerResizeObserver = new ResizeObserver((entries) => {
                const entry = entries?.[0]
                if (!entry) return
                const w = entry.contentRect.width
                const h = entry.contentRect.height
                if (w <= 0 || h <= 0) return
                applyViewByContainerSize(w, h)
            })
            containerResizeObserver.observe(container)
        }
    })

    // 3秒后隐藏提示
    setTimeout(() => {
        showHint.value = false
    }, 3000)
})

onUnmounted(() => {
    if (panRafId) cancelAnimationFrame(panRafId)
    if (pinchRafId) cancelAnimationFrame(pinchRafId)
    if (containerResizeObserver) {
        containerResizeObserver.disconnect()
        containerResizeObserver = null
    }
})
</script>

<!--suppress CssInvalidPropertyValue -->
<style scoped>
.city-map {
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #141e37 0%, #0f1a2a 100%);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
    overflow: hidden;
}

.map-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
}

.map-container {
    width: 100%;
    height: 100%;
    position: relative;
    background:
        radial-gradient(circle at 30% 40%, rgba(240, 179, 68, 0.1) 0%, transparent 42%),
        radial-gradient(circle at 70% 60%, rgba(74, 158, 255, 0.08) 0%, transparent 36%),
        linear-gradient(180deg, #141e37 0%, #0f1a2a 100%);
    cursor: grab;
    user-select: none;
}

.map-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
}

.map-container:active {
    cursor: grabbing;
}

.china-map-svg {
    position: relative;
    z-index: 1;
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

.map-container.interacting .city-marker .pulse-ring {
    animation: none;
    opacity: 0.3;
}

.map-container.interacting .city-marker .marker-dot,
.map-container.interacting .city-marker:hover .marker-dot {
    filter: none;
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
    z-index: 220;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
    }
    15% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    85% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .city-map {
        border-radius: 0;
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

@media (pointer: coarse) {
    .city-marker .pulse-ring {
        animation: none;
    }

    .city-marker .marker-dot,
    .city-marker:hover .marker-dot {
        filter: none;
    }
}
</style>
