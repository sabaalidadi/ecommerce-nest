import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Relation,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Address } from '../../addresses/entities/address.entity.js';
import { Ticket } from '../../tickets/entities/ticket.entity.js';
import { Product } from '../../products/entities/product.entity.js';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // شماره موبایل: اجباری، یکتا و شناسه اصلی کاربر
  @Column({ unique: true, length: 11 })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  // ایمیل اختیاری و در صورت وجود یکتا
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

  @OneToMany('Address', (address: Address) => address.user)
  addresses: Relation<Address>[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @ManyToMany(() => Product, (product) => product.bookmarkedBy)
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
  bookmarks: Product[];

  @ManyToMany(() => Product, (product) => product.inBaskets, {
    onDelete: 'CASCADE',
  })
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
  basket: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
