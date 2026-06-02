# 城竞共生 (os_national_frontend) 项目概要

> ⚠️ 每次功能/特性变更后必须同步更新此文档。

## 项目概述

**项目名称**: 城竞共生
**项目描述**: 电竞文旅沉浸体验项目
**技术栈**: Vue 3 + Pinia + Vue Router + Element Plus + Vite

---

## 页面架构

### 1. TravelView（旅行首页）

**路由**: `/travel`

**布局**:

- 城市地图（全屏） + 右侧聊天气泡面板（桌面 28vw / 移动端底部抽屉 70%）
- Quick Planners 筛选栏（可折叠）：城市、天数、人数、关系类型

**核心组件**:

- `CityMap`：SVG 交互地图，支持拖拽平移、滚轮缩放、触屏捏合缩放
- `ChatBox`：聊天气泡面板，消息列表 + 输入框

**消息结构**:

```javascript
{
    type: 'user' | 'character', content
:
    string, mid
:
    number, completed
:
    boolean
}
```

**核心功能**:

- 城市选择 → 弹窗展示电竞人物/英雄/美食/任务/路线
- `sendTravelMessage(text)` — 构建提示词模板 → SSE 流式响应
- `ensureLoginBeforeSend()` — 发送前检查登录状态，未登录弹登录框
- 消息操作：复制（`execCommand` 降级）、收藏（`favoriteRoute`）、跳转详情
- `streamToken` 机制防止 SSE 多流竞争

**API**:

- `POST /agent/travel-route-plan/message` — SSE 流式发送消息
- `POST /route/favorite` — 收藏路线

---

### 2. DialogueView（沉浸式角色对话）

**路由**: `/dialogue`

**布局**:

- 左侧角色边栏（三大分类：游戏英雄/电竞选手/电竞明星）+ 右侧聊天区
- 移动端隐藏侧边栏，显示切换角色按钮

**消息结构**:

```javascript
{
    type: 'user' | 'character', content
:
    string, mid
:
    number, completed
:
    boolean
}
```

**核心功能**:

- 角色选择 → 加载历史消息 → 展示欢迎语
- URL 路由同步 `?type=game_hero&rid=123` — 刷新/跳转恢复角色状态
- SSE 流式对话（`sendRoleplayMessageStream` 支持三种模式）：
    - 正常发送: `{ content }`
    - 恢复流: `{ mid }`
    - 重新生成: `{ regenerateMid }`
- 断流恢复：`resumeIncompleteStream` — 从 `incompleteMid` 恢复
- `selectCharacter` 时预加载三个分类角色列表
- 欢迎语伪消息：首条用户消息发出后自动移除
- 消息气泡下方 action buttons（复制/重新生成），hover/active 可见

**API**:

- `GET /agent/roleplay/list/:type` — 获取角色列表（按分类）
- `GET /agent/roleplay/detail/:rid` — 获取角色详情（bio/phrases）
- `GET /agent/roleplay/message/list/:rid` — 获取历史消息
- `POST /agent/roleplay/message/send/:rid` — SSE 流式发送消息

**SSE 事件类型**: `start` / `catchup` / `content` / `error` / `done`

---

### 3. RoutePlanView（电竞文旅助手）

**路由**: `/route-plan`

**布局**:

- 左侧 `ConversationSidebar` 会话边栏（296px）+ 右侧 `RouteChatBox` 聊天区
- 移动端（<=900px）侧边栏可折叠

**核心功能**:

- `syncSessionWithRoute` — 进入/后退/前进均触发会话同步
- 新建/选择/编辑会话标题（内联编辑 Enter 确认）
- SSE 流式对话（思考状态黄色脉冲、流式绿色发光）
- 消息操作：复制（`execCommand` 降级）、收藏、重新生成
- 流恢复：页面刷新后自动从 `hasIncompleteMessage`/`incompleteMid` 恢复
- `applyTopbarTitleFromDone` — SSE done 事件后更新顶栏标题
- 移动端侧边栏 hamburger 按钮触发

