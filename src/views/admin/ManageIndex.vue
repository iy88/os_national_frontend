<template>
    <div class="manage-index">
        <div class="page-header">
            <h1>后台概览</h1>
            <p class="subtitle">数据统计面板</p>
        </div>

        <div class="stats-grid">
            <!-- 用户统计 -->
            <div class="stat-card stat-users">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.users?.total || 0 }}</div>
                    <div class="stat-label">用户总数</div>
                    <div class="stat-sub">今日新增 {{ stats.users?.today_new || 0 }}</div>
                </div>
            </div>

            <!-- 角色统计 -->
            <div class="stat-card stat-characters">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.characters?.total || 0 }}</div>
                    <div class="stat-label">角色总数</div>
                    <div class="stat-sub">
                        <span class="type-dot" style="background: #f0b344"></span>
                        {{ stats.characters?.by_type?.game_expert || 0 }}
                        <span class="type-dot" style="background: #e63946"></span>
                        {{ stats.characters?.by_type?.esports_player || 0 }}
                        <span class="type-dot" style="background: #2a9d8f"></span>
                        {{ stats.characters?.by_type?.game_hero || 0 }}
                    </div>
                </div>
            </div>

            <!-- 会话统计 -->
            <div class="stat-card stat-sessions">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.sessions?.total || 0 }}</div>
                    <div class="stat-label">会话总数</div>
                    <div class="stat-sub">
                        旅行 {{ stats.sessions?.travel || 0 }} / 角色 {{ stats.sessions?.roleplay || 0 }}
                    </div>
                </div>
            </div>

            <!-- 消息统计 -->
            <div class="stat-card stat-messages">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <path
                            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.messages?.total || 0 }}</div>
                    <div class="stat-label">消息总数</div>
                    <div class="stat-sub">
                        旅行 {{ stats.messages?.travel || 0 }} / 角色 {{ stats.messages?.roleplay || 0 }}
                    </div>
                </div>
            </div>

            <!-- 路线统计 -->
            <div class="stat-card stat-routes">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.routes?.total || 0 }}</div>
                    <div class="stat-label">收藏路线</div>
                    <div class="stat-sub">用户收藏的路线</div>
                </div>
            </div>

            <!-- 文件统计 -->
            <div class="stat-card stat-files">
                <div class="stat-icon">
                    <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <div class="stat-value">{{ stats.files?.total || 0 }}</div>
                    <div class="stat-label">文件总数</div>
                    <div class="stat-sub">头像及图片文件</div>
                </div>
            </div>
        </div>

        <!-- 分布图表 -->
        <div class="charts-section">
            <!-- 角色分布 -->
            <div class="chart-card">
                <h3>角色分布</h3>
                <div class="character-bars">
                    <div class="bar-item">
                        <div class="bar-label">
                            <span class="type-dot" style="background: #f0b344"></span>
                            电竞达人
                        </div>
                        <div class="bar-track">
                            <div
                                :style="{
                                    width: getCharacterPercent('game_expert') + '%',
                                    background: 'var(--color-brand)'
                                }"
                                class="bar-fill"
                            ></div>
                        </div>
                        <div class="bar-value">{{ stats.characters?.by_type?.game_expert || 0 }}</div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">
                            <span class="type-dot" style="background: #e63946"></span>
                            电竞选手
                        </div>
                        <div class="bar-track">
                            <div
                                :style="{
                                    width: getCharacterPercent('esports_player') + '%',
                                    background: 'var(--color-brand-secondary)'
                                }"
                                class="bar-fill"
                            ></div>
                        </div>
                        <div class="bar-value">{{ stats.characters?.by_type?.esports_player || 0 }}</div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">
                            <span class="type-dot" style="background: #2a9d8f"></span>
                            游戏英雄
                        </div>
                        <div class="bar-track">
                            <div
                                :style="{
                                    width: getCharacterPercent('game_hero') + '%',
                                    background: '#2a9d8f'
                                }"
                                class="bar-fill"
                            ></div>
                        </div>
                        <div class="bar-value">{{ stats.characters?.by_type?.game_hero || 0 }}</div>
                    </div>
                </div>
            </div>

            <!-- 会话分布 -->
            <div class="chart-card">
                <h3>会话分布</h3>
                <div class="session-distribution">
                    <div class="session-bar">
                        <div :style="{ width: getSessionPercent('travel') + '%' }" class="session-segment">
                            {{ stats.sessions?.travel || 0 }}
                        </div>
                        <div :style="{ width: getSessionPercent('roleplay') + '%' }" class="session-segment travel">
                            {{ stats.sessions?.roleplay || 0 }}
                        </div>
                    </div>
                    <div class="session-legend">
                        <div class="legend-item">
                            <span class="legend-dot travel"></span>
                            旅行规划 {{ stats.sessions?.travel || 0 }}
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot roleplay"></span>
                            角色扮演 {{ stats.sessions?.roleplay || 0 }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {adminDashboard} from '../../api'
import {ElMessage} from 'element-plus'

const stats = ref({})

const fetchDashboard = async () => {
    try {
        const result = await adminDashboard()
        if (result?.success) {
            stats.value = result
        } else {
            ElMessage.error(result?.message || '获取统计数据失败')
        }
    } catch (error) {
        ElMessage.error('获取统计数据失败: ' + error.message)
    }
}

const getCharacterPercent = (type) => {
    const total = stats.value.characters?.total || 0
    if (total === 0) return 0
    const count = stats.value.characters?.by_type?.[type] || 0
    return Math.round((count / total) * 100)
}

const getSessionPercent = (type) => {
    const total = stats.value.sessions?.total || 0
    if (total === 0) return 0
    const count = stats.value.sessions?.[type] || 0
    return Math.round((count / total) * 100)
}

onMounted(() => {
    fetchDashboard()
})
</script>

<style scoped>
.manage-index {
    height: 100%;
    padding: 32px 40px;
    background: var(--color-bg-admin);
    position: relative;
    overflow-y: auto;
}

/* 右上角绿色光效 */
.manage-index::before {
    content: '';
    position: fixed;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--color-admin-soft-bg) 0%, var(--color-admin-soft-bg) 40%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
}

