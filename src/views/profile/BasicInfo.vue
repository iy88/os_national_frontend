<template>
    <div class="basic-info">
        <!-- 头像卡片 -->
        <div class="info-card avatar-card">
            <div class="card-header">
                <h3 class="card-title">头像</h3>
            </div>
            <div class="avatar-content">
                <div class="avatar-wrapper">
                    <img v-if="userInfo?.avatar" :alt="userInfo.username" :src="userInfo.avatar"/>
                    <div v-else class="avatar-placeholder">
                        {{ userInfo?.username?.charAt(0) || 'U' }}
                    </div>
                </div>
                <div class="avatar-actions">
                    <p class="avatar-hint">点击头像更换</p>
                    <button class="action-btn upload-btn">
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
    </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {useUserStore} from '../../stores/user'
import {ElMessage} from 'element-plus'

const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

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
        const updateData = {}
        Object.keys(editableFields).forEach(key => {
            if (editingField[key]) {
                updateData[key] = editForm[key]
                editingField[key] = false
            }
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
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 24px;
}

.loading {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 40px 0;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-title {
    color: #f0b344;
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
}

.avatar-wrapper {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #f0b344;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;
}

.avatar-wrapper:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(240, 179, 68, 0.3);
}

.avatar-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.avatar-hint {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    margin: 0;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(240, 179, 68, 0.1);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 6px;
    color: #f0b344;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn svg {
    width: 16px;
    height: 16px;
}

.action-btn:hover {
    background: rgba(240, 179, 68, 0.2);
    border-color: rgba(240, 179, 68, 0.4);
}

.edit-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(240, 179, 68, 0.1);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 6px;
    color: #f0b344;
    cursor: pointer;
    transition: all 0.2s ease;
}

.edit-all-btn svg {
    width: 16px;
    height: 16px;
}

.edit-all-btn:hover {
    background: rgba(240, 179, 68, 0.2);
    border-color: rgba(240, 179, 68, 0.4);
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
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.info-value-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.info-value {
    flex: 1;
    color: rgba(255, 255, 255, 0.9);
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
    border-top: 1px solid rgba(255, 255, 255, 0.06);
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
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.save-btn {
    background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
    border: none;
    color: #fff;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3);
}

.save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.4);
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
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    border-radius: 6px;
}

.basic-info .el-input__inner,
.basic-info .el-textarea__inner {
    color: #fff;
}

.basic-info .el-input__wrapper:hover,
.basic-info .el-textarea__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4);
}

.basic-info .el-input__wrapper.is-focus,
.basic-info .el-textarea__wrapper.is-focus {
    border-color: #f0b344;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15);
}
</style>
