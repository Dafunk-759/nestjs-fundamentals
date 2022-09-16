import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Protocol = createParamDecorator(
  (defaultValue: string, ctx: ExecutionContext) => {
    // console.log('default', defaultValue);
    const req = ctx.switchToHttp().getRequest() as Request;
    return req.protocol;
  },
);
