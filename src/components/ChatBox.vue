<template>
    <div class="chat-box">
        <div v-if="title" class="chat-header">
            <h4>{{ title }}</h4>
        </div>
        <div ref="messagesContainer" class="chat-messages" @scroll="handleMessagesScroll">
            <slot></slot>
            <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['message', msg.type]"
            >
                <div class="message-content" v-html="renderMessageContent(msg.content)"></div>
                <!-- 操作按钮（仅 character 消息） -->
                <div v-if="msg.type === 'character'" :class="['message-actions', { latest: isLatestCharacter(index) }]">
                    <button class="action-btn" title="复制" @click="emit('copy', msg.content)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.0664 1.55518C16.3166 1.57647 17.4787 1.66882 18.4814 1.78467C20.6826 2.03901 22.3736 3.73002 22.6279 5.93115C22.7604 7.07778 22.8623 8.43314 22.8623 9.89014C22.8623 11.3472 22.7604 12.7025 22.6279 13.8491C22.3737 16.0504 20.6827 17.7422 18.4814 17.9966L17.585 18.0884C17.5772 18.0891 17.5693 18.0887 17.5615 18.0894C17.2992 20.2806 15.6133 21.9627 13.4189 22.2163L12.5225 22.3081C11.5898 22.3926 10.555 22.4497 9.46289 22.4497L8.92188 22.4458C8.02837 22.4306 7.17985 22.3785 6.40234 22.3081L5.50586 22.2163C3.3735 21.9699 1.72019 20.3745 1.3877 18.2739L1.35938 18.0688C1.22695 16.9223 1.125 15.5668 1.125 14.1099C1.12502 13.0172 1.1821 11.9815 1.2666 11.0483L1.35938 10.1509C1.60586 8.01872 3.20036 6.36529 5.30078 6.03271L5.50586 6.00439C5.79879 5.97055 6.10542 5.93932 6.42383 5.91064C6.67801 3.78825 8.2695 2.14451 10.3633 1.81299L10.5684 1.78467C11.7145 1.65224 13.0692 1.55029 14.5254 1.55029L15.0664 1.55518ZM9.46289 7.36963C8.07961 7.36963 6.78716 7.46643 5.68945 7.59326C4.22664 7.76229 3.1174 8.87156 2.94824 10.3345C2.82139 11.4327 2.72463 12.7258 2.72461 14.1099C2.72461 15.4939 2.8214 16.787 2.94824 17.8853C3.11724 19.3484 4.22652 20.4574 5.68945 20.6265C6.78717 20.7533 8.07958 20.8501 9.46289 20.8501C10.846 20.8501 12.1378 20.7533 13.2354 20.6265C14.6983 20.4574 15.8076 19.3484 15.9766 17.8853C16.1034 16.787 16.2002 15.4939 16.2002 14.1099C16.2002 12.7258 16.1034 11.4327 15.9766 10.3345C15.8074 8.87157 14.6982 7.76229 13.2354 7.59326C12.1378 7.46645 10.8459 7.36965 9.46289 7.36963ZM14.5254 3.1499C13.1421 3.1499 11.8497 3.2467 10.752 3.37354C9.39556 3.53026 8.34428 4.49541 8.06348 5.80127C8.51646 5.78177 8.98419 5.77002 9.46289 5.77002L10.0039 5.7749C11.2541 5.7962 12.4163 5.88854 13.4189 6.00439C15.62 6.25872 17.311 7.94988 17.5654 10.1509C17.6979 11.2974 17.7998 12.653 17.7998 14.1099C17.7998 14.9347 17.7643 15.727 17.7119 16.4673C17.9127 16.4483 18.1082 16.4286 18.2979 16.4067C19.7608 16.2377 20.8701 15.1286 21.0391 13.6655C21.1659 12.5672 21.2627 11.2743 21.2627 9.89014C21.2627 8.50597 21.1659 7.21302 21.0391 6.11475C20.87 4.65171 19.7607 3.54257 18.2979 3.37354C17.2003 3.24672 15.9085 3.14992 14.5254 3.1499Z"
                                fill="currentColor"></path>
                        </svg>
                    </button>
                    <button class="action-btn" title="收藏" @click="emit('favorite', msg.mid)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11.9717 9.74023C12.4135 9.74181 12.7713 10.1011 12.7705 10.543L12.7666 12.5967H14.9707C15.4124 12.5969 15.7705 12.9548 15.7705 13.3965C15.7702 13.8379 15.4122 14.1961 14.9707 14.1963H12.7637L12.7598 16.2695C12.7589 16.7113 12.4007 17.068 11.959 17.0664C11.5173 17.0648 11.1595 16.7054 11.1602 16.2637L11.1641 14.1963H8.9707C8.52912 14.1962 8.17121 13.838 8.1709 13.3965C8.1709 12.9547 8.52893 12.5967 8.9707 12.5967H11.167L11.1709 10.5371C11.1718 10.0954 11.53 9.73878 11.9717 9.74023Z"
                                fill="currentColor"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M14.2998 5.25C18.0709 5.25 19.9564 5.25039 21.1279 6.42188C22.2995 7.59345 22.2998 9.47876 22.2998 13.25V13.5566L22.2979 14.8848C22.2818 17.7879 22.153 19.3597 21.1279 20.3848L21.0166 20.4912C19.9894 21.419 18.4277 21.5383 15.6279 21.5537L14.2998 21.5566H9.75L8.42188 21.5537C5.62208 21.5383 4.06033 21.419 3.0332 20.4912L2.92188 20.3848C1.8968 19.3597 1.76798 17.7879 1.75195 14.8848L1.75 13.5566V13.25C1.75 9.59627 1.75 7.71248 2.81543 6.5332L2.92188 6.42188C3.947 5.39675 5.51851 5.26797 8.42188 5.25195L9.75 5.25H14.2998ZM9.75 6.84961C7.8192 6.84961 6.53207 6.85365 5.57422 6.98242C4.66238 7.10501 4.29169 7.31378 4.05273 7.55273C3.81378 7.79169 3.60501 8.16238 3.48242 9.07422C3.35365 10.0321 3.34961 11.3192 3.34961 13.25V13.5566C3.34961 15.4873 3.35365 16.7746 3.48242 17.7324C3.60497 18.6437 3.81393 19.014 4.05273 19.2529C4.29169 19.4919 4.66238 19.7016 5.57422 19.8242C6.53207 19.953 7.81924 19.9561 9.75 19.9561H14.2998C16.2304 19.9561 17.5178 19.953 18.4756 19.8242C19.3874 19.7016 19.7581 19.4919 19.9971 19.2529C20.2359 19.014 20.4448 18.6438 20.5674 17.7324C20.6962 16.7746 20.7002 15.4873 20.7002 13.5566V13.25C20.7002 11.3192 20.6962 10.0321 20.5674 9.07422C20.4448 8.16238 20.236 7.79169 19.9971 7.55273C19.7581 7.31382 19.3873 7.105 18.4756 6.98242C17.5178 6.85367 16.2305 6.84961 14.2998 6.84961H9.75Z"
                                  fill="currentColor"></path>
                            <path
                                d="M13.8906 2.44531C16.7938 2.46133 18.3655 2.59028 19.3906 3.61523C19.7517 3.97627 20.001 4.40562 20.1738 4.93652C19.6136 4.76593 18.9425 4.67458 18.1221 4.62695C17.8767 4.43906 17.4933 4.27729 16.7383 4.17578C15.7804 4.04702 14.4933 4.04297 12.5625 4.04297H11.4375C9.50673 4.04297 8.21957 4.04702 7.26172 4.17578C6.50608 4.27737 6.12233 4.43886 5.87695 4.62695C5.05836 4.67451 4.38853 4.76561 3.8291 4.93555C3.9844 4.45901 4.19865 4.06336 4.50293 3.72656L4.60938 3.61523C5.6345 2.59028 7.20618 2.46133 10.1094 2.44531L11.4375 2.44336H12.5625L13.8906 2.44531Z"
                                fill="currentColor"></path>
                        </svg>
                    </button>
                    <button class="action-btn" title="跳转" @click="emit('navigate', msg.content)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="chat-input">
            <div v-if="status !== 'idle'" class="chat-status">
                <span :class="['status-dot', status]"></span>
                <span class="status-text">{{ statusText }}</span>
            </div>
            <textarea
                ref="inputTextarea"
                v-model="inputText"
                :placeholder="placeholder"
                :disabled="disabled"
                rows="1"
                @keydown="handleKeydown"
            ></textarea>
            <button :disabled="isSendDisabled || !inputText.trim()" @click="handleSend">发送</button>
        </div>
    </div>
