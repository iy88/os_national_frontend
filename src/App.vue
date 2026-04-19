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
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
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
const activeManageTab = ref(
    initialPath.startsWith('/manage/data/roles') ? 'roles' : 'index'
)

// 路由变化时更新
watch(() => route.path, (path) => {
    isManageRoute.value = path.startsWith('/manage')
    if (path.startsWith('/manage/data/roles')) {
        activeManageTab.value = 'roles'
    } else {
        activeManageTab.value = 'index'
    }
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
    background: #0a0a0f;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
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
    background: rgba(0, 0, 0, 0.5);
    z-index: 49;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
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
    color: rgba(34, 197, 94, 0.7);
    flex-shrink: 0;
}

.sidebar-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.08);
}

.sidebar-item.active {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border-color: rgba(34, 197, 94, 0.25);
}

.sidebar-item.active svg {
    color: #4ade80;
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
    background:
        radial-gradient(circle at 70% 60%, rgba(74, 158, 255, 0.08) 0%, transparent 36%),
        linear-gradient(180deg, #141e37 0%, #0f1a2a 100%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: auto, auto, 50px 50px, 50px 50px;
    background-attachment: fixed;
    color: #fff;
    min-height: 100vh;
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
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: rgba(240, 179, 68, 0.4);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(240, 179, 68, 0.6);
}

/* Element Plus 全局覆盖 */
.el-button--primary {
    --el-button-bg-color: #f0b344;
    --el-button-border-color: #f0b344;
    --el-button-hover-bg-color: #ffbe4a;
    --el-button-hover-border-color: #ffbe4a;
}

.el-message {
    border-radius: 6px;
}

/* Element Plus CSS 变量覆盖 - 暗色主题 */
:root {
    --el-color-primary: #f0b344;
    --el-bg-color-overlay: #1e2f55;
    --el-fill-color-light: rgba(240, 179, 68, 0.12);
    --el-text-color-regular: rgba(255, 255, 255, 0.9);
    --el-border-color-hover: rgba(240, 179, 68, 0.4);
    --el-fill-color: rgba(0, 0, 0, 0.4);
    --el-bg-color: #0d1b2a;
    --el-text-color-primary: #ffffff;
    --el-text-color-placeholder: rgba(255, 255, 255, 0.5);
}

.el-select-dropdown,
.el-select-dropdown__popper,
.el-select-dropdown__popper.el-popper[role="listbox"] {
    --el-bg-color-overlay: #1e2f55 !important;
    --el-fill-color-light: rgba(240, 179, 68, 0.12) !important;
    --el-text-color-regular: rgba(255, 255, 255, 0.9) !important;
    --el-border-color-hover: rgba(240, 179, 68, 0.4) !important;
}

.el-select-dropdown__popper {
    background: #1e2f55 !important;
    border: 1px solid rgba(240, 179, 68, 0.2) !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

.el-select-dropdown__popper .el-popper__arrow::before {
    background: #1e2f55 !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

/* Element Plus 暗色表单组件 */
.el-input__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
}

.el-input__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

.el-input__wrapper.is-focus {
    border-color: #f0b344 !important;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15) !important;
}

.el-input__inner {
    color: #fff !important;
}

.el-input__inner::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* Select 组件 - 关键修复 */
.el-select__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    min-height: 32px !important;
}

.el-select__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

.el-select__wrapper.is-focused,
.el-select__wrapper.is-focus {
    border-color: #f0b344 !important;
    box-shadow: 0 0 0 2px rgba(240, 179, 68, 0.15) !important;
}

.el-select__selection {
    background: transparent !important;
}

.el-select__placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

.el-select__selected-item {
    color: #fff !important;
}

.el-select__icon {
    color: rgba(255, 255, 255, 0.6) !important;
}

.el-select__suffix {
    background: transparent !important;
}

.el-input__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
}

.el-select-dropdown {
    background: #1e2f55 !important;
    border: 1px solid rgba(240, 179, 68, 0.2) !important;
    border-radius: 6px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
    padding: 6px 0 !important;
}

.el-select-dropdown__wrap {
    background: transparent !important;
}

.el-select-dropdown__list {
    background: transparent !important;
    padding: 0 !important;
}

.el-select-dropdown__item {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-size: 14px;
    padding: 8px 16px !important;
    margin: 0 !important;
}

