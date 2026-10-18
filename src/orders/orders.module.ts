import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { Order } from './entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { OrderItem } from './entities/order-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order,OrderItem , User, Address])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
