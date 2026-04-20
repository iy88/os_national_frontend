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
    background: #09090b;
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
    background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.05) 40%, transparent 70%);
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
    background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
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
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}

.header {
    margin-bottom: 32px;
}

.label-tag {
    display: inline-block;
    padding: 4px 8px;
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    margin-bottom: 12px;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

h2 {
    color: #fafafa;
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
}

.subtitle {
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input {
    width: 100%;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #e4e4e7;
    font-size: 15px;
    transition: all 0.2s;
    outline: none;
}

.form-group input:focus {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.1);
}

.form-group input::placeholder {
    color: rgba(255, 255, 255, 0.25);
}

.error {
    color: #f87171;
    font-size: 13px;
    margin-bottom: 16px;
    text-align: center;
}

.submit-btn {
    width: 100%;
    padding: 12px;
    background: #22c55e;
    border: none;
    border-radius: 6px;
    color: #000;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.25);
}

.submit-btn:hover:not(:disabled) {
    background: #4ade80;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(34, 197, 94, 0.35);
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
</style>