**API**:

- `GET /agent/travel-route-plan/chat/list` — 获取会话列表
- `GET /agent/travel-route-plan/chat/detail/:sid` — 获取会话详情
- `PUT /agent/travel-route-plan/chat/title/edit/:sid` — 编辑会话标题
- `POST /agent/travel-route-plan/message` — SSE 流式发送消息

---

### 4. UserProfile（用户中心）

**路由**: `/profile`（含子路由）

**布局**: 左侧固定导航 + 右侧内容区，未登录显示登录提示

**子路由**:

- `/profile/basic` — `BasicInfo.vue`：头像上传（drag-drop）、个人信息编辑
- `/profile/favorites` — `FavoriteRoutes.vue`：收藏路线列表、详情弹窗（Markdown 渲染）、编辑/删除

**核心功能**:

- 头像上传：`el-upload` + `uploadAvatar` API，2MB 限制，预览
- 收藏路线弹窗：只读/编辑模式，乐观更新
- 登出：清除 token + 重置 store + 跳转 `/travel`

---

### 5. AdminLogin（管理后台登录）

**路由**: `/manage/login`

**布局**: 居中登录表单

**核心功能**:

- 管理员账号密码登录
- 登录成功后跳转 `/manage`（角色管理页）
- 已登录用户访问直接跳转

---

### 6. Roles（角色管理）

**路由**: `/manage/data/roles`

**布局**: 顶部筛选栏 + 角色表格 + 分页 + 新增/编辑弹窗

**核心功能**:

- 角色列表展示（头像、名称、分类、简介、创建时间）
- 分类筛选 + 关键词搜索
- 新增/编辑角色弹窗：
    - 类型选择（游戏达人/电竞选手/游戏英雄）
    - 名称、简介编辑
    - 常用语管理（点击编辑 Enter 保存，空内容自动删除）
    - 头像上传（拖拽 + 点击，删除角标）
    - 图片上传（拖拽 + 多选，最多9张，删除角标）
- FormData 统一提交所有字段到 update 接口

---

## 全局状态管理

### userStore（src/stores/user.js）

| 状态/计算             | 类型          | 说明                                                                      |
|-------------------|-------------|-------------------------------------------------------------------------|
| `isLoggedIn`      | ref boolean | 登录状态                                                                    |
| `userInfo`        | ref object  | 用户信息 { uid, username, email, gender, age, basicInfo, bio, avatarToken } |
| `collectedRoutes` | ref array   | 收藏路线                                                                    |
| `showLoginModal`  | ref boolean | 登录弹窗显示状态                                                                |
| `avatarUrl`       | computed    | 计算头像 URL                                                                |

| 方法                                            | 说明                     |
|-----------------------------------------------|------------------------|
| `getToken()` / `setToken()` / `removeToken()` | localStorage token 操作  |
| `setUserInfo(info)`                           | 从 API 响应设置用户信息         |
| `fetchUserProfile()`                          | 获取用户完整信息               |
| `updateUserProfile(data)`                     | 更新用户信息                 |
| `login(result)`                               | 统一登录：保存 token + 设置用户信息 |
| `logout()`                                    | 登出：清除 token、重置状态       |
| `fetchCollectedRoutes()`                      | 获取收藏路线列表               |
| `removeCollectedRoute(rid)`                   | 删除收藏路线                 |

### conversationStore（src/stores/conversation.js）

| 状态/计算                  | 类型          | 说明                                  |
|------------------------|-------------|-------------------------------------|
| `sessions`             | ref array   | 会话列表                                |
| `currentSessionId`     | ref number  | 当前会话 ID                             |
| `currentMessages`      | ref array   | 当前会话消息                              |
| `hasIncompleteMessage` | ref boolean | 是否有未完成消息                            |
| `incompleteMid`        | ref number  | 未完成消息的 mid                          |
| `groupedSessions`      | computed    | 按时间分组 { today, yesterday, earlier } |

