# 前后端一体项目

本项目包含前端和后端两个子项目，前端使用 wok-ui，后端使用 wok-server。

## 目录结构

```
backend/   # 后端服务 (wok-server)
  src/
    api/
      app-info.ts    # 后端 API 接口
    main.ts          # 后端入口
frontend/  # 前端应用 (wok-ui)
  src/
    api/
      index.ts       # 前端 API 请求模块
    pages/
      home-page.ts   # 首页（展示后端数据）
```

## 启动方式

### 后端

```bash
cd backend
pnpm install
pnpm dev
```

后端服务默认运行在 http://localhost:8080

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

前端开发服务器默认运行在 http://localhost:5173

## 前后端交互

前端通过 `fetch` 调用后端 `/api/app-info` 接口获取应用信息，并在首页展示。

- 后端接口：[backend/src/api/app-info.ts](backend/src/api/app-info.ts)
- 前端请求：[frontend/src/api/index.ts](frontend/src/api/index.ts)
- 前端页面：[frontend/src/pages/home-page.ts](frontend/src/pages/home-page.ts)

## 环境配置

后端环境变量配置在 `backend/.env` 文件中，请根据实际情况修改。

## AI 技能安装

如需 AI 辅助开发，可执行以下命令安装技能：

```bash
npx skills add https://gitee.com/tai/wok-server.git --all
npx skills add https://gitee.com/tai/wok-ui.git --all
```
