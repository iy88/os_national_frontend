import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref(null)
  const collectedRoutes = ref([])
  const showLoginModal = ref(false)

  const register = (userData) => {
    userInfo.value = {
      username: userData.username,
      email: userData.email,
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
        email: '',
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

  return {
    isLoggedIn,
    userInfo,
    collectedRoutes,
    showLoginModal,
    register,
    login,
    logout,
    updateField,
    addCollectedRoute,
    removeCollectedRoute
  }
})