.el-select-dropdown__item:hover {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

.el-select-dropdown__item.hover {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

.el-select-dropdown__item.is-hovered {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

.el-select-dropdown__item.selected,
.el-select-dropdown__item.is-selected,
.el-select-dropdown__item--selected {
    background: rgba(240, 179, 68, 0.2) !important;
    color: #f0b344 !important;
    font-weight: 600;
}

/* 覆盖所有可能的白色背景 */
.el-select-dropdown__item {
    background-color: transparent !important;
    background-image: none !important;
}

.el-select-dropdown__item::before {
    background: transparent !important;
}

.el-select-dropdown__item.is-disabled {
    background: transparent !important;
    color: rgba(255, 255, 255, 0.4) !important;
}

/* 修复hover后移出变白的问题 */
.el-select-dropdown__item:hover,
.el-select-dropdown__item.hover,
.el-select-dropdown__item.is-hovered {
    background: rgba(240, 179, 68, 0.15) !important;
    color: #fff !important;
}

/* 强制覆盖任何可能的白色背景 */
.el-scrollbar,
.el-scrollbar__bar,
.el-scrollbar__track {
    background: transparent !important;
}

.el-select-dropdown__popper .el-select-dropdown {
    background: #1e2f55 !important;
}

/* Input Number 组件 */
.el-input-number {
    width: 100%;
}

.el-input-number .el-input__wrapper {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
}

.el-input-number .el-input__wrapper:hover {
    border-color: rgba(240, 179, 68, 0.4) !important;
}

.el-input-number__decrease,
.el-input-number__increase {
    background: rgba(0, 0, 0, 0.3) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.8) !important;
}

.el-input-number__decrease:hover,
.el-input-number__increase:hover {
    color: #f0b344 !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

/* Textarea */
.el-textarea__inner {
    background: rgba(0, 0, 0, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
    border-radius: 6px;
    color: #fff !important;
}

.el-textarea__inner::placeholder {
    color: rgba(255, 255, 255, 0.5) !important;
}

/* Popper */
.el-popper.is-light {
    background: #1e2f55 !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

.el-popper .el-popper__arrow::before {
    background: #1e2f55 !important;
    border-color: rgba(240, 179, 68, 0.2) !important;
}

/* Dialog */
.el-dialog {
    background: linear-gradient(145deg, #1e2f55 0%, #0f1a2a 100%);
    border: 1px solid rgba(240, 179, 68, 0.25);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.el-dialog__header {
    border-bottom: 1px solid rgba(240, 179, 68, 0.12);
    padding: 18px 20px;
}

.el-dialog__title {
    color: #f0b344;
    font-size: 1.1rem;
    font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7);
}

.el-dialog__headerbtn:hover .el-dialog__close {
    color: #f0b344;
}

.el-dialog__body {
    padding: 20px;
}

/* 后台页面背景 - 覆盖用户页面的 body 背景 */
body:has(.app-container.is-admin) {
    background: #09090b !important;
    background-image: none !important;
}

/* 后台页面 Select / Pagination 下拉框 - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-select-dropdown__popper {
    background: rgba(15, 15, 20, 0.98) !important;
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__popper .el-popper__arrow::before {
    background: rgba(15, 15, 20, 0.98) !important;
    border-color: rgba(34, 197, 94, 0.2) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown {
    background: rgba(15, 15, 20, 0.98) !important;
    border: 1px solid rgba(34, 197, 94, 0.2) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item {
    color: rgba(255, 255, 255, 0.85) !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item:hover,
body:has(.app-container.is-admin) .el-select-dropdown__item.hover,
body:has(.app-container.is-admin) .el-select-dropdown__item.is-hovered {
    background: rgba(34, 197, 94, 0.12) !important;
    color: #fff !important;
}

body:has(.app-container.is-admin) .el-select-dropdown__item.selected,
body:has(.app-container.is-admin) .el-select-dropdown__item.is-selected,
body:has(.app-container.is-admin) .el-select-dropdown__item--selected {
    background: rgba(34, 197, 94, 0.2) !important;
    color: #4ade80 !important;
}

body:has(.app-container.is-admin) .el-select__wrapper:hover {
    border-color: rgba(34, 197, 94, 0.4) !important;
}

body:has(.app-container.is-admin) .el-select__wrapper.is-focused,
body:has(.app-container.is-admin) .el-select__wrapper.is-focus {
    border-color: #4ade80 !important;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15) !important;
}

/* 后台页面 Dialog - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-dialog {
    background: linear-gradient(145deg, #1a1a1f 0%, #0d0d10 100%) !important;
    border: 1px solid rgba(34, 197, 94, 0.25) !important;
    border-radius: 10px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}

body:has(.app-container.is-admin) .el-dialog__header {
    border-bottom: 1px solid rgba(34, 197, 94, 0.15) !important;
    padding: 16px 20px !important;
}

body:has(.app-container.is-admin) .el-dialog__title {
    color: #4ade80 !important;
    font-size: 1.1rem !important;
    font-weight: 600 !important;
}

body:has(.app-container.is-admin) .el-dialog__headerbtn .el-dialog__close {
    color: rgba(255, 255, 255, 0.7) !important;
}

body:has(.app-container.is-admin) .el-dialog__headerbtn:hover .el-dialog__close {
    color: #4ade80 !important;
}

body:has(.app-container.is-admin) .el-dialog__body {
    padding: 20px !important;
}

body:has(.app-container.is-admin) .el-dialog__footer {
    border-top: 1px solid rgba(34, 197, 94, 0.15) !important;
}

/* 后台页面 MessageBox - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-message-box {
    background: linear-gradient(145deg, #1a1a1f 0%, #0d0d10 100%) !important;
    border: 1px solid rgba(34, 197, 94, 0.25) !important;
    border-radius: 10px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
}

body:has(.app-container.is-admin) .el-message-box__title {
    color: #4ade80 !important;
}

body:has(.app-container.is-admin) .el-message-box__content {
    color: rgba(255, 255, 255, 0.85) !important;
}

body:has(.app-container.is-admin) .el-message-box__btns .el-button--primary {
    --el-button-bg-color: #22c55e;
    --el-button-border-color: #22c55e;
    --el-button-hover-bg-color: #4ade80;
    --el-button-hover-border-color: #4ade80;
}

/* 后台页面按钮 - 覆盖用户端的金色主题 */
body:has(.app-container.is-admin) .el-button--primary {
    --el-button-bg-color: #22c55e;
    --el-button-border-color: #22c55e;
    --el-button-hover-bg-color: #4ade80;
    --el-button-hover-border-color: #4ade80;
    --el-button-text-color: #000;
}

body:has(.app-container.is-admin) .el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--link) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
}

body:has(.app-container.is-admin) .el-button:not(.el-button--primary):not(.el-button--danger):not(.el-button--link):hover {
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.3);
    color: #4ade80;
}

body:has(.app-container.is-admin) .el-button--link {
    color: #4ade80;
}

body:has(.app-container.is-admin) .el-button--link:hover {
    color: #22c55e;
}
</style>
