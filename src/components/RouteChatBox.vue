<template>
    <div class="route-chat-box">
        <div
            ref="messagesContainer"
            :class="['chat-messages', { 'scrollbar-visible': scrollbarVisible }]"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @mousemove="handleMouseMove"
            @scroll="handleMessagesScroll"
            @pointerdown="handlePointerDown"
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
                    <div
                        class="message-bubble"
                        v-html="renderMessageContent(msg.content)"
                    ></div>

                    <div
                        v-if="msg.type === 'character' && msg.completed"
                        :class="['message-actions', { latest: isLatestCharacter(index) }]"
                    >
                        <button
                            class="action-btn"
                            title="复制"
                            @click="emit('copy', msg.content)"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path
                                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                />
                            </svg>
                        </button>
                        <button
                            class="action-btn"
                            title="收藏"
                            @click="emit('favorite', msg.mid)"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </button>
                        <button
                            class="action-btn"
                            title="重新生成"
                            @click="emit('regenerate', msg.mid)"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
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
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          @keydown="handleKeydown"
          @input="autoResize"
      ></textarea>
            <button
                :disabled="isSendDisabled || !inputText.trim()"
                class="send-btn"
                @click="handleSend"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {marked} from "marked";
import DOMPurify from "dompurify";

const props = defineProps({
    messages: {
        type: Array,
        default: () => [],
    },
    placeholder: {
        type: String,
        default: "请输入...",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    sendDisabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["send", "copy", "favorite", "regenerate"]);

const inputText = ref("");
const messagesContainer = ref(null);
const inputTextarea = ref(null);
const status = ref("idle"); // idle | thinking | streaming
const scrollbarVisible = ref(false);
let userHasScrolled = false;
let streamingUnwatch = null;
let previousScrollTop = 0;
let dragging = false;
let scrollbarHideTimer = null;

marked.setOptions({
    gfm: true,
    breaks: true,
});

const latestCharacterIndex = computed(() => {
    for (let i = props.messages.length - 1; i >= 0; i--) {
        if (props.messages[i].type === "character") return i;
    }
    return -1;
});

const isLatestCharacter = (index) => index === latestCharacterIndex.value;

const isSendDisabled = computed(() => props.disabled || props.sendDisabled);

const statusText = computed(() => {
    if (status.value === "thinking") return "正在思考...";
    if (status.value === "streaming") return "正在输出...";
    return "";
});

const renderMessageContent = (content) => {
    if (!content) return "";
    const html = marked.parse(content);
    return DOMPurify.sanitize(html);
};

const handleMessagesScroll = () => {
    showScrollbar(1200);
    if (!messagesContainer.value) return;

    const {scrollTop} = messagesContainer.value;

    // 如果向上滚动（scrollTop < previous），判定为用户滚动
    if (scrollTop < previousScrollTop) {
        userHasScrolled = true;
        if (streamingUnwatch) {
            streamingUnwatch();
            streamingUnwatch = null;
        }
    }

    previousScrollTop = scrollTop;
};

const clearScrollbarHideTimer = () => {
    if (scrollbarHideTimer) {
        clearTimeout(scrollbarHideTimer);
        scrollbarHideTimer = null;
    }
};

const showScrollbar = (delay = 1200) => {
    scrollbarVisible.value = true;
    clearScrollbarHideTimer();
    if (!dragging) {
        scrollbarHideTimer = setTimeout(() => {
            scrollbarVisible.value = false;
        }, delay);
    }
};

const handleMouseEnter = () => {
    showScrollbar(1200);
};

const handleMouseLeave = () => {
    if (!dragging) {
        showScrollbar(360);
    }
};

const handleMouseMove = () => {
    showScrollbar(1200);
};

const handlePointerDown = () => {
    dragging = true;
    scrollbarVisible.value = true;
    clearScrollbarHideTimer();
};

const handleGlobalPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    showScrollbar(1200);
};

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

const autoResize = () => {
    if (!inputTextarea.value) return;
    inputTextarea.value.style.height = "auto";
    inputTextarea.value.style.height = `${Math.min(inputTextarea.value.scrollHeight, 120)}px`;
};

watch(
    () => props.messages.length,
    () => {
        scrollToBottom();
    },
);

watch(status, (newStatus) => {
    if (newStatus === "streaming") {
        userHasScrolled = false;
        streamingUnwatch = watch(
            () => props.messages[props.messages.length - 1]?.content.length ?? 0,
            () => {
                if (userHasScrolled) {
                    streamingUnwatch?.();
                    streamingUnwatch = null;
                    return;
                }
                scrollToBottom();
            },
        );
    } else if (newStatus === "idle") {
        if (streamingUnwatch) {
            streamingUnwatch();
            streamingUnwatch = null;
        }
    }
});

const handleKeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};

