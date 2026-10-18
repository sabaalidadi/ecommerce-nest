import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  type Relation, // 👈 اضافه شد
} from 'typeorm';
import type { User } from '../../users/entities/user.entity.js'; // 👈 به صورت type ایمپورت شود
import type { Order } from '../../orders/entities/order.entity.js'; // 👈 به صورت type ایمپورت شود

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column('text')
  postalAddress: string;

  @Column({ length: 10 })
  postalCode: string;

  @Column()
  receiverName: string;

  @Column({ length: 11 })
  receiverPhone: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne('User', (user: User) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>; // 👈 تغییر از User به Relation<User>

  @Column()
  userId: string;

  @OneToMany('Order', (order: Order) => order.address)
  orders: Relation<Order[]>; // 👈 تغییر از Order[] به Relation<Order[]>

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
