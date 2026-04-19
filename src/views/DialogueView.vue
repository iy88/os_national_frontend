<template>
    <div :style="dialogueViewportStyle" class="dialogue-view">
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
                    <button aria-label="选择角色" class="sidebar-add-btn" @click="openCharSelector">
                        <svg class="sidebar-add-icon" fill="none" stroke="currentColor" stroke-width="1.8"
                             viewBox="0 0 24 24">
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
                    @pointerdown="handleSidebarPointerDown"
                    @scroll.passive="handleSidebarScroll"
                >
                    <div v-if="currentSidebarLoading" class="sidebar-loading">角色加载中...</div>
                    <div v-else-if="currentSidebarError" class="sidebar-empty">{{ currentSidebarError }}</div>
                    <div v-else-if="!currentSidebarChars.length" class="sidebar-empty">暂无角色</div>
                    <div
                        v-for="char in currentSidebarChars"
                        :key="char.id"
                        :class="['sidebar-char-item', { active: activeCharacter?.id === char.id }]"
                        @click="selectCharacter(char)"
                    >
                        <div class="sidebar-char-avatar">
                            <img v-if="char.avatar" :alt="char.name" :src="char.avatar"/>
                            <div v-else class="avatar-placeholder">{{ char.name.charAt(0) }}</div>
                        </div>
                        <div class="sidebar-char-info">
                            <div class="sidebar-char-name">{{ char.name }}</div>
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
                            <button class="dropdown-btn"
                                    @click="openStory(activeCharacter); showAvatarDropdown = false">📖 故事
                            </button>
                            <button class="dropdown-btn"
                                    @click="openPhotos(activeCharacter); showAvatarDropdown = false">📷 照片
                            </button>
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
                    <div v-if="isHistoryLoading" class="history-loading">正在加载历史对话...</div>
                    <template v-else>
                        <div
                            v-for="(msg, index) in messages"
                            :key="index"
                            :class="['msg-row', msg.type]"
                        >
                            <div :class="msg.type === 'user' ? '' : 'ai'" class="msg-avatar">
                                {{ msg.type === 'user' ? '我' : activeCharacter.name.charAt(0) }}
                            </div>
                            <div class="msg-column">
                                <div class="msg-bubble">
                                    <div class="msg-content" v-html="renderMessageContent(msg.content)"></div>
                                </div>
                                <div
                                    v-if="msg.type === 'character' && msg.completed"
                                    :class="['msg-actions', { latest: isLatestCharacter(index) }]"
                                >
                                    <button class="action-btn" title="复制" @click="handleCopy(msg.content)">
                                        <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                             viewBox="0 0 24 24" width="14">
                                            <rect height="13" rx="2" ry="2" width="13" x="9" y="9"/>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                        </svg>
                                    </button>
                                    <button class="action-btn" title="重新生成" @click="handleRegenerate(msg.mid)">
                                        <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                             viewBox="0 0 24 24" width="14">
                                            <path d="M21 2v6h-6"/>
                                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                                            <path d="M3 22v-6h6"/>
                                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div v-if="streamStatus === 'thinking'" class="msg-row status-row">
                            <div class="msg-avatar ai">{{ activeCharacter.name.charAt(0) }}</div>
                            <div class="msg-bubble">
                                <span class="msg-content">正在思考...</span>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- 底部输入 -->
                <div v-if="activeCharacter" class="input-bar">
                    <div class="input-row">
                        <div class="input-placeholder">
                            <input
                                ref="inputRef"
                                v-model="inputText"
                                :disabled="streamStatus !== 'idle' || isHistoryLoading"
                                :placeholder="`与 ${activeCharacter.name} 对话...`"
                                @keydown.enter.prevent="handleSend"
                            />
                        </div>
                        <button
                            :disabled="streamStatus !== 'idle' || isHistoryLoading || !inputText.trim()"
                            class="send-btn"
                            @click="handleSend"
                        >
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
                <div class="panel-body" @scroll="handlePanelScroll">
                    <div v-if="selectorLoading" class="selector-loading">角色加载中...</div>
                    <div v-else-if="selectorError" class="selector-empty">{{ selectorError }}</div>
                    <div v-else-if="!selectorCharacters.length" class="selector-empty">暂无角色</div>
                    <div v-else class="char-grid">
                        <div
                            v-for="char in selectorCharacters"
                            :key="char.id"
                            :class="['char-card', { active: activeCharacter?.id === char.id }]"
                            @click="selectCharacter(char); showCharSelector = false"
                        >
                            <div class="char-avatar-block">{{ char.name.charAt(0) }}</div>
                            <div class="char-name">{{ char.name }}</div>
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
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {marked} from 'marked'
import DOMPurify from 'dompurify'
import StoryModal from '../components/StoryModal.vue'
import PhotoGallery from '../components/PhotoGallery.vue'
import {useStreamTimers} from '../composables/useStreamTimers'
import {
    getRoleplayCharacterDetail,
    getRoleplayCharacterList,
    getRoleplayMessageList,
    sendRoleplayMessageStream
} from '../api'

