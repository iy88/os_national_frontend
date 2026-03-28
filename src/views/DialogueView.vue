<template>
    <div class="dialogue-view" :style="dialogueViewportStyle">
        <!-- 全屏对话区 -->
        <main class="fullscreen-conversation">
            <!-- PC端左侧边栏 -->
            <aside class="sidebar">
                <!-- 顶部选项卡 -->
                <div class="sidebar-header">
                    <div class="sidebar-tabs">
                        <div
                            v-for="(info, key) in categoryInfo"
                            :key="key"
                            :class="['sidebar-tab', { active: activeSidebarTab === key }]"
                            @click="activeSidebarTab = key"
                        >
                            {{ info.name }}
                        </div>
                    </div>
                    <button class="sidebar-add-btn" @click="openCharSelector" aria-label="选择角色">
                        <svg class="sidebar-add-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" x2="19" y1="8" y2="14"/>
                            <line x1="16" x2="22" y1="11" y2="11"/>
                        </svg>
                    </button>
                </div>

                <!-- 角色列表 -->
                <div
                    :class="['sidebar-char-list', { 'scrollbar-visible': sidebarScrollbarVisible }]"
                    @mouseenter="handleSidebarMouseEnter"
                    @mouseleave="handleSidebarMouseLeave"
                    @mousemove="handleSidebarMouseMove"
                    @scroll.passive="handleSidebarScroll"
                    @pointerdown="handleSidebarPointerDown"
                >
                    <div
                        v-for="char in currentSidebarChars"
                        :key="char.id"
                        :class="['sidebar-char-item', { active: activeCharacter?.id === char.id }]"
                        @click="selectCharacter(char)"
                    >
                        <div class="sidebar-char-avatar">
                            <img v-if="char.avatar" :src="char.avatar" :alt="char.name"/>
                            <div v-else class="avatar-placeholder">{{ char.name.charAt(0) }}</div>
                        </div>
                        <div class="sidebar-char-info">
                            <div class="sidebar-char-name">{{ char.name }}</div>
                            <div class="sidebar-char-quote">{{ char.desc }}</div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- 右侧对话区 -->
            <section class="chat-area">
                <!-- 移动端标题栏 -->
                <div class="page-header mobile-only">
                    <h2 class="page-title">沉浸式电竞IP对话体验</h2>
                    <button class="switch-btn" @click="openCharSelector">🎭 切换角色</button>
                </div>

                <!-- 角色信息展示条 -->
                <div v-if="activeCharacter" class="char-info-strip">
                    <div class="avatar-wrapper" @click="toggleAvatarDropdown">
                        <img v-if="activeCharacter.avatar" :alt="activeCharacter.name" :src="activeCharacter.avatar"/>
                        <div v-else class="avatar-placeholder">{{ activeCharacter.name.charAt(0) }}</div>
                        <!-- 头像下拉菜单 -->
                        <div v-if="showAvatarDropdown" class="avatar-dropdown" @click.stop>
                            <button class="dropdown-btn" @click="openStory(activeCharacter); showAvatarDropdown = false">📖 故事</button>
                            <button class="dropdown-btn" @click="openPhotos(activeCharacter); showAvatarDropdown = false">📷 照片</button>
                        </div>
                    </div>
                    <div class="info-text">
                        <h3>{{ activeCharacter.name }}</h3>
                        <p>{{ activeCharacter.desc }}</p>
                    </div>
                    <div class="strip-actions desktop-only">
                        <button class="strip-btn" @click="openStory(activeCharacter)">📖 故事</button>
                        <button class="strip-btn" @click="openPhotos(activeCharacter)">📷 照片</button>
                    </div>
                </div>

                <!-- 欢迎状态 -->
                <div v-if="!activeCharacter" class="welcome-state">
                    <div class="welcome-circle">
                        <span class="welcome-icon">💬</span>
                    </div>
                    <p class="welcome-text mobile-only">点击上方的切换角色按钮</p>
                    <p class="welcome-text desktop-only">从左侧列表选择一位角色，开始对话</p>
                </div>

                <!-- 消息区 -->
                <div v-else ref="messagesAreaRef" class="messages-area" @scroll="handleMessagesScroll">
                    <div
                        v-for="(msg, index) in messages"
                        :key="index"
                        :class="['msg-row', msg.type]"
                    >
                        <div class="msg-avatar" :class="msg.type === 'user' ? '' : 'ai'">
                            {{ msg.type === 'user' ? '我' : activeCharacter.name.charAt(0) }}
                        </div>
                        <div class="msg-bubble">
                            <span class="msg-content">{{ msg.content }}</span>
                        </div>
                    </div>
                </div>

                <!-- 底部输入 -->
                <div v-if="activeCharacter" class="input-bar">
                    <div class="input-row">
                        <div class="input-placeholder">
                            <input
                                ref="inputRef"
                                v-model="inputText"
                                :placeholder="`与 ${activeCharacter.name} 对话...`"
                                @keydown.enter.prevent="handleSend"
                            />
                        </div>
                        <button class="send-btn" @click="handleSend">
                            <span class="send-arrow">↑</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <!-- 角色选择浮层 -->
        <div :class="['char-selector-overlay', { visible: showCharSelector }]" @click.self="showCharSelector = false">
            <div class="char-panel">
                <div class="panel-header">
                    <span class="panel-title">选择角色</span>
                    <button class="panel-close" @click="showCharSelector = false">✕</button>
                </div>
                <div class="panel-cats">
                    <div
                        v-for="(info, key) in categoryInfo"
                        :key="key"
                        :class="['panel-cat', { active: selectorCategory === key }]"
                        @click="selectorCategory = key"
                    >
                        {{ info.name }}
                    </div>
                </div>
                <div class="panel-body">
                    <div class="char-grid">
                        <div
                            v-for="char in selectorCharacters"
                            :key="char.id"
                            :class="['char-card', { active: activeCharacter?.id === char.id }]"
                            @click="selectCharacter(char); showCharSelector = false"
                        >
                            <div class="char-avatar-block">{{ char.name.charAt(0) }}</div>
                            <div class="char-name">{{ char.name }}</div>
                            <div class="char-desc">{{ char.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 故事弹窗 -->
        <StoryModal
            v-model="showStoryModal"
            :character-name="selectedCharacter?.name || ''"
            :story="selectedCharacter?.story || ''"
        />

        <!-- 照片弹窗 -->
        <PhotoGallery
            v-model="showPhotosModal"
            :photos="selectedCharacter?.photos || []"
        />
    </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import StoryModal from '../components/StoryModal.vue'
import PhotoGallery from '../components/PhotoGallery.vue'
import {categoryInfo, characterData, getCharacterWelcome, mockStreamReply} from '../data/characters'
import {useStreamTimers} from '../composables/useStreamTimers'

const activeSidebarTab = ref('hero')
const activeCharacter = ref(null)
const messages = ref([])
const inputText = ref('')
const messagesAreaRef = ref(null)
const inputRef = ref(null)

const showCharSelector = ref(false)
const selectorCategory = ref('hero')
const showStoryModal = ref(false)
const showPhotosModal = ref(false)
const selectedCharacter = ref(null)
const showAvatarDropdown = ref(false)
const sidebarScrollbarVisible = ref(false)
const sidebarDragging = ref(false)
const dynamicViewportHeight = ref('')
let sidebarScrollbarHideTimer = null
let viewportRafId = 0

// 用户滚动检测
let userHasScrolled = false
let previousScrollTop = 0

const handleMessagesScroll = () => {
    if (!messagesAreaRef.value) return
    const {scrollTop} = messagesAreaRef.value
    // 如果向上滚动，判定为用户滚动
    if (scrollTop < previousScrollTop) {
        userHasScrolled = true
    }
    previousScrollTop = scrollTop
}

// 流式输出定时器
const {streamIntervalRef, streamTimeoutRef, thinkingTimeoutRef, clearStreamTimers} = useStreamTimers()

const selectorCharacters = computed(() => characterData[selectorCategory.value] || [])
const currentSidebarChars = computed(() => characterData[activeSidebarTab.value] || [])

const openCharSelector = () => {
    selectorCategory.value = activeSidebarTab.value
    showCharSelector.value = true
}

const clearSidebarScrollbarHideTimer = () => {
    if (sidebarScrollbarHideTimer) {
        clearTimeout(sidebarScrollbarHideTimer)
        sidebarScrollbarHideTimer = null
    }
}

const showSidebarScrollbar = (delay = 1200) => {
    sidebarScrollbarVisible.value = true
    clearSidebarScrollbarHideTimer()
    if (!sidebarDragging.value) {
        sidebarScrollbarHideTimer = setTimeout(() => {
            sidebarScrollbarVisible.value = false
        }, delay)
    }
}

const handleSidebarMouseEnter = () => {
    showSidebarScrollbar(1200)
}

const handleSidebarMouseLeave = () => {
    if (!sidebarDragging.value) {
        showSidebarScrollbar(360)
    }
}

const handleSidebarMouseMove = () => {
    showSidebarScrollbar(1200)
}

const handleSidebarScroll = () => {
    showSidebarScrollbar(1200)
}

const handleSidebarPointerDown = () => {
    sidebarDragging.value = true
    sidebarScrollbarVisible.value = true
    clearSidebarScrollbarHideTimer()
}

const handleGlobalPointerUp = () => {
    if (!sidebarDragging.value) return
    sidebarDragging.value = false
    showSidebarScrollbar(1200)
}

const toggleAvatarDropdown = () => {
    showAvatarDropdown.value = !showAvatarDropdown.value
}

const updateDynamicViewportHeight = () => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile) {
        dynamicViewportHeight.value = ''
        return
    }

    const viewportHeight = window.visualViewport?.height || window.innerHeight
    dynamicViewportHeight.value = `${Math.max(320, Math.round(viewportHeight))}px`
}

