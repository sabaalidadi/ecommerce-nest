import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ۱. ایجاد آدرس جدید
  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { userId, isDefault } = createAddressDto;

    // بررسی وجود کاربر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربری با این شناسه یافت نشد');
    }

    // تعداد آدرس‌های فعلی کاربر
    const addressesCount = await this.addressRepository.count({
      where: { userId },
    });

    let shouldBeDefault = isDefault ?? false;

    // اگر اولین آدرس کاربر است، الزاما پیش‌فرض می‌شود
    if (addressesCount === 0) {
      shouldBeDefault = true;
    } else if (shouldBeDefault) {
      // اگر آدرس جدید قراره پیش‌فرض بشه، بقیه آدرس‌های کاربر رو غیرپیش‌فرض می‌کنیم
      await this.resetDefaultAddress(userId);
    }

    const newAddress = this.addressRepository.create({
      ...createAddressDto,
      isDefault: shouldBeDefault,
    });

    return await this.addressRepository.save(newAddress);
  }

  // ۲. دریافت همه آدرس‌های یک کاربر خاص
  async findAllByUser(userId: string): Promise<Address[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربری با این شناسه یافت نشد');
    }

    return await this.addressRepository.find({
      where: { userId },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  // ۳. دریافت یک آدرس بر اساس ID
  async findOne(id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    if (!address) {
      throw new NotFoundException('آدرس مورد نظر یافت نشد');
    }

    return address;
  }

  // ۴. به‌روزرسانی آدرس
  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id);

    // اگر کاربر خواست این آدرس پیش‌فرض شود
    if (updateAddressDto.isDefault === true && !address.isDefault) {
      await this.resetDefaultAddress(address.userId);
    }

    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  // ۵. حذف آدرس
  async remove(id: string): Promise<{ message: string }> {
    const address = await this.findOne(id);
    const wasDefault = address.isDefault;
    const userId = address.userId;

    await this.addressRepository.remove(address);

    // اگر آدرس حذف شده پیش‌فرض بود، آخرین آدرس ثبت‌شده را پیش‌فرض کن
    if (wasDefault) {
      const remainingAddress = await this.addressRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await this.addressRepository.save(remainingAddress);
      }
    }

    return { message: 'آدرس با موفقیت حذف شد' };
  }

  // متد کمکی: غیرفعال کردن حالت پیش‌فرض همه آدرس‌های کاربر
  private async resetDefaultAddress(userId: string): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}
