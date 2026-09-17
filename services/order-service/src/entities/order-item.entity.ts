import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order!: Order;

  @Column()
  menuItemId!: string;

  @Column()
  name!: string; // snapshot at order time, decoupled from menu-service

  @Column('decimal', { precision: 10, scale: 2 })
  price!: string; // snapshot at order time

  @Column('int')
  quantity!: number;
}
