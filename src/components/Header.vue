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
      <button class="login-btn" @click="$emit('open-login')">
        {{ isLoggedIn ? userInfo?.username : '登录/注册' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const userStore = useUserStore()

defineEmits(['open-login'])

const activeTab = computed(() => {
  if (route.path.includes('dialogue')) return 'dialogue'
  return 'travel'
})

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)
</script>

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
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.tab-btn:hover {
  background: rgba(240, 179, 68, 0.1);
  border-color: rgba(240, 179, 68, 0.3);
  transform: translateY(-1px);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.25),
    0 0 12px rgba(240, 179, 68, 0.1);
}

.tab-btn:active {
  transform: translateY(0);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.tab-btn.active {
  background: linear-gradient(145deg, #f0b344 0%, #e63946 100%);
  color: #fff;
  border-color: transparent;
  box-shadow:
    0 4px 12px rgba(240, 179, 68, 0.35),
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
  box-shadow:
    0 2px 8px rgba(240, 179, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 14px rgba(240, 179, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow:
    0 1px 4px rgba(240, 179, 68, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 14px;
  }

  .nav-tabs {
    order: 3;
  }
}
</style>
