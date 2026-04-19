# os_national_frontend

电竞文旅沉浸体验项目前端仓库。

## 项目概览

**城竞共生** - 电竞文旅沉浸体验项目

- **技术栈**: Vue 3 + Pinia + Vue Router + Element Plus + Vite
- **后端服务**: Python Flask (见 [os_national_backend](https://github.com/iy88/os_national_backend))

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，配置 VITE_API_BASE_URL

# 启动开发服务器
npm run dev
```

## 项目结构

```
src/
├── api/              # API 请求模块 (axios)
├── components/       # 公共组件
├── views/            # 页面视图
├── stores/           # Pinia 状态管理
├── composables/      # Vue Composables
├── router/           # 路由配置
└── data/             # 静态数据
```

## 项目配置

| 环境变量                | 默认值                     | 说明     |
|---------------------|-------------------------|--------|
| `VITE_API_BASE_URL` | `http://localhost:5000` | 后端服务地址 |

开发环境通过 Vite proxy 解决跨域，生产环境走同源。

## 整体架构

### 状态管理

- **userStore**（Pinia）：用户登录状态、用户信息、收藏路线、登录弹窗控制
- **conversationStore**（Pinia）：会话列表、当前消息、流状态追踪
- **adminStore**（Pinia）：管理员登录状态、管理员信息

### SSE 流式输出

使用 `fetch + ReadableStream` 实现 SSE（标准 `EventSource` 不支持 POST 和自定义 headers）。核心封装在 `src/api/index.js` 的
`sendChatMessageStream` 和 `sendRoleplayMessageStream`。

### 路由守卫

- **用户端**: `/profile`、`/route-plan`、`/dialogue` 受保护，无 token 弹登录框 + 重定向至 `/travel`
- **管理后台**: `/manage` 路径受保护，无 token 重定向至 `/manage/login`，有 token 直接放行

### 登录弹窗

`showLoginModal` 统一由 `userStore` 管理，各组件通过 `userStore.showLoginModal = true` 触发显示。

## 路由配置

| 路径                   | 名称              | 说明                 |
|----------------------|-----------------|--------------------|
| `/`                  | -               | 重定向至 /travel       |
| `/travel`            | travel          | 旅行首页（城市地图 + AI 助手） |
| `/dialogue`          | dialogue        | 沉浸式角色对话页           |
| `/route-plan`        | route-plan      | 电竞文旅助手（会话管理）       |
| `/profile`           | profile         | 用户中心（含子路由）         |
| `/profile/basic`     | basic-info      | 基本信息设置             |
| `/profile/favorites` | favorite-routes | 收藏路线管理             |
| `/manage`            | -               | 管理后台（重定向至角色管理）     |
| `/manage/login`      | admin-login     | 管理员登录页             |
| `/manage/data/roles` | admin-roles     | 角色管理页              |

## 主要功能

- **旅行探索**: 城市地图浏览（SVG 交互地图，支持平移/缩放）、路线规划与收藏
- **AI 对话**: 与角色进行沉浸式对话互动（Markdown 渲染，SSE 流式响应）
- **电竞文旅助手**: 基于 Agent AI 的旅行规划助手，支持会话管理、 SSE 流式输出
- **用户中心**: 个人信息管理、头像上传、收藏路线管理
- **管理后台**: 管理员角色管理（增删改查、头像/图片上传）

## 详细文档

完整项目文档见 [docs/summary.md](docs/summary.md)，包含：

- 各页面架构与功能特性
- API 接口说明
- 状态管理详解
- 登录流程
- 关键设计模式（SSE 流竞争防护、复制降级等）
- 设计规范（配色、字体、主题）
- 重要架构决策
