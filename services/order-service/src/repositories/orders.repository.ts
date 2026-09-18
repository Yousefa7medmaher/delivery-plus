import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '@food-delivery/shared';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

export interface NewOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  findById(id: string): Promise<Order | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(
    customerId: string,
    restaurantId: string,
    items: NewOrderItem[],
    totalAmount: number,
    idempotencyKey?: string,
  ): Promise<Order> {
    const order = this.repo.create({
      customerId,
      restaurantId,
      status: OrderStatus.CREATED,
      totalAmount: totalAmount.toFixed(2),
      idempotencyKey: idempotencyKey ?? null,
      items: items.map(
        (item) =>
          ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price.toFixed(2),
            quantity: item.quantity,
          }) as OrderItem,
      ),
    });
    return this.repo.save(order);
  }

  findByCustomerAndIdempotencyKey(customerId: string, idempotencyKey: string): Promise<Order | null> {
    return this.repo.findOne({
      where: { customerId, idempotencyKey },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.repo.update({ id }, { status });
    return this.findById(id);
  }

  async findByCustomer(customerId: string, page: number, limit: number): Promise<[Order[], number]> {
    return this.repo.findAndCount({
      where: { customerId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findByRestaurant(restaurantId: string, page: number, limit: number): Promise<[Order[], number]> {
    return this.repo.findAndCount({
      where: { restaurantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
