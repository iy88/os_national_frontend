<template>
    <header class="admin-header">
        <!-- 移动端导航按钮 -->
        <div class="mobile-nav-btn">
            <button :disabled="!isLoggedIn" class="hamburger-btn" @click="toggleSidebar">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <line x1="3" x2="21" y1="6" y2="6"/>
                    <line x1="3" x2="21" y1="12" y2="12"/>
                    <line x1="3" x2="21" y1="18" y2="18"/>
                </svg>
            </button>
        </div>

        <div class="header-left">
            <!-- 汉堡菜单按钮（无背景） -->
            <button :disabled="!isLoggedIn" class="menu-btn" @click="toggleSidebar">
                <svg :class="{ open: sidebarOpen }" class="menu-icon" fill="none" stroke="currentColor" stroke-width="2"
                     viewBox="0 0 24 24">
                    <line class="line line-1" x1="3" x2="21" y1="6" y2="6"/>
                    <line class="line line-2" x1="3" x2="21" y1="12" y2="12"/>
                    <line class="line line-3" x1="3" x2="21" y1="18" y2="18"/>
                </svg>
            </button>
            <!-- 竖线分割 -->
            <div class="divider"></div>
            <span class="header-title">后台管理</span>
        </div>

        <div class="header-right">
            <!-- 主题切换 -->
            <button
                :aria-label="theme.effective === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
                :title="theme.effective === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
                class="theme-toggle-btn"
                type="button"
                @click="theme.toggle()"
            >
                <svg
                    v-if="theme.effective === 'dark'"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
                <svg
                    v-else
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            </button>
            <div
                v-if="isLoggedIn"
                :class="{ mobile: isMobile }"
                class="user-dropdown"
                @mouseenter="handleDesktopMouseEnter"
                @mouseleave="handleDesktopMouseLeave"
            >
                <div class="user-trigger" @click.stop="toggleMobileDropdown">
                    <button aria-label="管理员头像" class="avatar-btn" type="button">
                        <img v-if="avatarUrl" :alt="userInfo?.username" :src="avatarUrl"/>
                        <div v-else class="avatar-placeholder">
                            {{ userInfo?.username?.charAt(0) || 'A' }}
                        </div>
                    </button>
                    <span :title="userInfo?.username || ''" class="username-text">{{
                            userInfo?.username || 'Admin'
                        }}</span>
                </div>
                <div v-show="dropdownOpen" class="dropdown-menu">
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
        </div>

        <!-- 侧边栏遮罩 -->
        <div
            v-if="mobileSidebarOpen"
            class="sidebar-overlay"
            @click.stop="closeMobileSidebar"
        ></div>

        <!-- 移动端侧边栏 -->
        <div :class="['sidebar', { open: mobileSidebarOpen }]">
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
                    :class="['sidebar-btn', { active: activeTab === 'index' }]"
                    @click="goToIndex"
                >
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect height="7" width="7" x="3" y="3"/>
                        <rect height="7" width="7" x="14" y="3"/>
                        <rect height="7" width="7" x="14" y="14"/>
                        <rect height="7" width="7" x="3" y="14"/>
                    </svg>
                    首页
                </button>
                <button
                    :class="['sidebar-btn', { active: activeTab === 'roles' }]"
                    @click="goToRoles"
                >
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    角色管理
                </button>
                <button class="sidebar-btn theme-toggle-sidebar-btn" @click="theme.toggle()">
                    <svg
                        v-if="theme.effective === 'dark'"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                    </svg>
                    <svg
                        v-else
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    <span>{{ theme.effective === 'dark' ? '浅色模式' : '深色模式' }}</span>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useUserStore} from '../../stores/user'
import {useThemeStore} from '../../stores/theme'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const theme = useThemeStore()

const props = defineProps({
    sidebarOpen: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['toggle-sidebar'])

const isMobile = ref(false)
const mobileSidebarOpen = ref(false)
const dropdownOpen = ref(false)
let hideTimer = null

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
const avatarUrl = computed(() => userStore.avatarUrl)

const activeTab = computed(() => {
    if (route.path.startsWith('/manage/data/roles')) return 'roles'
    if (route.path.startsWith('/manage/index')) return 'index'
    return 'index'
})

const updateViewport = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth <= 768
    if (!isMobile.value && wasMobile) {
        mobileSidebarOpen.value = false
    }
}

const clearHideTimer = () => {
    if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
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
    if (!isMobile.value) return
    const target = event.target
    if (!(target instanceof Element)) return

    // 关闭移动端 dropdown
    if (dropdownOpen.value && !target.closest('.user-dropdown.mobile')) {
        dropdownOpen.value = false
    }

    // 关闭移动端 sidebar（点击遮罩以外的空白区域兜底）
    if (mobileSidebarOpen.value && !target.closest('.sidebar') && !target.closest('.mobile-nav-btn')) {
        mobileSidebarOpen.value = false
    }
}

const closeMobileSidebar = () => {
    mobileSidebarOpen.value = false
}

const handleLogout = () => {
    clearHideTimer()
    dropdownOpen.value = false
    userStore.logout()
    router.push('/manage/login')
}

const toggleSidebar = () => {
    if (isMobile.value) {
        mobileSidebarOpen.value = !mobileSidebarOpen.value
    } else {
        emit('toggle-sidebar')
    }
}

const goToIndex = () => {
    mobileSidebarOpen.value = false
    router.push('/manage/index')
}

const goToRoles = () => {
    mobileSidebarOpen.value = false
    router.push('/manage/data/roles')
}

