import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {adminGetProfile} from '../api'

export const useAdminStore = defineStore('admin', () => {
    const isLoggedIn = ref(false)
    const userInfo = ref(null)

    const avatarUrl = computed(() => {
        if (userInfo.value?.avatarToken) {
            return `/file/avatar/fetch?token=${userInfo.value.avatarToken}`
        }
        return null
    })

    const getToken = () => localStorage.getItem('token')
    const setToken = (token) => localStorage.setItem('token', token)
    const removeToken = () => localStorage.removeItem('token')

    const setUserInfo = (info) => {
        userInfo.value = info
        isLoggedIn.value = true
    }

    const fetchAdminProfile = async () => {
        const result = await adminGetProfile()
        if (result.success && result.userInfo) {
            setUserInfo(result.userInfo)
        }
    }

    const login = (result) => {
        setToken(result.token)
        setUserInfo(result.userInfo)
    }

    const logout = () => {
        removeToken()
        isLoggedIn.value = false
        userInfo.value = null
    }

    return {
        isLoggedIn,
        userInfo,
        avatarUrl,
        getToken,
        login,
        logout,
        setUserInfo,
        fetchAdminProfile
    }
})