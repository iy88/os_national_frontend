<template>
    <div :class="['travel-view', { 'mobile-layout': !isDesktopLayout }]">
        <!-- 地图区域 -->
        <section class="map-section" :class="{ 'chat-open': chatOpen && isDesktopLayout }">
            <div class="map-host">
                <CityMap @select-city="showCityDetail"/>
            </div>
        </section>

        <!-- 侧边聊天浮窗 -->
        <aside class="chat-sidebar" :class="{ open: chatOpen, mobile: !isDesktopLayout }">
            <button
                class="chat-toggle-btn"
                type="button"
                :aria-label="chatOpen ? '收起助手' : '展开助手'"
                @click="chatOpen = !chatOpen"
            >
                <span class="toggle-icon">💬</span>
                <span class="toggle-label">助手</span>
                <span v-if="!chatOpen" class="toggle-badge"></span>
            </button>

            <!-- 聊天头部 -->
            <div class="chat-header">
                <div class="chat-icon">🤖</div>
                <div class="chat-info">
                    <h3>电竞文旅助手</h3>
                    <p>在线 · 基于AI规划</p>
                </div>
                <button class="close-btn" type="button" @click="chatOpen = false">✕</button>
            </div>

            <!-- 快速规划选项 -->
            <div class="planners-bar">
                <div class="planner-item">
                    <label>目标</label>
                    <el-select v-model="selectedCity" clearable placeholder="可选">
                        <el-option
                            v-for="(name, key) in cityMap"
                            :key="key"
                            :label="name"
                            :value="key"
                        />
                    </el-select>
                </div>
                <div class="planner-item">
                    <label>天数</label>
                    <el-select v-model="travelDays" clearable placeholder="可选">
                        <el-option :value="1" label="1天"/>
                        <el-option :value="2" label="2天"/>
                        <el-option :value="3" label="3天"/>
                        <el-option :value="4" label="4天"/>
                        <el-option :value="5" label="5天"/>
                        <el-option :value="6" label="6天"/>
                        <el-option :value="7" label="7天"/>
                    </el-select>
                </div>
                <div class="planner-item">
                    <label>人数</label>
                    <el-select v-model="travelPeople" clearable placeholder="可选">
                        <el-option :value="1" label="1人"/>
                        <el-option :value="2" label="2人"/>
                        <el-option :value="3" label="3-5人"/>
                        <el-option :value="5" label="5-10人"/>
                        <el-option :value="10" label="10人以上"/>
                    </el-select>
                </div>
                <div class="planner-item">
                    <label>类型</label>
                    <el-select v-model="travelRelationship" clearable placeholder="可选">
                        <el-option label="好友同行" value="好友同行"/>
                        <el-option label="情侣出游" value="情侣出游"/>
                        <el-option label="家庭出行" value="家庭出行"/>
                        <el-option label="独自旅行" value="独自旅行"/>
                    </el-select>
                </div>
            </div>

            <!-- 聊天消息区域 -->
            <ChatBox
                ref="chatBoxRef"
                :messages="travelMessages"
                :send-disabled="isProcessing"
                placeholder="描述旅行需求..."
                @send="sendTravelMessage"
                @copy="handleCopyMessage"
                @favorite="handleFavoriteMessage"
                @navigate="handleNavigateToDetail"
            >
                <div v-if="travelMessages.length === 0" class="chat-welcome">
                    <div class="welcome-circle">
                        <span class="welcome-icon">✈️</span>
                    </div>
                    <p class="welcome-text">告诉我您的旅行需求，我来帮您规划</p>
                </div>
            </ChatBox>
        </aside>

        <!-- 城市详情弹窗 -->
        <el-dialog
            ref="cityDialogRef"
            v-model="showCityModal"
            :title="currentCity?.name"
            class="city-detail-modal"
            modal-class="city-detail-overlay"
            :width="cityDialogWidth"
        >
            <div v-if="currentCity" ref="cityContentRef" class="city-content">
                <div class="content-left">
                    <!-- 电竞选手 -->
                    <div class="info-section">
                        <h3>🏆 电竞选手</h3>
                        <div v-for="player in currentCity.players" :key="player.name" class="player-card">
                            <strong>{{ player.name }}</strong> - {{ player.hero }}
                            <br/>
                            <small>{{ player.team }}</small>
                            <p>{{ player.desc }}</p>
                        </div>
                    </div>

                    <!-- 代表英雄 -->
                    <div class="info-section">
                        <h3>🎮 代表英雄</h3>
                        <div v-for="hero in currentCity.heroes" :key="hero.name" class="hero-card">
                            <strong>{{ hero.name }}</strong> ({{ hero.role }})
                            <br/>
                            <small>风格：{{ hero.style }}</small>
                            <p>{{ hero.desc }}</p>
                        </div>
                    </div>
                </div>

                <div class="content-right">
                    <!-- 电竞特色 -->
                    <div class="info-section">
                        <h3>⚡ 电竞特色</h3>
                        <ul>
                            <li v-for="(info, idx) in currentCity.eSportsInfo" :key="idx">{{ info }}</li>
                        </ul>
                    </div>

                    <!-- 特色美食 -->
                    <div class="info-section">
                        <h3>🍜 特色美食</h3>
                        <ul>
                            <li v-for="(food, idx) in currentCity.food" :key="idx">{{ food }}</li>
                        </ul>
                    </div>

                    <!-- 出行建议 -->
                    <div class="info-section">
                        <h3>💡 出行建议</h3>
                        <ul>
                            <li v-for="(tip, idx) in currentCity.travelTips" :key="idx">{{ tip }}</li>
                        </ul>
                    </div>
                </div>

                <div class="content-full">
                    <!-- 电竞羁绊打卡任务 -->
                    <div class="info-section">
                        <h3>📍 电竞羁绊打卡任务</h3>
                        <div class="tasks-grid">
                            <div v-for="task in currentCity.tasks" :key="task.title" class="task-card">
                                <strong>{{ task.title }}</strong>
                                <p>{{ task.desc }}</p>
                                <span class="task-reward">奖励：{{ task.reward }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 推荐行程 -->
                    <div class="info-section">
                        <h3>🗓️ 推荐行程</h3>
                        <div v-for="(route, idx) in currentCity.recommendedRoutes" :key="idx" class="route-item">
                            {{ route }}
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import CityMap from '../components/CityMap.vue'
import ChatBox from '../components/ChatBox.vue'
import citiesData from '../data/cities.json'
import {useStreamTimers} from '../composables/useStreamTimers'
import {sendChatMessage, favoriteRoute} from '../api'
import {ElMessage} from 'element-plus'

// 城市数据列表（直接使用 cities.json）
const cityDataList = citiesData

// 城市名称映射（key -> displayName）
const cityMap = Object.entries(citiesData).reduce((acc, [key, city]) => {
    if (city.displayName) {
        acc[key] = city.displayName
    }
    return acc
}, {})

const SIDEBAR_WIDTH = 380
const getIsDesktopLayout = () => {
    if (typeof window === 'undefined') return true
    return window.innerWidth - SIDEBAR_WIDTH > window.innerHeight
}

const isDesktopLayout = ref(getIsDesktopLayout())
// 首帧按布局决定开关状态，避免移动端初始化时出现收拢动画
const chatOpen = ref(isDesktopLayout.value)

const selectedCity = ref('')
const travelDays = ref(null)
const travelPeople = ref(null)
const travelRelationship = ref('')

const currentCity = ref(null)
const showCityModal = ref(false)
const cityDialogRef = ref(null)
const cityContentRef = ref(null)
const chatBoxRef = ref(null)
const cityDialogWidth = ref('800px')

// 会话状态
const currentSessionId = ref(null)
const streamingMsgIndex = ref(-1)
const isProcessing = ref(false) // 是否正在处理请求（禁用发送）
const activeStreamToken = ref(0)

// 流式输出定时器
const {streamingCancelRef, cancelStreaming} = useStreamTimers()

const updateLayoutMode = () => {
    isDesktopLayout.value = getIsDesktopLayout()
}

const triggerMapReflow = () => {
    if (typeof window === 'undefined') return
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'))
        })
    })
}

