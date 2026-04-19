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
                    @click="openRouteModal(route, 'readonly')"
                >
                    <div class="route-icon">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4l3 3"/>
                        </svg>
                    </div>
                    <div class="route-info">
                        <span class="route-name">{{ route.title || '未命名路线' }}</span>
                        <span class="route-meta">收藏于 {{ formatDate(route.createdAt) }}</span>
                    </div>
                    <div class="route-actions" @click.stop>
                        <button class="action-btn edit-btn" title="编辑" @click="openRouteModal(route, 'edit')">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn remove-btn" title="删除" @click="confirmDelete(route)">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path
                                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" x2="10" y1="11" y2="17"/>
                                <line x1="14" x2="14" y1="11" y2="17"/>
                            </svg>
                        </button>
                    </div>
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

        <!-- 路线详情/编辑弹窗 -->
        <el-dialog
            v-model="modalVisible"
            :close-on-click-modal="false"
            :title="modalMode === 'edit' ? '编辑路线' : '路线详情'"
            align-center
            append-to-body
            class="route-modal"
            modal-class="route-modal-overlay"
            width="90%"
        >
            <div class="modal-content">
                <div v-if="modalLoading" class="modal-loading">
                    <span class="loading-spinner"></span>
                    加载中...
                </div>
                <template v-else>
                    <div v-if="modalMode === 'edit'" class="modal-form">
                        <div class="form-item">
                            <label>标题</label>
                            <el-input v-model="editForm.title" placeholder="请输入路线标题"/>
                        </div>
                        <div class="form-item">
                            <label>内容</label>
                            <el-input
                                v-model="editForm.content"
                                :rows="10"
                                placeholder="请输入路线内容"
                                type="textarea"
                            />
                        </div>
                    </div>
                    <div v-else class="modal-view">
                        <h3 class="view-title">{{ currentRoute?.title || '未命名路线' }}</h3>
                        <div class="view-meta">收藏于 {{ formatDateFull(currentRoute?.createdAt) }}</div>
                        <div class="view-content" v-html="renderedContent()"></div>
                    </div>
                </template>
            </div>
            <template #footer>
                <div class="modal-footer">
                    <el-button v-if="modalMode === 'edit'" class="cancel-btn" @click="modalVisible = false">取消
                    </el-button>
                    <el-button v-if="modalMode === 'readonly'" type="primary" @click="modalVisible = false">确认
                    </el-button>
                    <el-button v-if="modalMode === 'edit'" :loading="saving" type="primary" @click="saveRoute">
                        保存
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 删除确认弹窗 -->
        <el-dialog
            v-model="deleteDialogVisible"
            align-center
            append-to-body
            class="delete-dialog"
            modal-class="delete-modal-overlay"
            title="确认删除"
            width="90%"
        >
            <p>确定要删除路线「{{ routeToDelete?.title || '未命名路线' }}」吗？此操作无法撤销。</p>
            <template #footer>
                <div class="modal-footer">
                    <el-button @click="deleteDialogVisible = false">取消</el-button>
                    <el-button :loading="deleting" type="danger" @click="executeDelete">删除</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useRouter} from 'vue-router'
import {useUserStore} from '../../stores/user'
import {editFavoriteRoute, getFavoriteRouteDetail} from '../../api'
import {ElMessage} from 'element-plus'
import {marked} from 'marked'
import DOMPurify from 'dompurify'

const router = useRouter()
const userStore = useUserStore()

const {collectedRoutes} = storeToRefs(userStore)

marked.setOptions({gfm: true, breaks: true})

// 弹窗状态
const modalVisible = ref(false)
const modalMode = ref('readonly') // 'readonly' | 'edit'
const modalLoading = ref(false)
const currentRoute = ref(null)
const editForm = ref({title: '', content: ''})
const saving = ref(false)

// 删除弹窗状态
const deleteDialogVisible = ref(false)
const routeToDelete = ref(null)
const deleting = ref(false)

onMounted(() => {
    userStore.fetchCollectedRoutes()
})

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDateFull = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const renderMarkdown = (content) => {
    if (!content) return ''
    const html = marked.parse(content)
    return DOMPurify.sanitize(html)
}

const renderedContent = () => {
    return renderMarkdown(currentRoute.value?.content || '')
}

const openRouteModal = async (route, mode) => {
    currentRoute.value = route
    modalMode.value = mode
    modalVisible.value = true

    // 获取完整详情（列表 API 不返回 content）
    modalLoading.value = true
    try {
        const result = await getFavoriteRouteDetail(route.rid)
        if (result.success && result.route) {
            currentRoute.value = result.route
        }
    } catch (error) {
        ElMessage.error('获取路线详情失败')
    } finally {
        modalLoading.value = false
    }

    if (mode === 'edit') {
        editForm.value = {
            title: currentRoute.value.title || '',
            content: currentRoute.value.content || ''
        }
    }
}

const saveRoute = async () => {
    if (!currentRoute.value) return

    saving.value = true
    try {
        // 先更新本地数据（表单已是最新）
        const index = collectedRoutes.value.findIndex(r => r.rid === currentRoute.value.rid)
        if (index !== -1) {
            collectedRoutes.value[index] = {
                ...collectedRoutes.value[index],
                title: editForm.value.title,
                content: editForm.value.content
            }
        }
        currentRoute.value.title = editForm.value.title
        currentRoute.value.content = editForm.value.content

        // 调用 API 保存到后端（返回数据无需处理）
        await editFavoriteRoute(currentRoute.value.rid, {
            title: editForm.value.title,
            content: editForm.value.content
        })

        ElMessage.success('保存成功')
        modalVisible.value = false
    } catch (error) {
        ElMessage.error(error.message || '保存失败')
    } finally {
        saving.value = false
    }
}

