// 后端 API 接口对接
export const API_BASE_URL = 'http://localhost:8080';

export interface AppInfo {
  appName: string;
  version: string;
  startAt: string;
  env: string;
}

export async function fetchAppInfo(): Promise<AppInfo> {
  const response = await fetch(`${API_BASE_URL}/api/app-info`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
