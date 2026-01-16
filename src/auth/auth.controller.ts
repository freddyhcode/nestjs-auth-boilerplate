import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordResetGuard } from './guards/password-reset.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ForgotPasswordDto, ChangePasswordDto } from './dto/password-reset.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  public async login(@Body() dto: LoginUserDto) {
    return await this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  public async refresh(@Body('token') token: string) {
    return await this.authService.refresh(token);
  }

  @Post('forgot-password')
  public async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @UseGuards(JwtAuthGuard, PasswordResetGuard)
  @Post('change-password')
  public async changePassword(
    @CurrentUser('userId') userId,
    @Body() dto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(userId, dto.newPassword);
  }
}
