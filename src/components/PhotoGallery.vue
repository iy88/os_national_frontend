<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    title="照片展示"
    width="700px"
    class="photo-gallery-modal"
    :close-on-click-modal="true"
    append-to-body
  >
    <div class="gallery-container" v-if="photos.length > 0">
      <div class="gallery-main">
        <button class="nav-btn prev" @click="prev" :disabled="currentIndex === 0">
          <span>&lt;</span>
        </button>
        <div class="photo-display">
          <img :src="photos[currentIndex]" :alt="`照片 ${currentIndex + 1}`" />
        </div>
        <button class="nav-btn next" @click="next" :disabled="currentIndex === photos.length - 1">
          <span>&gt;</span>
        </button>
      </div>
      <div class="photo-counter">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>
      <div class="thumbnail-strip" v-if="photos.length > 1">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          :class="['thumbnail', { active: index === currentIndex }]"
          @click="currentIndex = index"
        >
          <img :src="photo" :alt="`缩略图 ${index + 1}`" />
        </div>
      </div>
    </div>
    <div v-else class="no-photos">
      <p>暂无照片</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

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

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const next = () => {
  if (currentIndex.value < props.photos.length - 1) {
    currentIndex.value++
  }
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
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

.photo-display img {
  max-width: 100%;
  max-height: 380px;
  object-fit: contain;
}

.photo-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.thumbnail-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.thumbnail {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/*noinspection CssUnusedSymbol*/
.thumbnail.active {
  border-color: #f0b344;
  box-shadow: 0 0 10px rgba(240, 179, 68, 0.3);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    gap: 8px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .photo-display {
    max-height: 280px;
  }

  .photo-display img {
    max-height: 280px;
  }
}
</style>
