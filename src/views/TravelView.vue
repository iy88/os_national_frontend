<template>
  <div class="travel-view">
    <CityMap @select-city="showCityDetail" />

    <!-- 城市详情弹窗 -->
    <el-dialog
      v-model="showCityModal"
      :title="currentCity?.name"
      width="800px"
      class="city-detail-modal"
    >
      <div class="city-content" v-if="currentCity">
        <div class="content-left">
          <!-- 电竞选手 -->
          <div class="info-section">
            <h3>🏆 电竞选手</h3>
            <div v-for="player in currentCity.players" :key="player.name" class="player-card">
              <strong>{{ player.name }}</strong> - {{ player.hero }}
              <br />
              <small>{{ player.team }}</small>
              <p>{{ player.desc }}</p>
            </div>
          </div>

          <!-- 代表英雄 -->
          <div class="info-section">
            <h3>🎮 代表英雄</h3>
            <div v-for="hero in currentCity.heroes" :key="hero.name" class="hero-card">
              <strong>{{ hero.name }}</strong> ({{ hero.role }})
              <br />
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

    <!-- AI 路线规划 -->
    <div class="ai-route-planner">
      <h2 class="section-title">AI 电竞文旅路线规划</h2>
      <div class="planner-form">
        <div class="form-row">
          <div class="form-item">
            <label>目标城市</label>
            <el-select v-model="selectedCity" placeholder="请选择城市" style="width: 100%">
              <el-option
                v-for="(name, key) in cityMap"
                :key="key"
                :label="name"
                :value="key"
              />
            </el-select>
          </div>
          <div class="form-item">
            <label>旅行天数</label>
            <el-input-number v-model="travelDays" :min="1" :max="7" style="width: 100%" />
          </div>
          <div class="form-item">
            <label>出行人数</label>
            <el-input-number v-model="travelPeople" :min="1" :max="10" style="width: 100%" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label>关系类型</label>
            <el-select v-model="travelRelationship" placeholder="请选择" style="width: 100%">
              <el-option label="好友同行" value="好友同行" />
              <el-option label="情侣出游" value="情侣出游" />
              <el-option label="家庭出行" value="家庭出行" />
              <el-option label="独自旅行" value="独自旅行" />
            </el-select>
          </div>
          <div class="form-item">
            <label>喜爱英雄</label>
            <el-select v-model="favoriteHero" placeholder="请选择" style="width: 100%">
              <el-option label="李白" value="libai" />
              <el-option label="武则天" value="wuzetian" />
              <el-option label="诸葛亮" value="zhuge" />
            </el-select>
          </div>
          <div class="form-item">
            <label>喜爱选手</label>
            <el-select v-model="favoritePlayer" placeholder="请选择" style="width: 100%">
              <el-option label="Fly" value="fly" />
              <el-option label="Cat" value="cat" />
              <el-option label="一诺" value="yinuo" />
            </el-select>
          </div>
        </div>
        <el-button type="primary" @click="generateRoute" class="generate-btn">
          生成专属路线
        </el-button>
      </div>

      <div v-if="showRouteResult" class="route-result">
        <div v-html="routeResult"></div>
      </div>
    </div>

    <!-- 电竞文旅对话 -->
    <div class="travel-chat-section">
      <h2 class="section-title">电竞文旅助手</h2>
      <ChatBox
        :messages="travelMessages"
        title="文旅助手"
        placeholder="咨询电竞文旅相关信息..."
        @send="sendTravelMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CityMap from '../components/CityMap.vue'
import ChatBox from '../components/ChatBox.vue'
import { cityDataList, cityMap } from '../data/cities'

const selectedCity = ref('')
const travelDays = ref(3)
const travelPeople = ref(2)
const travelRelationship = ref('')
const favoriteHero = ref('')
const favoritePlayer = ref('')
const routeResult = ref('')
const showRouteResult = ref(false)

const currentCity = ref(null)
const showCityModal = ref(false)

const travelMessages = ref([
  { type: 'character', content: '欢迎来到电竞文旅助手！有什么关于电竞城市的问题可以问我哦～' }
])