const categoryInfo = {
    hero: {
        name: '游戏英雄',
        icon: '🗡️',
        color: '#f0b344'
    },
    player: {
        name: '电竞选手',
        icon: '🏆',
        color: '#e63946'
    },
    celebrity: {
        name: '电竞明星',
        icon: '🎮',
        color: '#2a9d8f'
    }
}

const route = useRoute()
const router = useRouter()

marked.setOptions({
    gfm: true,
    breaks: true
})

const roleplayTypeMap = Object.freeze({
    hero: 'game_hero',
    player: 'esports_player',
    celebrity: 'game_expert'
})


const createPlaceholderSvg = (name, color, subtitle = '电竞人物') => {
    const safeName = String(name || '角色').slice(0, 14)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.34" />
        <stop offset="100%" style="stop-color:#1a2b5f;stop-opacity:0.92" />
      </linearGradient>
    </defs>
    <rect width="320" height="320" fill="url(#grad)"/>
    <circle cx="160" cy="118" r="52" fill="${color}" opacity="0.65"/>
    <text x="160" y="226" text-anchor="middle" fill="#fff" font-size="26" font-weight="bold">${safeName}</text>
    <text x="160" y="262" text-anchor="middle" fill="rgba(255,255,255,0.66)" font-size="14">${subtitle}</text>
  </svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const buildMockPhotos = (name, color) => {
    return [
        createPlaceholderSvg(`${name}-1`, color, '角色画面'),
        createPlaceholderSvg(`${name}-2`, color, '互动场景'),
        createPlaceholderSvg(`${name}-3`, color, '高光瞬间')
    ]
}

const buildMockStory = (name, categoryKey, detail = null) => {
    const categoryName = categoryInfo[categoryKey]?.name || '电竞角色'
    const bio = typeof detail?.bio === 'string' ? detail.bio.trim() : ''
    const phraseList = Array.isArray(detail?.phrases)
        ? detail.phrases.filter(item => typeof item === 'string' && item.trim())
        : []

    const intro = bio || `${name}是一位${categoryName}，随时可以与你展开沉浸式对话。`
    if (!phraseList.length) {
        return `${intro}\n\n和TA聊聊你的问题，看看这位角色会给出怎样的回应。`
    }

    return `${intro}\n\n常用语：\n${phraseList.map(item => `- ${item}`).join('\n')}`
}

const buildWelcomeMessage = (character) => {
    return `你好，我是${character.name}。${character.desc || '很高兴认识你。'}`
}

const mapRoleplayMessage = (msg) => ({
    type: msg?.role === 'user' ? 'user' : 'character',
    content: typeof msg?.content === 'string' ? msg.content : '',
    mid: msg?.mid ?? null,
    createdAt: msg?.createdAt || null,
    completed: true
})

const renderMessageContent = (content) => {
    if (!content) return ''
    const html = marked.parse(content)
    return DOMPurify.sanitize(typeof html === 'string' ? html : '')
}

const mapRoleplayCharacter = (item, categoryKey) => {
    const color = categoryInfo[categoryKey]?.color || '#f0b344'
    const rid = Number(item?.rid)
    const name = typeof item?.name === 'string' && item.name.trim()
        ? item.name.trim()
        : `角色${Number.isFinite(rid) ? rid : ''}`

    return {
        id: Number.isFinite(rid) ? rid : `${categoryKey}-${Date.now()}`,
        rid,
        categoryKey,
        roleplayType: roleplayTypeMap[categoryKey],
        name,
        avatar: item?.avatar_token
            ? `/file/image/fetch?token=${item.avatar_token}`
            : createPlaceholderSvg(name, color),
        story: buildMockStory(name, categoryKey),
        photos: buildMockPhotos(name, color),
        createdAt: item?.createdAt || null,
        detailLoaded: false
    }
}

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
const isHistoryLoading = ref(false)
const streamStatus = ref('idle')
const hasIncompleteMessage = ref(false)
const incompleteMid = ref(null)
const charactersByCategory = reactive({
    hero: [],
    player: [],
    celebrity: []
})
const categoryLoading = reactive({
    hero: false,
    player: false,
    celebrity: false
})
const categoryError = reactive({
    hero: '',
    player: '',
    celebrity: ''
})
const categoryRequestToken = reactive({
    hero: 0,
    player: 0,
    celebrity: 0
})
// 每类角色的分页状态
const paginationState = reactive({
    hero: {page: 1, total: 0, hasMore: true},
    player: {page: 1, total: 0, hasMore: true},
    celebrity: {page: 1, total: 0, hasMore: true}
})

const activeCharacterRequestToken = ref(0)
const activeStreamToken = ref(0)
let sidebarScrollbarHideTimer = null
let viewportRafId = 0
let streamingUnwatch = null

// 路由参数解析与同步
const reverseCategoryMap = Object.freeze({
    game_hero: 'hero',
    esports_player: 'player',
    game_expert: 'celebrity'
})

const parseParamsFromQuery = (query) => {
    const type = typeof query.type === 'string' ? query.type.trim().toLowerCase() : ''
    const ridRaw = Array.isArray(query.rid) ? query.rid[0] : query.rid
    const rid = Number(ridRaw)
    if (!type || !reverseCategoryMap[type] || !Number.isInteger(rid) || rid <= 0) {
        return null
    }
    return {
        type,
        categoryKey: reverseCategoryMap[type],
        rid
    }
}

const hasCharacterByRid = (categoryKey, rid) => {
    const list = charactersByCategory[categoryKey] || []
    return list.some(item => Number(item.rid) === rid)
}

const syncCharacterWithRoute = async (query) => {
    const params = parseParamsFromQuery(query)
    if (!params) return

    const {type, categoryKey, rid} = params

    // 确保列表已加载
    if (!charactersByCategory[categoryKey]?.length) {
        await loadCategoryCharacters(categoryKey)
    }

    // 检查角色是否已在列表中
    if (!hasCharacterByRid(categoryKey, rid)) return

    const currentChar = activeCharacter.value
    if (currentChar && Number(currentChar.rid) === rid) {
        // 相同角色，不需要切换
        return
    }

    // 查找并选中该角色
    const char = charactersByCategory[categoryKey].find(item => Number(item.rid) === rid)
    if (char) {
        await selectCharacter(char)
        // 更新 URL 参数
        router.replace({query: {type, rid}})
    }
}

const charactersReady = ref(false)

// 用户滚动检测
let userHasScrolled = false
let previousScrollTop = 0

const handleMessagesScroll = () => {
    if (!messagesAreaRef.value) return
    const {scrollTop} = messagesAreaRef.value
    // 如果向上滚动，判定为用户滚动
    if (scrollTop < previousScrollTop) {
        userHasScrolled = true
        if (streamingUnwatch) {
            streamingUnwatch()
            streamingUnwatch = null
        }
    }
    previousScrollTop = scrollTop
}

// 流式输出定时器
const {streamingCancelRef, cancelStreaming, clearStreamTimers} = useStreamTimers()

const selectorCharacters = computed(() => charactersByCategory[selectorCategory.value] || [])
const currentSidebarChars = computed(() => charactersByCategory[activeSidebarTab.value] || [])
const currentSidebarLoading = computed(() => categoryLoading[activeSidebarTab.value])
const currentSidebarError = computed(() => categoryError[activeSidebarTab.value])
const selectorLoading = computed(() => categoryLoading[selectorCategory.value])
const selectorError = computed(() => categoryError[selectorCategory.value])

const latestCharacterIndex = computed(() => {
    for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].type === 'character') return i
    }
    return -1
})

