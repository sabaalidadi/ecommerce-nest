import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { JwtPayload } from '../auth/types/jwt-payload.type.js';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  private canManageAllAddresses(user: JwtPayload): boolean {
    return Boolean(user.roles?.includes('admin'));
  }

  // ثبت آدرس برای هر کاربرِ لاگین‌شده
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    const userId = request.user.sub;
    return this.addressesService.create({
      ...createAddressDto,
      userId,
    });
  }

  // دریافت آدرس‌ها
  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('userId') queryUserId?: string,
  ) {
    const user = request.user;

    // اگر ادمین باشد و کوئری userId فرستاده باشد، آدرس آن کاربر را می‌گیرد
    if (this.canManageAllAddresses(user) && queryUserId) {
      return this.addressesService.findAllByUser(queryUserId);
    }

    // در غیر این صورت فقط آدرس‌های خودِ کاربر برگشت داده می‌شود
    return this.addressesService.findAllByUser(user.sub);
  }

  @Get(':id')
  async findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const address = await this.addressesService.findOne(id);
    const user = request.user;

    if (!this.canManageAllAddresses(user) && address.userId !== user.sub) {
      throw new ForbiddenException('شما اجازه دسترسی به این آدرس را ندارید');
    }

    return address;
  }

  @Patch(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.addressesService.findOne(id);
    const user = request.user;

    if (!this.canManageAllAddresses(user) && address.userId !== user.sub) {
      throw new ForbiddenException('شما اجازه ویرایش این آدرس را ندارید');
    }

    return this.addressesService.update(id, updateAddressDto);
  }

  @Delete(':id')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const address = await this.addressesService.findOne(id);
    const user = request.user;

    if (!this.canManageAllAddresses(user) && address.userId !== user.sub) {
      throw new ForbiddenException('شما اجازه حذف این آدرس را ندارید');
    }

    return this.addressesService.remove(id);
  }
}
