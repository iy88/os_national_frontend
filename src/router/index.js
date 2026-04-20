import {createRouter, createWebHistory} from 'vue-router'
import TravelView from '../views/TravelView.vue'
import DialogueView from '../views/DialogueView.vue'
import RoutePlanView from '../views/RoutePlanView.vue'
import UserProfile from '../views/UserProfile.vue'
import BasicInfo from '../views/profile/BasicInfo.vue'
import FavoriteRoutes from '../views/profile/FavoriteRoutes.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import Roles from '../views/admin/data/Roles.vue'
import {useUserStore} from '../stores/user'
import {adminGetProfile, getProfile, authEvents} from '../api'

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
        path: '/route-plan',
        name: 'route-plan',
        component: RoutePlanView
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
    },

    // 管理后台路由
    {
        path: '/manage',
        redirect: '/manage/index'
    },
    {
        path: '/manage/index',
        name: 'admin-index',
        component: () => import('../views/admin/ManageIndex.vue'),
        meta: {requiresAuth: true, authType: 'admin'}
    },
    {
        path: '/manage/login',
        name: 'admin-login',
        component: AdminLogin,
        beforeEnter: (to, from) => {
            if (localStorage.getItem('token')) {
                return '/manage'
            }
            return true
        }
    },
    {
        path: '/manage/data/roles',
        name: 'admin-roles',
        component: Roles
    },
    // 404 兜底路由（必须放在最后）
    {
        path: '/:pathMatch(.*)*',
        redirect: (to) => {
            if (to.path.startsWith('/manage')) {
                return '/manage'
            }
            return '/travel'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const AUTH_CONFIGS = {
    user: {
        loginPage: null,
        redirectPaths: ['/profile', '/route-plan', '/dialogue'],
        loginPath: '/travel',
        verifyApi: getProfile,
        store: () => useUserStore(),
        isLoggedIn: (store) => store.isLoggedIn,
        setUserInfo: (store, info) => store.setUserInfo(info),
        logout: (store) => store.logout(),
        showLoginModal: (store, val) => {
            store.showLoginModal = val
        }
    },
    admin: {
        loginPage: '/manage/login',
        redirectPaths: ['/manage'],
        loginPath: '/manage/login',
        verifyApi: adminGetProfile,
        store: () => useUserStore(),
        isLoggedIn: (store) => store.isLoggedIn,
        setUserInfo: (store, info) => store.setUserInfo(info),
        logout: (store) => store.logout(),
        showLoginModal: () => {
        }
    }
}

// 监听 authEvents，统一处理 401/403 跳转/登出
authEvents.on((status) => {
    if (status !== 401 && status !== 403) return
    const path = router.currentRoute.value.path
    const authType = path.startsWith('/manage') ? 'admin' : 'user'
    const config = AUTH_CONFIGS[authType]
    const store = config.store()
    config.logout(store)
    if (authType === 'user') {
        store.showLoginModal = true
        router.push('/travel')
    } else {
        router.push('/manage/login')
    }
})

router.beforeEach(async (to, from) => {
    const authType = to.path.startsWith('/manage') ? 'admin' : 'user'
    const config = AUTH_CONFIGS[authType]
    const store = config.store()

    if (config.loginPage && to.path === config.loginPage) {
        return true
    }

    if (store.isLoggedIn) {
        return true
    }

    const token = localStorage.getItem('token')
    if (token) {
        try {
            const result = await config.verifyApi()
            if (result.success && result.userInfo) {
                config.setUserInfo(store, result.userInfo)
                return true
            }
        } catch (error) {
            // 验证失败，authEvents 已触发登出
        }
        if (!config.redirectPaths.some(p => to.path.startsWith(p))) {
            return true
        }
        return config.loginPath
    } else {
        if (config.redirectPaths.some(p => to.path.startsWith(p))) {
            if (authType === 'user') {
                config.showLoginModal(store, true)
                return config.loginPath
            }
            return config.loginPath
        }
        return true
    }
})

export default router