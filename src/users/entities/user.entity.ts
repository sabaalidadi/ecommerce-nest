import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Address } from '../../addresses/entities/address.entity.js';
import { Ticket } from '../../tickets/entities/ticket.entity.js';
import { Product } from '../../products/entities/product.entity.js';
import { Order } from '../../orders/entities/order.entity.js';
import { Role } from '../../roles/entities/role.entity.js';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller',
  SUPPORT = 'support',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // شماره موبایل
  @Column({ unique: true, length: 11 })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  // ایمیل اختیاری
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // آدرس‌های کاربر
  @OneToMany('Address', (address: Address) => address.user)
  addresses: Relation<Address[]>;

  // تیکت‌های کاربر
  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Relation<Ticket[]>;

  // محصولاتی که کاربر مالک آن‌هاست
  @OneToMany(() => Product, (product) => product.owner)
  products: Relation<Product[]>;

  // محصولات ذخیره‌شده
  @ManyToMany(
    () => Product,
    (product) => product.bookmarkedBy,
  )
  @JoinTable({
    name: 'bookmarks',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  bookmarks: Relation<Product[]>;

  // محصولات سبد خرید
  @ManyToMany(
    () => Product,
    (product) => product.inBaskets,
  )
  @JoinTable({
    name: 'basket_items',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  basket: Relation<Product[]>;

  // نقش‌های کاربر
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: Relation<Role[]>;

  // سفارش‌های کاربر
  @OneToMany(() => Order, (order) => order.user)
  orders: Relation<Order[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
