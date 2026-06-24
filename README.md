# create-wok-server

快速创建 [wok-server](https://gitee.com/tai/wok-server) 项目的脚手架工具。  
A scaffolding tool for quickly creating [wok-server](https://gitee.com/tai/wok-server) projects.

## 使用方式 / Usage

使用你喜欢的包管理器直接运行，无需安装：  
Run directly with your preferred package manager, no installation required:

```bash
# npm
npm create wok-server

# pnpm
pnpm create wok-server

# yarn
yarn create wok-server
```

然后根据命令行提示选择模板和输入项目名称即可生成项目。  
Then follow the prompts to select a template and enter a project name to generate your project.

### 模板 / Templates

- **default** — 纯后端项目（wok-server），适合独立的后端服务
- **fullstack** — 前后端一体项目（wok-server + wok-ui），适合全栈应用

创建项目时会询问是否安装 AI 技能和自动安装依赖，可根据需要选择。  
You will be asked whether to install AI skills and auto-install dependencies during project creation.

## 本地开发 / Local Development

```bash
# 安装依赖 / Install dependencies
pnpm install

# 构建 / Build
pnpm build
```