| 方法                                | 说明        |
|-----------------------------------|-----------|
| `fetchSessions()`                 | 获取会话列表    |
| `fetchSessionDetail(sid)`         | 获取会话详情    |
| `selectSession(sid)`              | 选择会话      |
| `createNewSession()`              | 创建新会话     |
| `updateSessionTitle(sid, title)`  | 更新会话标题    |
| `addStreamingMessage(mid)`        | 添加流式占位消息  |
| `appendToMessage(index, content)` | 追加流式内容    |
| `finalizeMessage(title)`          | 完成消息，更新标题 |

### adminStore（src/stores/admin.js）

| 状态/计算        | 类型          | 说明      |
|--------------|-------------|---------|
| `isLoggedIn` | ref boolean | 管理员登录状态 |
| `adminInfo`  | ref object  | 管理员信息   |

| 方法                    | 说明                    |
|-----------------------|-----------------------|
| `login(result)`       | 登录：保存 token + 设置管理员信息 |
| `logout()`            | 登出：清除 token + 重置状态    |
| `fetchAdminProfile()` | 获取管理员信息               |

### useStreamTimers（src/composables/useStreamTimers.js）

| 状态                   | 类型  | 说明       |
|----------------------|-----|----------|
| `streamingCancelRef` | ref | SSE 取消函数 |
| `streamIntervalRef`  | ref | 流式动画定时器  |
| `streamTimeoutRef`   | ref | 流式超时定时器  |
| `thinkingTimeoutRef` | ref | 思考状态定时器  |

| 方法                            | 说明                               |
|-------------------------------|----------------------------------|
| `clearStreamTimers()`         | 清除所有定时器                          |
| `cancelStreaming(abortFetch)` | 取消 SSE，`abortFetch` 控制是否中止 fetch |

---

## 全局组件

| 组件                    | 文件                                 | 用途                      |
|-----------------------|------------------------------------|-------------------------|
| `Header`              | components/Header.vue              | 导航栏 Logo + Tab + 用户头像下拉 |
| `LoginModal`          | components/LoginModal.vue          | 登录/注册弹窗                 |
| `ChatBox`             | components/ChatBox.vue             | 通用聊天气泡（TravelView 用）    |
| `RouteChatBox`        | components/RouteChatBox.vue        | 路线规划聊天气泡（含重新生成）         |
| `ConversationSidebar` | components/ConversationSidebar.vue | 会话边栏（分组/内联编辑/不完整标记）     |
| `CityMap`             | components/CityMap.vue             | SVG 交互地图（平移/缩放/触屏）      |
| `StoryModal`          | components/StoryModal.vue          | 角色故事弹窗                  |
| `PhotoGallery`        | components/PhotoGallery.vue        | 角色照片画廊                  |
| `CharacterCard`       | components/CharacterCard.vue       | 角色卡片（选择器用）              |

---

## API 集成

### 环境配置

- **基础 URL**: 空字符串（相对路径），开发环境走 Vite proxy
- **Proxy Target**: `VITE_API_BASE_URL` 环境变量（默认 `http://localhost:5000`）
- **Token 存储**: localStorage，key 为 `token`
- **请求拦截器**: 自动添加 `Authorization: Bearer <token>`
- **ElMessage 时长**: 全局收敛为 1000ms，调用方显式传入 duration 则保持原配置

### 认证接口

| 方法   | URL                      | 说明           |
|------|--------------------------|--------------|
| POST | /email/verification/send | 发送邮箱验证码      |
| POST | /user/register           | 用户注册         |
| POST | /user/login              | 用户登录         |
| GET  | /user/profile            | 获取用户信息       |
| PUT  | /user/profile            | 更新用户信息（增量更新） |
| POST | /file/avatar/upload      | 上传头像         |

### Agent AI 接口（电竞文旅助手）

