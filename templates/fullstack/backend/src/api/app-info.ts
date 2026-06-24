import { ServerExchange } from 'wok-server';

const startAt = new Date();

export async function getAppInfo(exchange: ServerExchange) {
  exchange.respondJson({
    appName: 'wok-fullstack-project',
    version: '1.0.0',
    startAt: startAt.toLocaleString(),
    env: process.env.ENV || 'dev'
  });
}
