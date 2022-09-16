import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const authHeader = req.header('Authorization');
    const isPublic = this.reflector.get(
      IS_PUBLIC_KEY,
      context.getHandler(),
    ) as boolean;
    // console.log('authHeader:', authHeader);
    // console.log('isPublic:', isPublic);

    if (isPublic) return true;

    if (authHeader && authHeader === this.configService.get('API_KEY')) {
      return true;
    }

    return false; // return false
  }
}
