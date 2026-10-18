import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketService } from './basket.service.js';
import { BasketController } from './basket.controller.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product])],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