// 消息操作处理
const handleCopyMessage = async (content) => {
    try {
        await navigator.clipboard.writeText(content)
        ElMessage.success('已复制到剪贴板')
    } catch {
        ElMessage.error('复制失败')
    }
}

const handleFavoriteMessage = async (mid) => {
    if (!mid) {
        ElMessage.warning('无法收藏此消息')
        return
    }
    try {
        await favoriteRoute(mid)
        ElMessage.success('已收藏到路线')
    } catch (error) {
        ElMessage.error(error.message || '收藏失败')
    }
}

const handleNavigateToDetail = () => {
    ElMessage.info('跳转详细规划页面')
}

const updateDialogWidth = () => {
    if (typeof window === 'undefined') return
    const viewportWidth = window.innerWidth
    if (viewportWidth <= 900) {
        cityDialogWidth.value = `${Math.max(280, viewportWidth - 24)}px`
        return
    }
    cityDialogWidth.value = '800px'
}

onMounted(() => {
    updateLayoutMode()
    updateDialogWidth()
    window.addEventListener('resize', updateLayoutMode)
    window.addEventListener('resize', updateDialogWidth)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateLayoutMode)
    window.removeEventListener('resize', updateDialogWidth)
    cancelStreaming()
})

watch([chatOpen, isDesktopLayout], () => {
    triggerMapReflow()
})

