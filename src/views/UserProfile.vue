<template>
    <div class="profile-layout">
        <!-- 侧边栏 -->
        <aside class="profile-sidebar">
            <div class="sidebar-header">
                <div class="user-avatar" @click="goToProfile">
                    <img v-if="avatarUrl" :alt="userInfo?.username" :src="avatarUrl"/>
                    <div v-else class="avatar-placeholder">
                        {{ userInfo?.username?.charAt(0) || 'U' }}
                    </div>
                </div>
                <div class="user-info">
                    <span class="username">{{ userInfo?.username || '未登录' }}</span>
                    <span class="user-level">会员</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <span class="nav-section-title">账户管理</span>
                    <router-link
                        v-for="item in navItems"
                        :key="item.path"
                        :to="item.path"
                        active-class="active"
                        class="nav-item"
                    >
                        <span class="nav-icon" v-html="item.icon"></span>
                        <span class="nav-label">{{ item.label }}</span>
                    </router-link>
                </div>
            </nav>

            <div class="sidebar-footer">
                <button class="logout-btn" @click="handleLogout">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" x2="9" y1="12" y2="12"/>
                    </svg>
                    退出登录
                </button>
            </div>
        </aside>

        <!-- 主内容区 -->
        <main class="profile-main">
            <div class="main-header">
                <h1 class="page-title">{{ currentTitle }}</h1>
                <p class="page-desc">{{ currentDesc }}</p>
            </div>
            <div class="content-card">
                <router-view v-if="isLoggedIn"/>
                <div v-else class="login-prompt">
                    <svg class="prompt-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                    </svg>
                    <p>请先登录后再访问个人中心</p>
                    <el-button class="login-btn" type="primary" @click="userStore.showLoginModal = true">
                        去登录
                    </el-button>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '../stores/user'
import {ElMessage} from 'element-plus'

defineEmits(['open-login'])

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

const avatarUrl = computed(() => {
    if (userInfo.value?.avatarToken) {
        return `/file/avatar/fetch?token=${userInfo.value.avatarToken}`
    }
    return null
})

const navItems = [
    {
        path: '/profile/basic',
        label: '基本信息',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        title: '基本信息',
        desc: '管理您的个人资料信息'
    },
    {
        path: '/profile/favorites',
        label: '收藏路线',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
        title: '我的收藏',
        desc: '管理您收藏的旅游路线'
    }
]

const currentTitle = computed(() => {
    const item = navItems.find(i => route.path.includes(i.path.split('/').pop()))
    return item?.title || '个人中心'
})

const currentDesc = computed(() => {
    const item = navItems.find(i => route.path.includes(i.path.split('/').pop()))
    return item?.desc || ''
})

const goToProfile = () => {
    router.push('/profile/basic')
}

const handleLogout = () => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/travel')
}
</script>

<style scoped>
.profile-layout {
    display: flex;
    min-height: calc(100vh - 80px);
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    gap: 24px;
}

/* 侧边栏 */
.profile-sidebar {
    width: 260px;
    flex-shrink: 0;
    background: rgba(30, 45, 80, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: fit-content;
    position: sticky;
    top: 104px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 20px;
}

.user-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #f0b344;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.25);
}

.user-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.35);
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: bold;
    color: #fff;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.username {
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
}

.user-level {
    color: #f0b344;
    font-size: 0.8rem;
    background: rgba(240, 179, 68, 0.12);
    padding: 2px 8px;
    border-radius: 4px;
    width: fit-content;
}

/* 导航 */
.sidebar-nav {
    flex: 1;
}

.nav-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.nav-section-title {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 12px;
    margin-bottom: 8px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.nav-item:hover {
    background: rgba(240, 179, 68, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(240, 179, 68, 0.15);
}

.nav-item.active {
    background: linear-gradient(145deg, rgba(240, 179, 68, 0.15) 0%, rgba(230, 57, 70, 0.1) 100%);
    color: #f0b344;
    border-color: rgba(240, 179, 68, 0.3);
}

.nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-icon :deep(svg) {
    width: 100%;
    height: 100%;
}

.nav-item.active .nav-icon {
    color: #f0b344;
}

/* 底部 */
.sidebar-footer {
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: 20px;
}

.logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    background: rgba(230, 57, 70, 0.1);
    border: 1px solid rgba(230, 57, 70, 0.2);
    border-radius: 8px;
    color: #e63946;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.logout-btn svg {
    width: 18px;
    height: 18px;
}

.logout-btn:hover {
    background: rgba(230, 57, 70, 0.2);
    border-color: rgba(230, 57, 70, 0.35);
    transform: translateY(-1px);
}

/* 主内容区 */
.profile-main {
    flex: 1;
    min-width: 0;
}

.main-header {
    margin-bottom: 20px;
}

.page-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 6px 0;
}

.page-desc {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    margin: 0;
}

.content-card {
    background: rgba(30, 45, 80, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 28px;
    min-height: 500px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* 未登录提示 */
.login-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
}

.prompt-icon {
    width: 64px;
    height: 64px;
    color: rgba(240, 179, 68, 0.5);
    margin-bottom: 20px;
}

.login-prompt p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24px;
    font-size: 1rem;
}

.login-btn {
    background: linear-gradient(145deg, #f0b344 0%, #d4962e 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 32px;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3);
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(240, 179, 68, 0.4);
}

/* 响应式 */
@media (max-width: 768px) {
    .profile-layout {
        flex-direction: column;
        padding: 16px;
    }

    .profile-sidebar {
        width: 100%;
        position: static;
    }

    .sidebar-nav {
        display: flex;
        gap: 8px;
        overflow-x: auto;
    }

    .nav-section {
        flex-direction: row;
        gap: 8px;
    }

    .nav-section-title {
        display: none;
    }

    .nav-item {
        white-space: nowrap;
    }
}
</style>
