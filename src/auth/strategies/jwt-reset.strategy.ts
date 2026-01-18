import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/core/config/config.service';
import { AuthPurpose } from '../enums/auth-purpose.enum';

@Injectable()
export class JwtResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.passwordResetSecret,
    });
  }

  async validate(payload: any) {
    if (payload.purpose !== AuthPurpose.PASSWORD_RESET) {
      throw new UnauthorizedException('Invalid token purpose');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      purpose: payload.purpose,
    };
  }
}
