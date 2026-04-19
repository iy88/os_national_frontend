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
import {useAdminStore} from '../stores/admin'
import {getProfile, adminGetProfile} from '../api'

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
        redirect: '/manage/data/roles'
    },
    {
        path: '/manage/index',
        name: 'admin-index',
        component: () => import('../views/admin/ManageIndex.vue'),
        meta: { requiresAuth: true, authType: 'admin' }
    },
    {
        path: '/manage/login',
        name: 'admin-login',
        component: AdminLogin,
        beforeEnter: (to, from) => {
            // 已登录则跳转到管理后台首页
            if (localStorage.getItem('adminToken')) {
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

// 路由守卫映射配置
const AUTH_CONFIGS = {
    user: {
        tokenKey: 'token',
        loginPage: null,
        redirectPaths: ['/profile', '/route-plan', '/dialogue'],
        loginPath: '/travel',
        verifyApi: getProfile,
        store: () => useUserStore(),
        isLoggedIn: (store) => store.isLoggedIn,
        setUserInfo: (store, info) => store.setUserInfo(info),
        logout: (store) => store.logout(),
        showLoginModal: (store, val) => { store.showLoginModal = val }
    },
    admin: {
        tokenKey: 'adminToken',
        loginPage: '/manage/login',
        redirectPaths: ['/manage'],
        loginPath: '/manage/login',
        verifyApi: adminGetProfile,
        store: () => useAdminStore(),
        isLoggedIn: (store) => store.isLoggedIn,
        setUserInfo: (store, info) => store.setAdminInfo(info),
        logout: (store) => store.logout(),
        showLoginModal: () => {}
    }
}

router.beforeEach(async (to, from) => {
    const authType = to.path.startsWith('/manage') ? 'admin' : 'user'
    const config = AUTH_CONFIGS[authType]
    const store = config.store()

    // 登录页直接放行
    if (config.loginPage && to.path === config.loginPage) {
        return true
    }

    // 已登录，直接放行
    if (store.isLoggedIn) {
        return true
    }

    const token = localStorage.getItem(config.tokenKey)
    if (token) {
        try {
            const result = await config.verifyApi()
            if (result.success) {
                if (authType === 'user' && result.userInfo) {
                    config.setUserInfo(store, result.userInfo)
                } else if (authType === 'admin' && result.adminInfo) {
                    config.setUserInfo(store, result.adminInfo)
                }
                return true
            } else {
                config.logout(store)
                return config.loginPath
            }
        } catch (error) {
            config.logout(store)
            return config.loginPath
        }
    } else {
        // 无 token，判断是否需要拦截
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
