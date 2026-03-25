import axios from 'axios'

// 所有请求使用相对路径，走 Vite proxy 或生产环境同源
const apiClient = axios.create({
    baseURL: '',
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

// 获取用户信息
export const getProfile = () => {
    return apiClient.get('/user/profile')
}

// 更新用户信息（增量更新）
export const updateProfile = (data) => {
    return apiClient.put('/user/profile', data)
}

// 上传头像 (multipart/form-data)
const uploadClient = axios.create({
    baseURL: '',
    timeout: 30000
})

uploadClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

uploadClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || '上传失败'
        return Promise.reject(new Error(message))
    }
)

export const uploadAvatar = (userId, file) => {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('file', file)
    return uploadClient.post('/file/avatar/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export default apiClient
