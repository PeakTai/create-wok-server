import { copy } from 'fs-extra';
import { join } from 'path';
import { confirm } from '@inquirer/prompts';
import { getTemplateRoot, updatePackageJson, runCommand } from './utils';

const SKILLS_COMMANDS = [
  'npx skills add https://gitee.com/tai/wok-server.git --all',
  'npx skills add https://gitee.com/tai/wok-ui.git --all'
];

export async function runFullstackFlow(
  projectName: string,
  usePnpm: boolean,
  projectPath: string,
  t: {
    installSkillsPrompt: string;
    installDepsPrompt: string;
    installingSkills: string;
    installSkillsFailed: string;
    installingDeps: string;
    installDepsFailed: string;
    createSuccess: string;
    projectDirectory: string;
    fullstackNextSteps: string;
    fullstackBackendDev: string;
    fullstackFrontendDev: string;
    devCommand: string;
  }
): Promise<void> {
  const installSkills = await confirm({
    message: t.installSkillsPrompt,
    default: true
  });

  const installDeps = await confirm({
    message: t.installDepsPrompt,
    default: true
  });

  const templateRoot = getTemplateRoot('fullstack');

  await copy(templateRoot, projectPath, {
    filter: (src: string) => {
      if (src.includes('node_modules')) {
        return false;
      }
      if (!usePnpm && src.endsWith('pnpm-lock.yaml')) {
        return false;
      }
      if (src.endsWith('AGENTS.md')) {
        return false;
      }
      return true;
    }
  });

  updatePackageJson(join(projectPath, 'backend'), projectName, usePnpm);
  updatePackageJson(join(projectPath, 'frontend'), projectName, usePnpm);

  // 安装 AI 技能
  if (installSkills) {
    console.log(`\n${t.installingSkills}`);
    let allSuccess = true;
    for (const cmd of SKILLS_COMMANDS) {
      if (!runCommand(cmd, projectPath)) {
        console.warn(`${t.installSkillsFailed}: ${cmd}`);
        allSuccess = false;
      }
    }
    if (allSuccess) {
      // 安装技能成功后，复制 AGENTS.md
      await copy(join(templateRoot, 'AGENTS.md'), join(projectPath, 'AGENTS.md'));
    }
  }

  // 安装依赖
  if (installDeps) {
    console.log(`\n${t.installingDeps}`);
    const pkgManager = usePnpm ? 'pnpm' : 'npm';
    const backendOk = runCommand(`${pkgManager} install`, join(projectPath, 'backend'));
    if (!backendOk) {
      console.warn(`${t.installDepsFailed} (backend)`);
    }
    const frontendOk = runCommand(`${pkgManager} install`, join(projectPath, 'frontend'));
    if (!frontendOk) {
      console.warn(`${t.installDepsFailed} (frontend)`);
    }
  }

  console.log(`\n${t.createSuccess}`);
  console.log(`\n${t.projectDirectory} ${projectPath}`);
  console.log(`\n${t.fullstackNextSteps}`);
  console.log(`  cd ${projectName}/backend`);
  console.log(`  ${usePnpm ? 'pnpm' : 'npm'} ${t.devCommand}  # ${t.fullstackBackendDev}`);
  console.log(`\n  cd ${projectName}/frontend`);
  console.log(`  ${usePnpm ? 'pnpm' : 'npm'} ${t.devCommand}  # ${t.fullstackFrontendDev}`);
}