const handleSend = () => {
    const text = inputText.value.trim();
    if (!text || isSendDisabled.value) return;

    emit("send", text);
    inputText.value = "";

    if (inputTextarea.value) {
        inputTextarea.value.style.height = "auto";
    }
};

defineExpose({
    setStatus: (s) => {
        status.value = s;
    },
    getStatus: () => status.value,
});

onMounted(() => {
    window.addEventListener("pointerup", handleGlobalPointerUp);
});

onUnmounted(() => {
    clearScrollbarHideTimer();
    window.removeEventListener("pointerup", handleGlobalPointerUp);
});
</script>

<style scoped>
.route-chat-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: rgba(20, 30, 55, 0.58);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    overscroll-behavior: contain;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.chat-messages {
    position: relative;
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(0, 0, 0, 0.22);
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
    scrollbar-color: rgba(240, 179, 68, 0.45) transparent;
}

.chat-messages.scrollbar-visible::-webkit-scrollbar-thumb {
    background: rgba(240, 179, 68, 0.45);
}

.chat-messages.scrollbar-visible::-webkit-scrollbar-thumb:hover {
    background: rgba(240, 179, 68, 0.68);
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
    background: rgba(240, 179, 68, 0.14);
    border: 1px solid rgba(240, 179, 68, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.73rem;
    color: #f0b344;
    font-weight: 700;
    flex-shrink: 0;
}

.message-row.user .message-avatar {
    background: rgba(74, 158, 255, 0.14);
    border-color: rgba(74, 158, 255, 0.25);
    color: #88c2ff;
}

.message-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.message-bubble {
    background: rgba(30, 45, 80, 0.64);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 0.9rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
}

.message-row.user .message-bubble {
    background: linear-gradient(
        135deg,
        rgba(240, 179, 68, 0.12),
        rgba(14, 165, 233, 0.1)
    );
    border-color: rgba(240, 179, 68, 0.25);
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.56);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.action-btn:hover {
    color: #f0b344;
    background: rgba(240, 179, 68, 0.15);
    border-color: rgba(240, 179, 68, 0.3);
}

.chat-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.56);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-dot.thinking {
    background: #f0b344;
    animation: pulse 1.1s infinite;
}

.status-dot.streaming {
    background: #63d179;
    box-shadow: 0 0 8px rgba(99, 209, 121, 0.5);
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.45;
    }
}

.chat-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(15, 26, 42, 0.86);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.chat-input textarea {
    flex: 1;
    background: rgba(30, 45, 80, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 12px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.9rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    max-height: 120px;
    font-family: inherit;
}

.chat-input textarea:focus {
    border-color: rgba(240, 179, 68, 0.42);
}

.chat-input textarea::placeholder {
    color: rgba(255, 255, 255, 0.38);
}

.chat-input textarea:disabled {
    opacity: 0.6;
}

.send-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(145deg, #f0b344 0%, #e7a22f 100%);
    color: #0f1a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.04);
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.3);
}

.send-btn:disabled {
    opacity: 0.52;
    cursor: not-allowed;
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
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
}

.message-bubble :deep(pre) {
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    overflow-x: auto;
}

.message-bubble :deep(pre code) {
    background: transparent;
    padding: 0;
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
