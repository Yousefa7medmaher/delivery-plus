import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(userId: string, type: NotificationType, title: string, message: string): Promise<Notification> {
    const notification = this.repo.create({ userId, type, title, message });
    return this.repo.save(notification);
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<[Notification[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
