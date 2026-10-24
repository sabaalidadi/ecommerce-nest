import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { AppPermission } from '../roles/constants/permissions.constant.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 🔒 نیاز به پرمیشن ایجاد محصول (admin, seller)
  @Post()
  @RequirePermissions(AppPermission.PRODUCT_CREATE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // 🌐 عمومی: همه کاربران و مهمان‌ها
  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // 🌐 عمومی: همه کاربران و مهمان‌ها
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  // 🔒 نیاز به پرمیشن ویرایش محصول (admin, seller)
  @Patch(':id')
  @RequirePermissions(AppPermission.PRODUCT_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // 🔒 نیاز به پرمیشن حذف محصول (admin, seller)
  @Delete(':id')
  @RequirePermissions(AppPermission.PRODUCT_DELETE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
