<template>
    <div class="chat-box">
        <div
            ref="messagesContainer"
            :class="['chat-messages', { 'scrollbar-visible': scrollbarVisible }]"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @mousemove="handleMouseMove"
            @pointerdown="handlePointerDown"
            @scroll="handleMessagesScroll"
        >
            <slot></slot>
            <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['message-row', msg.type]"
            >
                <div class="message-avatar">
                    <span v-if="msg.type === 'user'">我</span>
                    <span v-else>AI</span>
                </div>

                <div class="message-main">
                    <div class="message-bubble" v-html="renderMessageContent(msg.content)"></div>

                    <div
                        v-if="msg.type === 'character' && msg.completed"
                        :class="['message-actions', { latest: isLatestCharacter(index) }]"
                    >
                        <button class="action-btn" title="复制" @click="emit('copy', msg.content)">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                 width="14">
                                <rect height="13" rx="2" ry="2" width="13" x="9" y="9"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </button>
                        <button class="action-btn" title="收藏" @click="emit('favorite', msg.mid)">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                 width="14">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                        <button class="action-btn" title="跳转" @click="emit('navigate', msg.content)">
                            <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                                 width="14">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="status !== 'idle'" class="chat-status">
            <span :class="['status-dot', status]"></span>
            <span class="status-text">{{ statusText }}</span>
        </div>

        <div class="chat-input">
            <textarea
                ref="inputTextarea"
                v-model="inputText"
                :disabled="disabled"
                :placeholder="placeholder"
                rows="1"
                @keydown="handleKeydown"
            ></textarea>
            <button :disabled="isSendDisabled || !inputText.trim()" @click="handleSend">发送</button>
        </div>
    </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {marked} from 'marked'
import DOMPurify from 'dompurify'

// 找出最新一条 character 消息的索引
const latestCharacterIndex = computed(() => {
    for (let i = props.messages.length - 1; i >= 0; i--) {
        if (props.messages[i].type === 'character') {
            return i
        }
    }
    return -1
})

const isLatestCharacter = (index) => index === latestCharacterIndex.value

marked.setOptions({
    gfm: true,
    breaks: true
})

const props = defineProps({
    messages: {
        type: Array,
        default: () => []
    },
    placeholder: {
        type: String,
        default: '请输入...'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    sendDisabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['send', 'copy', 'favorite', 'navigate'])

const inputText = ref('')
const messagesContainer = ref(null)
const inputTextarea = ref(null)
const status = ref('idle') // 'idle', 'thinking', 'streaming'
const scrollbarVisible = ref(false)
let userHasScrolled = false // 用户是否主动滚动过
let streamingUnwatch = null // 流式输出时的监听函数
let previousScrollTop = 0 // 上一次的滚动位置
let dragging = false
let scrollbarHideTimer = null

const handleMessagesScroll = () => {
    showScrollbar(1200)
    if (!messagesContainer.value) return

    const {scrollTop} = messagesContainer.value

    // 如果向上滚动（scrollTop < previous），判定为用户滚动
    if (scrollTop < previousScrollTop) {
        userHasScrolled = true
        if (streamingUnwatch) {
            streamingUnwatch()
            streamingUnwatch = null
        }
    }

    previousScrollTop = scrollTop
}

const clearScrollbarHideTimer = () => {
    if (scrollbarHideTimer) {
        clearTimeout(scrollbarHideTimer)
        scrollbarHideTimer = null
    }
}

const showScrollbar = (delay = 1200) => {
    scrollbarVisible.value = true
    clearScrollbarHideTimer()
    if (!dragging) {
        scrollbarHideTimer = setTimeout(() => {
            scrollbarVisible.value = false
        }, delay)
    }
}

const handleMouseEnter = () => {
    showScrollbar(1200)
}

const handleMouseLeave = () => {
    if (!dragging) {
        showScrollbar(360)
    }
}

const handleMouseMove = () => {
    showScrollbar(1200)
}

const handlePointerDown = () => {
    dragging = true
    scrollbarVisible.value = true
    clearScrollbarHideTimer()
}

const handleGlobalPointerUp = () => {
    if (!dragging) return
    dragging = false
    showScrollbar(1200)
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

const statusText = computed(() => {
    if (status.value === 'thinking') return '正在思考...'
    if (status.value === 'streaming') return '正在输出...'
    return ''
})

const isSendDisabled = computed(() => props.disabled || props.sendDisabled)

const renderMessageContent = (content = '') => {
    const html = marked.parse(content, {async: false})
    return DOMPurify.sanitize(typeof html === 'string' ? html : '')
}

const handleKeydown = (e) => {
    // 任何时候都禁止 Enter 发送（防止误触）
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
    }
}

const autoResize = () => {
    if (inputTextarea.value) {
        inputTextarea.value.style.height = Math.min(inputTextarea.value.scrollHeight, 120) + 'px'
    }
}

watch(inputText, autoResize)

const handleSend = () => {
    if (inputText.value.trim() && !isSendDisabled.value) {
        emit('send', inputText.value.trim())
        inputText.value = ''
        nextTick(() => {
            if (inputTextarea.value) {
                inputTextarea.value.style.height = 'auto'
            }
        })
    }
}

watch(() => props.messages.length, scrollToBottom)

// 状态变化时处理
watch(status, (newStatus) => {
    if (newStatus === 'streaming') {
        // 新请求开始时，重置用户滚动状态
        userHasScrolled = false

        // 建立持续监听
        streamingUnwatch = watch(
            () => props.messages.length > 0 ? props.messages[props.messages.length - 1].content.length : 0,
            () => {
                if (userHasScrolled) {
                    streamingUnwatch?.()
                    streamingUnwatch = null
                    return
                }
                scrollToBottom()
            }
        )
    } else if (newStatus === 'idle') {
        // 回复结束，停止监听
        if (streamingUnwatch) {
            streamingUnwatch()
            streamingUnwatch = null
        }
    }
})

// 暴露状态控制方法供父组件使用
defineExpose({
    setStatus: (s) => {
        status.value = s
    },
    getStatus: () => status.value
})

onMounted(() => {
    window.addEventListener('pointerup', handleGlobalPointerUp)
})

onUnmounted(() => {
    clearScrollbarHideTimer()
    window.removeEventListener('pointerup', handleGlobalPointerUp)
})
</script>

<style scoped>
.chat-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-divider);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 1px 0 var(--color-bg-subtle);
}

