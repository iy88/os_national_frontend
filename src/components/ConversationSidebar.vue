<template>
    <aside class="conversation-sidebar">
        <div class="sidebar-header">
            <div class="sidebar-title-wrap">
                <h3>历史会话</h3>
                <p>按时间查看</p>
            </div>
            <button class="new-chat-btn" @click="emit('new-chat')">
                <svg
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    width="16"
                >
                    <line x1="12" x2="12" y1="5" y2="19"/>
                    <line x1="5" x2="19" y1="12" y2="12"/>
                </svg>
                新建
            </button>
        </div>

        <div
            :class="['session-list', { 'scrollbar-visible': scrollbarVisible }]"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @mousemove="handleMouseMove"
            @pointerdown="handlePointerDown"
            @scroll.passive="handleScroll"
        >
            <div v-if="sessions.today.length" class="session-group">
                <div class="group-title">今日</div>
                <button
                    v-for="session in sessions.today"
                    :key="session.sid"
                    :class="['session-item', { active: session.sid === currentSid }]"
                    :data-sid="session.sid"
                    @click="handleSelect(session.sid)"
                >
                    <div class="session-icon">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="session-content">
                        <div v-if="editingSid === session.sid" class="session-title-edit">
                            <input
                                v-model="editingTitle"
                                class="title-input"
                                @blur="handleTitleBlur(session)"
                                @keydown.enter="handleTitleConfirm(session)"
                                @keydown.escape="handleTitleCancel"
                                @click.stop
                            />
                        </div>
                        <template v-else>
                            <div class="session-title">{{ session.title || "新对话" }}</div>
                            <div class="session-date">{{ formatTime(session.updatedAt) }}</div>
                        </template>
                    </div>
                    <div v-if="session.hasIncompleteMessage" class="incomplete-badge">
                        !
                    </div>
                    <button
                        v-if="editingSid !== session.sid"
                        class="edit-title-btn"
                        title="编辑标题"
                        @click.stop="handleEditTitle(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        v-else
                        class="edit-title-btn confirm"
                        title="确认"
                        @click.stop="handleTitleConfirm(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </button>
            </div>

            <div v-if="sessions.yesterday.length" class="session-group">
                <div class="group-title">昨日</div>
                <button
                    v-for="session in sessions.yesterday"
                    :key="session.sid"
                    :class="['session-item', { active: session.sid === currentSid }]"
                    :data-sid="session.sid"
                    @click="handleSelect(session.sid)"
                >
                    <div class="session-icon">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="session-content">
                        <div v-if="editingSid === session.sid" class="session-title-edit">
                            <input
                                v-model="editingTitle"
                                class="title-input"
                                @blur="handleTitleBlur(session)"
                                @keydown.enter="handleTitleConfirm(session)"
                                @keydown.escape="handleTitleCancel"
                                @click.stop
                            />
                        </div>
                        <template v-else>
                            <div class="session-title">{{ session.title || "新对话" }}</div>
                            <div class="session-date">{{ formatTime(session.updatedAt) }}</div>
                        </template>
                    </div>
                    <div v-if="session.hasIncompleteMessage" class="incomplete-badge">
                        !
                    </div>
                    <button
                        v-if="editingSid !== session.sid"
                        class="edit-title-btn"
                        title="编辑标题"
                        @click.stop="handleEditTitle(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        v-else
                        class="edit-title-btn confirm"
                        title="确认"
                        @click.stop="handleTitleConfirm(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </button>
            </div>

            <div v-if="sessions.earlier.length" class="session-group">
                <div class="group-title">更早</div>
                <button
                    v-for="session in sessions.earlier"
                    :key="session.sid"
                    :class="['session-item', { active: session.sid === currentSid }]"
                    :data-sid="session.sid"
                    @click="handleSelect(session.sid)"
                >
                    <div class="session-icon">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div class="session-content">
                        <div v-if="editingSid === session.sid" class="session-title-edit">
                            <input
                                v-model="editingTitle"
                                class="title-input"
                                @blur="handleTitleBlur(session)"
                                @keydown.enter="handleTitleConfirm(session)"
                                @keydown.escape="handleTitleCancel"
                                @click.stop
                            />
                        </div>
                        <template v-else>
                            <div class="session-title">{{ session.title || "新对话" }}</div>
                            <div class="session-date">{{ formatDate(session.updatedAt) }}</div>
                        </template>
                    </div>
                    <div v-if="session.hasIncompleteMessage" class="incomplete-badge">
                        !
                    </div>
                    <button
                        v-if="editingSid !== session.sid"
                        class="edit-title-btn"
                        title="编辑标题"
                        @click.stop="handleEditTitle(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        v-else
                        class="edit-title-btn confirm"
                        title="确认"
                        @click.stop="handleTitleConfirm(session)"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </button>
            </div>

            <div v-if="isEmpty" class="empty-state">
                <p>暂无历史对话</p>
            </div>
        </div>
    </aside>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref} from "vue";
