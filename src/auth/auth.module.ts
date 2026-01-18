import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../core/config/config.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtResetStrategy } from './strategies/jwt-reset.strategy';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.jwt.secret,
        signOptions: { expiresIn: config.jwt.expiresIn as any },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtResetStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
