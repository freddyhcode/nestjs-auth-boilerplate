import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ForgotPasswordDto, ChangePasswordDto } from './dto/password-reset.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtResetAuthGuard } from './guards/jwt-reset-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  public async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(dto.email, dto.password, res);
  }

  @Post('refresh')
  public async refresh(
    @Body('token') token: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.refresh(req, res, token);
  }

  @Post('forgot-password')
  public async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @UseGuards(JwtResetAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN,UserRole.USER)
  @Post('change-password')
  public async changePassword(
    @CurrentUser('userId') userId,
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(userId, dto.newPassword);
  }
}
