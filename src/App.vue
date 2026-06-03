<template>
    <div :class="['app-container', { 'is-admin': isManageRoute }]">
        <template v-if="!isManageRoute">
            <Header @open-login="userStore.showLoginModal = true"/>
            <main class="main-content">
                <router-view/>
            </main>
            <LoginModal v-model="userStore.showLoginModal"/>
        </template>
        <template v-else>
            <AdminHeader :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar"/>
            <!-- 桌面端侧边栏遮罩 -->
            <div
                v-if="sidebarOpen"
                class="admin-sidebar-overlay"
                @click="toggleSidebar"
            ></div>
            <div class="admin-layout">
                <!-- 桌面端左侧导航 -->
                <nav :class="['admin-sidebar', { open: sidebarOpen }]">
                    <button
                        :class="['sidebar-item', { active: activeManageTab === 'index' }]"
                        @click="$router.push('/manage/index')"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <rect height="7" width="7" x="3" y="3"/>
                            <rect height="7" width="7" x="14" y="3"/>
                            <rect height="7" width="7" x="14" y="14"/>
                            <rect height="7" width="7" x="3" y="14"/>
                        </svg>
                        <span>首页</span>
                    </button>
                    <button
                        :class="['sidebar-item', { active: activeManageTab === 'roles' }]"
                        @click="$router.push('/manage/data/roles')"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>角色管理</span>
                    </button>
                    <button
                        :class="['sidebar-item', { active: activeManageTab === 'travel-recs' }]"
                        @click="$router.push('/manage/data/travel-recommendations')"
                    >
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>推荐管理</span>
                    </button>
                </nav>
                <div class="admin-content">
                    <router-view/>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import Header from './components/Header.vue'
import LoginModal from './components/LoginModal.vue'
import AdminHeader from './components/admin/AdminHeader.vue'
import {useUserStore} from './stores/user'

const route = useRoute()
const userStore = useUserStore()

// 避免首屏闪烁：setup 时直接读取浏览器地址栏路径，绕过异步路由守卫导致的 route.path 延迟更新
const initialPath = typeof window !== 'undefined' ? window.location.pathname : route.path
const isManageRoute = ref(initialPath.startsWith('/manage'))
const computeActiveManageTab = (path) => {
    if (path.startsWith('/manage/data/travel-recommendations')) return 'travel-recs'
    if (path.startsWith('/manage/data/roles')) return 'roles'
    return 'index'
}
const activeManageTab = ref(computeActiveManageTab(initialPath))

// 路由变化时更新
watch(() => route.path, (path) => {
    isManageRoute.value = path.startsWith('/manage')
    activeManageTab.value = computeActiveManageTab(path)
})

const sidebarOpen = ref(false)
const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
}
</script>

<style scoped>
.admin-content {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
}

.admin-layout {
    flex: 1;
    display: flex;
    min-height: 0;
}

.admin-sidebar {
    position: fixed;
    top: 56px;
    left: 0;
    width: 200px;
    height: calc(100vh - 56px);
    background: var(--color-bg-admin);
    border-right: 1px solid var(--color-border-subtle);
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 50;
}

.admin-sidebar.open {
    transform: translateX(0);
}

.admin-sidebar-overlay {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-overlay);
    z-index: 49;
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

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;
}

.sidebar-item svg {
    width: 20px;
    height: 20px;
    color: var(--color-admin-soft);
    flex-shrink: 0;
}

.sidebar-item:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-secondary);
    border-color: var(--color-border-subtle);
}

.sidebar-item.active {
    background: var(--color-admin-soft-bg);
    color: var(--color-admin);
    border-color: var(--color-admin-soft-border);
}

.sidebar-item.active svg {
    color: var(--color-admin);
}

@media (max-width: 768px) {
    .admin-sidebar {
        display: none;
    }
}
</style>

<!--suppress CssUnusedSymbol -->
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scrollbar-gutter: stable;
}

body {
    font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
    background: var(--gradient-body);
    background-size: var(--gradient-body-size);
    background-attachment: fixed;
    color: var(--color-text-primary);
    min-height: 100vh;
    transition: background 0.2s ease, color 0.2s ease;
}

/* Element Plus lock-scroll 会给 body 加压缩宽度，导致底层布局横向抖动。 */
body.el-popup-parent--hidden {
    width: 100% !important;
}

#app {
    width: 100%;
    min-height: 100vh;
    height: 100dvh;
    overflow: hidden;
}

.app-container {
    width: 100%;
    min-height: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: hidden;
}

/* 让所有直接子元素（如 router-view）填充剩余高度 */
.main-content > * {
    flex: 1;
    min-height: 0;
    min-width: 0;
    width: 100%;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: var(--color-scrollbar-track);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--color-scrollbar-thumb-hover);
}

/* Element Plus 全局覆盖 */
:root[data-theme="dark"] .el-button--primary {
    --el-button-bg-color: #f0b344;
    --el-button-border-color: #f0b344;
    --el-button-hover-bg-color: #ffbe4a;
    --el-button-hover-border-color: #ffbe4a;
}