const scheduleViewportHeightUpdate = () => {
    if (viewportRafId) return
    viewportRafId = requestAnimationFrame(() => {
        viewportRafId = 0
        updateDynamicViewportHeight()
    })
}

const dialogueViewportStyle = computed(() => {
    if (!dynamicViewportHeight.value) return {}
    return {
        height: dynamicViewportHeight.value,
        maxHeight: dynamicViewportHeight.value
    }
})

const selectCharacter = (character) => {
    // 清理之前的定时器，防止切换角色后继续执行
    clearStreamTimers()

    activeCharacter.value = character
    messages.value = [{
        type: 'character',
        content: `${character.name}：${getCharacterWelcome(character.id)}`
    }]

    // 重置输入状态
    inputText.value = ''
}

const openStory = (character) => {
    selectedCharacter.value = character
    showStoryModal.value = true
}

const openPhotos = (character) => {
    selectedCharacter.value = character
    showPhotosModal.value = true
}

const scrollToBottom = () => {
    if (messagesAreaRef.value) {
        messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight
    }
}

const handleSend = () => {
    const text = inputText.value.trim()
    if (!text || !activeCharacter.value) return

    // 清理之前的定时器，防止路由跳转后继续执行
    clearStreamTimers()

    // 重置用户滚动状态
    userHasScrolled = false

    messages.value.push({type: 'user', content: text})
    inputText.value = ''

    // 模拟流式输出过程
    // 1. 先显示正在思考状态
    const statusIndex = messages.value.length
    messages.value.push({type: 'status', content: '正在思考...'})

    // 2. 1秒后移除状态消息，显示角色气泡并开始流式输出
    thinkingTimeoutRef.value = setTimeout(() => {
        // 移除状态消息
        messages.value.splice(statusIndex, 1)

        // 添加角色消息气泡
        const msgIndex = messages.value.length
        messages.value.push({type: 'character', content: ''})

        // 3. 模拟逐字输出
        let charIndex = 0
        streamIntervalRef.value = setInterval(() => {
            if (charIndex < mockStreamReply.length) {
                messages.value[msgIndex].content += mockStreamReply[charIndex]
                charIndex++
                if (!userHasScrolled) {
                    scrollToBottom()
                }
            } else {
                clearInterval(streamIntervalRef.value)
                // 4. 输出完成后清理
                streamTimeoutRef.value = setTimeout(() => {
                    clearStreamTimers()
                }, 300)
            }
        }, 15) // 每15ms输出一个字符
    }, 1000)
}

