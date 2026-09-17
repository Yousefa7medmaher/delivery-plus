import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryStatus } from '@food-delivery/shared';
import { Delivery } from '../entities/delivery.entity';

@Injectable()
export class DeliveriesRepository {
  constructor(
    @InjectRepository(Delivery)
    private readonly repo: Repository<Delivery>,
  ) {}

  findById(id: string): Promise<Delivery | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByOrderId(orderId: string): Promise<Delivery | null> {
    return this.repo.findOne({ where: { orderId } });
  }

  findActiveByDriverId(driverId: string): Promise<Delivery[]> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.driverId = :driverId', { driverId })
      .andWhere('d.status NOT IN (:...terminal)', {
        terminal: [DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED],
      })
      .getMany();
  }

  create(orderId: string): Promise<Delivery> {
    return this.repo.save(this.repo.create({ orderId, status: DeliveryStatus.CREATED }));
  }

  async update(id: string, data: Partial<Delivery>): Promise<Delivery | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
}
