<template>
    <div class="roles-page">
        <div class="page-header">
            <h1>角色管理</h1>
            <p class="subtitle">管理游戏角色数据</p>
        </div>

        <div class="filter-section">
            <el-radio-group v-model="selectedCategory" class="category-tabs">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="game_expert">游戏达人</el-radio-button>
                <el-radio-button value="esports_player">电竞选手</el-radio-button>
                <el-radio-button value="game_hero">游戏英雄</el-radio-button>
            </el-radio-group>

            <el-input
                v-model="searchKeyword"
                class="search-input"
                clearable
                placeholder="搜索名称或描述..."
                prefix-icon="Search"
            />
            <el-button class="add-btn" type="primary" @click="openCreateModal">新增</el-button>
        </div>

        <div class="table-container">
            <div ref="tableScrollRef" class="table-scroll">
                <div class="table-inner">
                    <el-table
                        ref="tableRef"
                        v-loading="showTableLoading"
                        :data="paginatedCharacters"
                        class="roles-table"
                        element-loading-background="rgba(9, 9, 11, 0.35)"
                        height="100%"
                        stripe
                    >
                        <el-table-column align="center" label="头像" width="80">
                            <template #default="{ row }">
                                <img v-if="row.avatar" :src="row.avatar" class="avatar"/>
                                <div v-else class="avatar-placeholder">{{ row.name?.charAt(0) || '?' }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="名称" prop="name" width="100">
                            <template #default="{ row }">
                                <span v-html="row._highlight?.name || row.name"></span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="分类" prop="type" width="120">
                            <template #default="{ row }">
                                <span
                                    :style="{
                                        color: categoryMap[row.type]?.color,
                                        borderColor: categoryMap[row.type]?.color + '40',
                                        backgroundColor: categoryMap[row.type]?.color + '15'
                                    }"
                                    class="type-tag"
                                >
                                    {{ categoryMap[row.type]?.label || row.type }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="简介" min-width="120">
                            <template #default="{ row }">
                                <span v-html="row._highlight?.bio || row.bio || '-'"></span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="创建时间" prop="createdAt" width="160">
                            <template #default="{ row }">
                                <span class="time-text">{{ formatTime(row.createdAt) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" label="操作" width="200">
                            <template #default="{ row }">
                                <div class="action-buttons">
                                    <el-button
                                        class="edit-btn"
                                        size="small"
                                        @click="openEditModal(row)"
                                    >
                                        <svg fill="none" height="14" stroke="currentColor" stroke-width="2"
                                             style="margin-right: 4px;" viewBox="0 0 24 24" width="14">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        编辑
                                    </el-button>
                                    <el-button
                                        class="delete-btn"
                                        size="small"
                                        @click="handleDelete(row)"
                                    >
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
                    </el-table>
                </div>
            </div>

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

        <!-- 新增/编辑 Modal -->
        <el-dialog v-model="modalVisible" :title="modalTitle" destroy-on-close width="640px">
            <el-form :model="formData" class="role-form" label-width="80px">
                <!-- 类型 -->
                <el-form-item label="类型">
                    <div class="type-selector">
                        <span
                            v-for="(info, key) in categoryMap"
                            :key="key"
                            :class="{ active: formData.type === key }"
                            :style="formData.type === key ? {
                                color: info.color,
                                borderColor: info.color + '40',
                                backgroundColor: info.color + '15'
                            } : {}"
                            class="type-tag"
                            @click="formData.type = key"
                        >
                            {{ info.label }}
                        </span>
                    </div>
                </el-form-item>

                <!-- 名称 -->
                <el-form-item label="名称" required>
                    <el-input v-model="formData.name" placeholder="请输入角色名称"/>
                </el-form-item>

                <!-- 简介 -->
                <el-form-item label="简介">
                    <el-input v-model="formData.bio" :rows="3" placeholder="请输入角色简介" type="textarea"/>
                </el-form-item>

                <!-- 常用语 -->
                <el-form-item label="常用语">
                    <div class="phrases-list">
                        <div
                            v-for="(phrase, idx) in formData.phrases"
                            :key="idx"
                            class="phrase-item"
                        >
                            <input
                                v-if="editingPhraseIdx === idx"
                                :ref="(el) => setPhraseRef(idx, el)"
                                v-model="formData.phrases[idx]"
                                class="phrase-input"
                                @blur="onPhraseBlur(idx)"
                                @keydown.enter="onPhraseEnter(idx)"
                            />
                            <span
                                v-else
                                class="phrase-text"
                                @click="startEditPhrase(idx)"
                            >{{ phrase }}</span>
                            <span class="phrase-delete" @click="deletePhrase(idx)">×</span>
                        </div>
                        <div class="phrase-add" @click="addPhrase">
                            <span>+ 添加常用语</span>
                        </div>
                    </div>
                </el-form-item>

                <!-- 头像 -->
                <el-form-item label="头像">
                    <div class="avatar-upload-wrapper">
                        <!-- 已上传的头像 -->
                        <div v-if="avatarPreview" class="avatar-item">
                            <img :src="avatarPreview" class="avatar-preview"/>
                            <span class="delete-badge" @click="removeAvatar">×</span>
                        </div>
                        <!-- 上传区域 -->
                        <el-upload
                            v-else
                            :auto-upload="false"
                            :on-change="handleAvatarChange"
                            :show-file-list="false"
                            class="avatar-uploader"
                            drag
                        >
                            <div class="avatar-upload-content">
                                <el-icon class="avatar-uploader-icon">
                                    <Plus/>
                                </el-icon>
                                <span class="avatar-upload-text">拖拽或点击上传</span>
                            </div>
                        </el-upload>
                    </div>
                </el-form-item>

                <!-- 图片 -->
                <el-form-item label="图片">
                    <div class="images-grid">
                        <!-- 已上传图片 -->
                        <div
                            v-for="(img, idx) in existingImages"
                            :key="img"
                            class="image-item"
                        >
                            <img :src="`/file/image/fetch?token=${img}`"/>
                            <span class="delete-badge" @click="deleteExistingImage(img)">×</span>
                        </div>
                        <!-- 新上传图片预览 -->
                        <div
                            v-for="(preview, idx) in imagePreviews"
                            :key="preview"
                            class="image-item"
                        >
                            <img :src="preview"/>
                            <span class="delete-badge" @click="removeNewImage(idx)">×</span>
                        </div>
                        <!-- 上传按钮 -->
                        <el-upload
                            v-if="imagePreviews.length + existingImages.length < 9"
                            :auto-upload="false"
                            :on-change="handleImageChange"
                            :show-file-list="false"
                            class="image-uploader"
                            drag
                            multiple
                        >
                            <div class="image-upload-content">
                                <el-icon class="image-uploader-icon">
                                    <Plus/>
                                </el-icon>
                                <span class="image-upload-text">拖拽或点击上传</span>
                            </div>
                        </el-upload>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="modalVisible = false">取消</el-button>
                <el-button :loading="submitting" type="primary" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {
    adminCreateRoleplay,
    adminDeleteRoleplay,
    adminGetRoleplayDetail,
    adminUpdateRoleplay,
    getRoleplayCharacterList
} from '../../../api'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'

const categoryMap = {
    game_expert: {label: '游戏达人', color: '#f0b344'},
    esports_player: {label: '电竞选手', color: '#e63946'},
    game_hero: {label: '游戏英雄', color: '#2a9d8f'}
}

const allCharacters = ref([])
const loading = ref(false)
const selectedCategory = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isMobile = ref(false)
const tableRef = ref(null)
const tableScrollRef = ref(null)
const hasLoadedOnce = ref(false)
const requestSeq = ref(0)

// ============ Modal 状态 ============
const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const isEdit = ref(false)
const editingId = ref(null)
const submitting = ref(false)

// 表单数据
const formData = ref({
    type: 'game_expert',
    name: '',
    bio: '',
    phrases: []
})

// 头像
const avatarFile = ref(null)
const avatarPreview = ref(null)

// 图片
const imageFiles = ref([])
const imagePreviews = ref([])
const existingImages = ref([])
const deletedImageTokens = ref([])  // 待删除的图片 tokens

// 头像原始 token（用于检测是否被删除）
const originalAvatarToken = ref(null)

// 台词编辑状态
const editingPhraseIdx = ref(-1)
const phraseInputRefs = ref({})

const setPhraseRef = (idx, el) => {
    if (el) {
        phraseInputRefs.value[idx] = el
    } else {
        delete phraseInputRefs.value[idx]
    }
}

const focusPhraseInput = async (idx) => {
    await nextTick()
    requestAnimationFrame(() => {
        const inputEl = phraseInputRefs.value[idx]
        if (!inputEl) return
        inputEl.focus()
    })
}

const startEditPhrase = async (idx) => {
    editingPhraseIdx.value = idx
    await focusPhraseInput(idx)
}

const onPhraseBlur = (idx) => {
    const val = formData.value.phrases[idx]?.trim()
    if (!val) {
        formData.value.phrases.splice(idx, 1)
    }
    editingPhraseIdx.value = -1
}

const onPhraseEnter = (idx) => {
    formData.value.phrases[idx] = formData.value.phrases[idx].trim()
    editingPhraseIdx.value = -1
}

const addPhrase = async () => {
    const newIdx = formData.value.phrases.length
    formData.value.phrases.push('')
    editingPhraseIdx.value = newIdx
    await focusPhraseInput(newIdx)
}

const deletePhrase = (idx) => {
    formData.value.phrases.splice(idx, 1)
}

const resetForm = () => {
    formData.value = {
        type: 'game_expert',
        name: '',
        bio: '',
        phrases: []
    }
    avatarFile.value = null
    avatarPreview.value = null
    imageFiles.value = []
    imagePreviews.value = []
    existingImages.value = []
    deletedImageTokens.value = []
    originalAvatarToken.value = null
    editingPhraseIdx.value = -1
    phraseInputRefs.value = {}
}

const openCreateModal = () => {
    isEdit.value = false
    modalTitle.value = '新增角色'
    resetForm()
    modalVisible.value = true
}

const openEditModal = async (row) => {
    isEdit.value = true
    modalTitle.value = '编辑角色'
    editingId.value = row.rid
    resetForm()
    try {
        const result = await adminGetRoleplayDetail(row.rid)
        if (result?.success && result.character) {
            const data = result.character
            formData.value = {
                type: data.type,
                name: data.name,
                bio: data.bio || '',
                phrases: Array.isArray(data.phrases) ? data.phrases : []
            }
            existingImages.value = data.images_token || []
            originalAvatarToken.value = data.avatar_token || null
            avatarPreview.value = data.avatar_token
                ? `/file/image/fetch?token=${data.avatar_token}`
                : null
        } else {
            ElMessage.error(result?.message || '获取角色详情失败')
        }
    } catch (error) {
        ElMessage.error('获取角色详情失败: ' + error.message)
    }
    modalVisible.value = true
}

const handleAvatarChange = (file) => {
    avatarFile.value = file.raw
    avatarPreview.value = URL.createObjectURL(file.raw)
}

const removeAvatar = () => {
    avatarFile.value = null
    avatarPreview.value = null
}

const handleImageChange = (file) => {
    imageFiles.value.push(file.raw)
    imagePreviews.value.push(URL.createObjectURL(file.raw))
}

const removeNewImage = (idx) => {
    imageFiles.value.splice(idx, 1)
    imagePreviews.value.splice(idx, 1)
}

const deleteExistingImage = (fid) => {
    deletedImageTokens.value.push(fid)
    existingImages.value = existingImages.value.filter(i => i !== fid)
}

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除角色「${row.name}」吗？删除后无法恢复。`,
            '删除确认',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
                confirmButtonClass: 'el-button--danger'
            }
        )
        await adminDeleteRoleplay(row.rid)
        ElMessage.success('删除成功')
        fetchCharacters()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败: ' + (error.message || error))
        }
    }
}

const submitForm = async () => {
    if (!formData.value.name?.trim()) {
        ElMessage.warning('请输入角色名称')
        return
    }
    submitting.value = true
    try {
        const form = new FormData()
        form.append('type', formData.value.type)
        form.append('name', formData.value.name)
        form.append('bio', formData.value.bio || '')
        form.append('phrases', JSON.stringify(formData.value.phrases))

        // 编辑模式：包含需要删除的头像和图片
        if (isEdit.value) {
            // 头像被删除
            if (!avatarPreview.value && !avatarFile.value && originalAvatarToken.value) {
                form.append('delete_avatar', 'true')
            }
            // 删除的图片 tokens
            deletedImageTokens.value.forEach(token => {
                form.append('delete_images_token', token)
            })
        }

        // 头像文件
        if (avatarFile.value) {
            form.append('avatar', avatarFile.value, avatarFile.value.name)
        }

        // 图片文件
        imageFiles.value.forEach(file => {
            form.append('images', file, file.name)
        })

        if (isEdit.value) {
            await adminUpdateRoleplay(editingId.value, form)
        } else {
            await adminCreateRoleplay(form)
        }
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        modalVisible.value = false
        fetchCharacters()
    } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
    } finally {
        submitting.value = false
    }
}

const updateViewport = () => {
    isMobile.value = window.innerWidth <= 768
}

const paginationLayout = computed(() => {
    return isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
})

const showTableLoading = computed(() => {
    return loading.value && !hasLoadedOnce.value
})

const fetchCharacters = async () => {
    const currentRequest = ++requestSeq.value
    loading.value = true
    try {
        // 根据选中分类决定 API 类型
        const apiType = selectedCategory.value === 'all' ? 'all' : selectedCategory.value
        const result = await getRoleplayCharacterList(apiType, {
            page: currentPage.value,
            page_size: pageSize.value,
            search: searchKeyword.value
        })

        if (currentRequest !== requestSeq.value) {
            return
        }

        if (result?.success) {
            allCharacters.value = result.characters.map(item => ({
                ...item,
                // 当查询特定类型时，类型已知；当查询 all 时使用后端返回的 type
                type: apiType === 'all' ? (item.type || apiType) : apiType,
                avatar: item.avatar_token
                    ? `/file/image/fetch?token=${item.avatar_token}`
                    : null
            }))
            total.value = result.total
        }
    } catch (error) {
        if (currentRequest === requestSeq.value) {
            ElMessage.error('获取角色列表失败: ' + error.message)
        }
    } finally {
        if (currentRequest === requestSeq.value) {
            loading.value = false
            hasLoadedOnce.value = true
        }
    }
}

const resetListScroll = () => {
    if (tableScrollRef.value) {
        tableScrollRef.value.scrollLeft = 0
    }
    tableRef.value?.setScrollTop?.(0)
    tableRef.value?.setScrollLeft?.(0)
}

const fetchCharactersWithScrollReset = async () => {
    resetListScroll()
    await fetchCharacters()
    await nextTick()
    resetListScroll()
}

const resetPageAndQuery = () => {
    if (currentPage.value !== 1) {
        currentPage.value = 1
        return
    }
    fetchCharactersWithScrollReset()
}

const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const highlightText = (text, keyword) => {
    if (!keyword || !text) return text
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
}

const filteredCharacters = computed(() => {
    // API 已按分类和搜索过滤，这里只做高亮
    if (!searchKeyword.value.trim()) {
        return allCharacters.value
    }

    return allCharacters.value.map(c => ({
        ...c,
        _highlight: {
            name: highlightText(c.name, searchKeyword.value),
            bio: highlightText(c.bio || '', searchKeyword.value)
        }
    }))
})

// 分页数据（使用 API 返回的 total）
const paginatedCharacters = computed(() => {
    return filteredCharacters.value
})

const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
    fetchCharactersWithScrollReset()
})

onUnmounted(() => {
    window.removeEventListener('resize', updateViewport)
    clearTimeout(searchTimer)
})

// 分类切换时重置页码并刷新
watch(selectedCategory, () => {
    resetPageAndQuery()
})

// 搜索词变化时重新获取（带防抖）
let searchTimer = null
watch(searchKeyword, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        resetPageAndQuery()
    }, 300)
})

// 每页数量变化时重置到第一页再刷新
watch(pageSize, () => {
    resetPageAndQuery()
})

// 页码变化时刷新并重置列表滚动
watch(currentPage, () => {
    fetchCharactersWithScrollReset()
})
</script>

<style scoped>
.roles-page {
    height: 100%;
    padding: 32px 40px;
    background: #09090b;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 右上角绿色光效 */
.roles-page::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 40%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
}

/* 左下角橙色光效 */
.roles-page::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%);
    filter: blur(100px);
    z-index: 0;
}

.page-header {
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}

h1 {
    color: #fafafa;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 4px;
}

.subtitle {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
}

.filter-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
}

.filter-section .add-btn {
    margin-left: auto;
}

.category-tabs {
    flex-shrink: 0;
}

.category-tabs :deep(.el-radio-button__inner) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
}

.category-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    color: #fff;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
}

.search-input {
    width: 280px;
    flex-shrink: 0;
}

.search-input :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
}

.search-input :deep(.el-input__wrapper:hover) {
    border-color: rgba(34, 197, 94, 0.4);
}

.search-input :deep(.el-input__wrapper.is-focus) {
    border-color: rgba(34, 197, 94, 0.6);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.2);
}

.search-input :deep(.el-input__inner) {
    color: rgba(255, 255, 255, 0.9);
}

.search-input :deep(.el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.4);
}

.search-input :deep(.el-icon) {
    color: rgba(255, 255, 255, 0.5);
}

.table-container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.table-scroll {
    flex: 1;
    min-height: 0;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
}

.table-inner {
    min-width: 680px;
    height: 100%;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    padding: 12px 0 0;
    flex-shrink: 0;
}

.pagination-container :deep(.el-pagination) {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
}

.pagination-container :deep(.el-pagination button) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
}

.pagination-container :deep(.el-pagination button:hover) {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.pagination-container :deep(.el-pager li) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
}

.pagination-container :deep(.el-pager li:hover) {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
}

.pagination-container :deep(.el-pager li.is-active) {
    background: rgba(34, 197, 94, 0.3);
    color: #4ade80;
}

.roles-table {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    overflow: hidden;
}

.roles-table :deep(.el-table__inner-wrapper::before) {
    height: 0;
}

.roles-table :deep(.el-table__header-wrapper th) {
    background: #064e3b;
    color: #fff;
    font-weight: 600;
    border-bottom: 1px solid rgba(34, 197, 94, 0.5);
    border-top: none !important;
}

.roles-table :deep(.el-table__header-wrapper) {
    border-top: none !important;
}

.roles-table :deep(.el-table__body-wrapper tr) {
    background: rgba(255, 255, 255, 0.03);
}

.roles-table :deep(.el-table__body-wrapper td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
}

.roles-table :deep(.el-table__body-wrapper tr:hover > td) {
    background: rgba(34, 197, 94, 0.1);
}

.roles-table :deep(.el-table__row--striped td) {
    background: rgba(255, 255, 255, 0.02) !important;
}

.roles-table :deep(.el-table__row--striped:hover > td) {
    background: rgba(34, 197, 94, 0.1) !important;
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
}

.avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #fff;
    margin: 0 auto;
}

.time-text {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
}

.type-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid;
    line-height: 1.4;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.edit-btn {
    padding: 4px 10px;
    background: rgba(240, 179, 68, 0.12) !important;
    border: 1px solid rgba(240, 179, 68, 0.25) !important;
    color: #f0b344 !important;
    font-size: 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
}

.edit-btn:hover {
    background: rgba(240, 179, 68, 0.22) !important;
    border-color: rgba(240, 179, 68, 0.4) !important;
}

.delete-btn {
    padding: 4px 10px;
    background: rgba(230, 57, 70, 0.12) !important;
    border: 1px solid rgba(230, 57, 70, 0.25) !important;
    color: #e63946 !important;
    font-size: 0.8rem;
    font-weight: 500;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
}

.delete-btn:hover {
    background: rgba(230, 57, 70, 0.22) !important;
    border-color: rgba(230, 57, 70, 0.4) !important;
}

:deep(mark) {
    background: rgba(240, 179, 68, 0.4);
    color: #fff;
    padding: 0 2px;
    border-radius: 2px;
}

@media (max-width: 768px) {
    .roles-page {
        height: 100%;
        min-height: 0;
        padding: 16px 12px calc(16px + env(safe-area-inset-bottom));
        overflow: hidden;
    }

    .page-header {
        margin-bottom: 16px;
    }

    h1 {
        font-size: 1.2rem;
    }

    .filter-section {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        margin-bottom: 12px;
    }

    .category-tabs {
        width: 100%;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x;
    }

    .category-tabs :deep(.el-radio-button) {
        float: none;
        display: inline-block;
    }

    .search-input {
        width: 100%;
    }

    .table-container {
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .table-scroll {
        flex: 1;
        min-height: 0;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x;
    }

    .pagination-container {
        justify-content: center;
        padding: 8px 0 0;
        overflow-x: auto;
        touch-action: pan-x;
    }
}

/* Modal 表单样式 */
.role-form {
    padding: 0 8px;
}

.role-form :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.8);
}

.role-form :deep(.el-input__wrapper) {
    background: rgba(0, 0, 0, 0.4) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
}

.role-form :deep(.el-textarea__inner) {
    background: rgba(0, 0, 0, 0.4) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: rgba(255, 255, 255, 0.9) !important;
}

.role-form :deep(.el-radio__label) {
    color: rgba(255, 255, 255, 0.8);
}

/* 类型选择器 */
.type-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.type-selector .type-tag {
    padding: 4px 12px;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    color: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
}

.type-selector .type-tag:hover {
    border-color: rgba(255, 255, 255, 0.4);
}

.type-selector .type-tag.active {
    font-weight: 500;
}

/* 头像上传 */
.avatar-upload-wrapper {
    display: flex;
    align-items: flex-start;
}

.avatar-item {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.avatar-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-item .delete-badge {
    position: absolute;
    top: 2px;
    right: 2px;
}

.avatar-uploader {
    width: 80px;
    height: 80px;
    cursor: pointer;
    overflow: hidden;
}

.avatar-uploader :deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.avatar-uploader :deep(.el-upload-dragger) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-uploader :deep(.el-upload-dragger:hover) {
    border-color: #4ade80;
}

.avatar-uploader :deep(.el-upload-dragger.is-dragover) {
    background: rgba(34, 197, 94, 0.15);
    border-color: #4ade80;
}

.avatar-upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    pointer-events: none;
}

.avatar-upload-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.2;
    text-align: center;
}

.avatar-uploader-icon {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.4);
}

.avatar-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    display: block;
}

/* 图片网格 */
.images-grid {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    gap: 8px;
    width: 100%;
}

.image-item {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
}

.image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.delete-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    background: rgba(230, 57, 70, 0.9);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}

.image-item:hover .delete-badge,
.avatar-item:hover .delete-badge {
    opacity: 1;
}

.image-uploader {
    width: 80px;
    height: 80px;
    cursor: pointer;
}

.image-uploader :deep(.el-upload) {
    width: 100%;
    height: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
    background: rgba(0, 0, 0, 0.3);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-uploader :deep(.el-upload-dragger:hover) {
    border-color: #4ade80;
}

.image-uploader :deep(.el-upload-dragger.is-dragover) {
    background: rgba(34, 197, 94, 0.15);
    border-color: #4ade80;
}

.image-upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    pointer-events: none;
}

.image-upload-text {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.2;
    text-align: center;
}

.image-uploader-icon {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.4);
}

/* 常用语列表 */
.phrases-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
}

.phrase-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 4px 8px;
    max-width: 200px;
}

.phrase-text {
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
}

.phrase-text:hover {
    color: #4ade80;
}

.phrase-input {
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    width: 160px;
}

.phrase-delete {
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 2px;
}

.phrase-delete:hover {
    color: #e63946;
}

.phrase-add {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 4px 12px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    transition: all 0.2s;
}

.phrase-add:hover {
    border-color: #4ade80;
    color: #4ade80;
}

</style>

<!-- 全局覆盖 Element Plus 斑马条纹 -->
<style>
.roles-table.el-table--striped .el-table__body tr.el-table__row--striped td {
    background: rgba(255, 255, 255, 0.02) !important;
}
</style>
