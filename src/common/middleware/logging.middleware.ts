import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.time('Req-Res time');
    res.on('finish', () => {
      console.timeEnd('Req-Res time');
    });
    next();
  }
}