import {editChatSessionTitle} from "../api";

const props = defineProps({
    sessions: {
        type: Object,
        default: () => ({today: [], yesterday: [], earlier: []}),
    },
    currentSid: {
        type: [Number, String],
        default: null,
    },
});

const emit = defineEmits(["select", "new-chat", "delete", "title-update"]);

const scrollbarVisible = ref(false);
let dragging = false;
let scrollbarHideTimer = null;

// 内联编辑状态
const editingSid = ref(null);
const editingTitle = ref("");
const originalTitle = ref("");

const isEmpty = computed(() => {
    const g = props.sessions;
    return !g.today.length && !g.yesterday.length && !g.earlier.length;
});

const handleSelect = (sid) => {
    if (editingSid.value !== null && editingSid.value !== sid) {
        handleTitleCancel();
    }
    emit("select", sid);
};

const handleEditTitle = async (session) => {
    editingSid.value = session.sid;
    originalTitle.value = session.title || "新对话";
    editingTitle.value = session.title || "新对话";
    await nextTick();
    const el = document.querySelector(`.session-item[data-sid="${session.sid}"] .title-input`);
    if (el) {
        el.focus();
        el.select();
    }
};

const handleTitleBlur = (session) => {
    // 延迟到下一帧，避免点击确认按钮时 blur 先触发导致请求被跳过
    requestAnimationFrame(() => {
        if (editingSid.value !== session.sid) return;

        const activeEl = document.activeElement;
        const isActionButton =
            typeof activeEl?.classList?.contains === "function" &&
            activeEl.classList.contains("edit-title-btn");
        const inCurrentSessionItem =
            typeof activeEl?.closest === "function" &&
            activeEl.closest(`.session-item[data-sid="${session.sid}"]`);

        if (isActionButton && inCurrentSessionItem) return;
        handleTitleCancel();
    });
};

const handleTitleCancel = () => {
    editingSid.value = null;
    editingTitle.value = "";
    originalTitle.value = "";
};

