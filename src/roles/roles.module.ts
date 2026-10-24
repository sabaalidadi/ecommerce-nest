import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js'; // 👈 مسیر انتیتی Permission را با پروژه خود چک کنید
import { User } from '../users/entities/user.entity.js'; // 👈 اگر کاربر هم تزریق شده (مسیر را بر اساس ساختار پروژه تنظیم کنید)

@Module({
  imports: [
    // 👈 اضافه کردن تمام انتیتی‌هایی که RolesService به مخازن آن‌ها نیاز دارد
    TypeOrmModule.forFeature([Role, Permission, User]),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
