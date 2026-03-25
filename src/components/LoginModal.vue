<template>
    <el-dialog
        :close-on-click-modal="false"
        :model-value="modelValue"
        :title="isLogin ? '登录' : '注册'"
        append-to-body
        class="login-modal"
        width="450px"
        @update:model-value="(val) => emit('update:modelValue', val)"
    >
        <div class="login-container">
            <!-- 登录表单 -->
            <el-form v-if="isLogin" :model="loginForm" label-position="top">
                <el-form-item label="用户名/邮箱">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名或邮箱"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" placeholder="请输入密码" type="password"/>
                </el-form-item>
            </el-form>

            <!-- 注册表单 -->
            <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名"/>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入邮箱"/>
                </el-form-item>
                <el-form-item label="验证码" prop="verifyCode">
                    <div class="verification-row">
                        <el-input v-model="registerForm.verifyCode" class="verify-code-input"
                                  placeholder="请输入验证码"/>
                        <el-button :disabled="verifyCodeSent" class="send-code-btn" @click="sendVerifyCode">
                            {{ verifyCodeSent ? `${countdown}s后重发` : '发送验证码' }}
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerForm.password" placeholder="请输入密码" type="password" show-password/>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" placeholder="请再次输入密码" type="password" show-password/>
                </el-form-item>
            </el-form>

            <!-- 登录后显示收藏路线 -->
            <div v-if="isLoggedIn" class="collected-routes">
                <h4>我的收藏路线</h4>
                <div v-if="collectedRoutes.length > 0" class="routes-list">
                    <div v-for="(route, index) in collectedRoutes" :key="index" class="route-item">
                        {{ route }}
                    </div>
                </div>
                <p v-else class="no-routes">暂无收藏路线</p>
                <el-button class="logout-btn" type="danger" @click="handleLogout">
                    退出登录
                </el-button>
            </div>

            <div class="form-footer">
                <p v-if="!isLoggedIn" class="switch-mode">
                    {{ isLogin ? '还没有账号？' : '已有账号？' }}
                    <span @click="isLogin = !isLogin">{{ isLogin ? '立即注册' : '去登录' }}</span>
                </p>
                <el-button v-if="!isLoggedIn" class="submit-btn" type="primary" @click="handleSubmit">
                    {{ isLogin ? '登录' : '注册' }}
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useUserStore} from '../stores/user'
import {ElMessage} from 'element-plus'
import {sendVerificationCode, register as apiRegister, login as apiLogin} from '../api'

defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const collectedRoutes = computed(() => userStore.collectedRoutes)

const isLogin = ref(true)
const loginForm = ref({
    username: '',
    password: ''
})

const registerFormRef = ref(null)
const registerForm = ref({
    username: '',
    email: '',
    verifyCode: '',
    password: '',
    confirmPassword: ''
})

// 表单校验规则
const validateUsername = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入用户名'))
    } else if (value.length < 3) {
        callback(new Error('用户名至少3个字符'))
    } else {
        callback()
    }
}

const validateEmail = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入邮箱'))
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error('请输入有效的邮箱地址'))
    } else {
        callback()
    }
}

const validateVerifyCode = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入验证码'))
    } else if (!/^\d{6}$/.test(value)) {
        callback(new Error('验证码为6位数字'))
    } else {
        callback()
    }
}

const validatePassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入密码'))
    } else if (value.length < 6) {
        callback(new Error('密码至少6个字符'))
    } else {
        callback()
    }
}

const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.value.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const registerRules = {
    username: [{validator: validateUsername, trigger: 'blur'}],
    email: [{validator: validateEmail, trigger: 'blur'}],
    verifyCode: [{validator: validateVerifyCode, trigger: 'blur'}],
    password: [{validator: validatePassword, trigger: 'blur'}],
    confirmPassword: [{validator: validateConfirmPassword, trigger: 'blur'}]
}

const verifyCodeSent = ref(false)
const countdown = ref(0)
let countdownTimer = null

const sendVerifyCode = async () => {
    // 先校验邮箱格式
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)
    if (!registerForm.value.email || !emailValid) {
        ElMessage.warning('请先输入有效的邮箱')
        return
    }
    try {
        await sendVerificationCode(registerForm.value.email)
        ElMessage.success('验证码已发送')
        verifyCodeSent.value = true
        countdown.value = 60
        countdownTimer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                verifyCodeSent.value = false
                clearInterval(countdownTimer)
            }
        }, 1000)
    } catch (error) {
        ElMessage.error(error.message || '发送验证码失败')
    }
}