const confirmDelete = (route) => {
    routeToDelete.value = route
    deleteDialogVisible.value = true
}

const executeDelete = async () => {
    if (!routeToDelete.value) return

    deleting.value = true
    try {
        await userStore.removeCollectedRoute(routeToDelete.value.rid)
        ElMessage.success('已删除')
        deleteDialogVisible.value = false
        routeToDelete.value = null
    } catch (error) {
        ElMessage.error(error.message || '删除失败')
    } finally {
        deleting.value = false
    }
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
    background: rgba(20, 30, 55, 0.52);
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
    background: rgba(74, 158, 255, 0.16);
    color: #4a9eff;
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
    background: rgba(20, 30, 55, 0.52);
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

/* 操作按钮 */
.route-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border: 1px solid;
}

.action-btn svg {
    width: 16px;
    height: 16px;
}

.edit-btn {
    background: rgba(240, 179, 68, 0.1);
    border-color: rgba(240, 179, 68, 0.2);
    color: #f0b344;
}

.edit-btn:hover {
    background: rgba(240, 179, 68, 0.2);
    border-color: rgba(240, 179, 68, 0.35);
    transform: scale(1.05);
}

.remove-btn {
    background: rgba(230, 57, 70, 0.1);
    border-color: rgba(230, 57, 70, 0.2);
    color: #e63946;
}

.remove-btn:hover {
    background: rgba(230, 57, 70, 0.2);
    border-color: rgba(230, 57, 70, 0.35);
    transform: scale(1.05);
}

/* 弹窗样式 */
.modal-content {
    height: min(560px, calc(100vh - 240px), calc(100svh - 240px));
    max-height: min(560px, calc(100vh - 240px), calc(100svh - 240px));
    min-height: 340px;
    overflow: hidden;
    overscroll-behavior: contain;
}

.modal-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 100%;
    padding: 40px;
    color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #f0b344;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-item:last-child {
    flex: 1;
    min-height: 0;
}

.form-item label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
}

.form-item :deep(.el-textarea__inner) {
    background: rgba(15, 26, 42, 0.88);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    resize: none;
    height: 100%;
    min-height: 220px;
}

.form-item:last-child :deep(.el-textarea) {
    height: 100%;
}

.form-item :deep(.el-input__wrapper) {
    background: rgba(15, 26, 42, 0.88);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
}

.form-item :deep(.el-input__inner) {
    color: rgba(255, 255, 255, 0.9);
}

.modal-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}

.view-title {
    margin: 0;
    color: #f0b344;
    font-size: 1.2rem;
    font-weight: 600;
}

.view-meta {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
}

.view-content {
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    font-size: 0.95rem;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
}

@media (max-width: 900px) {
    :deep(.route-modal-overlay .el-overlay-dialog),
    :deep(.delete-modal-overlay .el-overlay-dialog) {
        padding: 14px 10px;
    }

    .modal-content {
        height: min(520px, calc(100vh - 220px), calc(100svh - 220px));
        max-height: min(520px, calc(100vh - 220px), calc(100svh - 220px));
        min-height: 300px;
    }

    .modal-footer {
        gap: 8px;
    }
}

.view-content :deep(h1),
.view-content :deep(h2),
.view-content :deep(h3) {
    color: rgba(255, 255, 255, 0.95);
    margin: 1em 0 0.5em;
}

.view-content :deep(p) {
    margin: 0.5em 0;
}

.view-content :deep(ul),
.view-content :deep(ol) {
    padding-left: 1.5em;
    margin: 0.5em 0;
}

.view-content :deep(code) {
    background: rgba(240, 179, 68, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
}

.view-content :deep(pre) {
    background: rgba(15, 26, 42, 0.88);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
}

.view-content :deep(pre code) {
    background: none;
    padding: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.modal-footer :deep(.cancel-btn) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.85);
}

.modal-footer :deep(.cancel-btn:hover) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
}

:deep(.route-modal-overlay),
:deep(.delete-modal-overlay) {
    overflow: hidden;
}

:deep(.route-modal-overlay .el-overlay-dialog),
:deep(.delete-modal-overlay .el-overlay-dialog) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 12px;
    box-sizing: border-box;
}

:deep(.route-modal-overlay .route-modal),
:deep(.delete-modal-overlay .delete-dialog) {
    margin: 0 !important;
    max-height: calc(100vh - 40px);
}

/* Element Plus 弹窗覆盖 */
:deep(.el-dialog) {
    background: rgba(20, 30, 55, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    max-width: 600px;
}

:deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px 20px;
}

:deep(.el-dialog__title) {
    color: #f0b344;
    font-weight: 600;
}

:deep(.el-dialog__body) {
    padding: 20px;
    color: rgba(255, 255, 255, 0.85);
}

:deep(.el-dialog__footer) {
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px 20px;
}

:deep(.delete-dialog) .el-dialog__body p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.6;
}

@media (max-width: 600px) {
    :deep(.el-dialog) {
        width: 95% !important;
        max-width: 95%;
    }

    :deep(.el-dialog__header) {
        padding: 14px 14px;
    }

    :deep(.el-dialog__body) {
        padding: 14px;
    }

    :deep(.el-dialog__footer) {
        padding: 12px 14px;
    }

    .modal-content {
        height: min(480px, calc(100vh - 210px), calc(100svh - 210px));
        max-height: min(480px, calc(100vh - 210px), calc(100svh - 210px));
        min-height: 260px;
    }

    .modal-form {
        gap: 12px;
    }

    .form-item:last-child :deep(.el-textarea__inner) {
        min-height: 160px;
    }

    .view-content {
        font-size: 0.9rem;
        line-height: 1.6;
    }
}
</style>
