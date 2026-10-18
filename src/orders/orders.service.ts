import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  // ۱. ثبت سفارش اولیه بر اساس سبد خرید فعلی کاربر
  async create(createOrderDto: CreateOrderDto) {
    const { userId, addressId, discountCode } = createOrderDto;

    // ۱. بررسی کاربر و لود کردن سبد خرید او
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        basket: true,
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    if (!user.basket || user.basket.length === 0) {
      throw new BadRequestException(
        'سبد خرید شما خالی است و امکان ثبت سفارش وجود ندارد',
      );
    }

    // ۲. بررسی آدرس و مطمئن شدن از اینکه آدرس متعلق به همین کاربر است
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(
        'آدرس انتخاب‌شده یافت نشد یا متعلق به این کاربر نیست',
      );
    }

    // ۳. محاسبه مجموع مبلغ سبد خرید
    const totalPrice = user.basket.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    // ۴. ساخت رکورد سفارش
    const newOrder = this.orderRepository.create({
      userId,
      addressId,
      totalPrice,
      discountCode: discountCode || null,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    // ۵. ثبت اقلام سفارش در جدول order_items با قیمت لحظه خرید
    const orderItems = user.basket.map((product) => ({
      orderId: savedOrder.id,
      productId: product.id,
      price: product.price,
    }));

    await this.orderItemRepository.save(orderItems as any);

    // ۶. خالی کردن سبد خرید کاربر
    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'basket')
      .of(userId)
      .remove(user.basket.map((p) => p.id));

    // ۷. برگرداندن سفارش همراه با اقلام و مشخصات محصولات
    return await this.findOne(savedOrder.id);
  }

  // ۲. دریافت سفارش‌های یک کاربر
  async findByUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    return await this.orderRepository.find({
      where: { userId },
      relations: {
        user: true,
        address: true,
        items: {
          product: true,
        },
      },
      select: {
        id: true,
        userId: true,
        addressId: true,
        status: true,
        setTime: true,
        payedTime: true,
        totalPrice: true,
        discountCode: true,
        user: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
        },
        address: {
          id: true,
          title: true,
          receiverName: true,
          receiverPhone: true,
          province: true,
          city: true,
          postalAddress: true,
          postalCode: true,
        },
        items: {
          id: true,    // <--- اضافه شد
          price: true, // <--- اضافه شد
          product: {
            id: true,
            title: true,
            price: true,
            description: true,
          },
        },
      },
      order: { setTime: 'DESC' },
    });
  }

  // ۳. دریافت یک سفارش با جزئیات کامل
  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        user: true,
        address: true,
        items: {
          product: true,
        },
      },
      select: {
        id: true,
        userId: true,
        addressId: true,
        status: true,
        setTime: true,
        payedTime: true,
        totalPrice: true,
        discountCode: true,
        user: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
        },
        address: {
          id: true,
          title: true,
          receiverName: true,
          receiverPhone: true,
          province: true,
          city: true,
          postalAddress: true,
          postalCode: true,
        },
        items: {
          id: true,    // <--- اضافه شد
          price: true, // <--- اضافه شد
          product: {
            id: true,
            title: true,
            price: true,
            description: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('سفارش مورد نظر یافت نشد');

    return order;
  }

}
