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
import * as bcrypt from 'bcrypt';
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

  public async create(userData: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { password, ...userDataRest } = userData;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

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

  public async findByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .where('users.email = :email', { email })
      .getOne();
  }

  public async findForAuth(email: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email })
      .getOne();
  }

  public async findById(id: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id })
      .getOne();
  }

  public async findForAuthById(id: string) {
    return await this.userRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.id = :id', { id })
      .getOne();
  }

  public async getProfile(userId: string): Promise<User> {
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
    const user = await this.userRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('The current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, salt);

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
