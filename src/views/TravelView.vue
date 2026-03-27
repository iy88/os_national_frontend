<template>
    <div class="travel-view">
        <CityMap @select-city="showCityDetail"/>

        <!-- 城市详情弹窗 -->
        <el-dialog
            ref="cityDialogRef"
            v-model="showCityModal"
            :title="currentCity?.name"
            class="city-detail-modal"
            width="800px"
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

        <!-- 电竞文旅助手 -->
        <div class="travel-chat-section">
            <h2 class="section-title">电竞文旅助手</h2>

            <!-- 快速规划选项 -->
            <div class="quick-planners-wrap">
                <transition name="planner-collapse">
                    <div v-show="!plannersCollapsed" class="quick-planners">
                        <div class="planner-item">
                            <label>目标城市</label>
                            <el-select v-model="selectedCity" clearable placeholder="可选" style="width: 100%">
                                <el-option
                                    v-for="(name, key) in cityMap"
                                    :key="key"
                                    :label="name"
                                    :value="key"
                                />
                            </el-select>
                        </div>
                        <div class="planner-item">
                            <label>旅行天数</label>
                            <el-select v-model="travelDays" clearable placeholder="可选" style="width: 100%">
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
                            <label>出行人数</label>
                            <el-select v-model="travelPeople" clearable placeholder="可选" style="width: 100%">
                                <el-option :value="1" label="1人"/>
                                <el-option :value="2" label="2人"/>
                                <el-option :value="3" label="3-5人"/>
                                <el-option :value="5" label="5-10人"/>
                                <el-option :value="10" label="10人以上"/>
                            </el-select>
                        </div>
                        <div class="planner-item">
                            <label>关系类型</label>
                            <el-select v-model="travelRelationship" clearable placeholder="可选" style="width: 100%">
                                <el-option label="好友同行" value="好友同行"/>
                                <el-option label="情侣出游" value="情侣出游"/>
                                <el-option label="家庭出行" value="家庭出行"/>
                                <el-option label="独自旅行" value="独自旅行"/>
                            </el-select>
                        </div>
                        <div class="planner-item">
                            <label>本命英雄</label>
                            <el-select v-model="favoriteHero" clearable placeholder="可选" style="width: 100%">
                                <el-option label="李白" value="李白"/>
                                <el-option label="武则天" value="武则天"/>
                                <el-option label="诸葛亮" value="诸葛亮"/>
                            </el-select>
                        </div>
                    </div>
                </transition>

                <button
                    class="quick-planners-toggle"
                    type="button"
                    :aria-label="plannersCollapsed ? '展开快速规划选项' : '收起快速规划选项'"
                    @click="plannersCollapsed = !plannersCollapsed"
                >
                    <span class="toggle-text">快速规划</span>
                    <span :class="['toggle-chevron', plannersCollapsed ? 'down' : 'up']"></span>
                </button>
            </div>

            <ChatBox
                ref="chatBoxRef"
                :messages="travelMessages"
                :send-disabled="isProcessing"
                placeholder="请输入..."
                @send="sendTravelMessage"
            />
        </div>
    </div>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref} from 'vue'
import CityMap from '../components/CityMap.vue'
import ChatBox from '../components/ChatBox.vue'
import citiesData from '../data/cities.json'
import {useStreamTimers} from '../composables/useStreamTimers'
import {sendChatMessage} from '../api'

// 城市数据列表（直接使用 cities.json）
const cityDataList = citiesData

// 城市名称映射（key -> displayName）
const cityMap = Object.entries(citiesData).reduce((acc, [key, city]) => {
    if (city.displayName) {
        acc[key] = city.displayName
    }
    return acc
}, {})

const selectedCity = ref('')
const travelDays = ref(null)
const travelPeople = ref(null)
const travelRelationship = ref('')
const favoriteHero = ref('')
const plannersCollapsed = ref(false)

const currentCity = ref(null)
const showCityModal = ref(false)
const cityDialogRef = ref(null)
const cityContentRef = ref(null)
const chatBoxRef = ref(null)

// 会话状态
const currentSessionId = ref(null)
const streamingMsgIndex = ref(-1)
const isProcessing = ref(false) // 是否正在处理请求（禁用发送）
const activeStreamToken = ref(0)

// 流式输出定时器
const {streamIntervalRef, streamTimeoutRef, thinkingTimeoutRef, streamingCancelRef, clearStreamTimers, cancelStreaming} = useStreamTimers()

