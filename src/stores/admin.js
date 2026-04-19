import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {adminGetProfile} from '../api'

export const useAdminStore = defineStore('admin', () => {
    const isLoggedIn = ref(false)
    const adminInfo = ref(null)

    const avatarUrl = computed(() => {
        if (adminInfo.value?.avatarToken) {
            return `/file/avatar/fetch?token=${adminInfo.value.avatarToken}`
        }
        return null
    })

    const getToken = () => localStorage.getItem('adminToken')
    const setToken = (token) => localStorage.setItem('adminToken', token)
    const removeToken = () => localStorage.removeItem('adminToken')

    const setAdminInfo = (info) => {
        adminInfo.value = {
            uid: info.uid,
            username: info.username,
            email: info.email,
            avatarToken: info.avatarToken || ''
        }
        isLoggedIn.value = true
    }

    const fetchAdminProfile = async () => {
        const result = await adminGetProfile()
        if (result.success && result.adminInfo) {
            setAdminInfo(result.adminInfo)
        }
    }

    const login = (result) => {
        setToken(result.token)
        setAdminInfo(result.adminInfo)
    }

    const logout = () => {
        removeToken()
        isLoggedIn.value = false
        adminInfo.value = null
    }

    return {
        isLoggedIn,
        adminInfo,
        avatarUrl,
        getToken,
        login,
        logout,
        setAdminInfo,
        fetchAdminProfile
    }
})
