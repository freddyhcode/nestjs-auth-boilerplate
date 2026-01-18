import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '../core/config/config.service';
import { MailService } from '../services/mail/mail.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthPurpose } from './enums/auth-purpose.enum';
import * as argon2 from 'argon2';
import { MailType } from 'src/services/mail/enums/mail-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  public async register(userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  public async login(email: string, pass: string, res: Response) {
    const user = await this.userService.findByEmail(email, true);

    if (!user || !(await argon2.verify(user.password, pass))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token, refresh_token } = await this.generateTokens(user);
    this.setCookies(res, access_token, refresh_token);

    return {
      success: true,
      access_token,
      refresh_token,
      user,
    };
  }

  public async generateTokens(user: User, existingRefreshToken?: string) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = existingRefreshToken
      ? existingRefreshToken
      : await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  public async refresh(req: Request, res: Response, bodyToken?: string) {
    const token = bodyToken || req.cookies?.['refresh_token'];
    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.jwt.refreshSecret,
      });

      const storedToken = await this.refreshTokenRepository
        .createQueryBuilder('refresh_tokens')
        .where('refresh_tokens.token = :token', { token })
        .andWhere('refresh_tokens.userId = :userId', { userId: payload.sub })
        .getOne();

      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(
        now.getDate() + this.config.jwt.refreshThresholdDays,
      );

      let tokens: any;
      if (storedToken.expires_at < thresholdDate) {
        await this.refreshTokenRepository.delete(storedToken.id);
        tokens = await this.generateTokens(user);
      } else {
        tokens = await this.generateTokens(user, token);
      }

      this.setCookies(res, tokens.access_token, tokens.refresh_token);

      return {
        success: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateRefreshToken(userId: string) {
    const token = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpiresIn as any,
      },
    );
    const expiresAt = new Date(Date.now() + this.config.cookie.refreshMaxAge);

    await this.refreshTokenRepository
      .createQueryBuilder()
      .insert()
      .into(RefreshToken)
      .values({
        user: { id: userId },
        token: token,
        expires_at: expiresAt,
      })
      .execute();

    return token;
  }

  public async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    const genericResponse = {
      statusCode: 200,
      message: 'If the email exists, you will receive a recovery link.',
    };

    if (!user) {
      return genericResponse;
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      purpose: AuthPurpose.PASSWORD_RESET,
    };

    const resetToken = await this.jwtService.signAsync(payload, {
      expiresIn: '5m',
      secret: this.config.jwt.passwordResetSecret,
    });

    try {
      await this.mailService.send(
        MailType.PASSWORD_RESET,
        user.email,
        resetToken,
      );
    } catch (error) {}

    return genericResponse;
  }

  public async changePassword(userId: string, newPass: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hashedPassword = await argon2.hash(newPass, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64MB
        timeCost: 3,
        parallelism: 4,
      });

      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ password: hashedPassword })
        .where('id = :userId', { userId })
        .execute();

      await this.invalidateRefreshTokens(userId, queryRunner.manager);
      await queryRunner.commitTransaction();
      return {
        statusCode: 200,
        message: 'Password updated and sessions closed successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error updating password');
    } finally {
      await queryRunner.release();
    }
  }

  public async invalidateRefreshTokens(
    userId: string,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(RefreshToken)
      : this.refreshTokenRepository;

    await repo
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('userId = :userId', { userId })
      .execute();
  }

  public setCookies(
    res: Response,
    access_token: string,
    refresh_token: string,
  ) {
    const cookieOptions = {
      httpOnly: true,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
    };

    res.cookie('access_token', access_token, {
      ...cookieOptions,
      maxAge: this.config.cookie.accessMaxAge,
    });

    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: this.config.cookie.refreshMaxAge,
    });
  }

  public async logout(userId: string, res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: this.config.cookie.secure,
      sameSite: this.config.cookie.sameSite,
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    await this.invalidateRefreshTokens(userId);

    return {
      statusCode: 200,
      message: 'Logged out successfully',
    };
  }
}
