import { copy } from 'fs-extra';
import { join } from 'path';
import { confirm } from '@inquirer/prompts';
import { getTemplateRoot, updatePackageJson, runCommand } from './utils';

const SKILLS_COMMAND = 'npx skills add https://gitee.com/tai/wok-server.git --all';

export async function runDefaultFlow(
  projectName: string,
  usePnpm: boolean,
  projectPath: string,
  t: {
    createSuccess: string;
    projectDirectory: string;
    nextSteps: string;
    installCommand: string;
    devCommand: string;
    installSkillsPrompt: string;
    installDepsPrompt: string;
    installingSkills: string;
    installSkillsFailed: string;
    installingDeps: string;
    installDepsFailed: string;
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

  const templateRoot = getTemplateRoot('default');

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

  updatePackageJson(projectPath, projectName, usePnpm);

  if (installSkills) {
    console.log(`\n${t.installingSkills}`);
    if (runCommand(SKILLS_COMMAND, projectPath)) {
      // 安装技能成功后，复制 AGENTS.md
      await copy(join(templateRoot, 'AGENTS.md'), join(projectPath, 'AGENTS.md'));
    } else {
      console.warn(`${t.installSkillsFailed}: ${SKILLS_COMMAND}`);
    }
  }

  if (installDeps) {
    console.log(`\n${t.installingDeps}`);
    const pkgManager = usePnpm ? 'pnpm' : 'npm';
    if (!runCommand(`${pkgManager} install`, projectPath)) {
      console.warn(t.installDepsFailed);
    }
  }

  console.log(`\n${t.createSuccess}`);
  console.log(`\n${t.projectDirectory} ${projectPath}`);
  console.log(`\n${t.nextSteps}`);
  console.log(`  cd ${projectName}`);
  console.log(`  ${usePnpm ? 'pnpm' : 'npm'} ${t.devCommand}`);
}
