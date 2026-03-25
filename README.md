# os_national_frontend

电竞文旅沉浸体验项目前端仓库。

## 项目概览

**城竞共生** - 电竞文旅沉浸体验项目

- **技术栈**: Vue 3 + Pinia + Vue Router + Element Plus + Vite
- **后端服务**: Python Flask (见 [os_national_backend](../os_national_backend))

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
├── router/           # 路由配置
└── data/             # 静态数据
```

## 主要功能

- **旅行探索**: 城市地图浏览、路线规划与收藏
- **AI 对话**: 与角色进行沉浸式对话互动
- **用户中心**: 个人信息管理、收藏路线管理

## 详细文档

完整项目文档见 [docs/summary.md](docs/summary.md)，包含：

- 设计架构与状态管理
- 路由配置与登录流程
- API 集成说明
- 设计规范（配色、字体、主题）
- 重要架构决策
