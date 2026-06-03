<template>
    <div class="basic-info">
        <!-- 头像卡片 -->
        <div class="info-card avatar-card">
            <div class="card-header">
                <h3 class="card-title">头像</h3>
            </div>
            <div class="avatar-content">
                <div class="avatar-wrapper">
                    <img v-if="avatarUrl" :alt="userInfo?.username" :src="avatarUrl"/>
                    <div v-else class="avatar-placeholder">
                        {{ userInfo?.username?.charAt(0) || 'U' }}
                    </div>
                </div>
                <div class="avatar-actions">
                    <p class="avatar-hint">支持 jpg、png、webp，最大 2MB</p>
                    <button class="upload-btn" @click="showUploadModal = true">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" x2="12" y1="3" y2="15"/>
                        </svg>
                        上传新头像
                    </button>
                </div>
            </div>
        </div>

        <!-- 基本信息卡片 -->
        <div class="info-card">
            <div class="card-header">
                <h3 class="card-title">基本信息</h3>
                <button v-if="!isEditing && !isLoading" class="edit-all-btn" @click="toggleEditAll">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
            </div>

            <div v-if="isLoading" class="loading">加载中...</div>

            <div v-else class="info-grid">
                <!-- 邮箱（只读） -->
                <div class="info-item">
                    <label class="info-label">邮箱</label>
                    <div class="info-value-wrapper">
                        <span class="info-value">{{ userInfo?.email || '未填写' }}</span>
                    </div>
                </div>

                <div
                    v-for="(field, key) in editableFields"
                    :key="key"
                    :class="['info-item', { 'full-width': field.rows > 1 }]"
                >
                    <label class="info-label">{{ field.label }}</label>
                    <div class="info-value-wrapper">
            <span v-if="!editingField[key]" class="info-value">
              {{ key === 'gender' ? (userInfo[key] || '未填写') : (userInfo[key] || '未填写') }}
            </span>
                        <el-select
                            v-else-if="key === 'gender'"
                            v-model="editForm[key]"
                            class="edit-input"
                            placeholder="请选择性别"
                        >
                            <el-option
                                v-for="option in genderOptions"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                        <el-input
                            v-else
                            v-model="editForm[key]"
                            :placeholder="`请输入${field.label}`"
                            :rows="field.rows || 1"
                            :type="field.type || 'text'"
                            class="edit-input"
                        />
                    </div>
                </div>
            </div>

            <div v-if="isEditing" class="edit-actions">
                <button class="cancel-btn" @click="cancelEdit">取消</button>
                <button class="save-btn" @click="saveAll">保存全部</button>
            </div>
        </div>

        <!-- 上传弹窗 -->
        <el-dialog
            v-model="showUploadModal"
            :close-on-click-modal="false"
            align-center
            class="upload-modal"
            title="上传头像"
            width="480px"
        >
            <!-- 桌面端拖拽上传 -->
            <div v-if="!isMobile" class="upload-layout">
                <el-upload
                    ref="uploadRef"
                    :auto-upload="false"
                    :limit="1"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    :show-file-list="false"
                    accept=".jpg,.jpeg,.png,.webp"
                    class="avatar-upload"
                    drag
                    @dragleave="handleDragLeave"
                    @dragover="handleDragOver"
                >
                    <!-- 无文件时显示默认内容 -->
                    <div v-if="!pendingFile" class="upload-content">
                        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" x2="12" y1="3" y2="15"/>
                        </svg>
                        <p>{{ isDragging ? '松开鼠标上传图片' : '点击或拖拽图片到此处' }}</p>
                        <p class="upload-hint">支持 jpg、png、webp，最大 2MB</p>
                    </div>
                    <!-- 有文件时显示预览背景 -->
                    <div v-else :style="{ backgroundImage: `url(${previewUrl})` }" class="upload-preview">
                        <div class="preview-overlay">
                            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" x2="12" y1="3" y2="15"/>
                            </svg>
                            <p>{{ isDragging ? '松开鼠标上传图片' : '点击或拖拽更换图片' }}</p>
                            <p class="upload-hint">支持 jpg、png、webp，最大 2MB</p>
                        </div>
                    </div>
                </el-upload>
            </div>
            <!-- 移动端直接选择文件 -->
            <div v-else class="mobile-upload" @click="triggerMobileUpload">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <p>点击选择图片</p>
                <p class="upload-hint">支持 jpg、png、webp，最大 2MB</p>
                <input
                    ref="mobileFileInput"
                    accept=".jpg,.jpeg,.png,.webp"
                    style="display: none"
                    type="file"
                    @change="handleMobileFileSelect"
                />
            </div>
            <div class="modal-footer">
                <!-- 文件名提示 -->
                <div class="file-info">
                    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <span class="file-name">{{ pendingFile ? pendingFile.name : '未选择文件' }}</span>
                </div>
                <div class="modal-actions">
                    <el-button class="cancel-btn-lg" @click="cancelUpload">取消</el-button>
                    <el-button :disabled="!pendingFile" class="upload-btn-lg" type="primary" @click="confirmUpload">
                        上传
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {useUserStore} from '../../stores/user'
import {ElMessage} from 'element-plus'
import {uploadAvatar} from '../../api'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const avatarUrl = computed(() => userStore.avatarUrl)

