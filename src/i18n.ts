interface Messages {
  projectNamePrompt: string;
  directoryExistsError: string;
  usePnpmPrompt: string;
  createSuccess: string;
  projectDirectory: string;
  nextSteps: string;
  cdCommand: string;
  installCommand: string;
  devCommand: string;
  createFailed: string;
  skillsTipTitle: string;
  templatePrompt: string;
  templateDefault: string;
  templateFullstack: string;
  installSkillsPrompt: string;
  installDepsPrompt: string;
  installingSkills: string;
  installSkillsFailed: string;
  installingDeps: string;
  installDepsFailed: string;
  fullstackNextSteps: string;
  fullstackBackendDev: string;
  fullstackFrontendDev: string;
  languagePrompt: string;
  languageZh: string;
  languageEn: string;
}

const messages: Record<string, Messages> = {
  zh: {
    projectNamePrompt: '请输入新项目目录名称:',
    directoryExistsError: '目录已存在，请选择其他名称',
    usePnpmPrompt: '是否使用 pnpm 作为包管理器?',
    createSuccess: '🎉 项目创建成功!',
    projectDirectory: '项目目录:',
    nextSteps: '接下来可以执行:',
    cdCommand: 'cd',
    installCommand: 'install',
    devCommand: 'run dev',
    createFailed: '❌ 项目创建失败:',
    skillsTipTitle: '如果需要 AI 辅助开发，可以执行以下命令安装技能：',
    templatePrompt: '请选择项目模板:',
    templateDefault: 'default (纯后端 wok-server)',
    templateFullstack: 'fullstack (前后端一体 wok-server + wok-ui)',
    installSkillsPrompt: '是否安装 AI 技能?',
    installDepsPrompt: '是否自动安装依赖?',
    installingSkills: '正在安装 AI 技能...',
    installSkillsFailed: '⚠️ AI 技能安装失败，请稍后手动执行',
    installingDeps: '正在安装依赖...',
    installDepsFailed: '⚠️ 依赖安装失败，请稍后手动执行',
    fullstackNextSteps: '前后端项目分别启动:',
    fullstackBackendDev: '后端 dev',
    fullstackFrontendDev: '前端 dev',
    languagePrompt: '请选择语言:',
    languageZh: '中文 (Chinese)',
    languageEn: '英文 (English)'
  },
  en: {
    projectNamePrompt: 'Enter new project directory name:',
    directoryExistsError: 'Directory already exists, please choose another name',
    usePnpmPrompt: 'Use pnpm as package manager?',
    createSuccess: '🎉 Project created successfully!',
    projectDirectory: 'Project directory:',
    nextSteps: 'Next steps:',
    cdCommand: 'cd',
    installCommand: 'install',
    devCommand: 'run dev',
    createFailed: '❌ Failed to create project:',
    skillsTipTitle: 'For AI-assisted development, run the following command to install skills:',
    templatePrompt: 'Select project template:',
    templateDefault: 'default (backend only wok-server)',
    templateFullstack: 'fullstack (frontend + backend wok-server + wok-ui)',
    installSkillsPrompt: 'Install AI skills?',
    installDepsPrompt: 'Auto install dependencies?',
    installingSkills: 'Installing AI skills...',
    installSkillsFailed: '⚠️ AI skills installation failed, please run manually later',
    installingDeps: 'Installing dependencies...',
    installDepsFailed: '⚠️ Dependencies installation failed, please run manually later',
    fullstackNextSteps: 'Start frontend and backend separately:',
    fullstackBackendDev: 'backend dev',
    fullstackFrontendDev: 'frontend dev',
    languagePrompt: 'Select language:',
    languageZh: 'Chinese (中文)',
    languageEn: 'English (英文)'
  }
};

function getLocale(): string {
  const lang = Intl.DateTimeFormat().resolvedOptions().locale;
  if (lang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

const locale = getLocale();
const t = messages[locale];

export { t, locale, messages };
