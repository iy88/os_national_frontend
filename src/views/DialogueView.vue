<template>
    <div class="dialogue-view">
        <h2 class="page-title">沉浸式电竞IP对话体验</h2>

        <!-- 分类选择 -->
        <div class="category-selection">
            <div
                v-for="(info, key) in categoryInfo"
                :key="key"
                :class="['category-card', { active: activeCategory === key }]"
                :style="{ '--cat-color': info.color }"
                @click="selectCategory(key)"
            >
                <span class="category-icon">{{ info.icon }}</span>
                <span class="category-name">{{ info.name }}</span>
            </div>
        </div>

        <!-- 角色列表 - 可横向滚动 -->
        <div class="character-scroll-wrapper">
            <div class="character-list">
                <CharacterCard
                    v-for="char in currentCharacters"
                    :key="char.id"
                    :category="activeCategory"
                    :character="char"
                    :is-active="activeCharacter?.id === char.id"
                    @select="selectCharacter(char)"
                    @show-story="openStory(char)"
                    @show-photos="openPhotos(char)"
                />
            </div>
        </div>

        <!-- 对话区域 -->
        <div v-if="activeCharacter" class="dialogue-area">
            <div class="dialogue-header">
                <div class="character-info">
                    <div class="avatar-wrapper">
                        <img v-if="activeCharacter.avatar" :alt="activeCharacter.name" :src="activeCharacter.avatar"/>
                        <div v-else class="avatar-placeholder">{{ activeCharacter.name.charAt(0) }}</div>
                    </div>
                    <div class="info-text">
                        <h3>{{ activeCharacter.name }}</h3>
                        <p>{{ activeCharacter.desc }}</p>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="action-btn story-btn" @click="openStory(activeCharacter)">
                        查看故事
                    </button>
                    <button class="action-btn photo-btn" @click="openPhotos(activeCharacter)">
                        查看照片
                    </button>
                </div>
            </div>

            <ChatBox
                ref="chatBoxRef"
                :messages="messages"
                :placeholder="`与 ${activeCharacter.name} 对话...`"
                @send="sendMessage"
            />
        </div>

        <div v-else class="dialogue-placeholder">
            <p>请从上方选择一个角色开始对话</p>
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
import CharacterCard from '../components/CharacterCard.vue'
import ChatBox from '../components/ChatBox.vue'
import StoryModal from '../components/StoryModal.vue'
import PhotoGallery from '../components/PhotoGallery.vue'
import {categoryInfo, characterData, getCharacterWelcome, mockStreamReply} from '../data/characters'

const activeCategory = ref('hero')
const activeCharacter = ref(null)
const messages = ref([])
const chatBoxRef = ref(null)

const showStoryModal = ref(false)
const showPhotosModal = ref(false)
const selectedCharacter = ref(null)

// 外部页面滚动控制
let isFirstRequest = true
let isScrollDetectionActive = false
let userHasScrolledPage = false
let lastScrollTime = 0
let lastChatHeight = 0
let scrollCheckInterval = null
let previousPageScrollTop = 0 // 上一次的页面滚动位置

const handlePageScroll = () => {
    if (!isScrollDetectionActive) return

    // 检查是否在程序滚动后的短时间内（50ms），如果是则跳过
    const now = Date.now()
    if (now - lastScrollTime < 50) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop

    // 如果向上滚动（scrollTop < previous），判定为用户滚动
    if (scrollTop < previousPageScrollTop) {
        userHasScrolledPage = true
        stopAutoScrollPage()
    }

    previousPageScrollTop = scrollTop
}

const stopAutoScrollPage = () => {
    if (scrollCheckInterval) {
        clearInterval(scrollCheckInterval)
        scrollCheckInterval = null
    }
}

const startAutoScrollPage = () => {
    lastChatHeight = 0
    isScrollDetectionActive = true

    scrollCheckInterval = setInterval(() => {
        if (userHasScrolledPage) {
            stopAutoScrollPage()
            return
        }

        // 检查聊天框高度
        const chatMessages = document.querySelector('.dialogue-area .chat-messages')
        if (chatMessages) {
            const maxHeight = 400 // 与 ChatBox 的 max-height 一致
            const currentHeight = chatMessages.clientHeight

            // 达到最大可见高度，停止滚动
            if (currentHeight >= maxHeight) {
                stopAutoScrollPage()
                return
            }

            lastChatHeight = currentHeight

            // 滚动到页面底部
            lastScrollTime = Date.now()
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'instant'
            })
        }
    }, 100)
}

onMounted(() => {
    window.addEventListener('scroll', handlePageScroll, {passive: true})
})

onUnmounted(() => {
    window.removeEventListener('scroll', handlePageScroll)
    stopAutoScrollPage()
})

const currentCharacters = computed(() => characterData[activeCategory.value] || [])

