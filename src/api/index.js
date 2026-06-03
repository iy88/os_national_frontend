import axios from 'axios'

// 401 认证失败事件发射器（供 router 监听并统一处理跳转/登出）
export const authEvents = {
    handlers: [],
    emit(status) {
        this.handlers.forEach(h => h(status))
    },
    on(handler) {
        this.handlers.push(handler)
    },
    off(handler) {
        this.handlers = this.handlers.filter(h => h !== handler)
    }
}

// 所有请求使用相对路径，走 Vite proxy 或生产环境同源
const apiClient = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器：添加 token，FormData 不设置 Content-Type（让浏览器自动处理）
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器：统一处理错误，401/403 触发 authEvents（token 失效）
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status
        if (status === 401 || status === 403) {
            authEvents.emit(status)
            return Promise.reject({__handled: true, status})
        }
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

// 管理后台登录
export const adminLogin = (data) => {
    const payload = {
        password: data.password
    }
    if (data.username?.includes('@')) {
        payload.email = data.username
    } else if (data.username) {
        payload.username = data.username
    } else if (data.email) {
        payload.email = data.email
    }
    return apiClient.post('/admin/login', payload)
}

// 获取管理员信息
export const adminGetProfile = () => {
    return apiClient.get('/admin/profile')
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
    baseURL: '/api',
    timeout: 30000
})

uploadClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }
        return config
    },
    (error) => Promise.reject(error)
)

uploadClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status
        if (status === 401 || status === 403) {
            authEvents.emit(status)
            return Promise.reject({__handled: true, status})
        }
        const message = error.response?.data?.message || error.message || '上传失败'
        return Promise.reject(new Error(message))
    }
)