| 方法   | URL                                           | 说明           |
|------|-----------------------------------------------|--------------|
| GET  | /agent/travel-route-plan/chat/list            | 获取会话列表       |
| GET  | /agent/travel-route-plan/chat/detail/:sid     | 获取会话详情       |
| PUT  | /agent/travel-route-plan/chat/title/edit/:sid | 编辑会话标题       |
| POST | /agent/travel-route-plan/message              | 发送消息（SSE 流式） |

### Agent AI 接口（角色对话）

| 方法   | URL                               | 说明           |
|------|-----------------------------------|--------------|
| GET  | /agent/roleplay/list/:type        | 获取角色列表       |
| GET  | /agent/roleplay/detail/:rid       | 获取角色详情       |
| GET  | /agent/roleplay/message/list/:rid | 获取历史消息       |
| POST | /agent/roleplay/message/send/:rid | 发送消息（SSE 流式） |

### 路线收藏接口

| 方法     | URL                | 说明     |
|--------|--------------------|--------|
| GET    | /route/list        | 获取收藏列表 |
| GET    | /route/detail/:rid | 获取收藏详情 |
| POST   | /route/favorite    | 收藏路线   |
| PUT    | /route/edit/:rid   | 编辑收藏路线 |
| DELETE | /route/delete/:rid | 删除收藏   |

### Admin Roleplay 接口（角色管理）

| 方法     | URL                         | 说明                                    |
|--------|-----------------------------|---------------------------------------|
| POST   | /admin/roleplay/create      | 创建角色（支持 multipart/form-data）          |
| GET    | /admin/roleplay/:rid/detail | 获取角色详情                                |
| PUT    | /admin/roleplay/:rid/update | 更新角色（支持 multipart/form-data，含头像/图片上传） |
| DELETE | /admin/roleplay/:rid/delete | 删除角色                                  |

---

## 路由配置

| 路径                   | 名称              | 说明                            |
|----------------------|-----------------|-------------------------------|
| `/`                  | -               | 重定向至 /travel                  |
| `/travel`            | travel          | 旅行首页                          |
| `/dialogue`          | dialogue        | 沉浸式角色对话页                      |
| `/route-plan`        | route-plan      | 电竞文旅助手（会话页面）                  |
| `/profile`           | profile         | 用户中心（含子路由）                    |
| `/profile/basic`     | basic-info      | 基本信息                          |
| `/profile/favorites` | favorite-routes | 收藏路线                          |
| `/manage`            | -               | 管理后台（重定向至 /manage/data/roles） |
| `/manage/login`      | admin-login     | 管理员登录页                        |
| `/manage/data/roles` | admin-roles     | 角色管理页                         |

### 路由守卫

**用户端受保护路径**: `/profile`、`/route-plan`、`/dialogue`

- 有 token → 验证 profile → 成功放行，失败登出并弹窗重定向
- 无 token → 弹登录框 + 重定向至 `/travel`

**管理后台受保护路径**: `/manage` 及子路径

- 有 token → 验证 admin profile → 成功放行，失败登出并跳转登录页
- 无 token → 跳转 `/manage/login`
- 404 兜底: `/manage/*` → `/manage`，其他 → `/travel`

---

## 登录流程

1. 路由守卫检测到访问受保护路径且未登录
2. 设置 `userStore.showLoginModal = true` 弹出登录框
3. 重定向至 `/travel`
4. 用户登录成功后，`userStore.login(result)` 统一处理

---

## 注册表单

| 字段   | 校验规则             |
|------|------------------|
| 用户名  | 可选，3-80字符（有值时校验） |
| 邮箱   | 必填，有效邮箱格式        |
| 验证码  | 必填，6位数字          |
| 密码   | 必填，6-128字符       |
| 确认密码 | 必填，需与密码一致        |

---

## 主题系统（深色 / 浅色模式）

### 架构

