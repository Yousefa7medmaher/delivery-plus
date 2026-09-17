import { Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError, PaginatedResult, UserRole, CacheService } from '@food-delivery/shared';
import { RestaurantsRepository } from '../repositories/restaurants.repository';
import { CreateRestaurantDto } from '../dto/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dto/update-restaurant.dto';
import { UpdateRestaurantStatusDto } from '../dto/update-restaurant-status.dto';
import { ListRestaurantsQueryDto } from '../dto/list-restaurants-query.dto';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly restaurants: RestaurantsRepository,
    private readonly cache: CacheService,
  ) {}

  create(ownerId: string, dto: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurants.create({ ownerId, ...dto });
  }

  async getById(id: string): Promise<Restaurant> {
    const key = `restaurant:${id}`;
    return this.cache.getOrSet(key, async () => {
      const restaurant = await this.restaurants.findById(id);
      if (!restaurant) {
        throw new NotFoundError(`Restaurant ${id} not found`);
      }
      return restaurant;
    }, 30);
  }

  async list(query: ListRestaurantsQueryDto): Promise<PaginatedResult<Restaurant>> {
    const [items, total] = await this.restaurants.list(query);
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async update(id: string, requesterId: string, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.assertOwnership(id, requesterId);
    void restaurant;
    const updated = await this.restaurants.update(id, dto);
    await this.cache.del(`restaurant:${id}`);
    return updated as Restaurant;
  }

  async updateStatus(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: UpdateRestaurantStatusDto,
  ): Promise<Restaurant> {
    // ADMIN can force any status transition (e.g. SUSPENDED); owners manage their own restaurant.
    if (requesterRole !== UserRole.ADMIN) {
      await this.assertOwnership(id, requesterId);
    } else {
      await this.getById(id);
    }
    const updated = await this.restaurants.update(id, { status: dto.status });
    await this.cache.del(`restaurant:${id}`);
    return updated as Restaurant;
  }

  /** Used by menu-service (via HTTP) to confirm the caller owns the restaurant. */
  async assertOwnership(id: string, requesterId: string): Promise<Restaurant> {
    const restaurant = await this.getById(id);
    if (restaurant.ownerId !== requesterId) {
      throw new ForbiddenError('You do not own this restaurant');
    }
    return restaurant;
  }
}
