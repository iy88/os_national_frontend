import {createRouter, createWebHistory} from 'vue-router'
import TravelView from '../views/TravelView.vue'
import DialogueView from '../views/DialogueView.vue'
import UserProfile from '../views/UserProfile.vue'
import BasicInfo from '../views/profile/BasicInfo.vue'
import FavoriteRoutes from '../views/profile/FavoriteRoutes.vue'
import {useUserStore} from '../stores/user'
import {getProfile} from '../api'

const routes = [
    {
        path: '/',
        redirect: '/travel'
    },
    {
        path: '/travel',
        name: 'travel',
        component: TravelView
    },
    {
        path: '/dialogue',
        name: 'dialogue',
        component: DialogueView
    },
    {
        path: '/profile',
        name: 'profile',
        component: UserProfile,
        redirect: '/profile/basic',
        children: [
            {
                path: 'basic',
                name: 'basic-info',
                component: BasicInfo
            },
            {
                path: 'favorites',
                name: 'favorite-routes',
                component: FavoriteRoutes
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

let isAutoLoggingIn = false

router.beforeEach(async (to, from) => {
    const userStore = useUserStore()

    // 如果正在自动登录验证中，直接放行
    if (isAutoLoggingIn) {
        return true
    }

    // 如果已登录，直接放行
    if (userStore.isLoggedIn) {
        return true
    }

    // 检查 localStorage 是否有 token
    const token = localStorage.getItem('token')
    if (token) {
        isAutoLoggingIn = true
        try {
            // 尝试获取 profile 验证 token
            const result = await getProfile()
            if (result.success && result.userInfo) {
                userStore.setUserInfo(result.userInfo)
                return true
            } else {
                userStore.logout()
                return redirectToLogin(to)
            }
        } catch (error) {
            // token 无效，使用 store 登出（会清除 token）
            userStore.logout()
            return redirectToLogin(to)
        } finally {
            isAutoLoggingIn = false
        }
    } else {
        // 无 token
        return redirectToLogin(to)
    }

    // 统一跳转和弹窗处理
    function redirectToLogin(to) {
        if (to.path.startsWith('/profile')) {
            userStore.showLoginModal = true
            return '/travel'
        } else {
            return true
        }
    }
})

export default router