const showCityDetail = (cityKey) => {
  currentCity.value = cityDataList[cityKey]
  showCityModal.value = true
}

const generateRoute = () => {
  if (!selectedCity.value) {
    ElMessage.warning('请选择旅行城市！')
    return
  }

  const cityName = cityMap[selectedCity.value]
  const heroNames = { libai: '李白', wuzetian: '武则天', zhuge: '诸葛亮' }
  const playerNames = { fly: 'Fly', cat: 'Cat', yinuo: '一诺' }

  routeResult.value = `
    <p>🎉 为您定制<strong>${cityName}</strong>${travelDays.value}天电竞文旅路线：</p>
    <p>👥 同行人数：${travelPeople.value}人（${travelRelationship.value || '好友同行'}）</p>
    <p>⚔️ 本命英雄：${favoriteHero.value ? heroNames[favoriteHero.value] : '未选择'}</p>
    <p>🎮 喜爱选手：${favoritePlayer.value ? playerNames[favoritePlayer.value] : '未选择'}</p>
    <br>
    <p><strong>Day 1：</strong>${cityName}电竞主题场馆打卡 → 本地特色电竞餐厅体验</p>
    <p><strong>Day 2：</strong>${cityName}历史文化景点（王者荣耀联动点）→ 电竞周边商城购物</p>
    <p><strong>Day 3：</strong>${cityName}KPL赛事观赛（如有）→ 电竞主题酒吧交流</p>
    <br>
    <p>💡 贴士：建议提前预订${cityName}电竞酒店，携带王者荣耀周边增加体验感！</p>
  `
  showRouteResult.value = true
}

const sendTravelMessage = (text) => {
  travelMessages.value.push({ type: 'user', content: text })

  setTimeout(() => {
    const replies = [
      '您想了解哪个城市的电竞文旅信息呢？',
      '根据您的喜好，我推荐去上海看比赛～',
      '这个话题很有趣，让我来为您解答...',
      '建议您关注KPL赛事日历，获取最新资讯。'
    ]
    travelMessages.value.push({
      type: 'character',
      content: replies[Math.floor(Math.random() * replies.length)]
    })
  }, 800)
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

/* AI 路线规划 */
.ai-route-planner {
  background: rgba(30, 45, 80, 0.5);
  border-radius: 10px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.planner-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.generate-btn {
  margin-top: 12px;
  background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
  border: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow:
    0 2px 8px rgba(240, 179, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 14px rgba(240, 179, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.generate-btn:active {
  transform: translateY(0);
  box-shadow:
    0 1px 4px rgba(240, 179, 68, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.route-result {
  margin-top: 18px;
  padding: 18px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  border: 1px solid rgba(240, 179, 68, 0.2);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
}

.route-result :deep(p) {
  margin: 5px 0;
}

/* 电竞文旅对话 */
.travel-chat-section {
  background: rgba(30, 45, 80, 0.5);
  border-radius: 10px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
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
  .form-row {
    grid-template-columns: 1fr;
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

/* AI路线规划器 - 表单组件样式 */
.ai-route-planner .el-select .el-input__wrapper {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: none;
  border-radius: 6px;
}

.ai-route-planner .el-select .el-input__wrapper:hover {
  border-color: rgba(240, 179, 68, 0.4);
}

.ai-route-planner .el-select .el-input.is-focus .el-input__wrapper {
  border-color: #f0b344;
  box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15);
}

.ai-route-planner .el-input__inner {
  color: #fff;
  font-size: 14px;
}

.ai-route-planner .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.ai-route-planner .el-input-number {
  width: 100%;
}

.ai-route-planner .el-input-number .el-input__wrapper {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: none;
  border-radius: 6px;
}

.ai-route-planner .el-input-number .el-input__wrapper:hover {
  border-color: rgba(240, 179, 68, 0.4);
}

.ai-route-planner .el-input-number__decrease,
.ai-route-planner .el-input-number__increase {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.ai-route-planner .el-input-number__decrease:hover,
.ai-route-planner .el-input-number__increase:hover {
  color: #f0b344;
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
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
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
</style>