const isLatestCharacter = (index) => index === latestCharacterIndex.value

const showCategoryErrorToast = (categoryKey, message) => {
    const shouldShow = activeSidebarTab.value === categoryKey || (showCharSelector.value && selectorCategory.value === categoryKey)
    if (shouldShow) {
        ElMessage.error(message)
    }
}

const stopActiveStream = ({keepIdleStatus = true} = {}) => {
    activeStreamToken.value = Date.now()
    cancelStreaming()
    if (streamingUnwatch) {
        streamingUnwatch()
        streamingUnwatch = null
    }
    if (keepIdleStatus) {
        streamStatus.value = 'idle'
    }
}

const updateCharacterInCategory = (character, updates) => {
    const list = charactersByCategory[character.categoryKey] || []
    const targetIndex = list.findIndex(item => Number(item.rid) === Number(character.rid))
    if (targetIndex < 0) return

    list[targetIndex] = {
        ...list[targetIndex],
        ...updates
    }
}

const loadCategoryCharacters = async (categoryKey, page = 1, {silent = false} = {}) => {
    const roleplayType = roleplayTypeMap[categoryKey]
    if (!roleplayType) return

    const requestToken = Date.now()
    categoryRequestToken[categoryKey] = requestToken
    if (!silent) {
        categoryLoading[categoryKey] = true
    }
    categoryError[categoryKey] = ''

    try {
        const result = await getRoleplayCharacterList(roleplayType, {page, page_size: 20})
        if (categoryRequestToken[categoryKey] !== requestToken) return
        if (!result?.success) {
            throw new Error(result?.message || '角色列表加载失败')
        }

        const characterList = Array.isArray(result?.characters)
            ? result.characters.map(item => mapRoleplayCharacter(item, categoryKey))
            : []

        // 第一页或重置，替换列表；后续页追加
        if (page === 1) {
            charactersByCategory[categoryKey] = characterList
        } else {
            charactersByCategory[categoryKey] = [
                ...(charactersByCategory[categoryKey] || []),
                ...characterList
            ]
        }

        // 更新分页状态
        const total = result.total || 0
        const pagination = paginationState[categoryKey]
        pagination.total = total
        pagination.hasMore = page * 20 < total
        pagination.page = page

        // 合并已选角色
        if (activeCharacter.value?.categoryKey === categoryKey) {
            const matched = characterList.find(item => Number(item.rid) === Number(activeCharacter.value.rid))
            if (matched) {
                const merged = {...matched, ...activeCharacter.value}
                const matchedIndex = charactersByCategory[categoryKey].findIndex(
                    item => Number(item.rid) === Number(merged.rid)
                )
                if (matchedIndex >= 0) {
                    charactersByCategory[categoryKey].splice(matchedIndex, 1, merged)
                }
                activeCharacter.value = merged
                selectedCharacter.value = merged
            }
        }

        // 预取下一页（只在非静默加载时触发，避免无限递归）
        if (pagination.hasMore && !silent) {
            preloadNextPage(categoryKey, page + 1)
        }
    } catch (error) {
        if (categoryRequestToken[categoryKey] !== requestToken) return
        const message = error?.message || '角色列表加载失败'
        if (page === 1 && !silent) {
            charactersByCategory[categoryKey] = []
        }
        categoryError[categoryKey] = message
        if (!silent) {
            showCategoryErrorToast(categoryKey, message)
        }
    } finally {
        if (categoryRequestToken[categoryKey] === requestToken && !silent) {
            categoryLoading[categoryKey] = false
        }
    }
}

