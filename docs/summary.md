# 城竞共生 (os_national_frontend) 项目概要

> ⚠️ 每次功能/特性变更后必须同步更新此文档。

## 项目概述

**项目名称**: 城竞共生
**项目描述**: 电竞文旅沉浸体验项目
**技术栈**: Vue 3 + Pinia + Vue Router + Element Plus + Vite

## 核心功能

- **旅行探索**: 城市地图浏览、路线规划与收藏
- **AI 对话**: 与角色进行沉浸式对话互动
- **用户中心**: 个人信息管理、收藏路线管理
- **故事体验**: 沉浸式故事展示与角色互动

## 项目结构

```
src/
├── App.vue                    # 主组件，含全局样式和暗色主题配置
├── main.js                    # 应用入口
├── router/index.js            # 路由配置（含 /profile 路由守卫）
├── stores/user.js            # Pinia 用户状态管理
├── views/
│   ├── TravelView.vue         # 旅行页（首页）
│   ├── DialogueView.vue       # AI 对话页
│   ├── UserProfile.vue        # 用户中心（含子路由）
│   └── profile/
│       ├── BasicInfo.vue      # 基本信息设置
│       └── FavoriteRoutes.vue # 收藏路线
└── components/
    ├── Header.vue             # 页头导航
    ├── LoginModal.vue         # 登录/注册弹窗
    ├── ChatBox.vue            # 聊天组件
    ├── StoryModal.vue         # 故事弹窗
    ├── CharacterCard.vue      # 角色卡片
    ├── CityMap.vue            # 城市地图
    └── PhotoGallery.vue       # 照片画廊
```

## 路由配置

| 路径 | 名称 | 说明 |
|------|------|------|
| `/` | - | 重定向至 /travel |
| `/travel` | travel | 旅行首页 |
| `/dialogue` | dialogue | AI 对话页 |
| `/profile` | profile | 用户中心（含子路由） |
| `/profile/basic` | basic-info | 基本信息 |
| `/profile/favorites` | favorite-routes | 收藏路线 |

**路由守卫**: 访问 `/profile` 路径时，若未登录则弹出登录框并重定向至 `/travel`。

## 设计架构

### 状态管理

```javascript
// stores/user.js
{
  isLoggedIn: boolean,          // 登录状态
  userInfo: object | null,      // 用户信息 { uid, username, email, avatar }
  collectedRoutes: array,       // 收藏路线
  showLoginModal: boolean,      // 登录弹窗显示状态（统一管理）
  setUserInfo(),                // 设置用户信息（从 API 响应）
  logout(),                     // 登出
  updateField(),                // 更新用户字段
  addCollectedRoute(),          // 添加收藏
  removeCollectedRoute()        // 移除收藏
}
```

### API 集成

- **基础 URL**: `http://localhost:5000`（可通过 `VITE_API_BASE_URL` 环境变量配置）
- **Token 存储**: localStorage，key 为 `token`
- **请求拦截器**: 自动在请求头添加 `Authorization: Bearer <token>`

#### 核心接口

| 方法 | URL | 说明 |
|------|-----|------|
| POST | /email/verification/send | 发送邮箱验证码 |
| POST | /user/register | 用户注册 |
| POST | /user/login | 用户登录 |

### 登录流程

1. 路由守卫检测到访问 `/profile` 且未登录
2. 设置 `userStore.showLoginModal = true` 弹出登录框
3. 重定向至 `/travel`
4. 用户登录成功后，`isLoggedIn` 置为 `true`

### 注册表单

注册表单字段（注册时不填写基本信息，可在后续 profile 中补充）:

| 字段 | 校验规则 |
|------|----------|
| 用户名 | 必填，至少3个字符 |
| 邮箱 | 必填，有效邮箱格式 |
| 验证码 | 必填，6位数字 |
| 密码 | 必填，至少6个字符 |
| 确认密码 | 必填，需与密码一致 |

### 组件通信

- 登录弹窗状态 `showLoginModal` 由 Pinia userStore 统一管理
- 各组件通过 `userStore.showLoginModal` 控制登录框显示

## 设计规范

### 配色方案

| 用途 | 色值 |
|------|------|
| 主色 | `#f0b344` (金色/橙色) |
| 强调色 | `#e63946` (红色) |
| 背景深色 | `#0d1b2a`, `#141e37`, `#1e2f55` |
| 文字主色 | `rgba(255, 255, 255, 0.9)` |
| 文字次色 | `rgba(255, 255, 255, 0.5)` |

### 字体
- `'Microsoft YaHei', 'Segoe UI', sans-serif`

### 暗色主题
- Element Plus 组件已配置为深色主题
- 全局滚动条样式已定义（宽度 6px，金色 thumb）

## 重要架构决策

1. **登录弹窗状态 `showLoginModal` 统一由 Pinia userStore 管理**
2. **路由守卫保护 `/profile` 路径，未登录重定向至 `/travel` 并弹出登录框**
3. **所有 Element Plus 组件使用暗色主题覆盖样式**

## 最近更新

- 2026-03-25: 项目初始化，建立基本架构
- 2026-03-25: 简化注册表单，仅保留用户名/密码/确认密码/邮箱/验证码，移除基本信息/简介，添加完整表单校验
- 2026-03-25: 集成后端 API，使用 axios 实现登录/注册/发送验证码请求