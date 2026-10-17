import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service.js';
import { BookmarksController } from './bookmarks.controller.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