const preloadNextPage = (categoryKey, page) => {
    const pagination = paginationState[categoryKey]
    if (!pagination || !pagination.hasMore) return
    // 延迟一帧执行，避免阻塞当前渲染和重复请求
    setTimeout(() => {
        if (categoryLoading[categoryKey]) return
        loadCategoryCharacters(categoryKey, page, {silent: true})
    }, 50)
}

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

const loadMoreSidebarCharacters = () => {
    if (loadMoreTimer) return
    const category = activeSidebarTab.value
    const pagination = paginationState[category]
    if (!pagination || !pagination.hasMore || categoryLoading[category]) return

    loadMoreTimer = setTimeout(() => {
        loadMoreTimer = null
        loadCategoryCharacters(category, pagination.page + 1)
    }, 200)
}

const handleSidebarScroll = (e) => {
    showSidebarScrollbar(1200)

    // 预取逻辑：滚动过 70% 即触发加载，而非等到底部
    const el = e.target
    const {scrollTop, scrollHeight, clientHeight} = el
    const scrollRatio = scrollHeight > 0 ? (scrollTop + clientHeight) / scrollHeight : 0
    const shouldPrefetch = scrollRatio > 0.7

    if (shouldPrefetch) {
        loadMoreSidebarCharacters()
    }
}

const handlePanelScroll = (e) => {
    if (!showCharSelector.value) return
    const el = e.target
    const {scrollTop, scrollHeight, clientHeight} = el
    // 预取逻辑：滚动过 70% 即触发加载，而非等到底部
    const scrollRatio = scrollHeight > 0 ? (scrollTop + clientHeight) / scrollHeight : 0
    const shouldPrefetch = scrollRatio > 0.7

    if (shouldPrefetch) {
        loadMoreSelectorCharacters()
    }
}

