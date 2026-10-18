import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { User } from '../../users/entities/user.entity.js';
import type { Address } from '../../addresses/entities/address.entity.js';
import type { OrderItem } from './order-item.entity.js';
import { OrderStatus } from '../enums/order-status.enum.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne('User', (user: User) => user.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'address_id', type: 'varchar', length: 36 })
  addressId: string;

  @ManyToOne('Address', (address: Address) => address.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id' })
  address: Relation<Address>;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn({ name: 'set_time' })
  setTime: Date;

  @Column({ name: 'payed_time', type: 'timestamp', nullable: true })
  payedTime: Date | null;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 0,
    default: 0,
  })
  totalPrice: number;

  @Column({ name: 'discount_code', type: 'varchar', length: 50, nullable: true })
  discountCode: string | null;

  // 👇 رابطه با اقلام سفارش اضافه شد
  @OneToMany('OrderItem', (item: OrderItem) => item.order, { cascade: true })
  items: Relation<OrderItem[]>;
}
