
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { Category } from '../../categories/entities/category.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
  })
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  // مالک محصول
  @ManyToOne(
    () => User,
    (user) => user.products,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
  })
  owner: Relation<User>;

  // دسته‌بندی‌های محصول
  @ManyToMany(
    () => Category,
    (category) => category.products,
  )
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Relation<Category[]>;

  // کاربرانی که محصول را ذخیره کرده‌اند
  @ManyToMany(
    () => User,
    (user) => user.bookmarks,
  )
  bookmarkedBy: Relation<User[]>;

  // کاربرانی که محصول را به سبد خرید اضافه کرده‌اند
  @ManyToMany(
    () => User,
    (user) => user.basket,
  )
  inBaskets: Relation<User[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
