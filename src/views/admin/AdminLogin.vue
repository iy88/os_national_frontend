<template>
    <div class="admin-login">
        <form class="login-card" @submit.prevent="handleSubmit">
            <div class="header">
                <div class="label-tag">安全入口</div>
                <h2>欢迎回来</h2>
                <p class="subtitle">输入凭据以访问后台</p>
            </div>

            <div class="form-group">
                <label>用户名</label>
                <input
                    v-model="form.username"
                    autocomplete="username"
                    placeholder="请输入用户名"
                    type="text"
                />
            </div>

            <div class="form-group">
                <label>密码</label>
                <input
                    v-model="form.password"
                    autocomplete="current-password"
                    placeholder="请输入密码"
                    type="password"
                />
            </div>

            <div v-if="error" class="error">{{ error }}</div>

            <button :disabled="loading" class="submit-btn" type="submit">
                {{ loading ? '登录中...' : '登录' }}
            </button>
        </form>
    </div>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '../../stores/user'
import {adminLogin} from '../../api'

const router = useRouter()
const userStore = useUserStore()
const form = reactive({username: '', password: ''})
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
    error.value = ''
    if (!form.username.trim()) {
        error.value = '请输入用户名'
        return
    }
    if (!form.password) {
        error.value = '请输入密码'
        return
    }

    loading.value = true
    try {
        const result = await adminLogin({username: form.username, password: form.password})
        if (result.success) {
            userStore.login(result)
            router.replace('/manage/index')
        } else {
            error.value = result.message || '登录失败'
        }
    } catch (e) {
        error.value = e.message || '登录失败，请重试'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.admin-login {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-admin);
    position: relative;
    overflow: hidden;
}

/* 右上角绿色光效 */
.admin-login::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, var(--color-admin-soft-bg) 0%, var(--color-admin-soft-bg) 40%, transparent 70%);
    filter: blur(80px);
    z-index: 0;
}

/* 左下角橙色光效 */
.admin-login::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--color-orange-soft) 0%, transparent 70%);
    filter: blur(100px);
    z-index: 0;
}

.login-card {
    position: relative;
    z-index: 1;
    width: 80%;
    max-width: 380px;
    padding: 40px;
    background: rgba(17, 17, 17, 0.6);
    border: 1px solid var(--color-border-divider);
    border-radius: 12px;
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px -12px var(--color-overlay),
    0 0 0 1px var(--color-bg-subtle) inset;
}

.header {
    margin-bottom: 32px;
}

.label-tag {
    display: inline-block;
    padding: 4px 8px;
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    margin-bottom: 12px;
    border: 1px solid var(--color-admin-soft-bg);
}

h2 {
    color: var(--color-text-primary);
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
}

.subtitle {
    color: var(--color-text-disabled);
    font-size: 14px;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: var(--color-text-placeholder);
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input {
    width: 100%;
    padding: 10px 14px;
    background: var(--color-shadow-sm-base);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 15px;
    transition: all 0.2s;
    outline: none;
}

.form-group input:focus {
    border-color: var(--color-admin-soft-bg);
    box-shadow: 0 0 0 2px var(--color-admin-soft-bg);
}

.form-group input::placeholder {
    color: var(--color-text-placeholder);
}

.error {
    color: var(--color-danger);
    font-size: 13px;
    margin-bottom: 16px;
    text-align: center;
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: var(--color-admin-hover);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(22, 163, 74, 0.35);
}

.submit-btn:hover:not(:disabled) {
    background: var(--color-admin);
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(22, 163, 74, 0.4);
}

.submit-btn:active {
    transform: translateY(0);
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

@media (max-width: 480px) {
    .login-card {
        padding: 24px 20px;
    }

    h2 {
        font-size: 22px;
    }
}

/* 浅色模式覆盖：去除深色玻璃效果 */
</style>
<style>
[data-theme="light"] .login-card {
    background: #ffffff !important;
    border-color: var(--color-border) !important;
    backdrop-filter: none !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}
</style>
