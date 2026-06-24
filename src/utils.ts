import { existsSync, writeFileSync, readFileSync } from 'fs-extra';
import { join, dirname } from 'path';
import { spawnSync } from 'child_process';

export const __filename = require.main?.filename || process.argv[1];
export const __dirname = dirname(__filename);
export const DEFAULT_PROJECT_NAME = 'wok-server-project';

export function getTemplateRoot(template: string): string {
  return join(__dirname, '../templates', template);
}

export function runCommand(command: string, cwd?: string): boolean {
  const result = spawnSync(command, [], {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  return result.status === 0;
}

export function updatePackageJson(dir: string, projectName: string, usePnpm: boolean): void {
  const packageJsonPath = join(dir, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.name = projectName.trim();
    if (usePnpm) {
      packageJson.packageManager = 'pnpm@10.33.0';
    } else {
      delete packageJson.packageManager;
    }
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}
