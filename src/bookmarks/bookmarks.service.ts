import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { ToggleBookmarkDto } from './dto/toggle-bookmark.dto.js';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // عملیات Toggle: اگر نشانک نشده بود اضافه کن، اگر بود حذف کن
  async toggleBookmark(toggleDto: ToggleBookmarkDto): Promise<{ isBookmarked: boolean; message: string }> {
    const { userId, productId } = toggleDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('محصول یافت نشد');
    }

    // بررسی اینکه آیا قبلاً بوک‌مارک شده یا خیر
    const isAlreadyBookmarked = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.bookmarks', 'product', 'product.id = :productId', { productId })
      .where('user.id = :userId', { userId })
      .getCount();

    if (isAlreadyBookmarked > 0) {
      // اگر از قبل بود، از جدول واسط حذف می‌کنیم
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'bookmarks')
        .of(userId)
        .remove(productId);

      return { isBookmarked: false, message: 'محصول از نشانک‌ها حذف شد' };
    } else {
      // اگر نبود، اضافه می‌کنیم
      await this.userRepository
        .createQueryBuilder()
        .relation(User, 'bookmarks')
        .of(userId)
        .add(productId);

      return { isBookmarked: true, message: 'محصول به نشانک‌ها اضافه شد' };
    }
  }

  // دریافت تمام محصولات بوک‌مارک‌شده توسط یک کاربر
  async getUserBookmarks(userId: string): Promise<Product[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        bookmarks: {
          categories: true, // لود کردن دسته‌بندی‌های هر بوک‌مارک (محصول)
        },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return user.bookmarks;
  }

}