// 外部页面滚动控制
let isFirstRequest = true
let isScrollDetectionActive = false
let userHasScrolledPage = false
let lastScrollTime = 0
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
    isScrollDetectionActive = true

    scrollCheckInterval = setInterval(() => {
        if (userHasScrolledPage) {
            stopAutoScrollPage()
            return
        }

        // 检查聊天框高度
        const chatMessages = document.querySelector('.chat-messages')
        if (chatMessages) {
            const maxHeight = 400 // 与 ChatBox 的 max-height 一致
            const currentHeight = chatMessages.clientHeight

            // 达到最大可见高度，停止滚动
            if (currentHeight >= maxHeight) {
                stopAutoScrollPage()
                return
            }

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
    cancelStreaming()
})

const travelMessages = ref([
    {
        type: 'character', content: `欢迎来到电竞文旅助手！🎮

我是您的专属电竞文旅规划师，熟悉各大电竞城市特色、KPL赛事资讯以及王者荣耀联动打卡点。无论您是想规划路线、了解电竞文化还是获取观赛攻略，都可以告诉我！`
    }
])

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

    // 清理之前的定时器和 SSE 连接
    cancelStreaming()

    const cityName = selectedCity.value ? cityMap[selectedCity.value] : ''
    const hasPlanningInfo = cityName || travelDays.value || travelPeople.value || travelRelationship.value || favoriteHero.value

    let promptTemplate
    if (hasPlanningInfo) {
        promptTemplate = `【电竞文旅规划请求】
目标城市：${cityName || '未指定'}
旅行天数：${travelDays.value ? `${travelDays.value}天` : '未指定'}
出行人数：${travelPeople.value ? `${travelPeople.value}人` : '未指定'}
关系类型：${travelRelationship.value || '未指定'}
本命英雄：${favoriteHero.value || '未指定'}

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

    // 第一次请求时，启动外部页面滚动
    if (isFirstRequest) {
        userHasScrolledPage = false
        startAutoScrollPage()
    }

    // 监听 SSE 事件
    eventSource.onmessage = (e) => {
        if (streamToken !== activeStreamToken.value) return

        const data = e.data
        if (data.type === 'start') {
            streamStarted = true
            currentSessionId.value = data.sid
            // 添加一条空消息用于流式填充
            streamingMsgIndex.value = travelMessages.value.length
            travelMessages.value.push({type: 'character', content: ''})
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
            // 第一次请求完成，停止外部页面滚动
            if (isFirstRequest) {
                isFirstRequest = false
                isScrollDetectionActive = false
                stopAutoScrollPage()
            }
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
.travel-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.section-title {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* 快速规划选项 */
.quick-planners {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

.quick-planners-wrap {
    margin-bottom: 14px;
}

.quick-planners-toggle {
    margin: 10px auto 2px;
    min-width: 110px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.18);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
}

.quick-planners-toggle:hover {
    color: #fff;
    border-color: rgba(240, 179, 68, 0.4);
    background: rgba(240, 179, 68, 0.12);
}

.toggle-text {
    font-size: 12px;
    line-height: 1;
}

.toggle-chevron {
    width: 8px;
    height: 8px;
    border-left: 2px solid currentColor;
    border-top: 2px solid currentColor;
    display: inline-block;
    transition: transform 0.2s ease;
}

.toggle-chevron.up {
    transform: rotate(45deg) translateY(1px);
}

.toggle-chevron.down {
    transform: rotate(-135deg) translateY(-1px);
}

.planner-collapse-enter-active,
.planner-collapse-leave-active {
    transition: all 0.2s ease;
    transform-origin: top;
}

.planner-collapse-enter-from,
.planner-collapse-leave-to {
    opacity: 0;
    transform: scaleY(0.92);
}

.planner-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.planner-item label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
}

@media (max-width: 900px) {
    .quick-planners {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 600px) {
    .quick-planners {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 电竞文旅对话 */
.travel-chat-section {
    background: rgba(30, 45, 80, 0.5);
    border-radius: 10px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
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

@media (max-width: 768px) {
    .city-content {
        grid-template-columns: 1fr;
    }

    .tasks-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<style>
.city-detail-modal .el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    margin-top: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
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
    .city-detail-modal .el-dialog {
        width: 95% !important;
        max-width: 95vw;
        margin: 10px auto !important;
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