const editableFields = {
    username: {label: '用户名', type: 'text'},
    gender: {label: '性别', type: 'select'},
    age: {label: '年龄', type: 'number'},
    basicInfo: {label: '基本信息', type: 'textarea', rows: 2},
    bio: {label: '简介', type: 'textarea', rows: 3}
}

const genderOptions = [
    {label: '男', value: '男'},
    {label: '女', value: '女'},
    {label: '不显示', value: '不显示'}
]

const editingField = reactive({})
const editForm = reactive({})
const isEditing = ref(false)
const isLoading = ref(false)
const uploadRef = ref(null)
const mobileFileInput = ref(null)

const showUploadModal = ref(false)
const pendingFile = ref(null)
const previewUrl = ref('')
const isDragging = ref(false)

// 检测移动端
const isMobile = ref(window.innerWidth <= 480)
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth <= 480
    })
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

onMounted(async () => {
    isLoading.value = true
    try {
        await userStore.fetchUserProfile()
    } catch (error) {
        ElMessage.error(error.message || '获取用户信息失败')
    } finally {
        isLoading.value = false
    }
})

const handleFileChange = (file) => {
    if (file.size > MAX_FILE_SIZE) {
        ElMessage.error('图片大小不能超过 2MB')
        uploadRef.value?.clearFiles()
        return
    }
    pendingFile.value = file.raw
    previewUrl.value = URL.createObjectURL(file.raw)
}

const handleFileRemove = () => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
    pendingFile.value = null
    previewUrl.value = ''
}

const triggerMobileUpload = () => {
    mobileFileInput.value?.click()
}

const handleMobileFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
        ElMessage.error('图片大小不能超过 2MB')
        event.target.value = ''
        return
    }
    pendingFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    event.target.value = ''
}

const cancelUpload = () => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
    }
    pendingFile.value = null
    previewUrl.value = ''
    uploadRef.value?.clearFiles()
    showUploadModal.value = false
    isDragging.value = false
}

const handleDragOver = (e) => {
    e.preventDefault()
    isDragging.value = true
}

const handleDragLeave = (e) => {
    e.preventDefault()
    isDragging.value = false
}

const confirmUpload = async () => {
    if (!pendingFile.value) return

    try {
        const result = await uploadAvatar(userInfo.value.uid, pendingFile.value)
        if (result.success) {
            userInfo.value.avatarToken = result.avatar_token
            ElMessage.success('头像上传成功')
            cancelUpload()
        }
    } catch (error) {
        ElMessage.error(error.message || '头像上传失败')
    }
}

const toggleEditAll = () => {
    Object.keys(editableFields).forEach(key => {
        editForm[key] = userInfo.value?.[key]
        editingField[key] = true
    })
    isEditing.value = true
}

const cancelEdit = () => {
    Object.keys(editableFields).forEach(key => {
        editingField[key] = false
    })
    isEditing.value = false
}

const saveAll = async () => {
    try {
        // 直接用表单数据更新本地状态
        Object.keys(editableFields).forEach(key => {
            if (editingField[key]) {
                userInfo.value[key] = editForm[key]
                editingField[key] = false
            }
        })
        // 同时提交到后端保存
        const updateData = {}
        Object.keys(editableFields).forEach(key => {
            updateData[key] = editForm[key]
        })
        await userStore.updateUserProfile(updateData)
        isEditing.value = false
        ElMessage.success('保存成功')
    } catch (error) {
        ElMessage.error(error.message || '保存失败')
    }
}
</script>

<style scoped>
.basic-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-card {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: 10px;
    padding: 24px;
}

.loading {
    text-align: center;
    color: var(--color-text-placeholder);
    padding: 40px 0;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border-subtle);
}

.card-title {
    color: var(--color-brand);
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
}

