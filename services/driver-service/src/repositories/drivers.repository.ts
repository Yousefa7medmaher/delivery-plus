import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverStatus } from '@food-delivery/shared';
import { Driver } from '../entities/driver.entity';

@Injectable()
export class DriversRepository {
  constructor(
    @InjectRepository(Driver)
    private readonly repo: Repository<Driver>,
  ) {}

  findById(id: string): Promise<Driver | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUserId(userId: string): Promise<Driver | null> {
    return this.repo.findOne({ where: { userId } });
  }

  create(data: Pick<Driver, 'userId' | 'vehicleType' | 'licensePlate'>): Promise<Driver> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: string, status: DriverStatus): Promise<Driver | null> {
    await this.repo.update({ id }, { status });
    return this.findById(id);
  }

  findAvailable(page: number, limit: number): Promise<[Driver[], number]> {
    return this.repo.findAndCount({
      where: { status: DriverStatus.AVAILABLE },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
