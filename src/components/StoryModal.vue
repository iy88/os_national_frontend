<template>
    <el-dialog
        :close-on-click-modal="true"
        :model-value="modelValue"
        :title="characterName + ' 的故事'"
        append-to-body
        class="story-modal"
        width="600px"
        @update:model-value="(val) => emit('update:modelValue', val)"
    >
        <div class="story-content" v-html="renderedStory"></div>
    </el-dialog>
</template>

<script setup>
import {computed} from 'vue'
import {marked} from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
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

marked.setOptions({
    gfm: true,
    breaks: true
})

const renderedStory = computed(() => {
    if (!props.story) return ''
    const html = marked.parse(props.story)
    return DOMPurify.sanitize(typeof html === 'string' ? html : '')
})
</script>

<style scoped>
.story-content {
    color: var(--color-text-secondary);
    line-height: 1.8;
    font-size: 1rem;
    padding: 10px 0;
}

.story-content :deep(p) {
    margin: 0 0 12px;
}

.story-content :deep(p:last-child) {
    margin-bottom: 0;
}

.story-content :deep(ul),
.story-content :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
}

.story-content :deep(li) {
    margin: 4px 0;
}

.story-content :deep(blockquote) {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 3px solid var(--color-brand-glow-strong);
    color: var(--color-text-tertiary);
    background: var(--color-shadow-xs-base);
    border-radius: 4px;
}

.story-content :deep(strong) {
    color: var(--color-brand);
    font-weight: 600;
}

.story-content :deep(code) {
    background: var(--color-shadow-sm-base);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
}

.story-content :deep(a) {
    color: var(--color-info-soft);
    text-decoration: underline;
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
.story-modal.el-dialog {
    background: linear-gradient(145deg, var(--color-bg-panel) 0%, var(--color-bg-deep) 100%);
    border: 1px solid var(--color-brand-soft-border);
    border-radius: 10px;
    box-shadow: 0 8px 32px var(--color-shadow-md-base);
    margin-top: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
}

.story-modal .el-dialog__header {
    border-bottom: 1px solid var(--color-brand-soft-bg);
    padding: 18px 20px;
}

.story-modal .el-dialog__title {
    color: var(--color-brand);
    font-size: 1.1rem;
    font-weight: 600;
}

.story-modal .el-dialog__headerbtn .el-dialog__close {
    color: var(--color-text-muted);
}

.story-modal .el-dialog__headerbtn:hover .el-dialog__close {
    color: var(--color-brand);
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
