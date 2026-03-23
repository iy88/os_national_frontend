<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :title="characterName + ' 的故事'"
    width="600px"
    class="story-modal"
    :close-on-click-modal="true"
    append-to-body
  >
    <div class="story-content">
      <p>{{ story }}</p>
    </div>
  </el-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  story: {
    type: String,
    default: ''
  },
  characterName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.story-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.9;
  font-size: 1rem;
  padding: 10px 0;
}

.story-content p {
  margin: 0;
  text-indent: 2em;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.story-modal.el-dialog {
  background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
  border: 1px solid rgba(240, 179, 68, 0.25);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  margin-top: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

.story-modal .el-dialog__header {
  border-bottom: 1px solid rgba(240, 179, 68, 0.12);
  padding: 18px 20px;
}

.story-modal .el-dialog__title {
  color: #f0b344;
  font-size: 1.1rem;
  font-weight: 600;
}

.story-modal .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255, 255, 255, 0.7);
}

.story-modal .el-dialog__headerbtn:hover .el-dialog__close {
  color: #f0b344;
}

.story-modal .el-dialog__body {
  padding: 20px;
}

@media (max-width: 768px) {
  .story-modal.el-dialog {
    width: 90% !important;
    max-width: 90vw;
    margin: 10px auto !important;
  }

  .story-modal .el-dialog__body {
    padding: 16px;
  }
}
</style>
