import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthPurpose } from '../enums/auth-purpose.enum';

@Injectable()
export class JwtResetAuthGuard extends AuthGuard('jwt-reset') {
  public handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid recovery token');
    }
    if (user.purpose !== AuthPurpose.PASSWORD_RESET) {
      throw new UnauthorizedException('Invalid token purpose');
    }
    return user;
  }
}