const travelMessages = ref([])

const showCityDetail = (cityKey) => {
    currentCity.value = cityDataList[cityKey]
    showCityModal.value = true
    nextTick(() => {
        const dialogBody = document.querySelector('.city-detail-modal .el-dialog__body')
        if (dialogBody) {
            dialogBody.scrollTop = 0
        }
    })
}

const sendTravelMessage = (text) => {
    const streamToken = Date.now()
    activeStreamToken.value = streamToken
    let streamStarted = false
    let streamFinished = false
    let hasAssistantOutput = false
    let hasEnteredStreaming = false

    // 清理之前的 SSE 连接
    cancelStreaming()

    const cityName = selectedCity.value ? cityMap[selectedCity.value] : ''
    const hasPlanningInfo = cityName || travelDays.value || travelPeople.value || travelRelationship.value

    let promptTemplate
    if (hasPlanningInfo) {
        promptTemplate = `【电竞文旅规划请求】
目标城市：${cityName || '未指定'}
旅行天数：${travelDays.value ? `${travelDays.value}天` : '未指定'}
出行人数：${travelPeople.value ? `${travelPeople.value}人` : '未指定'}
关系类型：${travelRelationship.value || '未指定'}

【用户需求】
${text}

请根据以上信息，为用户推荐合适的电竞文旅路线或解答相关问题。`
    } else {
        promptTemplate = text
    }

    travelMessages.value.push({type: 'user', content: promptTemplate})

    // 禁用发送，显示 thinking 状态
    isProcessing.value = true
    chatBoxRef.value?.setStatus('thinking')

    // 调用 API 发送消息
    const {eventSource, cancel} = sendChatMessage(promptTemplate, currentSessionId.value)
    streamingCancelRef.value = cancel

    // 监听 SSE 事件
    eventSource.onmessage = (e) => {
        if (streamToken !== activeStreamToken.value) return

        const data = e.data
        if (data.type === 'start') {
            streamStarted = true
            currentSessionId.value = data.sid
            // 添加一条空消息用于流式填充，存储 mid 用于收藏
            streamingMsgIndex.value = travelMessages.value.length
            travelMessages.value.push({type: 'character', content: '', mid: data.mid})
        } else if (data.type === 'content') {
            // 第一次收到非 start 的流内容时，切换为 streaming
            if (!hasEnteredStreaming) {
                chatBoxRef.value?.setStatus('streaming')
                hasEnteredStreaming = true
            }
            // 追加内容到气泡
            if (streamingMsgIndex.value >= 0) {
                travelMessages.value[streamingMsgIndex.value].content += data.content
                if (data.content) {
                    hasAssistantOutput = true
                }
            }
        } else if (data.type === 'done') {
            streamFinished = true
            // 输出完成，恢复空闲状态
            chatBoxRef.value?.setStatus('idle')
            // 取消 SSE 连接但不 abort fetch，让读取循环自然结束
            cancelStreaming(false)
            isProcessing.value = false
        }
    }

    eventSource.onerror = (error) => {
        if (streamToken !== activeStreamToken.value) return

        const message = error?.message || ''
        const isAbortLike = error?.name === 'AbortError' || /abort|aborted|load failed|failed to fetch/i.test(message)
        const shouldShowErrorText = !streamFinished && !isAbortLike && (!streamStarted || !hasAssistantOutput)

        chatBoxRef.value?.setStatus('idle')
        if (shouldShowErrorText && streamingMsgIndex.value >= 0) {
            travelMessages.value[streamingMsgIndex.value].content = '抱歉，发生错误，请重试。'
        }
        cancelStreaming()
        isProcessing.value = false
    }
}
</script>

<style scoped>
/* 布局 */
.travel-view {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
}