/* 头像卡片 */
.avatar-card .card-header {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.avatar-content {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 16px;
}

.avatar-wrapper {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--color-brand);
    box-shadow: 0 4px 16px var(--color-shadow-sm-base);
    cursor: pointer;
    transition: all 0.2s ease;
}

.avatar-wrapper:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px var(--color-brand-soft-border);
}

.avatar-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, var(--color-brand) 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-text-primary);
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.avatar-hint {
    color: var(--color-text-placeholder);
    font-size: 0.85rem;
    margin: 0;
}

.upload-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--color-brand-soft-bg);
    border: 1px solid var(--color-brand-soft-border);
    border-radius: 6px;
    color: var(--color-brand);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.upload-btn svg {
    width: 16px;
    height: 16px;
}

.upload-btn:hover {
    background: var(--color-brand-soft-border);
    border-color: var(--color-brand-glow-strong);
}

/* 头像上传弹窗 */
.basic-info .upload-modal .el-dialog {
    background: var(--color-bg-panel-alt);
    border-radius: 12px;
    width: 680px;
    max-width: 90vw;
    margin: 0 auto;
}

.basic-info .upload-modal :deep(.el-dialog__wrapper) {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 上传区域容器 - 占满宽度 */
.basic-info .upload-layout {
    width: 100%;
}

.basic-info .avatar-upload {
    width: 100%;
    display: block;
}

.basic-info .avatar-upload :deep(.el-upload) {
    width: 100%;
}

.basic-info .avatar-upload :deep(.el-upload-dragger) {
    background: var(--color-bg-hover);
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    padding: 0;
    transition: all 0.2s;
    width: 100%;
    height: 200px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
}

.basic-info .avatar-upload :deep(.el-upload-dragger:hover),
.basic-info .avatar-upload :deep(.el-upload-dragger.is-dragover) {
    border-color: var(--color-brand);
    background: var(--color-brand-soft-bg);
}

.basic-info .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.basic-info .upload-content svg {
    width: 4vw;
    height: 4vw;
    max-width: 48px;
    max-height: 48px;
    min-width: 36px;
    min-height: 36px;
    color: var(--color-text-disabled);
    margin-bottom: 12px;
}

.basic-info .upload-content p {
    color: var(--color-text-tertiary);
    margin: 0;
    font-size: 0.95rem;
}

.basic-info .upload-hint {
    font-size: 0.8rem;
    color: var(--color-text-placeholder);
    margin-top: 6px;
}

/* 预览背景区域 */
.basic-info .upload-preview {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 8px;
    position: relative;
}

.basic-info .preview-overlay {
    position: absolute;
    inset: 0;
    background: var(--color-overlay);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background 0.2s;
}

.basic-info .upload-preview:hover .preview-overlay {
    background: var(--color-shadow-md-base);
}

.basic-info .preview-overlay svg {
    width: 40px;
    height: 40px;
    color: var(--color-text-muted);
    margin-bottom: 10px;
}

.basic-info .preview-overlay p {
    color: var(--color-text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

/* 底部区域 - 文件名和按钮同一行 */
.basic-info .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-top: 20px;
    gap: 16px;
    box-sizing: border-box;
}

/* 文件信息 - 靠左 */
.basic-info .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--color-shadow-sm-base);
    border-radius: 6px;
    max-width: 60%;
    min-width: 0;
}

/* 按钮区域 - 靠右 */
.basic-info .modal-actions {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: 12px;
    margin-left: auto;
}

.basic-info .modal-actions .el-button {
    display: inline-flex;
}

.basic-info .file-info svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-faint);
    flex-shrink: 0;
}