export const uploadAvatar = (userId, file) => {
    const formData = new FormData()
    formData.append('user_id', userId)
    formData.append('file', file)
    return uploadClient.post('/file/avatar/upload', formData)
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
    return apiClient.put(`/agent/travel-route-plan/chat/title/edit/${sid}`, {title})
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
        body = {sid, regenerateMid}
    } else if (mid !== null) {
        // 恢复模式：只传 sid 和 mid，不传 content
        body = {sid, mid}
    } else {
        body = sid ? {content, sid} : {content}
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

    fetch('/api/agent/travel-route-plan/message', {
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
                            eventSource.onmessage({data})
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }

                    eventIndex = buffer.indexOf(eventDelimiter)
                }
            }

            const read = () => {
                if (aborted) return

                reader.read().then(({done, value}) => {
                    if (done || aborted) {
                        return
                    }

                    buffer += decoder.decode(value, {stream: true})
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
            if (!aborted && !isAbortError(error)) {
                const s = error.response?.status
                if (s === 401 || s === 403) {
                    authEvents.emit(s)
                    return
                }
                if (eventSource.onerror) eventSource.onerror(error)
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

// ============ Roleplay 角色扮演接口 ============

// 获取角色列表
export const getRoleplayCharacterList = (type, options = {}) => {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page)
    if (options.page_size) params.append('page_size', options.page_size)
    if (options.search) params.append('search', options.search)
    const query = params.toString() ? `?${params}` : ''
    return apiClient.get(`/agent/roleplay/list/${type}${query}`)
}

// 获取角色详情
export const getRoleplayCharacterDetail = (rid) => {
    return apiClient.get(`/agent/roleplay/detail/${rid}`)
}

// 获取角色历史消息
export const getRoleplayMessageList = (rid) => {
    return apiClient.get(`/agent/roleplay/message/list/${rid}`)
}

// 发送角色消息（SSE 流式响应）
// content: 正常发送内容
// mid: 恢复未完成流（不传 content）
// regenerateMid: 重新生成模式（不传 content）
export const sendRoleplayMessageStream = (rid, content = null, mid = null, regenerateMid = null) => {
    const token = localStorage.getItem('token')
    let body
    if (regenerateMid !== null) {
        body = {regenerateMid}
    } else if (mid !== null) {
        body = {mid}
    } else {
        body = {content}
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

    fetch(`/api/agent/roleplay/message/send/${rid}`, {
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
                const eventDelimiter = '\n\n'
                let eventIndex = buffer.indexOf(eventDelimiter)

                while (eventIndex !== -1) {
                    const eventData = buffer.slice(0, eventIndex)
                    buffer = buffer.slice(eventIndex + eventDelimiter.length)

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
                            eventSource.onmessage({data})
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }

                    eventIndex = buffer.indexOf(eventDelimiter)
                }
            }

            const read = () => {
                if (aborted) return

                reader.read().then(({done, value}) => {
                    if (done || aborted) {
                        return
                    }

                    buffer += decoder.decode(value, {stream: true})
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
            if (!aborted && !isAbortError(error)) {
                const s = error.response?.status
                if (s === 401 || s === 403) {
                    authEvents.emit(s)
                    return
                }
                if (eventSource.onerror) eventSource.onerror(error)
            }
        })

    return {
        eventSource,
        cancel: (abortFetch = true) => {
            eventSource.close(abortFetch)
        }
    }
}

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
    return apiClient.post('/route/favorite', {mid})
}

// 删除收藏
export const deleteFavoriteRoute = (rid) => {
    return apiClient.delete(`/route/delete/${rid}`)
}

// 编辑收藏路线
export const editFavoriteRoute = (rid, data) => {
    return apiClient.put(`/route/edit/${rid}`, data)
}

// ============ Admin Roleplay 管理员角色接口 ============

// 创建角色
export const adminCreateRoleplay = (data) => {
    return apiClient.post('/admin/roleplay/create', data)
}

// 更新角色
export const adminUpdateRoleplay = (rid, data) => {
    return apiClient.put(`/admin/roleplay/${rid}/update`, data)
}

// 删除角色
export const adminDeleteRoleplay = (rid) => {
    return apiClient.delete(`/admin/roleplay/${rid}/delete`)
}

// Dashboard 统计
export const adminDashboard = () => {
    return apiClient.get('/admin/dashboard')
}

// ============ Travel Recommendation 旅行推荐接口 ============

// 获取所有启用的旅行推荐（首页地图 + 城市详情共用）
export const getTravelRecommendations = () => {
    return apiClient.get('/travel/recommendation')
}

// 获取单条旅行推荐详情
export const getTravelRecommendationDetail = (recId) => {
    return apiClient.get(`/travel/recommendation/${recId}`)
}

// ============ Travel Recommendation 管理员接口 ============

// 主表 CRUD
export const adminListTravelRecs = (params) => {
    return apiClient.get('/admin/travel/recommendation', {params})
}

export const adminGetTravelRec = (id) => {
    return apiClient.get(`/admin/travel/recommendation/${id}`)
}

export const adminCreateTravelRec = (data) => {
    return apiClient.post('/admin/travel/recommendation', data)
}

export const adminUpdateTravelRec = (id, data) => {
    return apiClient.put(`/admin/travel/recommendation/${id}`, data)
}

export const adminDeleteTravelRec = (id) => {
    return apiClient.delete(`/admin/travel/recommendation/${id}`)
}

// 7 个子表 CRUD（保留备用，本次 UI 不直接调用，统一通过主表 PUT 提交）
const TRAVEL_REC_SUB_RESOURCES = [
    'players', 'heroes', 'esports_info', 'foods', 'travel_tips', 'tasks', 'recommended_routes'
]

export const adminListTravelRecSub = (rid, resource) => {
    return apiClient.get(`/admin/travel/recommendation/${rid}/${resource}`)
}

export const adminCreateTravelRecSub = (rid, resource, data) => {
    return apiClient.post(`/admin/travel/recommendation/${rid}/${resource}`, data)
}

export const adminUpdateTravelRecSub = (rid, resource, itemId, data) => {
    return apiClient.put(`/admin/travel/recommendation/${rid}/${resource}/${itemId}`, data)
}

export const adminDeleteTravelRecSub = (rid, resource, itemId) => {
    return apiClient.delete(`/admin/travel/recommendation/${rid}/${resource}/${itemId}`)
}

export default apiClient
