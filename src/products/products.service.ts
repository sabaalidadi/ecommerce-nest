import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { Category } from '../categories/entities/category.entity.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryIds, ...productData } = createProductDto;

    let categories: Category[] = [];

    if (categoryIds && categoryIds.length > 0) {
      categories = await this.categoryRepository.findBy({
        id: In(categoryIds),
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('یک یا چند دسته‌بندی ارسال‌شده معتبر نیستند');
      }
    }

    const product = this.productRepository.create({
      ...productData,
      categories,
    });

    return await this.productRepository.save(product);
  }

   async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      relations: {
        categories: true, 
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        categories: true, 
      },
    });

    if (!product) {
      throw new NotFoundException('محصول مورد نظر یافت نشد');
    }

    return product;
  }


  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const { categoryIds, ...productData } = updateProductDto;

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const categories = await this.categoryRepository.findBy({
          id: In(categoryIds),
        });

        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('یک یا چند دسته‌بندی ارسال‌شده معتبر نیستند');
        }

        product.categories = categories;
      } else {
        // در صورتی که آرایه خالی فرستاده شد دسته‌بندی‌ها پاک شوند
        product.categories = [];
      }
    }

    Object.assign(product, productData);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'محصول با موفقیت حذف شد' };
  }
}
