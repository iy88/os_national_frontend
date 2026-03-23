<template>
  <div class="app-container">
    <Header @open-login="userStore.showLoginModal = true" />
    <main class="main-content">
      <router-view />
    </main>
    <LoginModal v-model="userStore.showLoginModal" />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import LoginModal from './components/LoginModal.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'Segoe UI', sans-serif;
  background: linear-gradient(145deg, #1a2b5f 0%, #0d1b2a 100%);
  color: #fff;
  min-height: 100vh;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px 0;
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
</style>
