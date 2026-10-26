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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from './events/order-created.event.js';

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
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ۱. ثبت سفارش اولیه بر اساس سبد خرید فعلی کاربر
async create(createOrderDto: CreateOrderDto) {
    const { userId, addressId, discountCode } = createOrderDto;

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

    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException(
        'آدرس انتخاب‌شده یافت نشد یا متعلق به این کاربر نیست',
      );
    }

    const totalPrice = user.basket.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );

    const newOrder = this.orderRepository.create({
      userId,
      addressId,
      totalPrice,
      discountCode: discountCode || null,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    const orderItems = user.basket.map((product) => ({
      orderId: savedOrder.id,
      productId: product.id,
      price: product.price,
    }));

    await this.orderItemRepository.save(orderItems as any);

    await this.userRepository
      .createQueryBuilder()
      .relation(User, 'basket')
      .of(userId)
      .remove(user.basket.map((p) => p.id));

    // دریافت کامل سفارش به همراه اقلام و مشخصات کاربر و آدرس
    const completeOrder = await this.findOne(savedOrder.id);

    // ۴. انتشار رویداد برای صدور فاکتور توسط Listener
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(completeOrder));

    return completeOrder;
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
