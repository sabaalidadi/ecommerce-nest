import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { BookmarksModule } from './bookmarks/bookmarks.module.js';
import { BasketModule } from './basket/basket.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { RateLimitModule } from './rate-limit/rate-limit.module.js';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { RolesModule } from './roles/roles.module.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';

// ۱. انتیتی‌های مورد نیاز PermissionsGuard را ایمپورت کنید:
import { User } from './users/entities/user.entity.js';
import { Role } from './roles/entities/role.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'shop_db'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),

    // ۲. ثبت انتیتی‌ها برای این که APP_GUARD به ریپازیتوری آن‌ها دسترسی داشته باشد:
    TypeOrmModule.forFeature([User, Role]),

    AuthModule,
    UsersModule,
    AddressesModule,
    TicketsModule,
    CategoriesModule,
    ProductsModule,
    BookmarksModule,
    BasketModule,
    OrdersModule,
    PaymentsModule,
    RateLimitModule,
    RolesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