const handleTitleConfirm = async (session) => {
    const newTitle = editingTitle.value.trim() || originalTitle.value;
    editingSid.value = null;

    if (newTitle === originalTitle.value) {
        editingTitle.value = "";
        originalTitle.value = "";
        return;
    }

    try {
        await editChatSessionTitle(session.sid, newTitle);
        emit("title-update", {sid: session.sid, title: newTitle});
    } catch (error) {
        console.error("更新标题失败:", error);
    }

    editingTitle.value = "";
    originalTitle.value = "";
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

const handleScroll = () => {
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

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
};

onMounted(() => {
    window.addEventListener("pointerup", handleGlobalPointerUp);
});

onUnmounted(() => {
    clearScrollbarHideTimer();
    window.removeEventListener("pointerup", handleGlobalPointerUp);
});
</script>

<style scoped>
.conversation-sidebar {
    flex: 1;
    width: 100%;
    height: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(
        180deg,
        var(--color-bg-elevated),
        var(--color-bg-elevated)
    );
    border-right: 1px solid var(--color-brand-soft-bg);
}

.sidebar-header {
    flex-shrink: 0;
    padding: 14px 14px 12px;
    border-bottom: 1px solid var(--color-brand-soft-bg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.sidebar-title-wrap h3 {
    margin: 0;
    font-size: 0.92rem;
    color: var(--color-brand);
    font-weight: 600;
}

.sidebar-title-wrap p {
    margin: 2px 0 0;
    font-size: 0.72rem;
    color: var(--color-text-disabled);
}

.new-chat-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 11px;
    background: linear-gradient(145deg, var(--color-brand) 0%, var(--color-brand-active) 100%);
    border: none;
    border-radius: 10px;
    color: var(--color-bg-deep);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px var(--color-brand-soft-border);
    transition: all 0.2s ease;
}

.new-chat-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px var(--color-brand-soft-border);
}

.session-list {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    overflow-y: overlay;
    overflow-x: hidden;
    padding: 10px 12px 10px 10px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    -ms-overflow-style: none;
}

.session-list::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.session-list::-webkit-scrollbar-track {
    background: transparent;
}

.session-list::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 10px;
}

.session-list.scrollbar-visible {
    scrollbar-color: var(--color-brand-glow-strong) transparent;
}

.session-list.scrollbar-visible::-webkit-scrollbar-thumb {
    background: var(--color-brand-glow-strong);
}

.session-list.scrollbar-visible::-webkit-scrollbar-thumb:hover {
    background: var(--color-brand-glow-strong);
}

.session-group {
    margin-bottom: 8px;
}

.group-title {
    font-size: 0.69rem;
    color: var(--color-text-disabled);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 10px;
    font-weight: 700;
}

.session-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    margin-bottom: 4px;
}

.session-item:hover {
    background: var(--color-brand-soft-bg);
    border-color: var(--color-brand-soft-bg);
}

.session-item.active {
    background: linear-gradient(
        135deg,
        var(--color-brand-soft-bg),
        var(--color-info-soft)
    );
    border-color: var(--color-brand-soft-border);
}

.session-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: var(--color-brand);
    border-radius: 0 2px 2px 0;
}

.session-icon {
    width: 28px;
    height: 28px;
    background: var(--color-bg-input);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
    color: var(--color-brand);
}

.session-icon svg {
    width: 14px;
    height: 14px;
}

.session-content {
    flex: 1;
    min-width: 0;
}

.session-title {
    font-size: 0.84rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.session-date {
    font-size: 0.7rem;
    color: var(--color-text-disabled);
}

.incomplete-badge {
    width: 16px;
    height: 16px;
    background: var(--color-brand-secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.64rem;
    font-weight: 700;
    color: var(--color-text-primary);
    flex-shrink: 0;
}

.edit-title-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-text-disabled);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    opacity: 0;
    transition: all 0.15s ease;
}

.session-item:hover .edit-title-btn {
    opacity: 1;
}

.edit-title-btn:hover {
    background: var(--color-brand-soft-bg);
    color: var(--color-brand);
}

.edit-title-btn.confirm {
    color: var(--color-admin);
}

.edit-title-btn.confirm:hover {
    background: rgba(74, 222, 128, 0.15);
    color: var(--color-admin);
}

.edit-title-btn svg {
    width: 14px;
    height: 14px;
}

.session-title-edit {
    width: 100%;
}

.title-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--color-brand-glow-strong);
    border-radius: 4px;
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    font-size: 0.84rem;
    outline: none;
}

.title-input:focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 2px var(--color-brand-soft-border);
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--color-text-disabled);
    font-size: 0.84rem;
}

@media (max-width: 900px) {
    .conversation-sidebar {
        border-right: 1px solid var(--color-brand-soft-bg);
    }

    .edit-title-btn {
        opacity: 1;
    }
}
</style>