.el-message {
    border-radius: 6px;
}

/* Element Plus CSS 变量 - 由 tokens.css 中的 :root[data-theme] 提供，此处不再覆写 */

/* 用户端 Element Plus 暗色覆写 - 仅在深色主题下生效 */
:root[data-theme="dark"] .el-select-dropdown,
:root[data-theme="dark"] .el-select-dropdown__popper,
:root[data-theme="dark"] .el-select-dropdown__popper.el-popper[role="listbox"] {
    --el-bg-color-overlay: var(--color-bg-elevated) !important;
    --el-fill-color-light: rgba(240, 179, 68, 0.12) !important;
    --el-text-color-regular: rgba(255, 255, 255, 0.9) !important;
    --el-border-color-hover: rgba(240, 179, 68, 0.4) !important;
}

:root[data-theme="dark"] .el-select-dropdown__popper {
    background: var(--color-bg-elevated) !important;
    border: 1px solid rgba(240, 179, 68, 0.2) !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

:root[data-theme="dark"] .el-select-dropdown__popper .el-popper__arrow::before {
    background: var(--color-bg-elevated) !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

/* Element Plus 暗色表单组件 */
:root[data-theme="dark"] .el-input__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
}

:root[data-theme="dark"] .el-input__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

:root[data-theme="dark"] .el-input__wrapper.is-focus {
    border-color: #f0b344 !important;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15) !important;
}

:root[data-theme="dark"] .el-input__inner {
    color: #fff !important;
}

:root[data-theme="dark"] .el-input__inner::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* Select 组件 - 关键修复 */
:root[data-theme="dark"] .el-select__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    min-height: 32px !important;
}

:root[data-theme="dark"] .el-select__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

:root[data-theme="dark"] .el-select__wrapper.is-focused,
:root[data-theme="dark"] .el-select__wrapper.is-focus {
    border-color: #f0b344 !important;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15) !important;
}

:root[data-theme="dark"] .el-select__selection {
    background: transparent !important;
}

:root[data-theme="dark"] .el-select__placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

:root[data-theme="dark"] .el-select__selected-item {
    color: #fff !important;
}

:root[data-theme="dark"] .el-select__icon {
    color: rgba(255, 255, 255, 0.6) !important;
}

:root[data-theme="dark"] .el-select__suffix {
    background: transparent !important;
}

:root[data-theme="dark"] .el-select-dropdown {
    background: var(--color-bg-elevated) !important;
    border: 1px solid rgba(240, 179, 68, 0.2) !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
    padding: 6px 0 !important;
}

:root[data-theme="dark"] .el-select-dropdown__wrap {
    background: transparent !important;
}

:root[data-theme="dark"] .el-select-dropdown__list {
    background: transparent !important;
    padding: 0 !important;
}

:root[data-theme="dark"] .el-select-dropdown__item {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 14px;
    padding: 8px 16px !important;
    margin: 0 !important;
    background-color: transparent !important;
    background-image: none !important;
}

:root[data-theme="dark"] .el-select-dropdown__item:hover,
:root[data-theme="dark"] .el-select-dropdown__item.hover,
:root[data-theme="dark"] .el-select-dropdown__item.is-hovered {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

:root[data-theme="dark"] .el-select-dropdown__item.selected,
:root[data-theme="dark"] .el-select-dropdown__item.is-selected,
:root[data-theme="dark"] .el-select-dropdown__item--selected {
    background: rgba(240, 179, 68, 0.2) !important;
    color: #f0b344 !important;
    font-weight: 600;
}

:root[data-theme="dark"] .el-select-dropdown__item::before {
    background: transparent !important;
}

:root[data-theme="dark"] .el-select-dropdown__item.is-disabled {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.4) !important;
}

:root[data-theme="dark"] .el-scrollbar,
:root[data-theme="dark"] .el-scrollbar__bar,
:root[data-theme="dark"] .el-scrollbar__track {
    background: transparent !important;
}

:root[data-theme="dark"] .el-select-dropdown__popper .el-select-dropdown {
    background: var(--color-bg-elevated) !important;
}

/* Input Number 组件 */
.el-input-number {
    width: 100%;
}

:root[data-theme="dark"] .el-input-number .el-input__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
}

:root[data-theme="dark"] .el-input-number .el-input__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

:root[data-theme="dark"] .el-input-number__decrease,
:root[data-theme="dark"] .el-input-number__increase {
    background: rgba(0, 0, 0, 0.3) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.8) !important;
}

