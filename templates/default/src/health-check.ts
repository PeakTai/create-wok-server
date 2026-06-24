import { ServerExchange } from 'wok-server';

export async function healthCheck(exchange: ServerExchange) {
  exchange.respondJson({ status: 'ok' });
}
