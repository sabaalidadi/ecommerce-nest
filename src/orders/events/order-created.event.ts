import { Order } from '../entities/order.entity.js';

export class OrderCreatedEvent {
  constructor(public readonly order: Order) {}
}
