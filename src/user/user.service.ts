import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import * as argon2 from 'argon2';
import { UpdatePasswordDto } from '../auth/dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  public async create(userData: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { password, ...userDataRest } = userData;

      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64MB
        timeCost: 3,
        parallelism: 4,
      });

      const user = queryRunner.manager.create(User, {
        ...userDataRest,
        password: hashedPassword,
      });

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new BadRequestException('Email already registered');
      }
      throw new InternalServerErrorException('Error creating user');
    } finally {
      await queryRunner.release();
    }
  }

  public async findByEmail(email: string, includePassword = false) {
    const query = this.userRepository
      .createQueryBuilder('users')
      .where('users.email = :email', { email });

    if (includePassword) {
      query.addSelect('users.password');
    }

    return await query.getOne();
  }

  public async findById(id: string, includePassword = false) {
    const query = this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id });

    if (includePassword) {
      query.addSelect('users.password');
    }

    return await query.getOne();
  }

  public async getProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.findById(userId, true);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !(await argon2.verify(user.password, updatePasswordDto.currentPassword))
    ) {
      throw new UnauthorizedException('Current password does not match');
    }

    const hashedPassword = await argon2.hash(updatePasswordDto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,
      parallelism: 4,
    });

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('id = :userId', { userId })
      .execute();

    return {
      statusCode: 200,
      message: 'Password updated successfully.',
    };
  }
}
