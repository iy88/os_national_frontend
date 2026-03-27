# 城竞共生 (os_national_frontend) 项目概要

> ⚠️ 每次功能/特性变更后必须同步更新此文档。

## 项目概述

**项目名称**: 城竞共生
**项目描述**: 电竞文旅沉浸体验项目
**技术栈**: Vue 3 + Pinia + Vue Router + Element Plus + Vite

## 核心功能

- **旅行探索**: 城市地图浏览、路线规划与收藏
- **AI 对话**: 与角色进行沉浸式对话互动
- **电竞文旅助手**: 基于 Agent AI 的旅行规划助手，支持 SSE 流式输出
- **用户中心**: 个人信息管理、收藏路线管理
- **故事体验**: 沉浸式故事展示与角色互动

### ChatBox 聊天气泡

- 支持 Markdown 格式自动解析渲染
- 状态指示器：thinking（黄色脉冲）、streaming（绿色发光）
- 发送/输入框在处理请求时自动禁用

### 电竞文旅助手 (TravelView)

- **Quick Planners**: 目标城市、旅行天数、出行人数、关系类型、本命英雄筛选
- 可折叠/展开的筛选面板（底部箭头图标控制）
- 基于 Agent AI 的 SSE 流式对话响应

## 项目结构

```
src/
├── App.vue                    # 主组件，含全局样式和暗色主题配置
├── main.js                    # 应用入口
├── api/index.js               # API 请求模块
├── composables/               # Vue Composables
│   └── useStreamTimers.js     # 流式输出定时器管理
├── router/index.js             # 路由配置（含 /profile 路由守卫）
├── stores/user.js             # Pinia 用户状态管理
├── data/                      # 静态数据
│   ├── cities.json            # 城市数据
│   ├── characters.js          # 角色数据
│   └── geo_city.json          # 地理数据
├── views/
│   ├── TravelView.vue         # 旅行页（首页）
│   ├── DialogueView.vue       # AI 对话页
│   ├── UserProfile.vue        # 用户中心（含子路由）
│   └── profile/
│       ├── BasicInfo.vue      # 基本信息设置
│       └── FavoriteRoutes.vue # 收藏路线
└── components/
    ├── Header.vue             # 页头导航
    ├── LoginModal.vue          # 登录/注册弹窗
    ├── ChatBox.vue             # 聊天组件
    ├── StoryModal.vue          # 故事弹窗
    ├── CharacterCard.vue       # 角色卡片
    ├── CityMap.vue             # 城市地图
    └── PhotoGallery.vue        # 照片画廊
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
  userInfo: object | null,      // 用户信息 { uid, username, email, gender, age, basicInfo, bio, avatar }
  collectedRoutes: array,       // 收藏路线
  showLoginModal: boolean,      // 登录弹窗显示状态（统一管理）
  setUserInfo(),                // 设置用户信息（从 API 响应）
  fetchUserProfile(),          // 获取用户完整信息
  updateUserProfile(),         // 更新用户信息
  logout(),                     // 登出
  updateField(),                // 更新用户字段
  addCollectedRoute(),          // 添加收藏
  removeCollectedRoute()        // 移除收藏
}
```

### API 集成

- **基础 URL**: 空字符串（相对路径），开发环境走 Vite proxy
- **Proxy Target**: `VITE_API_BASE_URL` 环境变量（默认 `http://localhost:8080`）
- **Token 存储**: localStorage，key 为 `token`
- **请求拦截器**: 自动在请求头添加 `Authorization: Bearer <token>`

#### 核心接口

| 方法 | URL | 说明 |
|------|-----|------|
| POST | /email/verification/send | 发送邮箱验证码 |
| POST | /user/register | 用户注册 |
| POST | /user/login | 用户登录 |
| GET | /user/profile | 获取用户信息 |
| PUT | /user/profile | 更新用户信息（增量更新） |

#### Agent AI 接口

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /agent/travel-route-plan/chat | 获取会话列表 |
| GET | /agent/travel-route-plan/chat/:sid | 获取会话详情 |
| POST | /agent/travel-route-plan/message | 发送消息（SSE 流式） |

### 登录流程

1. 路由守卫检测到访问 `/profile` 且未登录
2. 设置 `userStore.showLoginModal = true` 弹出登录框
3. 重定向至 `/travel`
4. 用户登录成功后，`isLoggedIn` 置为 `true`

### 注册表单

注册表单字段（注册时不填写基本信息，可在后续 profile 中补充）:

| 字段 | 校验规则 |
|------|----------|
| 用户名 | 可选，3-80字符（有值时校验） |
| 邮箱 | 必填，有效邮箱格式 |
| 验证码 | 必填，6位数字 |
| 密码 | 必填，6-128字符 |
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

- 2026-03-28: 添加聊天气泡 Markdown 渲染支持
- 2026-03-28: Quick Planners 添加可折叠/展开功能（箭头图标）
- 2026-03-28: 电竞文旅助手对接 Agent AI API，SSE 流式输出
- 2026-03-27: 完善登录注册表单，优化 UI/UX
- 2026-03-25: 项目初始化，建立基本架构