.chat-messages {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--color-shadow-sm-base);
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
}

.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
}

.chat-messages.scrollbar-visible {
    scrollbar-color: var(--color-brand-glow-strong) transparent;
}

.chat-messages.scrollbar-visible::-webkit-scrollbar-thumb {
    background: var(--color-brand-glow-strong);
}

.chat-messages.scrollbar-visible::-webkit-scrollbar-thumb:hover {
    background: var(--color-brand-glow-strong);
}

.message-row {
    display: flex;
    gap: 10px;
    max-width: 82%;
}

.message-row.user {
    margin-left: auto;
    flex-direction: row-reverse;
}

.message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--color-brand-soft-bg);
    border: 1px solid var(--color-brand-soft-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.73rem;
    color: var(--color-brand);
    font-weight: 700;
    flex-shrink: 0;
}

.message-row.user .message-avatar {
    background: var(--color-info);
    border-color: var(--color-info);
    color: #fff;
}

.message-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.message-bubble {
    background: var(--color-bg-panel);
    border: 1px solid var(--color-border-divider);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
}

.message-row.user .message-bubble {
    background: linear-gradient(
        135deg,
        var(--color-brand-soft-bg),
        var(--color-brand-soft-border)
    );
    border-color: var(--color-brand-soft-border);
}

.message-bubble :deep(p) {
    margin: 0 0 8px;
}

.message-bubble :deep(p:last-child) {
    margin-bottom: 0;
}

.message-bubble :deep(ul),
.message-bubble :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
}

.message-bubble :deep(code) {
    background: var(--color-shadow-sm-base);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
}

.message-bubble :deep(pre) {
    background: var(--color-shadow-sm-base);
    border: 1px solid var(--color-border-divider);
    border-radius: 8px;
    padding: 10px 12px;
    overflow-x: auto;
}

.message-bubble :deep(pre code) {
    background: transparent;
    padding: 0;
}

.message-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.message-row:hover .message-actions,
.message-actions.latest {
    opacity: 1;
}

.action-btn {
    width: 28px;
    height: 28px;
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-placeholder);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.action-btn:hover {
    color: var(--color-brand);
    background: var(--color-brand-soft-bg);
    border-color: var(--color-brand-soft-border);
}

.chat-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 0.8rem;
    color: var(--color-text-placeholder);
    border-top: 1px solid var(--color-bg-hover);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-dot.thinking {
    background: var(--color-brand);
    animation: pulse 1.1s infinite;
}

.status-dot.streaming {
    background: var(--color-success-light);
    box-shadow: 0 0 8px var(--color-success-light);
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.45;
    }
}

.chat-input {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px;
    background: var(--color-bg-elevated);
    border-top: 1px solid var(--color-border-subtle);
}

.chat-input textarea {
    flex: 1;
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--color-text-primary);
    font-size: 0.9rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    max-height: 120px;
    font-family: inherit;
}

.chat-input textarea:focus {
    border-color: var(--color-brand-glow-strong);
}

.chat-input textarea::placeholder {
    color: var(--color-text-disabled);
}

.chat-input textarea:disabled {
    opacity: 0.6;
}

.chat-input button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(145deg, var(--color-brand) 0%, var(--color-brand-active) 100%);
    color: var(--color-bg-deep);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

.chat-input button:hover:not(:disabled) {
    transform: scale(1.04);
    box-shadow: 0 4px 12px var(--color-brand-soft-border);
}

.chat-input button:disabled {
    opacity: 0.52;
    cursor: not-allowed;
}

@media (max-width: 900px) {
    .chat-messages {
        padding: 12px;
        gap: 14px;
    }

    .message-row {
        max-width: 92%;
    }

    .chat-input {
        padding: 10px;
    }
}
</style>
