import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Product } from '../products/entities/product.entity.js';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { title: createCategoryDto.title },
    });
    if (existing) {
      throw new ConflictException('دسته‌بندی با این عنوان از قبل وجود دارد');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.title && updateCategoryDto.title !== category.title) {
      const existing = await this.categoryRepository.findOne({
        where: { title: updateCategoryDto.title },
      });
      if (existing) {
        throw new ConflictException('دسته‌بندی با این عنوان از قبل وجود دارد');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }


    async safe_remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی مورد نظر یافت نشد');
    }

    const productsCount = await this.productRepository.count({
      where: {
        categories: { id },
      },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `امکان حذف این دسته‌بندی وجود ندارد؛ زیرا ${productsCount} محصول به آن متصل است.`,
      );
    }

    // ۳. حذف در صورت نبود محصول
    await this.categoryRepository.remove(category);
    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }
}