```
[系统 / 手动选择]                  [CSS 变量层]                  [组件]
                                                  ┌──────────────────────────┐
matchMedia('prefers-color-scheme: dark')   ──►  │ html[data-theme="dark"]   │ ──► 全部 var(--color-*)
                                                  │ html[data-theme="light"]  │
localStorage('theme-mode')    ──► Pinia store   └──────────────────────────┘
   'light' | 'dark' | 'system'     (toggle(), setMode())
                                                            ▲
                                                            │
                              <button @click="theme.toggle()">  Header.vue
                                                            │  AdminHeader.vue
                                                            │  (桌面 + 移动 sidebar 各一处)
```

- `data-theme` 放在 `<html>` 上（Element Plus 的 `dark/css-vars.css` 监听 `html.dark`，EP 的暗色变量和自定义 token 体系共存）
- `:root[data-theme="dark"]` 和 `:root[data-theme="light"]` 提供两套 token

### 关键文件

| 路径 | 说明 |
|---|---|
| `src/styles/tokens.css` | 全局设计令牌；`:root[data-theme="dark"]` / `:root[data-theme="light"]` 各一套 |
| `src/stores/theme.js` | Pinia store；`mode` / `effective` / `setMode()` / `toggle()` / `init()` |
| `index.html` | `<head>` 注入 FOUC 防护脚本（在 CSS 加载前基于 localStorage + matchMedia 预设 `data-theme`） |
| `src/main.js` | 引入 `tokens.css` 早于 EP CSS；挂载后调用 `useThemeStore().init()` 绑定 matchMedia |

### Token 体系（节选）

- **Surface**：`--color-bg-base` / `--color-bg-elevated` / `--color-bg-panel` / `--color-bg-deep` / `--color-bg-admin` / `--color-bg-input`
- **Text**：`--color-text-primary` / `-secondary` / `-muted` / `-placeholder` / `-tertiary` / `-on-brand`
- **Border**：`--color-border` / `-subtle` / `-divider` / `-strong`
- **Brand**：`--color-brand` (金) / `--color-brand-secondary` (红) / `--gradient-brand` / `-brand-soft-bg` / `-brand-soft-border` / `-brand-glow-strong`
- **Status**：`--color-info` / `--color-purple` / `--color-pink` / `--color-orange` / `--color-cyan`
- **Admin**：`--color-admin` (绿) / `--color-admin-soft-bg` / `--color-bg-admin-mid` / `-bg-admin-deep`
- **Map（按主题差异）**：`--color-map-province-fill` / `-stroke` / `-hover-fill` / `-hover-stroke`
  - 深色模式：金色 + 暗底
  - 浅色模式：白底 + 金色边线

### 用户偏好持久化

- `localStorage` key：`theme-mode`，值 `'light' | 'dark' | 'system'`
- 默认 `system` —— 跟随 `window.matchMedia('(prefers-color-scheme: dark)')`
- 监听 matchMedia 的 `change` 事件，运行时实时跟随系统切换

### 切换按钮入口

- 公开端 `Header.vue`：桌面端导航栏右侧、移动端 sidebar 内
- 管理端 `AdminHeader.vue`：桌面端右侧、移动端 sidebar 内
- 按钮图标随当前 `effective` 主题切换：深色显示太阳（点击切到浅色），浅色显示月亮

### 颜色规约

- 角色分类的语义色（金 #f0b344 / 红 #e63946 / 青 #2a9d8f）保持不变，跨主题通用
- Element Plus 暗色 CSS 变量（`--el-*`）在深色模式覆写为金色主题；浅色模式恢复 EP 默认
- 组件不再写 hex / rgba，统一 `var(--color-*)`
- 高对比图标模式：饱和底色 + 白色图标（stat 卡片、用户头像、删除按钮等）

---

## 关键设计模式

### SSE 流竞争防护

```javascript
const streamToken = Date.now()
activeStreamToken.value = streamToken

eventSource.onmessage = (e) => {
    if (streamToken !== activeStreamToken.value) return // 忽略过期事件
    // 处理事件...
}
```

