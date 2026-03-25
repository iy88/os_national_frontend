import axios from 'axios'

// 开发环境使用空字符串，通过 Vite proxy 转发
// 生产环境可配置完整的 API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器：添加 token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || '请求失败'
        return Promise.reject(new Error(message))
    }
)

// 发送邮箱验证码
export const sendVerificationCode = (email) => {
    return apiClient.post('/email/verification/send', {email})
}

// 用户注册
export const register = (data) => {
    return apiClient.post('/user/register', {
        email: data.email,
        password: data.password,
        verifyCode: data.verifyCode,
        username: data.username || undefined
    })
}

// 用户登录
export const login = (data) => {
    const payload = {
        password: data.password
    }
    // username 或 email 二选一
    if (data.username?.includes('@')) {
        payload.email = data.username
    } else if (data.username) {
        payload.username = data.username
    } else if (data.email) {
        payload.email = data.email
    }
    return apiClient.post('/user/login', payload)
}

// 健康检查
export const healthCheck = () => {
    return apiClient.get('/health')
}

export default apiClient
