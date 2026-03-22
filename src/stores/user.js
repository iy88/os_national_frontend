import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref(null)
  const collectedRoutes = ref([])

  const register = (userData) => {
    userInfo.value = {
      username: userData.username,
      phone: userData.phone,
      gender: userData.gender,
      age: userData.age,
      basicInfo: userData.basicInfo,
      intro: userData.intro,
      avatar: userData.avatar || ''
    }
    isLoggedIn.value = true
    collectedRoutes.value = []
  }

  const login = (username, password) => {
    if (username && password) {
      userInfo.value = {
        username: username,
        phone: '',
        avatar: ''
      }
      isLoggedIn.value = true
      collectedRoutes.value = []
      return true
    }
    return false
  }

  const logout = () => {
    isLoggedIn.value = false
    userInfo.value = null
    collectedRoutes.value = []
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

  return {
    isLoggedIn,
    userInfo,
    collectedRoutes,
    register,
    login,
    logout,
    addCollectedRoute,
    removeCollectedRoute
  }
})