onMounted(() => {
    updateViewport()
    window.addEventListener('resize', updateViewport)
    document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateViewport)
    document.removeEventListener('click', handleDocumentClick)
    clearHideTimer()
})
</script>

<style scoped>
.admin-header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background: var(--color-bg-admin);
    border-bottom: 1px solid var(--color-border-subtle);
    backdrop-filter: blur(12px);
    position: relative;
    z-index: 100;
}

.mobile-nav-btn {
    display: none;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.menu-btn {
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.menu-btn:hover:not(:disabled) {
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
}

.menu-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.menu-icon {
    width: 20px;
    height: 20px;
}

.menu-icon .line {
    transition: all 0.3s ease;
    transform-origin: 12px 12px;
}

.menu-icon .line-1 {
    transform: translateY(0) rotate(0deg);
}

.menu-icon .line-2 {
    opacity: 1;
}

.menu-icon .line-3 {
    transform: translateY(0) rotate(0deg);
}

/* X 状态 */
.menu-icon.open .line-1 {
    transform: translateY(6px) rotate(45deg);
}

.menu-icon.open .line-2 {
    opacity: 0;
}

.menu-icon.open .line-3 {
    transform: translateY(-6px) rotate(-45deg);
}

.divider {
    width: 1px;
    height: 24px;
    background: var(--color-border-strong);
}

.header-title {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.02em;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 主题切换按钮 */
.theme-toggle-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-hover);
    border: 1px solid var(--color-admin-soft-border);
    border-radius: 8px;
    color: var(--color-admin);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.theme-toggle-btn svg {
    width: 18px;
    height: 18px;
}

.theme-toggle-btn:hover {
    background: var(--color-admin-soft-bg);
    border-color: var(--color-admin);
    box-shadow: 0 2px 8px var(--color-admin-glow);
}

/* 用户头像下拉菜单 */
.user-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background 0.2s;
}

.user-trigger:hover {
    background: var(--color-bg-hover);
}

.avatar-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--color-admin-soft);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px var(--color-admin-glow);
    background: transparent;
}

.avatar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--color-admin-soft-border-hover);
}

.user-trigger:hover .avatar-btn {
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--color-admin-soft-border-hover);
}

.user-trigger:hover .username-text {
    color: var(--color-admin);
}

.avatar-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-admin-soft-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-admin);
}

.username-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text-tertiary);
    font-size: 0.9rem;
    line-height: 1;
    transition: color 0.2s;
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 100px;
    width: max-content;
    background: var(--color-bg-admin-mid);
    border: 1px solid var(--color-admin-soft-border);
    border-radius: 8px;
    padding: 4px;
    box-shadow: var(--color-shadow-md);
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
    background: var(--color-bg-admin-mid);
    border-left: 1px solid var(--color-admin-soft-border);
    border-top: 1px solid var(--color-admin-soft-border);
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
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
    min-width: 100px;
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
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--color-text-tertiary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.dropdown-item svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-faint);
    flex-shrink: 0;
}

.dropdown-item:hover {
    background: var(--color-admin-soft-bg);
    color: var(--color-text-primary);
}

.dropdown-item:hover svg {
    color: var(--color-admin);
}

.dropdown-item.logout {
    color: var(--color-danger);
}

.dropdown-item.logout svg {
    color: var(--color-danger-soft);
}

.dropdown-item.logout:hover {
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
}

.dropdown-item.logout:hover svg {
    color: var(--color-admin);
}

/* 移动端导航按钮 */
.hamburger-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.hamburger-btn svg {
    width: 20px;
    height: 20px;
}

.hamburger-btn:hover:not(:disabled) {
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
}

.hamburger-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

/* 侧边栏遮罩 */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-overlay-strong);
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

/* 移动端侧边栏 */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background: var(--gradient-panel-admin);
    border-right: 1px solid var(--color-admin-soft-bg);
    z-index: 201;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: var(--color-shadow-lg);
}

.sidebar.open {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-admin-soft-bg);
}

.sidebar-title {
    color: var(--color-admin);
    font-size: 1.1rem;
    font-weight: 600;
}

.close-btn {
    width: 36px;
    height: 36px;
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-muted);
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
    border-color: var(--color-brand-secondary);
    color: var(--color-brand-secondary);
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
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    color: var(--color-text-tertiary);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.sidebar-btn svg {
    width: 22px;
    height: 22px;
    color: var(--color-admin);
}

.sidebar-btn:hover {
    background: var(--color-admin-soft-bg);
    border-color: var(--color-admin-soft-border-hover);
    transform: translateX(4px);
}

.sidebar-btn.active {
    background: var(--gradient-admin-soft);
    border-color: var(--color-admin-soft-border-hover);
    color: var(--color-text-primary);
}

.sidebar-btn.active svg {
    color: var(--color-admin);
}

.theme-toggle-sidebar-btn {
    margin-top: 12px;
    border-top: 1px dashed var(--color-border-subtle);
    padding-top: 18px;
}

@media (max-width: 768px) {
    .admin-header {
        padding: 0 16px;
    }

    .mobile-nav-btn {
        display: flex;
        align-items: center;
    }

    .header-left {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .menu-btn {
        display: none;
    }

    .divider {
        display: none;
    }

    .username-text {
        display: none;
    }
}

@media (max-width: 1024px) {
    .header-right .user-dropdown .dropdown-menu {
        left: auto;
        right: 0;
        transform: none;
        max-width: min(180px, calc(100vw - 32px));
    }

    .header-right .user-dropdown .dropdown-menu::before {
        left: auto;
        right: 20px;
        transform: rotate(45deg);
    }
}
</style>
