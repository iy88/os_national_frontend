import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useUserStore = defineStore('user', () => {
    const isLoggedIn = ref(false)
    const userInfo = ref(null)
    const collectedRoutes = ref([])
    const showLoginModal = ref(false)

    // 从 API 响应设置用户信息
    const setUserInfo = (info) => {
        userInfo.value = {
            uid: info.uid,
            username: info.username,
            email: info.email,
            avatar: info.avatar || ''
        }
        isLoggedIn.value = true
        collectedRoutes.value = []
    }

    const logout = () => {
        isLoggedIn.value = false
        userInfo.value = null
        collectedRoutes.value = []
    }

    const updateField = (key, value) => {
        if (userInfo.value) {
            userInfo.value[key] = value
        }
    }

    const addCollectedRoute = (route) => {
        if (!collectedRoutes.value.includes(route)) {
            collectedRoutes.value.push(route)
        }
    }

    const removeCollectedRoute = (route) => {
        const index = collectedRoutes.value.indexOf(route)
        if (index > -1) {
            collectedRoutes.value.splice(index, 1)
        }
    }

    // 初始化时检查本地存储的 token
    const initAuth = () => {
        const token = localStorage.getItem('token')
        if (token) {
            // TODO: 可以在这里验证 token 有效性
            // 目前简单处理，刷新页面后需要重新登录
        }
    }

    return {
        isLoggedIn,
        userInfo,
        collectedRoutes,
        showLoginModal,
        setUserInfo,
        logout,
        updateField,
        addCollectedRoute,
        removeCollectedRoute,
        initAuth
    }
})
