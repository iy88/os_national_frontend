<template>
    <div class="favorite-routes">
        <!-- 统计卡片 -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon blue">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <span class="stat-value">{{ collectedRoutes.length }}</span>
                    <span class="stat-label">收藏路线</span>
                </div>
            </div>
        </div>

        <!-- 收藏列表 -->
        <div v-if="collectedRoutes.length > 0" class="routes-section">
            <div class="section-header">
                <h3 class="section-title">已收藏路线</h3>
                <span class="route-count">{{ collectedRoutes.length }} 条</span>
            </div>

            <div class="routes-list">
                <div
                    v-for="(route, index) in collectedRoutes"
                    :key="index"
                    class="route-item"
                >
                    <div class="route-icon">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                        </svg>
                    </div>
                    <div class="route-info">
                        <span class="route-name">{{ route }}</span>
                        <span class="route-meta">收藏于 {{ getDate(index) }}</span>
                    </div>
                    <button class="remove-btn" title="移除收藏" @click="removeRoute(route)">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <div class="empty-icon">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
            </div>
            <h3 class="empty-title">暂无收藏路线</h3>
            <p class="empty-desc">在文旅交互中发现感兴趣的路线，点击收藏即可在此处查看</p>
            <button class="browse-btn" @click="goToTravel">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                </svg>
                去逛逛
            </button>
        </div>
    </div>
</template>

<script setup>
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '../../stores/user'
import {ElMessage} from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const collectedRoutes = computed(() => userStore.collectedRoutes)

// 模拟收藏日期（实际项目中应该存储真实日期）
const getDate = (index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    return `${date.getMonth() + 1}月${date.getDate()}日`
}

const removeRoute = (route) => {
    userStore.removeCollectedRoute(route)
    ElMessage.success('已移除收藏')
}

const goToTravel = () => {
    router.push('/travel')
}
</script>

<style scoped>
.favorite-routes {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 统计卡片 */
.stats-row {
    display: flex;
    gap: 16px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    flex: 1;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon.blue {
    background: rgba(45, 92, 246, 0.15);
    color: #2d5cf6;
}

.stat-icon svg {
    width: 24px;
    height: 24px;
}

.stat-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-value {
    color: #fff;
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
}

.stat-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

/* 收藏列表 */
.routes-section {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 24px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.section-title {
    color: #f0b344;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

.route-count {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.routes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.route-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: rgba(240, 179, 68, 0.05);
    border: 1px solid rgba(240, 179, 68, 0.12);
    border-radius: 10px;
    transition: all 0.2s ease;
}

.route-item:hover {
    background: rgba(240, 179, 68, 0.08);
    border-color: rgba(240, 179, 68, 0.2);
    transform: translateX(4px);
}

.route-icon {
    width: 42px;
    height: 42px;
    background: rgba(240, 179, 68, 0.12);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f0b344;
    flex-shrink: 0;
}

.route-icon svg {
    width: 20px;
    height: 20px;
}

.route-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.route-name {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.route-meta {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
}

.remove-btn {
    width: 36px;
    height: 36px;
    background: rgba(230, 57, 70, 0.1);
    border: 1px solid rgba(230, 57, 70, 0.2);
    border-radius: 8px;
    color: #e63946;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.remove-btn svg {
    width: 16px;
    height: 16px;
}

.remove-btn:hover {
    background: rgba(230, 57, 70, 0.2);
    border-color: rgba(230, 57, 70, 0.35);
    transform: scale(1.05);
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    text-align: center;
}

.empty-icon {
    width: 80px;
    height: 80px;
    background: rgba(240, 179, 68, 0.08);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.empty-icon svg {
    width: 36px;
    height: 36px;
    color: rgba(240, 179, 68, 0.5);
}

.empty-title {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 8px 0;
}

.empty-desc {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    margin: 0 0 24px 0;
    max-width: 280px;
}

.browse-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3);
}

.browse-btn svg {
    width: 18px;
    height: 18px;
}

.browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(240, 179, 68, 0.4);
}
</style>