// 点击空白处关闭头像下拉菜单
const handleClickOutside = (e) => {
    if (showAvatarDropdown.value) {
        const avatarWrapper = document.querySelector('.avatar-wrapper')
        if (avatarWrapper && !avatarWrapper.contains(e.target)) {
            showAvatarDropdown.value = false
        }
    }
}

onMounted(() => {
    updateDynamicViewportHeight()
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('resize', scheduleViewportHeightUpdate)
    window.addEventListener('orientationchange', scheduleViewportHeightUpdate)
    window.visualViewport?.addEventListener('resize', scheduleViewportHeightUpdate)
    window.visualViewport?.addEventListener('scroll', scheduleViewportHeightUpdate)
})

onUnmounted(() => {
    if (viewportRafId) {
        cancelAnimationFrame(viewportRafId)
        viewportRafId = 0
    }
    clearStreamTimers()
    clearSidebarScrollbarHideTimer()
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('pointerup', handleGlobalPointerUp)
    window.removeEventListener('resize', scheduleViewportHeightUpdate)
    window.removeEventListener('orientationchange', scheduleViewportHeightUpdate)
    window.visualViewport?.removeEventListener('resize', scheduleViewportHeightUpdate)
    window.visualViewport?.removeEventListener('scroll', scheduleViewportHeightUpdate)
})
</script>

