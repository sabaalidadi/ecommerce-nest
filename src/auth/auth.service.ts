import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './types/jwt-payload.type.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // ایجاد کاربر جدید (نقش پیش‌فرض customer داخل UsersService مدیریت می‌شود)
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByPhoneForAuth(
      loginDto.phoneNumber,
    );

    if (!user) {
      throw new UnauthorizedException(
        'شماره موبایل یا رمز عبور نادرست است',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'حساب کاربری شما غیرفعال شده است',
      );
    }

    const passwordIsValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'شماره موبایل یا رمز عبور نادرست است',
      );
    }

    const tokens = await this.generateTokens(user);

    const publicUser = await this.usersService.findOne(user.id);

    return {
      ...tokens,
      user: publicUser,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException(
        'توکن refresh نامعتبر یا منقضی شده است',
      );
    }

    try {
      const user = await this.usersService.findOne(payload.sub);

      if (!user.isActive) {
        throw new UnauthorizedException(
          'حساب کاربری شما غیرفعال شده است',
        );
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user,
      };
    } catch {
      throw new UnauthorizedException(
        'کاربر موردنظر پیدا نشد',
      );
    }
  }

  /**
   * استخراج پرمیشن‌های یکتا از روی تمام نقش‌های کاربر
   */
  private extractUserPermissions(user: User): {
    roles: string[];
    permissions: string[];
  } {
    const roles: string[] = [];
    const permissionSet = new Set<string>();

    if (user.roles && user.roles.length > 0) {
      for (const role of user.roles) {
        roles.push(role.name);
        if (role.permissions && role.permissions.length > 0) {
          for (const perm of role.permissions) {
            permissionSet.add(perm.name);
          }
        }
      }
    }

    return {
      roles,
      permissions: Array.from(permissionSet),
    };
  }

  /**
   * تولید توکن‌های Access و Refresh شامل پرمیشن‌ها و نقش‌ها
   */
  private async generateTokens(user: Omit<User, 'password'> | User) {
    const { roles, permissions } = this.extractUserPermissions(user as User);

    const payload: JwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      roles,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: 60 * 15, // 15 دقیقه
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 60 * 60 * 24 * 7, // 7 روز
    });

    return {
      accessToken,
      refreshToken,
    };
  }

}
