import { ServerExchange, ValidationException } from 'wok-server';

const isDev = process.env.ENV === 'dev';

/**
 * 自定义业务异常.
 */
export class BusinessException {
  constructor(
    /**
     * 提示信息.
     */
    readonly message: string,
    /**
     * 自定义状态码，默认 400
     */
    readonly status?: number
  ) {}
}

/**
 * 无权限的自定义业务异常.
 */
export class ForbiddenBizException extends BusinessException {
  constructor() {
    super('无权限', 403);
  }
}

/**
 * 未找到对象的自定义业务异常.
 */
export class NotFoundBizException extends BusinessException {
  constructor() {
    super('未找到', 404);
  }
}

/**
 * 全局异常拦截器，对一些特定的异常做处理，给予合适的响应信息.
 * @param exchange
 * @param next
 */
export async function globalErrorInterceptor(
  exchange: ServerExchange,
  next: () => Promise<void>
): Promise<void> {
  try {
    await next();
  } catch (e) {
    // 处理自定义业务异常
    if (e instanceof BusinessException) {
      const status = typeof e.status === 'number' ? e.status : 400;
      const message = e.message || '';
      exchange.respondErrMsg(message, status);
      return;
    }
    // 校验异常
    if (e instanceof ValidationException) {
      exchange.respondErrMsg(isDev ? e.message : `${e.propertyPath}:${e.errMsg}`, 400);
      return;
    }
    throw e;
  }
}
