import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesService } from './addresses.service.js';
import { AddressesController } from './addresses.controller.js';
import { Address } from './entities/address.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Order } from '../orders/entities/order.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Address , User , Order])],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
