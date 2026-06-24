import { ServerExchange } from 'wok-server';
import { healthCheck } from './health-check';

export const routers: Record<string, (exchange: ServerExchange) => Promise<void> | void> = {
  '/health': healthCheck
};