.travel-view.mobile-layout .map-section {
    transition: none;
}

/* 地图区域 */
.map-section {
    position: absolute;
    inset: 0;
    display: flex;
    flex: 1;
    min-height: 0;
    min-width: 0;
    margin-right: 0;
    transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-host {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
}

.map-host > :deep(*) {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.map-host :deep(.city-map) {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 0;
}

.map-section.chat-open {
    margin-right: 380px;
}

/* 聊天切换按钮 */
.chat-toggle-btn {
    position: absolute;
    left: -48px;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 60px;
    background: rgba(20, 30, 55, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-right: none;
    border-radius: 12px 0 0 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.65rem;
    transition: all 0.2s ease;
    z-index: 110;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.3);
}

.chat-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #f0b344;
}

.toggle-icon {
    font-size: 1.2rem;
}

.toggle-label {
    font-size: 0.65rem;
    line-height: 1;
}

.toggle-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #f0b344;
    border-radius: 50%;
}

/* 侧边聊天浮窗 */
.chat-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    width: 380px;
    height: 100%;
    background: #0f1a2a;
    border-left: 1px solid rgba(240, 179, 68, 0.15);
    display: flex;
    flex-direction: column;
    z-index: 100;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backface-visibility: hidden;
    will-change: transform;
}

.chat-sidebar.open {
    transform: translateX(0);
}

.chat-sidebar.mobile {
    width: 100%;
    height: 70%;
    min-height: 400px;
    max-height: 85%;
    top: auto;
    bottom: 0;
    border-left: none;
    border-top: 1px solid rgba(240, 179, 68, 0.15);
    border-radius: 20px 20px 0 0;
    transform: translateY(100%);
}

.chat-sidebar.mobile.open {
    transform: translateY(0);
}

.chat-sidebar.mobile .chat-toggle-btn {
    left: 50%;
    top: -36px;
    transform: translateX(-50%);
    width: 100px;
    height: 36px;
    flex-direction: row;
    gap: 6px;
    border-radius: 10px 10px 0 0;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: none;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.25);
}

.chat-sidebar.mobile .planners-bar {
    grid-template-columns: repeat(3, 1fr);
}

.chat-sidebar :deep(.chat-box) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
}

.chat-sidebar :deep(.chat-messages) {
    flex: 1;
    min-height: 0;
    max-height: none;
    display: flex;
    flex-direction: column;
}

/* 欢迎状态 */
.chat-welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 24px;
    text-align: center;
}

.welcome-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(30, 45, 80, 0.6);
    border: 2px solid rgba(240, 179, 68, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.welcome-circle::after {
    content: '';
    position: absolute;
    inset: -10px;
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
    font-size: 2rem;
    opacity: 0.7;
}

.welcome-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    max-width: 240px;
    line-height: 1.6;
    margin: 0;
}

/* 聊天头部 */
.chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(30, 45, 80, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

.chat-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #f0b344, #e63946);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
}

.chat-info {
    flex: 1;
}

.chat-info h3 {
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 2px 0;
}

.chat-info p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.7rem;
    margin: 0;
}

.close-btn {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(230, 57, 70, 0.2);
    border-color: rgba(230, 57, 70, 0.4);
    color: #e63946;
}

/* 快速规划选项栏 */
.planners-bar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;
    background: rgba(30, 45, 80, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

.planner-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.planner-item label {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.planner-item :deep(.el-select) {
    width: 100%;
}

.planner-item :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: none !important;
    border-radius: 6px !important;
    padding: 0 8px !important;
}

.planner-item :deep(.el-input__inner) {
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 0.75rem !important;
}

.planner-item :deep(.el-select__caret) {
    color: rgba(255, 255, 255, 0.4) !important;
}

/* 城市详情弹窗 */
.city-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
}

.content-full {
    grid-column: 1 / -1;
}

.info-section {
    background: rgba(0, 0, 0, 0.15);
    padding: 14px;
    border-radius: 6px;
    margin-bottom: 14px;
    border-left: 3px solid #f0b344;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.info-section h3 {
    color: #f0b344;
    margin: 0 0 10px 0;
    font-size: 0.95rem;
    font-weight: 600;
}

.info-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-section li {
    padding: 5px 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.88rem;
}

.player-card, .hero-card {
    background: rgba(0, 0, 0, 0.2);
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 8px;
}

.player-card strong, .hero-card strong {
    color: #f0b344;
}