:root[data-theme="dark"] .el-input-number__decrease:hover,
:root[data-theme="dark"] .el-input-number__increase:hover {
    color: #f0b344 !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

/* Textarea */
:root[data-theme="dark"] .el-textarea__inner {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
    color: #fff !important;
}

:root[data-theme="dark"] .el-textarea__inner::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* Popper */
:root[data-theme="dark"] .el-popper.is-light {
    background: var(--color-bg-elevated) !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

:root[data-theme="dark"] .el-popper .el-popper__arrow::before {
    background: var(--color-bg-elevated) !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

/* Dialog */
:root[data-theme="dark"] .el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:root[data-theme="dark"] .el-dialog__header {
    border-bottom: 1px solid rgba(240, 179, 68, 0.12);
    padding: 18px 20px;
}

:root[data-theme="dark"] .el-dialog__title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

:root[data-theme="dark"] .el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7);
}

:root[data-theme="dark"] .el-dialog__headerbtn:hover .el-dialog__close {
    color: #f0b344;
}

:root[data-theme="dark"] .el-dialog__body {
    padding: 20px;
}

/* 后台页面背景 - 覆盖用户页面的 body 背景 */
body:has(.app-container.is-admin) {
    background: var(--color-bg-admin) !important;
    background-image: none !important;
}

/* 后台页面 Select / Pagination 下拉框 - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-select-dropdown__popper {
    background: var(--color-bg-admin-mid) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    border-radius: 8px !important;
    box-shadow: var(--color-shadow-md) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__popper .el-popper__arrow::before {
    background: var(--color-bg-admin-mid) !important;
    border-color: var(--color-admin-soft-border) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown {
    background: var(--color-bg-admin-mid) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    box-shadow: var(--color-shadow-md) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item {
    color: var(--color-text-tertiary) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item:hover,
body:has(.app-container.is-admin) .el-select-dropdown__item.hover,
body:has(.app-container.is-admin) .el-select-dropdown__item.is-hovered {
    background: var(--color-admin-soft-bg) !important;
    color: var(--color-text-primary) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item.selected,
body:has(.app-container.is-admin) .el-select-dropdown__item.is-selected,
body:has(.app-container.is-admin) .el-select-dropdown__item--selected {
    background: var(--color-admin-soft-bg-hover) !important;
    color: var(--color-admin) !important;
}

body:has(.app-container.is-admin) .el-select__wrapper:hover {
    border-color: var(--color-admin-soft-border-hover) !important;
}

body:has(.app-container.is-admin) .el-select__wrapper.is-focused,
body:has(.app-container.is-admin) .el-select__wrapper.is-focus {
    border-color: var(--color-admin) !important;
    box-shadow: 0 0 0 2px var(--color-admin-glow) !important;
}

/* 后台页面 Dialog - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-dialog {
    background: var(--gradient-panel-admin) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    border-radius: 10px !important;
    box-shadow: var(--color-shadow-lg) !important;
}

body:has(.app-container.is-admin) .el-dialog__header {
    border-bottom: 1px solid var(--color-admin-soft-bg) !important;
    padding: 16px 20px !important;
}

body:has(.app-container.is-admin) .el-dialog__title {
    color: var(--color-admin) !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
}

body:has(.app-container.is-admin) .el-dialog__headerbtn .el-dialog__close {
    color: var(--color-text-muted) !important;
}

body:has(.app-container.is-admin) .el-dialog__headerbtn:hover .el-dialog__close {
    color: var(--color-admin) !important;
}

body:has(.app-container.is-admin) .el-dialog__body {
    padding: 20px !important;
}

body:has(.app-container.is-admin) .el-dialog__footer {
    border-top: 1px solid var(--color-admin-soft-bg) !important;
}

/* 后台页面 MessageBox - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-message-box {
    background: var(--gradient-panel-admin) !important;
    border: 1px solid var(--color-admin-soft-border) !important;
    border-radius: 10px !important;
    box-shadow: var(--color-shadow-lg) !important;
}

body:has(.app-container.is-admin) .el-message-box__title {
    color: var(--color-admin) !important;
}

body:has(.app-container.is-admin) .el-message-box__content {
    color: var(--color-text-tertiary) !important;
}

body:has(.app-container.is-admin) .el-message-box__btns .el-button--primary {
    --el-button-bg-color: var(--color-admin-hover);
    --el-button-border-color: var(--color-admin-hover);
    --el-button-hover-bg-color: var(--color-admin);
    --el-button-hover-border-color: var(--color-admin);
}

/* 后台页面按钮 - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-button--primary {
    --el-button-bg-color: var(--color-admin-hover);
    --el-button-border-color: var(--color-admin-hover);
    --el-button-hover-bg-color: var(--color-admin);
    --el-button-hover-border-color: var(--color-admin);
    --el-button-text-color: #ffffff;
    --el-button-hover-text-color: #ffffff;
}

body:has(.app-container.is-admin) .el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--link) {
    background: var(--color-bg-hover);
    border-color: var(--color-border);
    color: var(--color-text-tertiary);
}

body:has(.app-container.is-admin) .el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--link):hover {
    background: var(--color-admin-soft-bg);
    border-color: var(--color-admin-soft-border-hover);
    color: var(--color-admin);
}

body:has(.app-container.is-admin) .el-button--link {
    color: var(--color-admin);
}

body:has(.app-container.is-admin) .el-button--link:hover {
    color: var(--color-admin-hover);
}
</style>