</template>

<script setup>
import {computed, nextTick, ref, watch} from 'vue'
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
    title: {
        type: String,
        default: ''
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
let userHasScrolled = false // 用户是否主动滚动过
let streamingUnwatch = null // 流式输出时的监听函数
let previousScrollTop = 0 // 上一次的滚动位置

const handleMessagesScroll = () => {
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
    display: flex;
    flex-direction: column;
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
    flex-direction: column;
    justify-content: flex-start;
}

.message-content {
    word-break: break-word;
    line-height: 1.6;
}

.message-content :deep(p),
.message-content :deep(ul),
.message-content :deep(ol),
.message-content :deep(pre),
.message-content :deep(blockquote),
.message-content :deep(table) {
    margin: 0 0 10px 0;
}

.message-content :deep(*:last-child) {
    margin-bottom: 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
    padding-left: 20px;
}

.message-content :deep(code) {
    font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
}

.message-content :deep(pre) {
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    overflow-x: auto;
}

.message-content :deep(pre code) {
    background: transparent;
    padding: 0;
}

.message-content :deep(a) {
    color: #f0b344;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.message-content :deep(blockquote) {
    border-left: 3px solid rgba(240, 179, 68, 0.5);
    padding-left: 10px;
    color: rgba(255, 255, 255, 0.75);
}

.message.user .message-content {
    background: rgba(74, 158, 255, 0.15);
    border: 1px solid rgba(74, 158, 255, 0.3);
    padding: 10px 14px;
    border-radius: 12px 12px 4px 12px;
    width: fit-content;
    max-width: min(68%, 100%);
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

/* 消息操作按钮 */
.message-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.message.character:hover .message-actions,
.message-actions.latest {
    opacity: 1;
}

.action-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
    padding: 0;
}

.action-btn:hover {
    background: rgba(240, 179, 68, 0.15);
    border-color: rgba(240, 179, 68, 0.3);
    color: #f0b344;
}

.action-btn:active {
    transform: scale(0.95);
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

@media (max-width: 768px) {
    .message.user .message-content {
        width: fit-content;
        max-width: 100%;
        box-sizing: border-box;
    }
}
</style>
