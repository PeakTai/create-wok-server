import { ServerExchange } from 'wok-server';
import { getAppInfo } from './api/app-info';

export const routers: Record<string, (exchange: ServerExchange) => Promise<void> | void> = {
  '/api/app-info': getAppInfo
};
