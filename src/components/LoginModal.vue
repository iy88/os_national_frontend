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
                    <el-input v-model="loginForm.username" placeholder="请输入用户名或邮箱" @keydown.enter.prevent="focusPassword"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input ref="passwordInputRef" v-model="loginForm.password" placeholder="请输入密码" type="password" @keydown.enter.prevent="handleSubmit"/>
                </el-form-item>
            </el-form>

            <!-- 注册表单 -->
            <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名" @keydown.enter.prevent="focusEmail"/>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input ref="emailInputRef" v-model="registerForm.email" placeholder="请输入邮箱" @keydown.enter.prevent="focusVerifyCode"/>
                </el-form-item>
                <el-form-item label="验证码" prop="verifyCode">
                    <div class="verification-row">
                        <el-input ref="verifyCodeInputRef" v-model="registerForm.verifyCode" class="verify-code-input"
                                  placeholder="请输入验证码" @keydown.enter.prevent="focusPasswordReg"/>
                        <el-button :disabled="verifyCodeSent" class="send-code-btn" @click="sendVerifyCode">
                            {{ verifyCodeSent ? `${countdown}s后重发` : '发送验证码' }}
                        </el-button>
                    </div>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input ref="passwordRegInputRef" v-model="registerForm.password" placeholder="请输入密码" type="password" show-password @keydown.enter.prevent="focusConfirmPassword"/>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" placeholder="请再次输入密码" type="password" show-password @keydown.enter.prevent="handleSubmit"/>
                </el-form-item>
            </el-form>

            <div class="form-footer">
                <p class="switch-mode">
                    {{ isLogin ? '还没有账号？' : '已有账号？' }}
                    <span @click="isLogin = !isLogin">{{ isLogin ? '立即注册' : '去登录' }}</span>
                </p>
                <el-button class="submit-btn" type="primary" @click="handleSubmit">
                    {{ isLogin ? '登录' : '注册' }}
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import {computed, nextTick, ref} from 'vue'
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

const isLogin = ref(true)
const loginForm = ref({
    username: '',
    password: ''
})

const registerFormRef = ref(null)
const passwordInputRef = ref(null)
const emailInputRef = ref(null)
const verifyCodeInputRef = ref(null)
const passwordRegInputRef = ref(null)

const registerForm = ref({
    username: '',
    email: '',
    verifyCode: '',
    password: '',
    confirmPassword: ''
})

// 回车跳转到下一个输入框
const focusPassword = () => {
    passwordInputRef.value?.focus()
}

const focusEmail = () => {
    emailInputRef.value?.focus()
}

const focusVerifyCode = () => {
    verifyCodeInputRef.value?.focus()
}

const focusPasswordReg = () => {
    passwordRegInputRef.value?.focus()
}

const focusConfirmPassword = () => {
    // 找到确认密码输入框并聚焦
    const inputs = document.querySelectorAll('.login-container .el-input')
    const lastInput = inputs[inputs.length - 1]
    if (lastInput) {
        lastInput.querySelector('input')?.focus()
    }
}

// 表单校验规则
const validateUsername = (rule, value, callback) => {
    if (value && value.length < 3) {
        callback(new Error('用户名至少3个字符'))
    } else if (value && value.length > 80) {
        callback(new Error('用户名最多80个字符'))
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
    } else if (value.length > 128) {
        callback(new Error('密码最多128个字符'))
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
                    userStore.login(result)
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
                        userStore.login(result)
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
