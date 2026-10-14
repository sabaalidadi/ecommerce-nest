import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';
import { UserRole } from '../users/entities/user.entity.js';
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
    return this.usersService.create({
      ...registerDto,
      role: UserRole.CUSTOMER,
    });
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
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
          ),
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

  private async generateTokens(user: {
    id: string;
    phoneNumber: string;
    role: UserRole;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      ),
      expiresIn: 60 * 15,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      ),
      expiresIn: 60 * 60 * 24 * 7,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
