import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator.js';
import { AppPermission } from '../roles/constants/permissions.constant.js';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @RequirePermissions(AppPermission.PRODUCT_CREATE)
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
  ) {
    return this.productsService.create(
      createProductDto,
      request.user.sub,
    );
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(AppPermission.PRODUCT_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() request: any,
  ) {
    const roles: string[] = request.user.roles ?? [];
    const isAdmin = roles.includes('admin');

    return this.productsService.update(
      id,
      updateProductDto,
      request.user.sub,
      isAdmin,
    );
  }

  @Delete(':id')
  @RequirePermissions(AppPermission.PRODUCT_DELETE)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
  ) {
    const roles: string[] = request.user.roles ?? [];
    const isAdmin = roles.includes('admin');

    return this.productsService.remove(
      id,
      request.user.sub,
      isAdmin,
    );
  }
}