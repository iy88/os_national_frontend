import {defineStore} from 'pinia'
import {ref} from 'vue'
import {getProfile, updateProfile} from '../api'

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
            gender: info.gender || '',
            age: info.age || '',
            basicInfo: info.basicInfo || '',
            bio: info.bio || '',
            avatarToken: info.avatarToken || ''
        }
        isLoggedIn.value = true
        collectedRoutes.value = []
    }

    // 获取用户完整信息
    const fetchUserProfile = async () => {
        const result = await getProfile()
        if (result.success && result.userInfo) {
            setUserInfo(result.userInfo)
        }
    }

    // 更新用户信息
    const updateUserProfile = async (data) => {
        const result = await updateProfile(data)
        if (result.success && result.userInfo) {
            setUserInfo(result.userInfo)
        }
        return result
    }

    const logout = () => {
        localStorage.removeItem('token')
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
        fetchUserProfile,
        updateUserProfile,
        logout,
        updateField,
        addCollectedRoute,
        removeCollectedRoute,
        initAuth
    }
})
