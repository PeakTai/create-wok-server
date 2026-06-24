import { getLogger, startWebServer } from 'wok-server';
import { globalErrorInterceptor } from './exception';
import { homepage } from './homepage';
import { routers } from './router';

async function main() {
  process.on('uncaughtException', (err) => getLogger().error('未捕获的异常', err));
  Date.prototype.toJSON = function () {
    return this.getTime() as any;
  };

  await startWebServer({
    interceptors: [globalErrorInterceptor],
    routers: {
      '/': homepage,
      ...routers
    }
  });
}

main();
