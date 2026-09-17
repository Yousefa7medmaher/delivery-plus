import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByRestaurant(restaurantId: string): Promise<Category[]> {
    return this.repo.find({ where: { restaurantId }, order: { displayOrder: 'ASC' } });
  }

  create(data: Pick<Category, 'restaurantId' | 'name' | 'displayOrder'>): Promise<Category> {
    return this.repo.save(this.repo.create(data));
  }
}
