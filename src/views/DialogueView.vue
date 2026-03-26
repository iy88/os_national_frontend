<template>
    <div class="dialogue-view">
        <!-- 全屏对话区 -->
        <main class="fullscreen-conversation">
            <!-- 标题栏 -->
            <div class="page-header">
                <h2 class="page-title">沉浸式电竞IP对话体验</h2>
                <button class="switch-btn" @click="openCharSelector">🎭 切换角色</button>
            </div>

            <!-- 角色信息展示条 -->
            <div v-if="activeCharacter" class="char-info-strip">
                <div class="avatar-wrapper" @click="toggleAvatarDropdown">
                    <img v-if="activeCharacter.avatar" :alt="activeCharacter.name" :src="activeCharacter.avatar"/>
                    <div v-else class="avatar-placeholder">{{ activeCharacter.name.charAt(0) }}</div>
                    <!-- 头像下拉菜单（移动端） -->
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
                <p class="welcome-text">点击「切换角色」按钮，从角色库中选择一位开始对话</p>
            </div>

            <!-- 消息区 -->
            <div v-else ref="messagesAreaRef" class="messages-area">
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
                        <div class="send-icon"></div>
                    </button>
                </div>
            </div>
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
                            @click="selectCharacter(char)"
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

const activeCategory = ref('hero')
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

// 流式输出定时器
const {streamIntervalRef, streamTimeoutRef, thinkingTimeoutRef, clearStreamTimers} = useStreamTimers()

const selectorCharacters = computed(() => characterData[selectorCategory.value] || [])

const openCharSelector = () => {
    selectorCategory.value = activeCategory.value
    showCharSelector.value = true
}

const toggleAvatarDropdown = () => {
    showAvatarDropdown.value = !showAvatarDropdown.value
}

const selectCharacter = (character) => {
    // 清理之前的定时器，防止切换角色后继续执行
    clearStreamTimers()

    activeCharacter.value = character
    messages.value = [{
        type: 'character',
        content: `${character.name}：${getCharacterWelcome(character.id)}`
    }]
    showCharSelector.value = false

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

    messages.value.push({type: 'user', content: text})
    inputText.value = ''

    // 模拟流式输出过程
    // 1. 先显示正在思考状态 - 在消息后添加状态行
    const statusIndex = messages.value.length
    messages.value.push({type: 'status', content: '正在思考...'})

    // 2. 1秒后切换到正在输出状态，并开始流式输出
    thinkingTimeoutRef.value = setTimeout(() => {
        // 替换状态为实际内容
        messages.value[statusIndex] = {type: 'character', content: `${activeCharacter.value?.name || '智能体'}：`}
        const msgIndex = messages.value.length
        messages.value.push({type: 'character', content: ''})

        // 3. 模拟逐字输出
        let charIndex = 0
        streamIntervalRef.value = setInterval(() => {
            if (charIndex < mockStreamReply.length) {
                messages.value[msgIndex].content += mockStreamReply[charIndex]
                charIndex++
                scrollToBottom()
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
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    clearStreamTimers()
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dialogue-view {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #06090f;
    overflow: hidden;
}

/* 页面标题栏 */
.page-header {
    flex-shrink: 0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(180deg, rgba(13, 20, 32, 0.95), rgba(6, 9, 15, 0.9));
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.page-title {
    color: #f0b344;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
}

.switch-btn {
    padding: 8px 16px;
    background: rgba(21, 32, 53, 0.8);
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

/* 全屏对话区 */
.fullscreen-conversation {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
}

/* 角色信息展示条 */
.char-info-strip {
    flex-shrink: 0;
    padding: 16px 24px;
    background: #0d1420;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    gap: 16px;
}

.avatar-wrapper {
    position: relative;
    cursor: pointer;
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
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    text-align: center;
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
    padding: 16px 24px;
    background: #0d1420;
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
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #f0b344, #d4962e);
    border: none;
    border-radius: 50%;
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

.send-icon {
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
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

/* 移动端适配 */
@media (max-width: 768px) {
    .page-header {
        padding: 12px 16px;
    }

    .page-title {
        font-size: 1rem;
    }

    .switch-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
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
