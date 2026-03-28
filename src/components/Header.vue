<template>
    <header class="app-header">
        <div class="header-content">
            <div class="logo-section">
                <div class="brand-icon">🏆</div>
                <h1 class="logo">城竞共生</h1>
            </div>
            <div class="nav-tabs">
                <button
                    :class="['tab-btn', { active: activeTab === 'travel' }]"
                    @click="$router.push('/travel')"
                >
                    文旅探索
                </button>
                <button
                    :class="['tab-btn', { active: activeTab === 'route-plan' }]"
                    @click="$router.push('/route-plan')"
                >
                    路线规划
                </button>
                <button
                    :class="['tab-btn', { active: activeTab === 'dialogue' }]"
                    @click="$router.push('/dialogue')"
                >
                    沉浸对话
                </button>
            </div>
            <!-- 登录后显示头像下拉 -->
            <div
                v-if="authReady && isLoggedIn"
                class="user-dropdown"
                @mouseenter="handleDesktopMouseEnter"
                @mouseleave="handleDesktopMouseLeave"
            >
                <div class="user-trigger">
                    <button class="avatar-btn" type="button" aria-label="用户头像">
                        <img v-if="avatarUrl" :alt="userInfo?.username" :src="avatarUrl"/>
                        <div v-else class="avatar-placeholder">
                            {{ userInfo?.username?.charAt(0) || 'U' }}
                        </div>
                    </button>
                    <span class="username-text" :title="userInfo?.username || ''">{{ userInfo?.username || '用户' }}</span>
                </div>
                <div v-show="dropdownOpen" class="dropdown-menu">
                    <button class="dropdown-item" @click="goToProfile">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        个人中心
                    </button>
                    <button class="dropdown-item logout" @click="handleLogout">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                        退出登录
                    </button>
                </div>
            </div>
            <button v-if="authReady && !isLoggedIn" class="login-btn" @click="handleLoginClick">
                登录/注册
            </button>
        </div>

        <!-- 移动端导航 -->
        <div class="mobile-nav">
            <button class="hamburger-btn" @click="toggleSidebar">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="3" x2="21" y1="6" y2="6"/>
                    <line x1="3" x2="21" y1="12" y2="12"/>
                    <line x1="3" x2="21" y1="18" y2="18"/>
                </svg>
            </button>
            <h1 class="mobile-logo">城竞共生</h1>
            <!-- 移动端已登录显示头像下拉 -->
            <div v-if="authReady && isLoggedIn" class="user-dropdown mobile">
                <button class="avatar-btn small" @click.stop="toggleMobileDropdown">
                    <img v-if="avatarUrl" :alt="userInfo?.username" :src="avatarUrl"/>
                    <div v-else class="avatar-placeholder">
                        {{ userInfo?.username?.charAt(0) || 'U' }}
                    </div>
                </button>
                <div v-show="dropdownOpen" class="dropdown-menu">
                    <button class="dropdown-item" @click="goToProfile">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        个人中心
                    </button>
                    <button class="dropdown-item logout" @click="handleLogout">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                        退出登录
                    </button>
                </div>
            </div>
            <button v-if="authReady && !isLoggedIn" class="user-btn" @click="handleLoginClick">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
            </button>
        </div>

        <!-- 侧边栏遮罩 -->
        <div
            v-if="sidebarOpen"
            class="sidebar-overlay"
            @click="toggleSidebar"
        ></div>

        <!-- 侧边栏 -->
        <div :class="['sidebar', { open: sidebarOpen }]">
            <div class="sidebar-header">
                <span class="sidebar-title">菜单</span>
                <button class="close-btn" @click="toggleSidebar">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <line x1="18" x2="6" y1="6" y2="18"/>
                        <line x1="6" x2="18" y1="6" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="sidebar-content">
                <button
                    :class="['sidebar-btn', { active: activeTab === 'travel' }]"
                    @click="goToTravel"
                >
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    文旅交互
                </button>
                <button
                    :class="['sidebar-btn', { active: activeTab === 'route-plan' }]"
                    @click="goToRoutePlan"
                >
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M3 6h18"/>
                        <path d="M7 12h10"/>
                        <path d="M10 18h4"/>
                    </svg>
                    路线规划
                </button>
                <button
                    :class="['sidebar-btn', { active: activeTab === 'dialogue' }]"
                    @click="goToDialogue"
                >
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    沉浸对话
                </button>
            </div>
        </div>
    </header>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['open-login'])

