import {createRouter, createWebHistory} from 'vue-router'
import TravelView from '../views/TravelView.vue'
import DialogueView from '../views/DialogueView.vue'
import UserProfile from '../views/UserProfile.vue'
import BasicInfo from '../views/profile/BasicInfo.vue'
import FavoriteRoutes from '../views/profile/FavoriteRoutes.vue'
import {useUserStore} from '../stores/user'

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

router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    if (to.path.startsWith('/profile') && !userStore.isLoggedIn) {
        userStore.showLoginModal = true
        next('/travel')
    } else {
        next()
    }
})

export default router
