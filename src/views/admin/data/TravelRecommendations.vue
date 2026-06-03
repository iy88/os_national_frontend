<template>
    <div class="travel-recs-page">
        <div class="page-header">
            <h1>推荐管理</h1>
            <p class="subtitle">管理旅行目的地城市推荐</p>
        </div>

        <div class="filter-section">
            <el-input
                v-model="searchKeyword"
                class="search-input"
                clearable
                placeholder="搜索名称或显示名..."
                prefix-icon="Search"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-button class="add-btn" type="primary" @click="handleCreate">
                <svg fill="none" height="14" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="14"
                     style="margin-right: 4px;">
                    <line x1="12" x2="12" y1="5" y2="19"/>
                    <line x1="5" x2="19" y1="12" y2="12"/>
                </svg>
                新增
            </el-button>
        </div>

        <div class="table-container">
            <el-table
                v-loading="showTableLoading"
                :data="allRecs"
                class="recs-table"
                element-loading-background="rgba(9, 9, 11, 0.35)"
                stripe
            >
                <el-table-column label="名称" prop="name" min-width="180">
                    <template #default="{ row }">
                        <span class="primary-text">{{ row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="显示名" prop="display_name" width="120">
                    <template #default="{ row }">
                        <span class="display-name-tag">{{ row.display_name || '-' }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="中心坐标" width="200">
                    <template #default="{ row }">
                        <span class="coord-text">
                            {{ formatCoord(row.center_lon) }} , {{ formatCoord(row.center_lat) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="启用" prop="is_active" width="100">
                    <template #default="{ row }">
                        <span :class="['status-tag', row.is_active ? 'active' : 'inactive']">
                            {{ row.is_active ? '启用' : '停用' }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="更新时间" prop="updatedAt" width="180">
                    <template #default="{ row }">
                        <span class="time-text">{{ formatTime(row.updatedAt) }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="操作" width="260" fixed="right">
                    <template #default="{ row }">
                        <div class="action-buttons">
                            <el-button class="preview-btn" size="small" @click="handlePreview(row)">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                     style="margin-right: 4px;" viewBox="0 0 24 24" width="14">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                预览
                            </el-button>
                            <el-button class="edit-btn" size="small" @click="handleEdit(row)">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                     style="margin-right: 4px;" viewBox="0 0 24 24" width="14">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                编辑
                            </el-button>
                            <el-button class="delete-btn" size="small" @click="handleDelete(row)">
                                <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                     style="margin-right: 4px;" viewBox="0 0 24 24" width="14">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path
                                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <template #empty>
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg fill="none" height="32" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
                                 width="32">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                        <p class="empty-text">{{ searchKeyword ? '没有匹配的城市推荐' : '暂无推荐，点击右上角"新增"创建' }}</p>
                    </div>
                </template>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :layout="paginationLayout"
                    :page-sizes="[10, 20, 50]"
                    :total="total"
                    background
                />
            </div>
        </div>

        <!-- 预览弹窗（与用户端城市详情卡片风格一致） -->
        <el-dialog
            v-model="previewVisible"
            :title="previewRec?.name"
            :width="previewDialogWidth"
            class="preview-modal"
            destroy-on-close
        >
            <div v-if="previewRec" class="preview-content">
                <div class="content-left">
                    <div class="info-section">
                        <h3>🏆 电竞选手</h3>
                        <div v-for="(player, idx) in previewRec.players" :key="idx" class="player-card">
                            <strong>{{ player.name }}</strong> - {{ player.hero }}
                            <br/>
                            <small>{{ player.team }}</small>
                            <p>{{ player.description }}</p>
                        </div>
                        <div v-if="!previewRec.players?.length" class="empty-tip">暂无</div>
                    </div>

                    <div class="info-section">
                        <h3>🎮 代表英雄</h3>
                        <div v-for="(hero, idx) in previewRec.heroes" :key="idx" class="hero-card">
                            <strong>{{ hero.name }}</strong> ({{ hero.role }})
                            <br/>
                            <small>风格：{{ hero.style }}</small>
                            <p>{{ hero.description }}</p>
                        </div>
                        <div v-if="!previewRec.heroes?.length" class="empty-tip">暂无</div>
                    </div>
                </div>

                <div class="content-right">
                    <div class="info-section">
                        <h3>⚡ 电竞资讯</h3>
                        <ul>
                            <li v-for="(info, idx) in previewRec.esports_info" :key="idx">{{ info.content }}</li>
                        </ul>
                        <p v-if="!previewRec.esports_info?.length" class="empty-tip">暂无</p>
                    </div>

                    <div class="info-section">
                        <h3>🍜 特色美食</h3>
                        <ul>
                            <li v-for="(food, idx) in previewRec.foods" :key="idx">{{ food.content }}</li>
                        </ul>
                        <p v-if="!previewRec.foods?.length" class="empty-tip">暂无</p>
                    </div>

                    <div class="info-section">
                        <h3>💡 旅行贴士</h3>
                        <ul>
                            <li v-for="(tip, idx) in previewRec.travel_tips" :key="idx">{{ tip.content }}</li>
                        </ul>
                        <p v-if="!previewRec.travel_tips?.length" class="empty-tip">暂无</p>
                    </div>
                </div>

                <div class="content-full">
                    <div class="info-section">
                        <h3>📍 打卡任务</h3>
                        <div class="tasks-grid">
                            <div v-for="(task, idx) in previewRec.tasks" :key="idx" class="task-card">
                                <strong>{{ task.title }}</strong>
                                <p>{{ task.description }}</p>
                                <span class="task-reward">奖励：{{ task.reward }}</span>
                            </div>
                        </div>
                        <p v-if="!previewRec.tasks?.length" class="empty-tip">暂无</p>
                    </div>

                    <div class="info-section">
                        <h3>🗓️ 推荐路线</h3>
                        <div v-for="(route, idx) in previewRec.routes" :key="idx" class="route-item">
                            {{ route.content }}
                        </div>
                        <p v-if="!previewRec.routes?.length" class="empty-tip">暂无</p>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {adminDeleteTravelRec, adminListTravelRecs} from '../../../api'

const router = useRouter()

const allRecs = ref([])
const loading = ref(false)
const hasLoadedOnce = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const requestSeq = ref(0)

// 预览弹窗
const previewVisible = ref(false)
const previewRec = ref(null)
const previewDialogWidth = ref('800px')

const updatePreviewWidth = () => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    previewDialogWidth.value = w <= 900 ? `${Math.max(280, w - 24)}px` : '800px'
}

const isMobile = ref(false)
const updateViewport = () => {
    isMobile.value = typeof window !== 'undefined' && window.innerWidth <= 768
}

const paginationLayout = computed(() => {
    return isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
})

const showTableLoading = computed(() => loading.value && !hasLoadedOnce.value)

const fetchRecs = async () => {
    const currentRequest = ++requestSeq.value
    loading.value = true
    try {
        const result = await adminListTravelRecs({
            page: currentPage.value,
            page_size: pageSize.value,
            search: searchKeyword.value || undefined
        })
        if (currentRequest !== requestSeq.value) return
        if (result?.success) {
            allRecs.value = Array.isArray(result.recommendations) ? result.recommendations : []
            total.value = result.total || 0
        } else {
            ElMessage.error(result?.message || '获取推荐列表失败')
        }
    } catch (error) {
        if (currentRequest === requestSeq.value) {
            ElMessage.error('获取推荐列表失败: ' + (error?.message || ''))
        }
    } finally {
        if (currentRequest === requestSeq.value) {
            loading.value = false
            hasLoadedOnce.value = true
        }
    }
}

const handleSearch = () => {
    currentPage.value = 1
    fetchRecs()
}

const handleCreate = () => {
    router.push('/manage/data/travel-recommendations/form')
}

const handlePreview = (row) => {
    previewRec.value = row
    previewVisible.value = true
}

// el-dialog Teleport 到 body，EP 会动态设 overflow:auto，CSS 经常被覆盖；
// 这里用 DOM 直接操作，确保弹窗打开后强制覆盖为正确的滚动布局
const fixPreviewDialogLayout = () => {
    const el = document.querySelector('.preview-modal')
    if (!el) return
    const dialog = el.querySelector('.el-dialog') || el.closest('.el-dialog')
    if (!dialog) return
    ;(dialog).style.cssText += ';height:80vh;display:flex;flex-direction:column;overflow:hidden !important;margin-top:10vh'
    const body = dialog.querySelector('.el-dialog__body')
    if (body) {
        ;(body).style.cssText += ';flex:1 1 0;overflow-y:auto;min-height:0'
    }
}

watch(previewVisible, (v) => {
    if (v) nextTick(() => setTimeout(fixPreviewDialogLayout, 50))
})

const handleEdit = (row) => {
    router.push(`/manage/data/travel-recommendations/form/${row.id}`)
}

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除"${row.name}"吗？该操作将同时删除其下 7 张子表的所有数据，且不可恢复。`,
            '删除确认',
            {confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'}
        )
    } catch {
        return
    }
    try {
        const result = await adminDeleteTravelRec(row.id)
        if (result?.success) {
            ElMessage.success('删除成功')
            // 如果删空当前页，回到上一页
            if (allRecs.value.length === 1 && currentPage.value > 1) {
                currentPage.value -= 1
            } else {
                fetchRecs()
            }
        } else {
            ElMessage.error(result?.message || '删除失败')
        }
    } catch (error) {
        ElMessage.error('删除失败: ' + (error?.message || ''))
    }
}

const formatCoord = (val) => {
    if (val == null) return '-'
    return Number(val).toFixed(2)
}

const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

watch([currentPage, pageSize], () => fetchRecs())

onMounted(() => {
    updateViewport()
    updatePreviewWidth()
    window.addEventListener('resize', updateViewport)
    window.addEventListener('resize', updatePreviewWidth)
    fetchRecs()
})
</script>

<style scoped>
.travel-recs-page {
    height: 100%;
    padding: 32px 40px;
    background: var(--color-bg-admin);
    position: relative;
    overflow-y: auto;
}

.travel-recs-page::before {
    content: '';
    position: fixed;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--color-admin-soft-bg) 0%, transparent 70%);
    filter: blur(80px);
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

.filter-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}

.search-input {
    flex: 0 0 320px;
    max-width: 320px;
}

.add-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
}

.table-container {
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 16px;
    position: relative;
    z-index: 1;
}

.recs-table {
    width: 100%;
}

.recs-table :deep(.el-table__body-wrapper tr td) {
    background: var(--color-bg-admin-mid);
}

.recs-table :deep(.el-table__row--striped td) {
    background: var(--color-bg-admin-deep) !important;
}

.recs-table :deep(.el-table__body-wrapper tr:hover > td) {
    background: var(--color-admin-soft-bg-hover) !important;
}

.recs-table :deep(.el-table__row--striped:hover > td) {
    background: var(--color-admin-soft-bg-hover) !important;
}

.primary-text {
    color: var(--color-text-primary);
    font-weight: 500;
}

.display-name-tag {
    color: var(--color-admin);
    background: var(--color-admin-soft-bg);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
}

.coord-text {
    color: var(--color-text-muted);
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.85rem;
}

.status-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-tag.active {
    color: var(--color-admin);
    background: var(--color-admin-soft-bg);
    border: 1px solid var(--color-admin-soft-border);
}

.status-tag.inactive {
    color: var(--color-text-disabled);
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border-subtle);
}

.time-text {
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.edit-btn {
    padding: 4px 10px;
    background: var(--color-admin-soft-bg) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    color: var(--color-admin) !important;
    font-size: 0.8rem;
    border-radius: 4px;
}

.edit-btn:hover {
    background: var(--color-admin-soft-bg-hover) !important;
    border-color: var(--color-admin-soft-border-hover) !important;
}

.preview-btn {
    padding: 4px 10px;
    background: var(--color-brand-soft-bg) !important;
    border: 1px solid var(--color-brand-soft-border) !important;
    color: var(--color-brand-active) !important;
    font-size: 0.8rem;
    border-radius: 4px;
}

.preview-btn:hover {
    background: var(--color-brand-soft-border) !important;
    border-color: var(--color-brand-glow-strong) !important;
    color: var(--color-brand-active) !important;
}

.delete-btn {
    padding: 4px 10px;
    background: rgba(214, 57, 70, 0.1) !important;
    border: 1px solid rgba(214, 57, 70, 0.3) !important;
    color: var(--color-brand-secondary) !important;
    font-size: 0.8rem;
    border-radius: 4px;
}

.delete-btn:hover {
    background: var(--color-brand-secondary) !important;
    border-color: var(--color-brand-secondary) !important;
    color: #fff !important;
}

.pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
}

.pagination-container :deep(.el-pager li.is-active) {
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 0;
    color: var(--color-text-disabled);
}

.empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .travel-recs-page {
        padding: 16px;
    }

    .search-input {
        flex: 1;
        max-width: none;
    }
}
</style>

<!-- 预览弹窗样式（非 scoped：el-dialog 通过 Teleport 渲染到 <body>，scoped 规则无法命中） -->
<style>
.preview-modal .el-dialog {
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden !important;
    margin-top: 10vh;
}

.preview-modal .el-dialog__header {
    flex-shrink: 0;
}

.preview-modal .el-dialog__body {
    padding: 20px 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.preview-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
}

.content-full {
    grid-column: 1 / -1;
}

.info-section {
    background: var(--color-bg-admin-deep);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 12px;
}

.info-section h3 {
    color: var(--color-text-primary);
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 10px;
}

.info-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.info-section ul li {
    padding: 4px 0;
    border-bottom: 1px dashed var(--color-border-subtle);
    color: var(--color-text-secondary);
}

.info-section ul li:last-child {
    border-bottom: none;
}

.player-card,
.hero-card {
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
}

.player-card strong,
.hero-card strong {
    color: var(--color-admin);
    font-size: 0.9rem;
}

.player-card small,
.hero-card small {
    color: var(--color-text-disabled);
    font-size: 0.75rem;
}

.player-card p,
.hero-card p {
    margin: 6px 0 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px;
}

.task-card {
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 10px 12px;
}

.task-card strong {
    color: var(--color-brand);
    display: block;
    margin-bottom: 4px;
}

.task-card p {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    margin: 4px 0;
}

.task-reward {
    display: inline-block;
    margin-top: 6px;
    padding: 2px 8px;
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
    border-radius: 4px;
    font-size: 0.75rem;
}

.route-item {
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 6px;
    color: var(--color-text-secondary);
}

.preview-content .empty-tip {
    text-align: center;
    color: var(--color-text-disabled);
    font-size: 0.85rem;
    padding: 8px 0;
    margin: 0;
}

@media (max-width: 768px) {
    .preview-content {
        grid-template-columns: 1fr;
    }
}
</style>
