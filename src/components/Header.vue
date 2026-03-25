<template>
    <header class="app-header">
        <div class="header-content">
            <div class="logo-section">
                <h1 class="logo">城竞共生</h1>
                <p class="subtitle">电竞文旅 · 沉浸体验</p>
            </div>
            <div class="nav-tabs">
                <button
                    :class="['tab-btn', { active: activeTab === 'travel' }]"
                    @click="$router.push('/travel')"
                >
                    文旅交互
                </button>
                <button
                    :class="['tab-btn', { active: activeTab === 'dialogue' }]"
                    @click="$router.push('/dialogue')"
                >
                    沉浸对话
                </button>
            </div>
            <button class="login-btn" @click="handleLoginClick">
                {{ isLoggedIn ? userInfo?.username : '登录/注册' }}
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
            <button class="user-btn" @click="handleLoginClick">
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
import {computed, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['open-login'])

const sidebarOpen = ref(false)

const activeTab = computed(() => {
    if (route.path.startsWith('/profile')) return null
    if (route.path.includes('dialogue')) return 'dialogue'
    return 'travel'
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

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

const handleLoginClick = () => {
    if (isLoggedIn.value) {
        router.push('/profile')
    } else {
        emit('open-login')
    }
}
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.app-header {
    background: rgba(20, 30, 55, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-section {
    text-align: left;
}

.logo {
    font-size: 1.8rem;
    font-weight: bold;
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    filter: drop-shadow(0 0 8px rgba(240, 179, 68, 0.3));
}

.subtitle {
    color: rgba(240, 179, 68, 0.8);
    font-size: 0.85rem;
    margin: 4px 0 0 0;
}

.nav-tabs {
    display: flex;
    gap: 12px;
}

.tab-btn {
    padding: 10px 22px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.tab-btn:hover {
    background: rgba(240, 179, 68, 0.1);
    border-color: rgba(240, 179, 68, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25),
    0 0 12px rgba(240, 179, 68, 0.1);
}

.tab-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.tab-btn.active {
    background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(240, 179, 68, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
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

/* 移动端导航 */
.mobile-nav {
    display: none;
    padding: 0 16px;
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
</style>