const handleSubmit = async () => {
    if (isLogin.value) {
        if (loginForm.value.username && loginForm.value.password) {
            try {
                const result = await apiLogin(loginForm.value)
                if (result.success) {
                    localStorage.setItem('token', result.token)
                    userStore.setUserInfo(result.userInfo)
                    ElMessage.success('登录成功！')
                    emit('update:modelValue', false)
                    resetForms()
                }
            } catch (error) {
                ElMessage.error(error.message || '登录失败')
            }
        } else {
            ElMessage.warning('请填写完整信息')
        }
    } else {
        // 注册时校验整个表单
        if (!registerFormRef.value) return
        await registerFormRef.value.validate(async (valid) => {
            if (valid) {
                try {
                    const result = await apiRegister(registerForm.value)
                    if (result.success) {
                        localStorage.setItem('token', result.token)
                        userStore.setUserInfo(result.userInfo)
                        ElMessage.success('注册成功！')
                        emit('update:modelValue', false)
                        resetForms()
                    }
                } catch (error) {
                    ElMessage.error(error.message || '注册失败')
                }
            } else {
                ElMessage.warning('请填写完整且有效的注册信息')
            }
        })
    }
}

const handleLogout = () => {
    userStore.logout()
    localStorage.removeItem('token')
    ElMessage.success('已退出登录')
    emit('update:modelValue', false)
    resetForms()
}

const resetForms = () => {
    loginForm.value = {username: '', password: ''}
    registerForm.value = {username: '', email: '', verifyCode: '', password: '', confirmPassword: ''}
    isLogin.value = true
}
</script>

<style scoped>
.login-container {
    padding: 8px 0;
}

.form-footer {
    margin-top: 18px;
}

.switch-mode {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 14px;
    font-size: 0.9rem;
}

.switch-mode span {
    color: #f0b344;
    cursor: pointer;
    margin-left: 5px;
}

.switch-mode span:hover {
    text-decoration: underline;
}

.collected-routes {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 14px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.collected-routes h4 {
    color: #f0b344;
    margin: 0 0 10px 0;
    font-size: 0.95rem;
    font-weight: 600;
}

.routes-list {
    max-height: 180px;
    overflow-y: auto;
}

.route-item {
    padding: 8px 12px;
    background: rgba(240, 179, 68, 0.08);
    border-radius: 6px;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.88rem;
}

.no-routes {
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
    padding: 18px 0;
    font-size: 0.9rem;
}

.logout-btn {
    width: 100%;
    margin-top: 14px;
    background: linear-gradient(180deg, #e63946 0%, #c62d3a 100%);
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(230, 57, 70, 0.3);
}

.logout-btn:hover {
    background: linear-gradient(180deg, #f04050 0%, #d63a47 100%);
}

.submit-btn {
    width: 100%;
    background: linear-gradient(180deg, #f0b344 0%, #d4962e 100%);
    border: none;
    border-radius: 6px;
    padding: 12px 20px;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3);
}

.submit-btn:hover {
    background: linear-gradient(180deg, #ffbe4a 0%, #e4a630 100%);
}

.verification-row {
    display: flex;
    gap: 10px;
}

.verify-code-input {
    flex: 1;
}

.send-code-btn {
    background: rgba(240, 179, 68, 0.1);
    border: 1px solid rgba(240, 179, 68, 0.25);
    color: #f0b344;
    border-radius: 6px;
    padding: 0 16px;
    height: 32px;
    white-space: nowrap;
}

.send-code-btn:hover:not(:disabled) {
    background: rgba(240, 179, 68, 0.2);
    border-color: rgba(240, 179, 68, 0.4);
}

.send-code-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>

<style>
.login-modal.el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    margin-top: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
}

.login-modal .el-dialog__header {
    border-bottom: 1px solid rgba(240, 179, 68, 0.12);
    padding: 18px 20px;
}

.login-modal .el-dialog__title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

.login-modal .el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7);
}

.login-modal .el-dialog__headerbtn:hover .el-dialog__close {
    color: #f0b344;
}

.login-modal .el-dialog__body {
    padding: 20px;
}

.login-modal .el-form-item__label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
}

.login-modal .el-input__wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    border-radius: 6px;
}

.login-modal .el-input__inner {
    color: #fff;
}

.login-modal .el-input__inner::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.login-modal .el-input__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4);
}

.login-modal .el-input__wrapper.is-focus {
    border-color: #f0b344;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15);
}

.login-modal .el-select .el-input__wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
}

.login-modal .el-select-dropdown {
    background: #1e2f55;
    border: 1px solid rgba(240, 179, 68, 0.2);
    border-radius: 6px;
}

.login-modal .el-select-dropdown__item {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
}

.login-modal .el-select-dropdown__item.hover,
.login-modal .el-select-dropdown__item:hover {
    background: rgba(240, 179, 68, 0.15);
}

.login-modal .el-textarea__inner {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    border-radius: 6px;
    color: #fff;
}

.login-modal .el-input-number {
    width: 100%;
}

.login-modal .el-input-number .el-input__wrapper {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
}

@media (max-width: 768px) {
    .login-modal.el-dialog {
        width: 90% !important;
        max-width: 90vw;
        margin: 10px auto !important;
    }

    .login-modal .el-dialog__body {
        padding: 16px;
    }
}
</style>
