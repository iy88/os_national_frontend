<template>
    <div class="chat-box">
        <div class="chat-header" v-if="title">
            <h4>{{ title }}</h4>
        </div>
        <div class="chat-messages" ref="messagesContainer" @scroll="handleMessagesScroll">
            <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['message', msg.type]"
            >
                <span class="message-content">{{ msg.content }}</span>
            </div>
        </div>
        <div class="chat-input">
            <div class="chat-status" v-if="status !== 'idle'">
                <span :class="['status-dot', status]"></span>
                <span class="status-text">{{ statusText }}</span>
            </div>
            <textarea
                v-model="inputText"
                :placeholder="placeholder"
                rows="1"
                ref="inputTextarea"
                @keydown="handleKeydown"
            ></textarea>
            <button @click="handleSend">发送</button>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, nextTick, watch} from 'vue'

const props = defineProps({
    messages: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: '请输入...'
    }
})

const emit = defineEmits(['send'])

const inputText = ref('')
const messagesContainer = ref(null)
const inputTextarea = ref(null)
const status = ref('idle') // 'idle', 'thinking', 'streaming'
let userHasScrolled = false // 用户是否主动滚动过
let streamingUnwatch = null // 流式输出时的监听函数
let previousScrollTop = 0 // 上一次的滚动位置

const handleMessagesScroll = () => {
    if (!messagesContainer.value) return

    const { scrollTop } = messagesContainer.value

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

const handleKeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
    }
}

const autoResize = () => {
    if (inputTextarea.value) {
        inputTextarea.value.style.height = Math.min(inputTextarea.value.scrollHeight, 120) + 'px'
    }
}

watch(inputText, autoResize)

const handleSend = () => {
    if (inputText.value.trim()) {
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
</script>

<style scoped>
.chat-box {
    background: rgba(20, 30, 55, 0.6);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    display: flex;
    flex-direction: column;
}

.chat-header {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    flex-shrink: 0;
}

.chat-header h4 {
    margin: 0;
    color: #f0b344;
    font-size: 0.95rem;
    font-weight: 600;
}

.chat-messages {
    flex: 1;
    min-height: 150px;
    max-height: 400px;
    overflow-y: auto;
    padding: 14px 16px;
    background: rgba(0, 0, 0, 0.2);
}

.message {
    display: flex;
    margin-bottom: 16px;
    animation: messageSlide 0.2s ease;
}

@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message.user {
    justify-content: flex-end;
}

.message.character {
    justify-content: flex-start;
}

.message-content {
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.6;
}

.message.user .message-content {
    background: rgba(74, 158, 255, 0.15);
    border: 1px solid rgba(74, 158, 255, 0.3);
    padding: 10px 14px;
    border-radius: 12px 12px 4px 12px;
    max-width: 40%;
    color: rgba(255, 255, 255, 0.9);
}

.message.character .message-content {
    padding: 8px 0;
    color: rgba(255, 255, 255, 0.85);
}

.message.character .message-content::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 12px;
}

.chat-input {
    flex-shrink: 0;
    display: flex;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-input textarea {
    flex: 1;
    min-height: 40px;
    max-height: 120px;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    resize: none;
    transition: border-color 0.2s;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
    line-height: 1.4;
}

.chat-input textarea::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.chat-input textarea:focus {
    border-color: #f0b344;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(240, 179, 68, 0.15);
}

.chat-input button {
    height: 40px;
    padding: 0 20px;
    background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 2px 6px rgba(240, 179, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.chat-input button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(240, 179, 68, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.chat-input button:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(240, 179, 68, 0.25),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.chat-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-dot.thinking {
    background: #FFD700;
    box-shadow: 0 0 6px #FFD700;
    animation: pulse 1s ease-in-out infinite;
}

.status-dot.streaming {
    background: #90EE90;
    box-shadow: 0 0 6px #90EE90;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.status-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
}
</style>
