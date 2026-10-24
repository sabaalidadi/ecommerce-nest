import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ایجاد کاربر جدید
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const phoneExists = await this.userRepository.findOne({
      where: { phoneNumber: createUserDto.phoneNumber },
    });

    if (phoneExists) {
      throw new ConflictException(
        'کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است',
      );
    }

    if (createUserDto.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('این ایمیل قبلاً ثبت شده است');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const { password, ...result } = savedUser;
    return result;
  }

  // دریافت لیست همه کاربران (مرتب‌شده بر اساس تاریخ ثبت نام نزولی)
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  // دریافت یک کاربر با شناسه UUID
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر موردنظر پیدا نشد');
    }

    const { password, ...result } = user;
    return result;
  }


async update(id: string, updateUserDto: UpdateUserDto) {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('کاربر موردنظر پیدا نشد');
  }

  Object.assign(user, updateUserDto);

  return this.userRepository.save(user);
}

  // حذف کاربر
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('کاربر موردنظر پیدا نشد');
    }

    await this.userRepository.remove(user);

    return {
      message: 'کاربر با موفقیت حذف شد',
    };
  }

  async findByPhoneForAuth(phoneNumber: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }


}
