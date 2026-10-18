import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { BasketActionDto } from './dto/basket-action.dto.js';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}


  async addToBasket(dto: BasketActionDto) {
    const { userId, productIds } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    // جلوگیری از شناسه‌های تکراری ارسالی در یک درخواست
    const uniqueProductIds = Array.from(new Set(productIds));

    // چک کردن وجود محصولات در دیتابیس
    const foundProducts = await this.productRepository.find({
      where: { id: In(uniqueProductIds) },
      select: { id: true },
    });

    if (foundProducts.length !== uniqueProductIds.length) {
      throw new BadRequestException('یک یا چند محصول ارسالی در سیستم یافت نشد');
    }

    // دریافت محصولاتی که در حال حاضر داخل سبد خرید کاربر هستند
    const existingBasketItems = await this.userRepository
      .createQueryBuilder()
      .relation(User, 'basket')
      .of(userId)
      .loadMany();

    const existingProductIds = new Set(existingBasketItems.map((item) => item.id));

    // فقط مواردی که هنوز در سبد نیستند را جدا می‌کنیم
    const idsToAdd = uniqueProductIds.filter((id) => !existingProductIds.has(id));

    if (idsToAdd.length === 0) {
      return {
        message: 'تمامی محصولات انتخابی از قبل در سبد خرید موجود بودند',
        addedCount: 0,
      };
    }

    // اضافه کردن تمام شناسه‌ها در یک کوئری
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'basket')
      .of(userId)
      .add(idsToAdd);

    return {
      message: `${idsToAdd.length} محصول با موفقیت به سبد خرید اضافه شد`,
      addedCount: idsToAdd.length,
      skippedCount: uniqueProductIds.length - idsToAdd.length,
    };
  }

  // ۲. حذف گروهی از سبد خرید
  async removeFromBasket(dto: BasketActionDto) {
    const { userId, productIds } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    const uniqueProductIds = Array.from(new Set(productIds));

    // حذف چندتایی در یک کوئری
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'basket')
      .of(userId)
      .remove(uniqueProductIds);

    return {
      message: 'محصولات انتخابی با موفقیت از سبد خرید حذف شدند',
      removedCount: uniqueProductIds.length,
    };
  }

  // ۳. مشاهده سبد خرید کاربر به همراه مشخصات کاربر و مجموع قیمت
  async getUserBasket(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        role: true,
      },
      relations: {
        basket: {
          categories: true,
        },
      },
    });

    if (!user) throw new NotFoundException('کاربر یافت نشد');

    // محاسبه قیمت کل محصولات سبد
    const totalPrice = user.basket.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      items: user.basket,
      totalCount: user.basket.length,
      totalPrice,
    };
  }
}
