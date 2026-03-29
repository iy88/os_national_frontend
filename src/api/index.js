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

// ============ Agent AI 对话接口 ============

// 获取会话列表
export const getChatSessions = () => {
    return apiClient.get('/agent/travel-route-plan/chat/list')
}

// 获取会话详情
export const getChatSession = (sid) => {
    return apiClient.get(`/agent/travel-route-plan/chat/detail/${sid}`)
}

// 编辑会话标题
export const editChatSessionTitle = (sid, title) => {
    return apiClient.put(`/agent/travel-route-plan/chat/title/edit/${sid}`, { title })
}

// 使用 fetch 实现 SSE（带 POST 和自定义 headers）
// 返回 { eventSource, cancel }
// mid 用于恢复模式（不传 content 表示恢复未完成的流）
// regenerateMid 用于重新生成模式（不传 content）
export const sendChatMessageStream = (content, sid = null, mid = null, regenerateMid = null) => {
    const token = localStorage.getItem('token')
    let body
    if (regenerateMid !== null) {
        // 重新生成模式：只传 sid 和 regenerateMid，不传 content
        body = { sid, regenerateMid }
    } else if (mid !== null) {
        // 恢复模式：只传 sid 和 mid，不传 content
        body = { sid, mid }
    } else {
        body = sid ? { content, sid } : { content }
    }

    let aborted = false
    const controller = new AbortController()

    const isAbortError = (error) => error?.name === 'AbortError'

    const eventSource = {
        onmessage: null,
        onerror: null,
        close: (abortFetch = true) => {
            aborted = true
            if (abortFetch) {
                controller.abort()
            }
        }
    }

    fetch('/agent/travel-route-plan/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (!response.body) {
            throw new Error('SSE response body is empty')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const processEvents = () => {
            // SSE 事件以两个换行符 \n\n 分隔
            const eventDelimiter = '\n\n'
            let eventIndex = buffer.indexOf(eventDelimiter)

            while (eventIndex !== -1) {
                const eventData = buffer.slice(0, eventIndex)
                buffer = buffer.slice(eventIndex + eventDelimiter.length)

                // 解析事件行（可能有多个 data: 行，需要合并）
                const lines = eventData.split('\n')
                let jsonStr = ''
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        jsonStr += line.slice(6)
                    }
                }

                if (jsonStr && eventSource.onmessage) {
                    try {
                        const data = JSON.parse(jsonStr)
                        eventSource.onmessage({ data })
                    } catch (e) {
                        // 忽略解析错误
                    }
                }

                eventIndex = buffer.indexOf(eventDelimiter)
            }
        }

        const read = () => {
            if (aborted) return

            reader.read().then(({ done, value }) => {
                if (done || aborted) {
                    return
                }

                buffer += decoder.decode(value, { stream: true })
                processEvents()
                read()
            }).catch(error => {
                if (!aborted && !isAbortError(error) && eventSource.onerror) {
                    eventSource.onerror(error)
                }
            })
        }

        read()
    })
    .catch(error => {
        if (!aborted && !isAbortError(error) && eventSource.onerror) {
            eventSource.onerror(error)
        }
    })

    return {
        eventSource,
        cancel: (abortFetch = true) => {
            eventSource.close(abortFetch)
        }
    }
}

// 发送消息（SSE 流式响应）- 简化为直接使用 sendChatMessageStream
export const sendChatMessage = sendChatMessageStream

// ============ 路线收藏接口 ============

// 获取收藏列表
export const getFavoriteRoutes = () => {
    return apiClient.get('/route/list')
}

// 获取收藏详情
export const getFavoriteRouteDetail = (rid) => {
    return apiClient.get(`/route/detail/${rid}`)
}

// 收藏路线
export const favoriteRoute = (mid) => {
    return apiClient.post('/route/favorite', { mid })
}

// 删除收藏
export const deleteFavoriteRoute = (rid) => {
    return apiClient.delete(`/route/delete/${rid}`)
}

// 编辑收藏路线
export const editFavoriteRoute = (rid, data) => {
    return apiClient.put(`/route/edit/${rid}`, data)
}

export default apiClient
