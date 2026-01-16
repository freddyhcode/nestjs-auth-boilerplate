import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthPurpose } from '../enums/auth-purpose.enum';

@Injectable()
export class PasswordResetGuard implements CanActivate {
  public canActivate(context: ExecutionContext) {
    const { user } = context.switchToHttp().getRequest();
    if (!user || user.purpose !== AuthPurpose.PASSWORD_RESET) {
      throw new ForbiddenException('Recovery token required');
    }
    return true;
  }
}
