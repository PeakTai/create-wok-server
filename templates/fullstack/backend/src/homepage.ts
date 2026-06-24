import { ServerExchange } from 'wok-server';
import pkg from '../package.json';

const startAt = new Date();

export async function homepage(exchange: ServerExchange) {
  exchange.respondJson({
    appName: 'wok-server-project',
    version: pkg.version,
    startAt: startAt.toLocaleString()
  });
}
