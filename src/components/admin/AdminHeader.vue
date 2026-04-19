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
            <div
                v-if="isLoggedIn"
                :class="{ mobile: isMobile }"
                class="user-dropdown"
                @mouseenter="handleDesktopMouseEnter"
                @mouseleave="handleDesktopMouseLeave"
            >
                <div class="user-trigger" @click.stop="toggleMobileDropdown">
                    <button aria-label="管理员头像" class="avatar-btn" type="button">
                        <img v-if="avatarUrl" :alt="adminInfo?.username" :src="avatarUrl"/>
                        <div v-else class="avatar-placeholder">
                            {{ adminInfo?.username?.charAt(0) || 'A' }}
                        </div>
                    </button>
                    <span :title="adminInfo?.username || ''" class="username-text">{{
                            adminInfo?.username || 'Admin'
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
            </div>
        </div>
    </header>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAdminStore} from '../../stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

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

const isLoggedIn = computed(() => adminStore.isLoggedIn)
const adminInfo = computed(() => adminStore.adminInfo)
const avatarUrl = computed(() => adminStore.avatarUrl)

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
    adminStore.logout()
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
    background: rgba(10, 10, 15, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.menu-btn:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.06);
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
    background: rgba(255, 255, 255, 0.15);
}

.header-title {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.02em;
}

.header-right {
    display: flex;
    align-items: center;
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
    background: rgba(255, 255, 255, 0.06);
}

.avatar-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(34, 197, 94, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
    background: transparent;
}

.avatar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.user-trigger:hover .avatar-btn {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.user-trigger:hover .username-text {
    color: #4ade80;
}

.avatar-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(34, 197, 94, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: #4ade80;
}

.username-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.85);
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
    background: rgba(15, 15, 20, 0.98);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
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
    background: rgba(15, 15, 20, 0.98);
    border-left: 1px solid rgba(34, 197, 94, 0.2);
    border-top: 1px solid rgba(34, 197, 94, 0.2);
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
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.dropdown-item svg {
    width: 16px;
    height: 16px;
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
}

.dropdown-item:hover {
    background: rgba(34, 197, 94, 0.12);
    color: #fff;
}

.dropdown-item:hover svg {
    color: #4ade80;
}

.dropdown-item.logout {
    color: #f87171;
}

.dropdown-item.logout svg {
    color: rgba(248, 113, 113, 0.7);
}

.dropdown-item.logout:hover {
    background: rgba(248, 113, 113, 0.12);
}

.dropdown-item.logout:hover svg {
    color: #f87171;
}

/* 移动端导航按钮 */
.hamburger-btn {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
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
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.06);
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

/* 移动端侧边栏 */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    background: linear-gradient(145deg, #1a1a1f 0%, #0d0d10 100%);
    border-right: 1px solid rgba(34, 197, 94, 0.15);
    z-index: 201;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
}

.sidebar.open {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(34, 197, 94, 0.15);
}

.sidebar-title {
    color: #4ade80;
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
    color: #4ade80;
}

.sidebar-btn:hover {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
    transform: translateX(4px);
}

.sidebar-btn.active {
    background: linear-gradient(145deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
    border-color: rgba(34, 197, 94, 0.4);
    color: #fff;
}

.sidebar-btn.active svg {
    color: #4ade80;
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