### 状态追踪四变量

`streamStarted`（收到 start）、`streamFinished`（收到 done）、`hasAssistantOutput`（有内容输出）、`hasEnteredStreaming`（已切换到
streaming）

### 复制降级

优先 `navigator.clipboard.writeText()`（需 HTTPS），失败则用 `document.execCommand('copy')` + 临时 `textarea`

### 移动端视口

`visualViewport` API 解决 `100dvh` 问题，动态设置 CSS 变量

### 会话 URL 同步

`router.replace({ query: { sid } })` + watch 触发加载，支持浏览器后退/前进

---

## 设计规范

### 配色方案

| 用途   | 色值                              |
|------|---------------------------------|
| 主色   | `#f0b344` (金色/橙色)               |
| 强调色  | `#e63946` (红色)                  |
| 背景深色 | `#0d1b2a`, `#141e37`, `#1e2f55` |
| 文字主色 | `rgba(255, 255, 255, 0.9)`      |
| 文字次色 | `rgba(255, 255, 255, 0.5)`      |

### 字体

`'Microsoft YaHei', 'Segoe UI', sans-serif`

### 暗色主题

Element Plus 组件已配置为深色主题，全局滚动条样式已定义（宽度 6px，金色 thumb）

---

## 重要架构决策

1. **登录弹窗状态 `showLoginModal` 统一由 Pinia userStore 管理**
2. **路由守卫保护 `/profile`、`/route-plan`、`/dialogue` 路径，未登录重定向至 `/travel` 并弹出登录框**
3. **所有 Element Plus 组件使用暗色主题覆盖样式**
4. **SSE 使用 fetch + ReadableStream 实现**（标准 EventSource 不支持 POST 和自定义 headers）
5. **复制功能优先 Clipboard API，失败降级 execCommand**
6. **管理后台使用独立 store 和 token（adminToken），与用户端分离**

---

## 最近更新

- 2026-06-03: 新增深色/浅色模式切换（Pinia theme store + tokens.css + FOUC 防护），Header/AdminHeader 桌面+移动端均加切换按钮；全站 22 个文件的硬编码颜色迁移到 CSS 变量；迭代修复地图边线、表格 header、el-select 下拉、stat 图标、聊天气泡头像、admin 表等跨主题对比度问题
- 2026-06-03: 助手/路线规划页面的 LLM 消息"重新生成"按钮在流式输出期间 disable，防止重复 regen
- 2026-04-19: 新增管理后台（AdminLogin、ManageIndex、Roles 角色管理页面）
- 2026-04-19: 角色管理支持新增/编辑弹窗，常用语动态编辑，头像/图片拖拽上传
- 2026-04-19: 添加 404 兜底路由，优化管理后台默认跳转
- 2026-04-19: "电竞达人"更名为"电竞明星"
- 2026-03-29: 对话页添加消息操作按钮（复制/重新生成），移动端复用 hover/active 逻辑
- 2026-03-29: 全局收敛 ElMessage 时长为 1000ms，TravelView 添加登录前置检查
- 2026-03-29: 添加 /route-plan 和 /dialogue 路由登录保护
- 2026-03-29: DialogueView 支持 URL 路由同步、角色断流恢复、重新生成模式
- 2026-03-29: 添加收藏路线查看/编辑弹窗，内联标题编辑
- 2026-03-29: 新增 RoutePlanView 电竞文旅助手页面，会话边栏和 URL 路由同步
- 2026-03-28: 添加聊天气泡 Markdown 渲染支持
- 2026-03-28: Quick Planners 添加可折叠/展开功能（箭头图标）
- 2026-03-28: 电竞文旅助手对接 Agent AI API，SSE 流式输出
- 2026-03-27: 完善登录注册表单，优化 UI/UX
- 2026-03-25: 项目初始化，建立基本架构