let loadMoreTimer = null
const loadMoreSelectorCharacters = () => {
    if (loadMoreTimer) return
    const category = selectorCategory.value
    const pagination = paginationState[category]
    if (!pagination || !pagination.hasMore || categoryLoading[category]) return

    loadMoreTimer = setTimeout(() => {
        loadMoreTimer = null
        loadCategoryCharacters(category, pagination.page + 1)
    }, 200)
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

const loadCharacterDetail = async (character, requestToken) => {
    // 防止重复获取详情（但如果已有 desc 则直接使用）
    if (character.detailLoaded && character.desc) return

    try {
        const result = await getRoleplayCharacterDetail(character.rid)
        if (requestToken !== activeCharacterRequestToken.value) return
        if (!result?.success || !result?.character) return

        const detail = result.character
        const bio = typeof detail.bio === 'string' ? detail.bio.trim() : ''
        const phrases = Array.isArray(detail.phrases)
            ? detail.phrases.filter(item => typeof item === 'string' && item.trim())
            : []
        const updates = {
            desc: bio || character.desc,
            story: buildMockStory(character.name, character.categoryKey, {bio, phrases}),
            detailLoaded: true,
            photos: Array.isArray(detail.images_token)
                ? detail.images_token.map(token => `/file/image/fetch?token=${token}`)
                : character.photos,
            avatar: detail.avatar_token
                ? `/file/image/fetch?token=${detail.avatar_token}`
                : character.avatar,
            phrases
        }

        updateCharacterInCategory(character, updates)

        if (activeCharacter.value && Number(activeCharacter.value.rid) === Number(character.rid)) {
            activeCharacter.value = {
                ...activeCharacter.value,
                ...updates
            }
            selectedCharacter.value = activeCharacter.value
        }
    } catch (error) {
        if (requestToken !== activeCharacterRequestToken.value) return
        ElMessage.warning(error?.message || '角色详情加载失败')
    }
}

const loadCharacterMessages = async (character, requestToken) => {
    isHistoryLoading.value = true

    try {
        const result = await getRoleplayMessageList(character.rid)
        if (requestToken !== activeCharacterRequestToken.value) return
        if (!result?.success) {
            throw new Error(result?.message || '历史消息加载失败')
        }

        const serverIncompleteMid = Number(result?.incompleteMid)
        const hasServerIncomplete = Number.isInteger(serverIncompleteMid) && serverIncompleteMid > 0
        hasIncompleteMessage.value = hasServerIncomplete
        incompleteMid.value = hasServerIncomplete ? serverIncompleteMid : null

        const history = Array.isArray(result?.messages)
            ? result.messages.map(mapRoleplayMessage)
            : []

        messages.value = history.length
            ? history
            : [{
                type: 'character',
                content: buildWelcomeMessage(character),
                completed: true
            }]

        userHasScrolled = false
        previousScrollTop = 0
        scrollToBottom()
    } catch (error) {
        if (requestToken !== activeCharacterRequestToken.value) return
        hasIncompleteMessage.value = false
        incompleteMid.value = null
        messages.value = [{
            type: 'character',
            content: buildWelcomeMessage(character),
            completed: true
        }]
        ElMessage.error(error?.message || '历史消息加载失败')
    } finally {
        if (requestToken === activeCharacterRequestToken.value) {
            isHistoryLoading.value = false
        }
    }
}

const resumeIncompleteStream = (character, resumeMid, requestToken) => {
    const normalizedMid = Number(resumeMid)
    if (!character || !Number.isInteger(normalizedMid) || normalizedMid <= 0) return

    let streamStarted = false
    let streamFinished = false
    let hasAssistantOutput = false
    let hasEnteredStreaming = false

    stopActiveStream({keepIdleStatus: false})
    const streamToken = Date.now()
    activeStreamToken.value = streamToken
    streamStatus.value = 'thinking'

    const {eventSource, cancel} = sendRoleplayMessageStream(character.rid, null, normalizedMid)
    streamingCancelRef.value = cancel

    let streamingMidValue = normalizedMid
    let streamingMsgIndex = messages.value.findIndex(msg => Number(msg.mid) === normalizedMid)

    eventSource.onmessage = (e) => {
        if (streamToken !== activeStreamToken.value) return
        if (requestToken !== activeCharacterRequestToken.value) return

        const data = e.data

        if (data.type === 'start') {
            streamStarted = true
            streamingMidValue = Number(data.mid) || normalizedMid
            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.findIndex(msg => Number(msg.mid) === streamingMidValue)
            }
            return
        }

        if (data.type === 'catchup') {
            const catchupContent = typeof data.content === 'string' ? data.content : ''
            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.length
                messages.value.push({
                    type: 'character',
                    content: catchupContent,
                    mid: streamingMidValue,
                    completed: false
                })
            } else {
                messages.value[streamingMsgIndex].mid = streamingMidValue
                if (catchupContent) {
                    messages.value[streamingMsgIndex].content = catchupContent
                }
                messages.value[streamingMsgIndex].completed = false
            }

            hasEnteredStreaming = true
            hasAssistantOutput = Boolean(messages.value[streamingMsgIndex]?.content?.trim())
            streamStatus.value = 'streaming'
            return
        }

        if (data.type === 'content') {
            if (!hasEnteredStreaming) {
                hasEnteredStreaming = true
                streamStatus.value = 'streaming'
            }

            const chunk = typeof data.content === 'string' ? data.content : ''
            if (!chunk) return

            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.length
                messages.value.push({
                    type: 'character',
                    content: chunk,
                    mid: streamingMidValue,
                    completed: false
                })
            } else {
                messages.value[streamingMsgIndex].content += chunk
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'error') {
            const errorMessage = typeof data.message === 'string'
                ? data.message
                : '生成失败，请稍后重试。'

            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.length
                messages.value.push({
                    type: 'character',
                    content: errorMessage,
                    mid: streamingMidValue,
                    completed: true
                })
            } else {
                messages.value[streamingMsgIndex].content = errorMessage
                messages.value[streamingMsgIndex].completed = true
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'done') {
            streamFinished = true

            if (streamingMsgIndex >= 0) {
                const finalContent = messages.value[streamingMsgIndex]?.content || ''
                if (!finalContent.trim()) {
                    messages.value.splice(streamingMsgIndex, 1)
                } else {
                    messages.value[streamingMsgIndex].completed = true
                }
            }

            hasIncompleteMessage.value = false
            incompleteMid.value = null
            streamStatus.value = 'idle'
            cancelStreaming(false)
        }
    }

    eventSource.onerror = (error) => {
        if (streamToken !== activeStreamToken.value) return
        if (requestToken !== activeCharacterRequestToken.value) return

        const isAbortLike =
            error?.name === 'AbortError' ||
            /abort|aborted|load failed|failed to fetch/i.test(error?.message || '')

        if (!streamFinished && !isAbortLike && (!streamStarted || !hasAssistantOutput)) {
            ElMessage.error('恢复未完成对话失败，请稍后重试')
        }

        streamStatus.value = 'idle'
        cancelStreaming()
    }
}

