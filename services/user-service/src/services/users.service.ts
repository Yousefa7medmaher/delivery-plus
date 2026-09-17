import { Injectable } from '@nestjs/common';
import { ConflictError, NotFoundError } from '@food-delivery/shared';
import { ProfilesRepository } from '../repositories/profiles.repository';
import { OrderServiceClient } from '../common/order-service.client';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly profiles: ProfilesRepository,
    private readonly orderServiceClient: OrderServiceClient,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<UserProfile> {
    const existing = await this.profiles.findById(dto.userId);
    if (existing) {
      throw new ConflictError(`Profile for user ${dto.userId} already exists`);
    }

    return this.profiles.create({
      id: dto.userId,
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.profiles.findById(userId);
    if (!profile) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    await this.getProfile(userId); // ensures it exists (404 otherwise)
    const updated = await this.profiles.update(userId, dto);
    return updated as UserProfile;
  }

  // Order history: now that order-service exists (Phase 4), proxy to it
  // rather than duplicating order data here. Forwards the caller's own
  // token so order-service's own ownership checks apply unchanged.
  getOrderHistory(authHeader: string, page: number, limit: number): Promise<unknown> {
    return this.orderServiceClient.getOrderHistory(authHeader, page, limit);
  }
}
