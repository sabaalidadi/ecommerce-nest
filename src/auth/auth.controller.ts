import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UsersService } from '../users/users.service.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

interface AuthenticatedUser {
  sub: string;
  phoneNumber: string;
  roles: string[];
  permissions: string[];
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    return {
      message: 'ثبت‌نام با موفقیت انجام شد',
      user,
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    this.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return {
      message: 'ورود با موفقیت انجام شد',
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // گرفتن رفرش توکن از کوکی (یا request.body / headers بسته به پروژه شما)
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('توکن refresh ارسال نشده است');
    }

    const result = await this.authService.refresh(refreshToken);

    this.setAuthCookies(
      response,
      result.accessToken,
      result.refreshToken,
    );

    return {
      message: 'توکن‌ها با موفقیت به‌روزرسانی شدند',
      user: result.user,
    };
  }


  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions());
    response.clearCookie('refreshToken', this.cookieOptions());

    return {
      message: 'با موفقیت خارج شدید',
    };
  }

  // پروفایل کاربر لاگین شده به همراه نقش‌ها و پرمیشن‌ها (مناسب برای فرانت‌اند)
@Get('me')
async me(@CurrentUser() user: AuthenticatedUser) {
  const userProfile = await this.usersService.findOne(user.sub);

  return {
    ...userProfile,
    roles: user.roles,
    permissions: user.permissions,
  };
}
  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const options = this.cookieOptions();

    response.cookie('accessToken', accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