const selectCharacter = async (character) => {
    stopActiveStream()

    const requestToken = Date.now()
    activeCharacterRequestToken.value = requestToken

    activeCharacter.value = {...character}
    selectedCharacter.value = activeCharacter.value
    messages.value = []
    inputText.value = ''
    showAvatarDropdown.value = false

    // 更新路由参数
    const type = roleplayTypeMap[character.categoryKey]
    router.replace({query: {type, rid: character.rid}})

    await Promise.all([
        loadCharacterMessages(activeCharacter.value, requestToken),
        loadCharacterDetail(activeCharacter.value, requestToken)
    ])

    if (requestToken !== activeCharacterRequestToken.value) return
    if (hasIncompleteMessage.value && incompleteMid.value) {
        resumeIncompleteStream(activeCharacter.value, incompleteMid.value, requestToken)
    }
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
    nextTick(() => {
        if (messagesAreaRef.value) {
            messagesAreaRef.value.scrollTop = messagesAreaRef.value.scrollHeight
        }
    })
}

const handleSend = () => {
    const text = inputText.value.trim()
    if (!text || !activeCharacter.value || streamStatus.value !== 'idle') return

    stopActiveStream({keepIdleStatus: false})
    const streamToken = Date.now()
    activeStreamToken.value = streamToken

    // 重置用户滚动状态
    userHasScrolled = false
    previousScrollTop = 0

    // 如果第一条消息是欢迎消息（用户还没发过言），则移除
    if (messages.value.length === 1 && messages.value[0].type === 'character') {
        messages.value.shift()
    }

    messages.value.push({type: 'user', content: text, completed: true})
    inputText.value = ''
    streamStatus.value = 'thinking'

    let streamStarted = false
    let streamFinished = false
    let hasAssistantOutput = false
    let streamingMsgIndex = -1
    let streamingMid = null

    const {eventSource, cancel} = sendRoleplayMessageStream(activeCharacter.value.rid, text)
    streamingCancelRef.value = cancel

    eventSource.onmessage = (e) => {
        if (streamToken !== activeStreamToken.value) return
        const data = e.data

        if (data.type === 'start') {
            streamStarted = true
            streamingMid = data.mid
            return
        }

        if (data.type === 'content') {
            if (streamStatus.value !== 'streaming') {
                streamStatus.value = 'streaming'
            }

            const chunk = typeof data.content === 'string' ? data.content : ''
            if (!chunk) return

            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.length
                messages.value.push({
                    type: 'character',
                    content: chunk,
                    mid: streamingMid || data.mid || null,
                    completed: false
                })
            } else {
                messages.value[streamingMsgIndex].content += chunk
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'error') {
            const errorMessage = typeof data.message === 'string'
                ? data.message
                : '生成失败，请稍后重试。'

            if (streamingMsgIndex < 0) {
                streamingMsgIndex = messages.value.length
                messages.value.push({
                    type: 'character',
                    content: errorMessage,
                    mid: streamingMid || data.mid || null,
                    completed: true
                })
            } else {
                messages.value[streamingMsgIndex].content = errorMessage
                messages.value[streamingMsgIndex].completed = true
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'done') {
            streamFinished = true

            if (streamingMsgIndex >= 0) {
                const finalContent = messages.value[streamingMsgIndex]?.content || ''
                if (!finalContent.trim()) {
                    messages.value.splice(streamingMsgIndex, 1)
                } else {
                    messages.value[streamingMsgIndex].completed = true
                }
            }

            streamStatus.value = 'idle'
            cancelStreaming(false)
        }
    }

    eventSource.onerror = (error) => {
        if (streamToken !== activeStreamToken.value) return

        const isAbortLike =
            error?.name === 'AbortError' ||
            /abort|aborted|load failed|failed to fetch/i.test(error?.message || '')

        if (!streamFinished && !isAbortLike && (!streamStarted || !hasAssistantOutput)) {
            messages.value.push({
                type: 'character',
                content: '抱歉，发生错误，请稍后重试。',
                completed: true
            })
            ElMessage.error('消息发送失败，请稍后重试')
        }

        streamStatus.value = 'idle'
        cancelStreaming()
    }
}

const handleCopy = async (content) => {
    // 优先使用现代 Clipboard API，失败则降级到 execCommand
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(content)
            ElMessage.success('已复制到剪贴板')
            return
        } catch {
            // fallthrough to fallback
        }
    }
    // 降级方案：临时 textarea + execCommand
    try {
        const textarea = document.createElement('textarea')
        textarea.value = content
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        ElMessage.success('已复制到剪贴板')
    } catch {
        ElMessage.error('复制失败')
    }
}

