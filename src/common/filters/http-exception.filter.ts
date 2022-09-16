import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exRes = exception.getResponse();

    const error =
      typeof exRes === 'string' ? { message: exRes } : (exRes as object);

    res.status(status).json({
      ...error,
      timestamp: new Date().toISOString(),
    });
  }
}
