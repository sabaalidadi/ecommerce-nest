import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { Order } from './order.entity.js';
import type { Product } from '../../products/entities/product.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId: string;

  @ManyToOne('Order', (order: Order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId: string;

  @ManyToOne('Product', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 0,
  })
  price: number;
}