const handleRegenerate = async (mid) => {
    if (!mid || !activeCharacter.value || streamStatus.value !== 'idle') return

    const midNum = Number(mid)
    const oldMsgIndex = messages.value.findIndex(m => Number(m.mid) === midNum)
    if (oldMsgIndex < 0) {
        ElMessage.warning('未找到要重新生成的消息')
        return
    }

    stopActiveStream({keepIdleStatus: false})
    const streamToken = Date.now()
    activeStreamToken.value = streamToken

    // 立即撤销旧回复内容，显示「正在思考...」状态
    const regenerateInsertIndex = oldMsgIndex
    messages.value.splice(oldMsgIndex, 1)

    streamStatus.value = 'thinking'

    let streamStarted = false
    let streamFinished = false
    let hasAssistantOutput = false
    let hasEnteredStreaming = false
    let streamingMsgIndex = -1
    let streamingMid = null

    const {eventSource, cancel} = sendRoleplayMessageStream(activeCharacter.value.rid, null, null, midNum)
    streamingCancelRef.value = cancel

    eventSource.onmessage = (e) => {
        if (streamToken !== activeStreamToken.value) return
        const data = e.data

        if (data.type === 'start') {
            streamStarted = true
            streamingMid = data.mid
            return
        }

        if (data.type === 'content') {
            if (!hasEnteredStreaming) {
                hasEnteredStreaming = true
                streamStatus.value = 'streaming'
                if (streamingMsgIndex >= 0) {
                    messages.value[streamingMsgIndex].completed = false
                }
            }

            const chunk = typeof data.content === 'string' ? data.content : ''
            if (!chunk) return

            if (streamingMsgIndex < 0) {
                const insertIndex = Math.min(regenerateInsertIndex, messages.value.length)
                streamingMsgIndex = insertIndex
                messages.value.splice(insertIndex, 0, {
                    type: 'character',
                    content: chunk,
                    mid: streamingMid || data.mid || null,
                    completed: false
                })
            } else {
                if (!hasAssistantOutput) {
                    messages.value[streamingMsgIndex].content = chunk
                } else {
                    messages.value[streamingMsgIndex].content += chunk
                }
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'error') {
            const errorMessage = typeof data.message === 'string'
                ? data.message
                : '生成失败，请稍后重试。'

            if (streamingMsgIndex < 0) {
                const insertIndex = Math.min(regenerateInsertIndex, messages.value.length)
                streamingMsgIndex = insertIndex
                messages.value.splice(insertIndex, 0, {
                    type: 'character',
                    content: errorMessage,
                    mid: streamingMid || data.mid || null,
                    completed: true
                })
            } else {
                messages.value[streamingMsgIndex].content = errorMessage
                messages.value[streamingMsgIndex].completed = true
            }

            hasAssistantOutput = true
            return
        }

        if (data.type === 'done') {
            streamFinished = true

            if (streamingMsgIndex >= 0) {
                const finalContent = messages.value[streamingMsgIndex]?.content || ''
                if (!finalContent.trim()) {
                    messages.value.splice(streamingMsgIndex, 1)
                } else {
                    messages.value[streamingMsgIndex].completed = true
                }
            }

            streamStatus.value = 'idle'
            cancelStreaming(false)
        }
    }

    eventSource.onerror = (error) => {
        if (streamToken !== activeStreamToken.value) return

        const isAbortLike =
            error?.name === 'AbortError' ||
            /abort|aborted|load failed|failed to fetch/i.test(error?.message || '')

        if (!streamFinished && !isAbortLike && (!streamStarted || !hasAssistantOutput)) {
            messages.value.push({
                type: 'character',
                content: '抱歉，发生错误，请稍后重试。',
                completed: true
            })
            ElMessage.error('消息发送失败，请稍后重试')
        }

        streamStatus.value = 'idle'
        cancelStreaming()
    }
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

watch(
    () => activeSidebarTab.value,
    (newCategory) => {
        // 避免重复请求：若该分类已有数据则不再重新加载（保留滚动增量结果）
        if (!charactersByCategory[newCategory]?.length) {
            loadCategoryCharacters(newCategory)
        }
    }
)

watch(
    () => selectorCategory.value,
    (newCategory) => {
        if (!showCharSelector.value) return
        // 重置分页状态
        paginationState[newCategory].page = 1
        paginationState[newCategory].hasMore = true
        loadCategoryCharacters(newCategory, 1)
    }
)

watch(
    () => showCharSelector.value,
    (visible) => {
        if (!visible) return
        // 只加载第1页
        paginationState[selectorCategory.value].page = 1
        paginationState[selectorCategory.value].hasMore = true
        loadCategoryCharacters(selectorCategory.value, 1)
    }
)

watch(
    () => messages.value.length,
    () => {
        scrollToBottom()
    }
)

watch(streamStatus, (newStatus) => {
    if (newStatus === 'streaming') {
        userHasScrolled = false

        if (streamingUnwatch) {
            streamingUnwatch()
            streamingUnwatch = null
        }

        streamingUnwatch = watch(
            () => messages.value[messages.value.length - 1]?.content.length ?? 0,
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
        if (streamingUnwatch) {
            streamingUnwatch()
            streamingUnwatch = null
        }
    }
})

onMounted(async () => {
    updateDynamicViewportHeight()
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('resize', scheduleViewportHeightUpdate)
    window.addEventListener('orientationchange', scheduleViewportHeightUpdate)
    window.visualViewport?.addEventListener('resize', scheduleViewportHeightUpdate)
    window.visualViewport?.addEventListener('scroll', scheduleViewportHeightUpdate)

    // 预加载所有分类角色列表
    await Promise.all([
        loadCategoryCharacters('hero'),
        loadCategoryCharacters('player'),
        loadCategoryCharacters('celebrity')
    ])
    charactersReady.value = true

    // 路由参数同步
    if (parseParamsFromQuery(route.query)) {
        await syncCharacterWithRoute(route.query)
    }
})

// 监听路由变化（用户通过浏览器前进/后退时处理）
watch(
    () => [route.query.type, route.query.rid],
    async () => {
        if (!charactersReady.value) return
        if (parseParamsFromQuery(route.query)) {
            await syncCharacterWithRoute(route.query)
        }
    }
)

onUnmounted(() => {
    if (viewportRafId) {
        cancelAnimationFrame(viewportRafId)
        viewportRafId = 0
    }
    stopActiveStream()
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

.sidebar-loading,
.sidebar-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.58);
    text-align: center;
    padding: 10px 8px;
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
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.sidebar-char-item:hover {
    background: rgba(240, 179, 68, 0.08);
    border-color: rgba(240, 179, 68, 0.25);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.sidebar-char-item.active {
    background: linear-gradient(135deg, rgba(240, 179, 68, 0.15), rgba(14, 165, 233, 0.1));
    border-color: rgba(240, 179, 68, 0.4);
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.15);
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
    display: flex;
    align-items: center;
}

.sidebar-char-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
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

.history-loading {
    width: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.56);
    font-size: 0.85rem;
    padding: 24px 0;
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

.msg-column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.msg-row.user .msg-column {
    align-items: flex-end;
}

.status-row {
    max-width: 80%;
}

.status-row .msg-bubble {
    border-style: dashed;
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
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
}

.msg-content :deep(p) {
    margin: 0 0 8px;
}

.msg-content :deep(p:last-child) {
    margin-bottom: 0;
}

.msg-content :deep(ul),
.msg-content :deep(ol) {
    margin: 8px 0;
    padding-left: 20px;
}

.msg-content :deep(li + li) {
    margin-top: 4px;
}

.msg-content :deep(a) {
    color: #89c3ff;
    text-decoration: underline;
}

.msg-content :deep(strong) {
    font-weight: 700;
}

.msg-content :deep(blockquote) {
    margin: 8px 0;
    padding: 6px 12px;
    border-left: 3px solid rgba(240, 179, 68, 0.45);
    color: rgba(255, 255, 255, 0.72);
    background: rgba(0, 0, 0, 0.18);
    border-radius: 6px;
}

.msg-content :deep(code) {
    background: rgba(0, 0, 0, 0.32);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.86em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.msg-content :deep(pre) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    overflow-x: auto;
    margin: 8px 0;
}

.msg-content :deep(pre code) {
    background: transparent;
    padding: 0;
    font-size: 0.85rem;
    line-height: 1.5;
}

.msg-actions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.msg-row:hover .msg-actions,
.msg-row:active .msg-actions,
.msg-actions.latest {
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

.input-placeholder input:disabled {
    color: rgba(255, 255, 255, 0.45);
    cursor: not-allowed;
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

.send-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

.selector-loading,
.selector-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
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