/* 左下角橙色光效 */
.manage-index::after {
    content: '';
    position: fixed;
    bottom: -20%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--color-orange-soft) 0%, transparent 70%);
    filter: blur(100px);
    z-index: 0;
    pointer-events: none;
}

.page-header {
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
}

h1 {
    color: var(--color-text-primary);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 4px;
}

.subtitle {
    color: var(--color-text-disabled);
    font-size: 0.9rem;
}

/* 统计卡片网格 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
}

.stat-card {
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border-divider);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    transition: all 0.2s;
}

.stat-card:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-input);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-users .stat-icon {
    background: var(--color-info);
    color: #fff;
}

.stat-characters .stat-icon {
    background: var(--color-admin);
    color: #fff;
}

.stat-sessions .stat-icon {
    background: var(--color-purple);
    color: #fff;
}

.stat-messages .stat-icon {
    background: var(--color-orange);
    color: #fff;
}

.stat-routes .stat-icon {
    background: var(--color-pink);
    color: #fff;
}

.stat-files .stat-icon {
    background: var(--color-cyan);
    color: #fff;
}

.stat-content {
    flex: 1;
    min-width: 0;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.2;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--color-text-faint);
    margin-top: 4px;
}

.stat-sub {
    font-size: 0.75rem;
    color: var(--color-text-disabled);
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.type-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

/* 图表区域 */
.charts-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    position: relative;
    z-index: 1;
}

.chart-card {
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border-divider);
    border-radius: 12px;
    padding: 20px;
}

.chart-card h3 {
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
}

/* 角色分布条形图 */
.character-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bar-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.bar-label {
    width: 80px;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.bar-track {
    flex: 1;
    height: 24px;
    background: var(--color-bg-hover);
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.bar-value {
    width: 30px;
    text-align: right;
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    font-weight: 500;
}

/* 会话分布 */
.session-distribution {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.session-bar {
    display: flex;
    height: 32px;
    border-radius: 6px;
    overflow: hidden;
    background: var(--color-bg-hover);
}

.session-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-primary);
    transition: width 0.5s ease;
    min-width: 40px;
}

.session-segment:first-child {
    background: var(--color-info);
}

.session-segment.travel {
    background: var(--color-purple);
}

.session-legend {
    display: flex;
    gap: 24px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.legend-dot.travel {
    background: var(--color-info);
}

.legend-dot.roleplay {
    background: var(--color-purple);
}

/* 响应式 */
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .charts-section {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .manage-index {
        padding: 16px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