const sidebarOpen = ref(false)
const dropdownOpen = ref(false)
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
const routeReady = ref(false)
const authReady = ref(false)

let hideTimer = null

const clearHideTimer = () => {
    if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
    }
}

const updateViewport = () => {
    isMobile.value = window.innerWidth <= 768
    if (!isMobile.value) {
        dropdownOpen.value = false
    }
}

const handleDesktopMouseEnter = () => {
    if (isMobile.value) return
    clearHideTimer()
    dropdownOpen.value = true
}

const handleDesktopMouseLeave = () => {
    if (isMobile.value) return
    clearHideTimer()
    hideTimer = setTimeout(() => {
        dropdownOpen.value = false
    }, 220)
}

const toggleMobileDropdown = () => {
    if (!isMobile.value) return
    clearHideTimer()
    dropdownOpen.value = !dropdownOpen.value
}

const handleDocumentClick = (event) => {
    if (!isMobile.value || !dropdownOpen.value) return
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest('.user-dropdown.mobile')) {
        dropdownOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('resize', updateViewport)
    document.addEventListener('click', handleDocumentClick)
    router.isReady().then(() => {
        routeReady.value = true
        authReady.value = true
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', updateViewport)
    document.removeEventListener('click', handleDocumentClick)
    clearHideTimer()
})

const activeTab = computed(() => {
    if (!routeReady.value) return null
    if (route.path.startsWith('/profile')) return null
    if (route.path.startsWith('/route-plan')) return 'route-plan'
    if (route.path.startsWith('/dialogue')) return 'dialogue'
    if (route.path.startsWith('/travel')) return 'travel'
    return null
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const avatarUrl = computed(() => userStore.avatarUrl)

const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}

const goToTravel = () => {
    sidebarOpen.value = false
    router.push('/travel')
}

const goToDialogue = () => {
    sidebarOpen.value = false
    router.push('/dialogue')
}

const goToRoutePlan = () => {
    sidebarOpen.value = false
    router.push('/route-plan')
}

const handleLoginClick = () => {
    emit('open-login')
}

const goToProfile = () => {
    clearHideTimer()
    dropdownOpen.value = false
    router.push('/profile')
}

const handleLogout = () => {
    clearHideTimer()
    dropdownOpen.value = false
    userStore.logout()
    router.push('/travel')
}
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.app-header {
    --desktop-dropdown-reserve: 86px;
    background: rgba(15, 26, 42, 0.96);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 10px 0;
    position: sticky;
    top: 0;
    z-index: 260;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.header-content {
    max-width: none;
    width: 100%;
    margin: 0 auto;
    padding: 0 var(--desktop-dropdown-reserve);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 0;
}

.brand-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: linear-gradient(135deg, #f0b344 0%, #e63946 100%);
    font-size: 0.88rem;
}

.logo {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f0b344;
    margin: 0;
    letter-spacing: 0.2px;
}

.nav-tabs {
    display: flex;
    gap: 6px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.tab-btn {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 0.84rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
}

.tab-btn:active {
    transform: none;
}

.tab-btn.active {
    background: rgba(240, 179, 68, 0.1);
    color: #f0b344;
    border-color: rgba(240, 179, 68, 0.3);
}

.login-btn {
    padding: 10px 22px;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(240, 179, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.login-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(240, 179, 68, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 用户头像下拉菜单 */
.user-dropdown {
    position: relative;
    padding-right: 0;
    display: inline-flex;
    align-items: center;
}

.login-btn {
    margin-right: 0;
}

.user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    cursor: pointer;
}

.username-text {
    max-width: 128px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.86);
    font-size: 0.9rem;
    line-height: 1;
}

.avatar-btn {
    width: 42px;
    height: 42px;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #f0b344;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(240, 179, 68, 0.25);
}

.avatar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.35);
}

.user-trigger:hover .avatar-btn {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.35);
}

.user-trigger:hover .username-text {
    color: #f0b344;
}

.avatar-btn img {
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
    font-size: 1.1rem;
    font-weight: bold;
    color: #fff;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 160px;
    background: rgba(30, 45, 80, 0.98);
    border: 1px solid rgba(240, 179, 68, 0.2);
    border-radius: 8px;
    padding: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    z-index: 320;
    animation: dropdownFadeIn 0.15s ease;
}

.dropdown-menu::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 10px;
    height: 10px;
    background: rgba(30, 45, 80, 0.98);
    border-left: 1px solid rgba(240, 179, 68, 0.2);
    border-top: 1px solid rgba(240, 179, 68, 0.2);
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.avatar-btn.small {
    width: 36px;
    height: 36px;
}

.avatar-btn.small .avatar-placeholder {
    font-size: 0.95rem;
}

.user-dropdown.mobile {
    position: static;
}

.user-dropdown.mobile .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 8px;
    left: auto;
    transform: none;
}

.user-dropdown.mobile .dropdown-menu::before {
    left: auto;
    right: 20px;
    transform: rotate(45deg);
}

.dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.dropdown-item svg {
    width: 18px;
    height: 18px;
    color: rgba(255, 255, 255, 0.6);
}

.dropdown-item:hover {
    background: rgba(240, 179, 68, 0.12);
    color: #fff;
}

.dropdown-item:hover svg {
    color: #f0b344;
}

.dropdown-item.logout {
    color: #e63946;
}

.dropdown-item.logout svg {
    color: rgba(230, 57, 70, 0.7);
}

.dropdown-item.logout:hover {
    background: rgba(230, 57, 70, 0.15);
}

.dropdown-item.logout:hover svg {
    color: #e63946;
}

/* 移动端导航 */
.mobile-nav {
    display: none;
    padding: 0 8px;
    align-items: center;
    justify-content: space-between;
    height: 56px;
}

.mobile-logo {
    font-size: 1.2rem;
    font-weight: bold;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
}

.hamburger-btn,
.user-btn {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(240, 179, 68, 0.3);
    border-radius: 10px;
    color: #f0b344;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.hamburger-btn svg,
.user-btn svg {
    width: 22px;
    height: 22px;
}

.hamburger-btn:hover,
.user-btn:hover {
    background: rgba(240, 179, 68, 0.15);
    border-color: rgba(240, 179, 68, 0.3);
}

/* 侧边栏遮罩 */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* 侧边栏 */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border-right: 1px solid rgba(240, 179, 68, 0.2);
    z-index: 201;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
}

.sidebar.open {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(240, 179, 68, 0.15);
}

.sidebar-title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

.close-btn {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-btn svg {
    width: 18px;
    height: 18px;
}

.close-btn:hover {
    background: rgba(230, 57, 70, 0.2);
    border-color: rgba(230, 57, 70, 0.4);
    color: #e63946;
}

.sidebar-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sidebar-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.sidebar-btn svg {
    width: 22px;
    height: 22px;
    color: #f0b344;
}

.sidebar-btn:hover {
    background: rgba(240, 179, 68, 0.1);
    border-color: rgba(240, 179, 68, 0.3);
    transform: translateX(4px);
}

.sidebar-btn.active {
    background: linear-gradient(145deg, rgba(240, 179, 68, 0.2) 0%, rgba(230, 57, 70, 0.15) 100%);
    border-color: rgba(240, 179, 68, 0.4);
    color: #fff;
}

.sidebar-btn.active svg {
    color: #f0b344;
}

@media (max-width: 768px) {
    .app-header {
        height: auto;
        padding: 0;
    }

    .header-content {
        display: none;
    }

    .mobile-nav {
        display: flex;
    }
}

@media (max-width: 1280px) {
    .app-header {
        --desktop-dropdown-reserve: 66px;
    }
}

@media (max-width: 1024px) {
    .app-header {
        --desktop-dropdown-reserve: 24px;
    }

    .header-content {
        padding-left: max(24px, env(safe-area-inset-left));
        padding-right: max(24px, env(safe-area-inset-right));
    }

    .username-text {
        max-width: 96px;
    }

    .header-content .user-dropdown .dropdown-menu {
        left: auto;
        right: 0;
        transform: none;
        max-width: min(220px, calc(100vw - 32px));
    }

    .header-content .user-dropdown .dropdown-menu::before {
        left: auto;
        right: 20px;
        transform: rotate(45deg);
    }
}
</style>