<style scoped>
.dialogue-view {
    flex: 1;
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, #141e37 0%, #0f1a2a 100%);
    overflow: hidden;
    max-width: 1200px;
    margin: 8px auto;
    width: 100%;
    border: 1px solid rgba(240, 179, 68, 0.2);
    border-radius: 8px;
    box-sizing: border-box;
}

/* 全屏对话区 */
.fullscreen-conversation {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
}

/* ==================== PC端侧边栏 ==================== */
.sidebar {
    width: 30%;
    min-width: 280px;
    max-width: 360px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(20, 30, 55, 0.96), rgba(15, 26, 42, 0.92));
    border-right: 1px solid rgba(240, 179, 68, 0.15);
}

.sidebar-header {
    flex-shrink: 0;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid rgba(240, 179, 68, 0.1);
}

.sidebar-tabs {
    flex: 1;
    display: flex;
    gap: 4px;
    min-width: 0;
}

.sidebar-tab {
    flex: 1;
    min-width: 0;
    padding: 8px 8px;
    background: rgba(12, 22, 38, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    transition: all 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar-tab:hover {
    border-color: rgba(240, 179, 68, 0.3);
    color: rgba(255, 255, 255, 0.85);
}

.sidebar-tab.active {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.2), rgba(14, 165, 233, 0.15));
    border-color: #f0b344;
    color: #f0b344;
}

.sidebar-add-btn {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    background: rgba(12, 22, 38, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;
}

.sidebar-add-icon {
    width: 16px;
    height: 16px;
}

.sidebar-add-btn:hover {
    border-color: #f0b344;
    color: #f0b344;
    background: rgba(240, 179, 68, 0.1);
}

/* 侧边栏角色列表 */
.sidebar-char-list {
    flex: 1;
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    overflow-y: overlay;
    overflow-x: hidden;
    padding: 12px 16px 12px 12px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    -ms-overflow-style: none;
}

.sidebar-char-list::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.sidebar-char-list::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-char-list::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 10px;
}

.sidebar-char-list.scrollbar-visible {
    scrollbar-color: rgba(240, 179, 68, 0.45) transparent;
}

.sidebar-char-list.scrollbar-visible::-webkit-scrollbar-thumb {
    background: rgba(240, 179, 68, 0.45);
}

.sidebar-char-list.scrollbar-visible::-webkit-scrollbar-thumb:hover {
    background: rgba(240, 179, 68, 0.68);
}

.sidebar-char-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 6px;
    border: 1px solid transparent;
}

.sidebar-char-item:hover {
    background: rgba(240, 179, 68, 0.08);
    border-color: rgba(240, 179, 68, 0.15);
}

.sidebar-char-item.active {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.15), rgba(14, 165, 233, 0.1));
    border-color: rgba(240, 179, 68, 0.3);
}