const selectCategory = (category) => {
    activeCategory.value = category
    activeCharacter.value = null
    messages.value = []
}

const selectCharacter = (character) => {
    activeCharacter.value = character
    messages.value = [{
        type: 'character',
        content: `${character.name}：${getCharacterWelcome(character.id)}`
    }]
}

const openStory = (character) => {
    selectedCharacter.value = character
    showStoryModal.value = true
}

const openPhotos = (character) => {
    selectedCharacter.value = character
    showPhotosModal.value = true
}

const sendMessage = (text) => {
    messages.value.push({type: 'user', content: text})

    // 模拟流式输出过程
    // 1. 先显示正在思考状态
    chatBoxRef.value?.setStatus('thinking')

    // 2. 1秒后切换到正在输出状态，并开始流式输出
    setTimeout(() => {
        chatBoxRef.value?.setStatus('streaming')

        // 第一次请求时，流式输出开始后启动外部页面滚动
        if (isFirstRequest) {
            userHasScrolledPage = false
            startAutoScrollPage()
        }

        // 添加一条空消息用于流式填充
        const msgIndex = messages.value.length
        const characterName = activeCharacter.value?.name || '智能体'
        messages.value.push({type: 'character', content: `${characterName}：`})

        // 3. 模拟逐字输出
        let charIndex = 0
        const streamInterval = setInterval(() => {
            if (charIndex < mockStreamReply.length) {
                messages.value[msgIndex].content += mockStreamReply[charIndex]
                charIndex++
            } else {
                clearInterval(streamInterval)
                // 4. 输出完成后恢复空闲状态
                setTimeout(() => {
                    chatBoxRef.value?.setStatus('idle')
                    // 第一次请求完成，停止外部页面滚动
                    if (isFirstRequest) {
                        isFirstRequest = false
                        isScrollDetectionActive = false
                        stopAutoScrollPage()
                    }
                }, 300)
            }
        }, 15) // 每15ms输出一个字符
    }, 1000)
}
</script>

<style scoped>
.dialogue-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* 分类选择 */
.category-selection {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.category-card {
    background: rgba(30, 45, 80, 0.6);
    border-radius: 10px;
    padding: 24px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
    --cat-color: #f0b344;
}

.category-card:hover {
    background: rgba(40, 58, 100, 0.7);
    border-color: var(--cat-color);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3),
    0 0 24px rgba(240, 179, 68, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.category-card:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

/*noinspection CssUnusedSymbol*/
.category-card.active {
    background: linear-gradient(145deg, rgba(240, 179, 68, 0.18) 0%, rgba(230, 57, 70, 0.18) 100%);
    border-color: var(--cat-color);
    box-shadow: 0 0 0 1px var(--cat-color),
    0 4px 20px rgba(240, 179, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.category-icon {
    font-size: 2.2rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.category-name {
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
}

/* 角色列表横向滚动 */
.character-scroll-wrapper {
    margin-bottom: 24px;
    overflow-x: auto;
    padding: 8px 4px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
}

.character-scroll-wrapper::-webkit-scrollbar {
    height: 4px;
}

.character-scroll-wrapper::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
}

.character-scroll-wrapper::-webkit-scrollbar-thumb {
    background: rgba(240, 179, 68, 0.4);
    border-radius: 2px;
}

.character-list {
    display: flex;
    gap: 14px;
    padding: 4px;
    min-width: min-content;
}

/* 对话区域 */
.dialogue-area {
    background: rgba(30, 45, 80, 0.5);
    border-radius: 10px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dialogue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.character-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.avatar-wrapper img,
.avatar-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 2px solid #f0b344;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.avatar-placeholder {
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: bold;
    color: #fff;
}

.info-text h3 {
    color: #f0b344;
    margin: 0 0 6px 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.info-text p {
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.action-btn:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.story-btn {
    background: linear-gradient(180deg, #4a9eff 0%, #2d7cd6 100%);
    color: #fff;
}

.story-btn:hover {
    background: linear-gradient(180deg, #5aadff 0%, #3d8ce6 100%);
}

.photo-btn {
    background: linear-gradient(180deg, #f0b344 0%, #d4962e 100%);
    color: #fff;
}

.photo-btn:hover {
    background: linear-gradient(180deg, #ffbe4a 0%, #e4a630 100%);
}

.dialogue-placeholder {
    text-align: center;
    padding: 60px 40px;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(30, 45, 80, 0.4);
    border-radius: 10px;
    border: 1px dashed rgba(240, 179, 68, 0.25);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

@media (max-width: 768px) {
    .category-selection {
        grid-template-columns: 1fr;
    }

    .dialogue-header {
        flex-direction: column;
        gap: 16px;
    }

    .action-buttons {
        width: 100%;
        justify-content: center;
    }
}
</style>
