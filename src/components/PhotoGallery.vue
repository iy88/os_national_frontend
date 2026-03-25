<template>
    <el-dialog
        :close-on-click-modal="true"
        :model-value="modelValue"
        append-to-body
        class="photo-gallery-modal"
        title="照片展示"
        width="700px"
        @update:model-value="(val) => emit('update:modelValue', val)"
    >
        <div v-if="photos.length > 0" class="gallery-container">
            <div
                class="gallery-main"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <button :disabled="currentIndex === 0" class="nav-btn prev" @click="prev">
                    <span>&lt;</span>
                </button>
                <div class="photo-display">
                    <div
                        ref="photoTrackRef"
                        class="photo-track"
                        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
                    >
                        <img
                            v-for="(photo, index) in photos"
                            :key="index"
                            :alt="`照片 ${index + 1}`"
                            :src="photo"
                        />
                    </div>
                </div>
                <button :disabled="currentIndex === photos.length - 1" class="nav-btn next" @click="next">
                    <span>&gt;</span>
                </button>
            </div>
            <div class="photo-counter">
                {{ currentIndex + 1 }} / {{ photos.length }}
            </div>
            <div v-if="photos.length > 1" ref="indicatorStripRef" class="indicator-strip">
                <div
                    v-for="(photo, index) in photos"
                    :key="index"
                    :class="['indicator', { active: index === currentIndex }]"
                    @click="handleIndicatorClick(index)"
                />
            </div>
        </div>
        <div v-else class="no-photos">
            <p>暂无照片</p>
        </div>
    </el-dialog>
</template>

<script setup>
import {ref, watch} from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    photos: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])

const currentIndex = ref(0)
const indicatorStripRef = ref(null)
const photoTrackRef = ref(null)

// 拖拽滑动状态
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0
let isDragging = false

const scrollToActiveIndicator = (index) => {
    if (!indicatorStripRef.value) return
    const strip = indicatorStripRef.value
    const indicators = strip.querySelectorAll('.indicator')
    if (!indicators[index]) return

    const indicator = indicators[index]
    const stripRect = strip.getBoundingClientRect()
    const indicatorRect = indicator.getBoundingClientRect()

    // 计算使当前指示器居中需要的 scrollLeft
    const scrollLeft = indicator.offsetLeft - (stripRect.width / 2) + (indicatorRect.width / 2)
    strip.scrollTo({left: scrollLeft, behavior: 'smooth'})
}

const handleIndicatorClick = (index) => {
    currentIndex.value = index
    scrollToActiveIndicator(index)
}

const prev = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
        scrollToActiveIndicator(currentIndex.value)
    }
}

const next = () => {
    if (currentIndex.value < props.photos.length - 1) {
        currentIndex.value++
        scrollToActiveIndicator(currentIndex.value)
    }
}

const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
}

// 拖拽滑动
const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
    isDragging = true
}

const handleTouchMove = (e) => {
    if (!isDragging) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX
    const deltaY = currentY - touchStartY

    // 如果是水平滑动，阻止默认行为
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
    }

    // 更新拖拽偏移
    if (photoTrackRef.value) {
        // 限制拖拽范围
        const maxOffset = window.innerWidth * 0.3
        const clampedDelta = Math.max(-maxOffset, Math.min(maxOffset, deltaX))

        // 计算视觉偏移：基础偏移 + 拖拽增量
        const baseOffset = currentIndex.value * 100
        const dragPercent = (clampedDelta / photoTrackRef.value.offsetWidth) * 100
        photoTrackRef.value.style.transform = `translateX(-${baseOffset - dragPercent}%)`
    }
}

const handleTouchEnd = (e) => {
    if (!isDragging) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX
    const duration = touchStartTime ? Date.now() - touchStartTime : 0

    // 重置视觉偏移
    if (photoTrackRef.value) {
        photoTrackRef.value.style.transform = `translateX(-${currentIndex.value * 100}%)`
    }

    // 判断是滑动切换还是弹回
    const threshold = photoTrackRef.value ? photoTrackRef.value.offsetWidth * 0.25 : 50
    if (Math.abs(deltaX) > threshold && duration < 300) {
        if (deltaX > 0) {
            prev()
        } else {
            next()
        }
    }

    isDragging = false
}

watch(() => props.modelValue, (val) => {
    if (val) {
        currentIndex.value = 0
        window.addEventListener('keydown', handleKeydown)
    } else {
        window.removeEventListener('keydown', handleKeydown)
    }
})
</script>

<style scoped>
.gallery-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.gallery-main {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
}

.nav-btn {
    width: 38px;
    height: 38px;
    border-radius: 6px;
    background: linear-gradient(180deg, rgba(240, 179, 68, 0.15) 0%, rgba(240, 179, 68, 0.08) 100%);
    border: 1px solid rgba(240, 179, 68, 0.3);
    color: #f0b344;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
    background: linear-gradient(180deg, #f0b344 0%, #d4962e 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3);
}

.nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.photo-display {
    flex: 1;
    max-height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.photo-track {
    display: flex;
    width: 100%;
    transition: transform 0.3s ease;
}

.photo-track img {
    width: 100%;
    max-height: 380px;
    object-fit: contain;
    flex-shrink: 0;
}

.photo-counter {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
}

.indicator-strip {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px 40px;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.indicator-strip::-webkit-scrollbar {
    display: none;
}

.indicator {
    width: 24px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

/*noinspection CssUnusedSymbol*/
.indicator.active {
    width: 36px;
    background: #f0b344;
    box-shadow: 0 0 10px rgba(240, 179, 68, 0.5);
}

.no-photos {
    text-align: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.6);
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.photo-gallery-modal.el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    margin-top: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
}

.photo-gallery-modal .el-dialog__header {
    border-bottom: 1px solid rgba(240, 179, 68, 0.12);
    padding: 18px 20px;
}

.photo-gallery-modal .el-dialog__title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

.photo-gallery-modal .el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7);
}

.photo-gallery-modal .el-dialog__headerbtn:hover .el-dialog__close {
    color: #f0b344;
}

.photo-gallery-modal .el-dialog__body {
    padding: 20px;
}

@media (max-width: 768px) {
    .photo-gallery-modal.el-dialog {
        width: 95% !important;
        max-width: 95vw;
        margin: 10px auto !important;
    }

    .photo-gallery-modal .el-dialog__body {
        padding: 12px;
    }

    .gallery-main {
        gap: 0;
        position: relative;
    }

    .gallery-main .nav-btn {
        display: none !important;
    }

    .photo-display {
        max-height: 280px;
        width: 100%;
    }

    .photo-track img {
        max-height: 280px;
    }
}
</style>
