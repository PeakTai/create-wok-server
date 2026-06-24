import { ensureDir, existsSync } from 'fs-extra';
import { input, confirm, select } from '@inquirer/prompts';
import { join } from 'path';
import { t, locale, messages } from './i18n';
import { DEFAULT_PROJECT_NAME } from './utils';
import { runDefaultFlow } from './default-flow';
import { runFullstackFlow } from './fullstack-flow';

const FULLSTACK_PROJECT_NAME = 'wok-fullstack-project';

type TemplateType = 'default' | 'fullstack';

async function chooseLanguage(): Promise<string> {
  const detectedLocale = locale;
  const defaultValue = detectedLocale === 'zh' ? 'zh' : 'en';
  const lang = await select<string>({
    message: t.languagePrompt,
    choices: [
      { name: t.languageZh, value: 'zh' },
      { name: t.languageEn, value: 'en' }
    ],
    default: defaultValue
  });
  return lang;
}

async function main() {
  try {
    const lang = await chooseLanguage();
    const currentT = messages[lang];

    const template = await select<TemplateType>({
      message: currentT.templatePrompt,
      choices: [
        { name: currentT.templateDefault, value: 'default' },
        { name: currentT.templateFullstack, value: 'fullstack' }
      ]
    });

    const defaultProjectName = template === 'default' ? DEFAULT_PROJECT_NAME : FULLSTACK_PROJECT_NAME;

    const projectName = await input({
      message: currentT.projectNamePrompt,
      default: defaultProjectName,
      validate: (value) => {
        const name = value.trim() || defaultProjectName;
        if (existsSync(name)) {
          return currentT.directoryExistsError;
        }
        return true;
      }
    });

    const usePnpm = await confirm({
      message: currentT.usePnpmPrompt,
      default: true
    });

    const projectPath = join(process.cwd(), projectName.trim());
    await ensureDir(projectPath);

    if (template === 'default') {
      await runDefaultFlow(projectName, usePnpm, projectPath, currentT);
    } else {
      await runFullstackFlow(projectName, usePnpm, projectPath, currentT);
    }
  } catch (error) {
    console.error(`${t.createFailed}`, error);
    process.exit(1);
  }
}

main();