.player-card small, .hero-card small {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
}

.player-card p, .hero-card p {
    margin: 5px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.task-card {
    background: linear-gradient(145deg, rgba(240, 179, 68, 0.08) 0%, rgba(230, 57, 70, 0.08) 100%);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid rgba(240, 179, 68, 0.2);
}

.task-card strong {
    color: #fff;
    font-weight: 500;
}

.task-card p {
    margin: 5px 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
}

.task-reward {
    display: inline-block;
    background: linear-gradient(145deg, #2a9d8f 0%, #238b7e 100%);
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 0.78rem;
    margin-top: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.route-item {
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.8);
}

/* 移动端适配 */
@media (max-width: 900px) {
    .chat-sidebar.mobile .planners-bar {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 600px) {
    .chat-sidebar.mobile .planners-bar {
        grid-template-columns: repeat(2, 1fr);
    }

    .city-content {
        grid-template-columns: 1fr;
    }

    .tasks-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<style>
.city-detail-modal.el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    max-width: calc(100vw - 24px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    margin: 0 !important;
    margin-top: 0 !important;
    top: auto !important;
    transform: none !important;
    box-sizing: border-box;
}

.city-detail-overlay .el-overlay-dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
}

.city-detail-modal .el-dialog__header {
    border-bottom: 1px solid rgba(240, 179, 68, 0.15);
    padding: 18px 20px;
}

.city-detail-modal .el-dialog__title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

.city-detail-modal .el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7);
}

.city-detail-modal .el-dialog__body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
}

.city-detail-modal .el-input__wrapper,
.city-detail-modal .el-select .el-input__wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    border-radius: 6px;
}

.city-detail-modal .el-input__inner,
.city-detail-modal .el-select-dropdown__item {
    color: #fff;
}

.city-detail-modal .el-select-dropdown {
    background: #1e2f55;
    border: 1px solid rgba(240, 179, 68, 0.2);
    border-radius: 6px;
}

.city-detail-modal .el-select-dropdown__item {
    color: rgba(255, 255, 255, 0.9);
}

.city-detail-modal .el-select-dropdown__item.hover,
.city-detail-modal .el-select-dropdown__item:hover {
    background: rgba(240, 179, 68, 0.15);
}

.city-detail-modal .el-input-number .el-input__wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    border-radius: 6px;
}

/* Select dropdown popup */
.el-select-dropdown {
    background: #1e2f55 !important;
    border: 1px solid rgba(240, 179, 68, 0.2) !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

.el-select-dropdown__item {
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 14px;
    line-height: 1 !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

.el-select-dropdown__item.selected {
    color: #f0b344 !important;
    font-weight: 600;
}

.el-popper.is-light {
    background: #1e2f55;
    border-color: rgba(240, 179, 68, 0.2);
}

.el-popper .el-popper__arrow::before {
    background: #1e2f55;
    border-color: rgba(240, 179, 68, 0.2);
}

/* Select dropdown 内部结构 - 确保透明背景 */
.el-select-dropdown__wrap {
    background: transparent !important;
}

.el-select-dropdown__list {
    background: transparent !important;
}

.el-select-dropdown__item {
    background: transparent none !important;
}

.el-scrollbar__wrap {
    background: transparent !important;
}

.el-scrollbar__bar {
    background: transparent !important;
}

.el-select-dropdown {
    background: #1e2f55 !important;
}

.el-select-dropdown__popper {
    background: #1e2f55 !important;
}

/* 选中项背景 - 关键修复 */
.el-select-dropdown__item.selected,
.el-select-dropdown__item.is-selected,
.el-select-dropdown__item[selected] {
    background-color: rgba(240, 179, 68, 0.2) !important;
    color: #f0b344 !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .city-detail-overlay .el-overlay-dialog {
        padding: 0;
    }

    .city-detail-modal.el-dialog {
        margin: 0 !important;
        top: auto !important;
        transform: none !important;
    }

    .city-detail-modal .el-dialog__body {
        padding: 12px;
        max-height: 70vh;
        overflow-y: auto;
    }

    .city-content {
        flex-direction: column;
    }

    .content-left,
    .content-right,
    .content-full {
        width: 100%;
        padding: 0;
    }

    .info-section {
        margin-bottom: 16px;
    }

    .info-section h3 {
        font-size: 1rem;
        margin-bottom: 8px;
    }

    .tasks-grid {
        grid-template-columns: 1fr;
    }
}
</style>