.basic-info .file-name {
    display: block;
    color: var(--color-text-tertiary);
    font-size: 0.85rem;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 移动端上传区域 */
.basic-info .mobile-upload {
    background: var(--color-info-soft);
    border: 2px dashed var(--color-info-soft);
    border-radius: 8px;
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.basic-info .mobile-upload:hover {
    border-color: var(--color-info-soft);
    background: var(--color-info-soft);
}

.basic-info .mobile-upload svg {
    width: 48px;
    height: 48px;
    color: var(--color-text-disabled);
    margin-bottom: 16px;
}

.basic-info .mobile-upload p {
    color: var(--color-text-tertiary);
    margin: 0;
    font-size: 1rem;
}

/* 弹窗内大按钮 */
.basic-info .cancel-btn-lg,
.basic-info .upload-btn-lg {
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.basic-info .cancel-btn-lg {
    background: var(--color-border-divider);
    border: 1px solid var(--color-border-strong);
    color: var(--color-text-tertiary);
}

.basic-info .cancel-btn-lg:hover {
    background: var(--color-border-input);
    border-color: var(--color-border-strong);
    color: var(--color-text-primary);
}

.basic-info .upload-btn-lg {
    background: linear-gradient(145deg, var(--color-brand) 0%, var(--color-brand-active) 100%);
    border: none;
    color: var(--color-text-primary);
    box-shadow: 0 2px 12px var(--color-brand-soft-border);
}

.basic-info .upload-btn-lg:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--color-brand-glow-strong);
}

.basic-info .upload-btn-lg:disabled {
    background: var(--color-brand-glow-strong);
    box-shadow: none;
}

/* 移动端适配 */
@media (max-width: 480px) {
    .basic-info .upload-modal .el-dialog {
        width: 90vw;
        margin: 30vh auto;
    }

    .basic-info .avatar-upload :deep(.el-upload-dragger),
    .basic-info .mobile-upload {
        min-height: 132px;
        height: auto;
        padding: 12px 10px;
        overflow: visible;
    }

    .basic-info .upload-content {
        width: 100%;
        padding: 0 4px;
        overflow: visible;
    }

    .basic-info .upload-content svg {
        width: 28px;
        height: 28px;
        max-width: 28px;
        max-height: 28px;
        min-width: 24px;
        min-height: 24px;
        margin-bottom: 6px;
    }

    .basic-info .upload-content p {
        font-size: 0.8rem;
        line-height: 1.2;
        margin: 0;
        word-break: break-word;
    }

    .basic-info .upload-hint {
        font-size: 0.75rem;
    }

    .basic-info .preview-overlay svg {
        width: 28px;
        height: 28px;
        margin-bottom: 6px;
    }

    .basic-info .preview-overlay p {
        font-size: 0.8rem;
    }

    .basic-info .upload-hint {
        font-size: 0.7rem;
        margin-top: 4px;
        white-space: normal;
        overflow-wrap: anywhere;
    }

    .basic-info .modal-footer {
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }

    .basic-info .file-info {
        max-width: 55%;
        flex-shrink: 0;
        padding: 6px 10px;
    }

    .basic-info .file-name {
        max-width: 100%;
    }

    .basic-info .modal-actions {
        flex: 1;
        justify-content: flex-end;
        flex-shrink: 0;
    }

    .basic-info .cancel-btn-lg,
    .basic-info .upload-btn-lg {
        padding: 10px 16px;
        font-size: 0.9rem;
    }
}

.edit-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: var(--color-brand-soft-bg);
    border: 1px solid var(--color-brand-soft-border);
    border-radius: 6px;
    color: var(--color-brand);
    cursor: pointer;
    transition: all 0.2s ease;
}

.edit-all-btn svg {
    width: 16px;
    height: 16px;
}

.edit-all-btn:hover {
    background: var(--color-brand-soft-border);
    border-color: var(--color-brand-glow-strong);
}

/* 信息网格 */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/*noinspection CssUnusedSymbol*/
.info-item.full-width {
    grid-column: span 2;
}

.info-label {
    color: var(--color-text-placeholder);
    font-size: 0.85rem;
}

.info-value-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.info-value {
    flex: 1;
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    padding: 10px 0;
}

.edit-input {
    flex: 1;
}

/* 编辑操作按钮 */
.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border-subtle);
}

.cancel-btn,
.save-btn {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-btn {
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
}

.cancel-btn:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
}

.save-btn {
    background: linear-gradient(145deg, var(--color-brand) 0%, var(--color-brand-active) 100%);
    border: none;
    color: var(--color-text-primary);
    box-shadow: 0 2px 8px var(--color-brand-soft-border);
}

.save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--color-brand-glow-strong);
}

@media (max-width: 600px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    /*noinspection CssUnusedSymbol*/
    .info-item.full-width {
        grid-column: span 1;
    }

    .avatar-content {
        flex-direction: column;
        text-align: center;
    }
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
/* Element Plus 覆盖样式 */
.basic-info .el-input__wrapper,
.basic-info .el-textarea__wrapper {
    background: var(--color-shadow-sm-base);
    border: 1px solid var(--color-border);
    box-shadow: none;
    border-radius: 6px;
}

.basic-info .el-input__inner,
.basic-info .el-textarea__inner {
    color: var(--color-text-primary);
}

.basic-info .el-input__wrapper:hover,
.basic-info .el-textarea__wrapper:hover {
    border-color: var(--color-brand-glow-strong);
}

.basic-info .el-input__wrapper.is-focus,
.basic-info .el-textarea__wrapper.is-focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 2px var(--color-brand-soft-bg);
}
</style>