.sidebar-char-avatar {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(240, 179, 68, 0.3);
}

.sidebar-char-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.sidebar-char-avatar .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f0b344, #e63946);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
}

.sidebar-char-info {
    flex: 1;
    min-width: 0;
}

.sidebar-char-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 3px;
}

.sidebar-char-quote {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* ==================== 右侧对话区 ==================== */
.chat-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}

/* 移动端标题栏 */
.page-header {
    flex-shrink: 0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(145deg, #141e37 0%, #0f1a2a 100%);
    border-bottom: 1px solid rgba(240, 179, 68, 0.15);
}

.page-title {
    color: #f0b344;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.switch-btn {
    padding: 8px 16px;
    background: rgba(12, 22, 38, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.switch-btn:hover {
    border-color: #f0b344;
    color: #f0b344;
}

/* PC端隐藏移动端元素 */
.mobile-only {
    display: none;
}

/* 移动端隐藏桌面端元素 */
.desktop-only {
    display: block;
}

/* 角色信息展示条 */
.char-info-strip {
    flex-shrink: 0;
    padding: 10px 12px;
    background: linear-gradient(145deg, #141e37 0%, #0f1a2a 100%);
    border-bottom: 1px solid rgba(240, 179, 68, 0.15);
    display: flex;
    align-items: center;
    gap: 16px;
}

.avatar-wrapper {
    position: relative;
    cursor: pointer;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-wrapper img,
.avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
}

.avatar-placeholder {
    background: linear-gradient(135deg, #f0b344, #e63946);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 700;
    color: #fff;
    border: 2px solid #f0b344;
    box-shadow: 0 0 20px rgba(240, 179, 68, 0.3);
}

.avatar-wrapper img {
    display: block;
    border: 2px solid #f0b344;
    box-shadow: 0 0 20px rgba(240, 179, 68, 0.3);
    object-fit: cover;
}

/* 头像下拉菜单 */
.avatar-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px;
    flex-direction: column;
    gap: 6px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    min-width: 120px;
}

.avatar-dropdown::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 16px;
    width: 10px;
    height: 10px;
    background: #152035;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
}

.dropdown-btn {
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.dropdown-btn:hover {
    background: rgba(240, 179, 68, 0.15);
    color: #f0b344;
}

.info-text {
    flex: 1;
}

.info-text h3 {
    font-size: 1rem;
    margin: 0 0 3px 0;
    color: #f0b344;
}

.info-text p {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
}

.strip-actions {
    display: flex;
    gap: 10px;
}

.strip-btn {
    padding: 8px 16px;
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.strip-btn:hover {
    border-color: #f0b344;
    color: #f0b344;
}

/* 欢迎状态 */
.welcome-state {
    flex: 0 1 auto;
    width: 100%;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 20px;
    text-align: center;
    padding: 24px;
    margin: auto 0;
}

@media (min-width: 769px) {
    .dialogue-view {
        max-height: calc(100dvh - 92px - 16px);
    }
}

.welcome-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #152035;
    border: 2px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.welcome-circle::after {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    border: 1px dashed rgba(240, 179, 68, 0.2);
    animation: spin 30s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.welcome-icon {
    font-size: 2.5rem;
    opacity: 0.5;
}

.welcome-text {
    font-size: 0.95rem;
    color: #64748b;
    max-width: 300px;
    line-height: 1.6;
}

/* 消息区 */
.messages-area {
    flex: 1;
    min-height: 0;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: radial-gradient(ellipse at 50% 30%, rgba(240, 179, 68, 0.03), transparent 60%);
}

.msg-row {
    display: flex;
    gap: 12px;
    max-width: 70%;
}

.msg-row.user {
    margin-left: auto;
    flex-direction: row-reverse;
}

.msg-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0b344, #e63946);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    margin-top: 2px;
}

.msg-avatar.ai {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.msg-bubble {
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 14px 18px;
}

.msg-row.user .msg-bubble {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.12), rgba(14, 165, 233, 0.1));
    border-color: rgba(240, 179, 68, 0.2);
}

.msg-content {
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
}

/* 底部输入 */
.input-bar {
    flex-shrink: 0;
    padding: 10px 12px;
    background: rgba(6, 9, 15, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.input-row {
    display: flex;
    gap: 12px;
    align-items: center;
}

.input-placeholder {
    flex: 1;
    height: 50px;
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 25px;
    display: flex;
    align-items: center;
    padding: 0 22px;
    transition: border-color 0.2s;
}

.input-placeholder:focus-within {
    border-color: #f0b344;
}

.input-placeholder input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 0.95rem;
}

.input-placeholder input::placeholder {
    color: #64748b;
}

.send-btn {
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #f0b344, #d4962e);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(240, 179, 68, 0.3);
}

.send-btn:hover {
    transform: scale(1.08);
}

.send-arrow {
    color: #fff;
    font-size: 1.55rem;
    font-weight: 700;
    line-height: 1;
    transform: translateY(-2px);
}

/* 浮动角色选择面板 */
.char-selector-overlay {
    position: fixed;
    inset: 0;
    background: rgba(6, 9, 15, 0.85);
    backdrop-filter: blur(8px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.char-selector-overlay.visible {
    opacity: 1;
    visibility: visible;
}

.char-panel {
    width: 90%;
    max-width: 800px;
    max-height: 70vh;
    background: #0d1420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transform: translateY(20px) scale(0.95);
    transition: transform 0.3s ease;
}

.char-selector-overlay.visible .char-panel {
    transform: translateY(0) scale(1);
}

.panel-header {
    flex-shrink: 0;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f0b344;
}

.panel-close {
    width: 32px;
    height: 32px;
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #64748b;
    transition: all 0.2s;
}

.panel-close:hover {
    border-color: #f0b344;
    color: #f0b344;
}

.panel-cats {
    flex-shrink: 0;
    padding: 16px 24px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-cat {
    padding: 8px 16px;
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    cursor: pointer;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s;
}

.panel-cat:hover {
    border-color: #f0b344;
    color: #fff;
}

.panel-cat.active {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.2), rgba(14, 165, 233, 0.15));
    border-color: #f0b344;
    color: #f0b344;
}

.panel-body {
    flex: 1;
    min-height: 0;
    max-height: 50vh;
    overflow-y: auto;
    padding: 20px;
}

.char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
}

.char-card {
    background: #152035;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.char-card:hover {
    border-color: #f0b344;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.char-card.active {
    border-color: #f0b344;
    background: linear-gradient(145deg, rgba(240, 179, 68, 0.12), transparent);
    box-shadow: 0 0 0 2px #f0b344;
}

.char-avatar-block {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0b344, #e63946);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    border: 2px solid #f0b344;
}

.char-name {
    font-weight: 600;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
}

.char-desc {
    font-size: 0.7rem;
    color: #64748b;
}

/* 移动端适配 - 隐藏侧边栏，使用原来的布局 */
@media (max-width: 768px) {
    .dialogue-view {
        height: 100%;
        max-height: 100%;
        margin: 0 auto;
        border: none;
        border-radius: 0;
        overflow: hidden;
    }

    .fullscreen-conversation {
        flex-direction: column;
        height: 100%;
        min-height: 0;
    }

    .sidebar {
        display: none;
    }

    .chat-area {
        width: 100%;
        min-height: 0;
    }

    .welcome-state {
        margin: 0;
        flex: 1;
    }

    .mobile-only {
        display: flex;
    }

    .desktop-only {
        display: none;
    }

    .page-header {
        padding: 12px 16px;
    }

    .page-title {
        font-size: 1rem;
    }

    .char-info-strip {
        padding: 12px 16px;
    }

    .desktop-only {
        display: none;
    }

    .avatar-dropdown {
        display: flex;
    }

    .messages-area {
        flex: 1;
        min-height: 0;
        padding: 16px;
    }

    .msg-row {
        max-width: 85%;
    }

    .input-bar {
        padding: 12px 16px;
    }

    .char-panel {
        width: 95%;
        max-height: 80vh;
    }

    .char-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 10px;
    }

    .char-card {
        padding: 12px;
    }

    .char-avatar-block {
        width: 44px;
        height: 44px;
        font-size: 1rem;
    }
}
</style>
