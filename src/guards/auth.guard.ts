import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<ExpressRequestInterface>();

    if (request.user) {
      return true;
    }

    throw new HttpException('User not authorized', 401);
  }
}
