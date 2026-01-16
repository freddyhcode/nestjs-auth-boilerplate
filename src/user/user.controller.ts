import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(UserRole.ADMIN)
  @Get('admin')
  public async adminOnly() {
    return {
      statusCode: 200,
      message: 'Only access by administrator',
    };
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Get('profile')
  public async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Patch('update-password')
  public async updatePasswordSelf(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePasswordSelf(
      req.user.userId,
      updatePasswordDto,
    );
  }
}
