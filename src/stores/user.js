import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {getProfile, updateProfile} from '../api'

export const useUserStore = defineStore('user', () => {
    const isLoggedIn = ref(false)
    const userInfo = ref(null)
    const collectedRoutes = ref([])
    const showLoginModal = ref(false)

    // 头像URL计算属性
    const avatarUrl = computed(() => {
        if (userInfo.value?.avatarToken) {
            return `/file/avatar/fetch?token=${userInfo.value.avatarToken}`
        }
        return null
    })

    // Token操作
    const getToken = () => localStorage.getItem('token')
    const setToken = (token) => localStorage.setItem('token', token)
    const removeToken = () => localStorage.removeItem('token')

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
        return await updateProfile(data)
    }

    // 统一登录处理
    const login = (result) => {
        setToken(result.token)
        setUserInfo(result.userInfo)
    }

    // 统一登出处理
    const logout = () => {
        removeToken()
        isLoggedIn.value = false
        userInfo.value = null
        collectedRoutes.value = []
    }

    const removeCollectedRoute = (route) => {
        const index = collectedRoutes.value.indexOf(route)
        if (index > -1) {
            collectedRoutes.value.splice(index, 1)
        }
    }

    return {
        isLoggedIn,
        userInfo,
        collectedRoutes,
        showLoginModal,
        avatarUrl,
        getToken,
        login,
        logout,
        setUserInfo,
        fetchUserProfile,
        updateUserProfile,
        removeCollectedRoute
    }
})
