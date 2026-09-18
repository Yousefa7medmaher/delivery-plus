import { DataSource } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { buildTypeOrmConfig } from './typeorm.config';

export const AppDataSource = new DataSource(
  buildTypeOrmConfig(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/notification_service',
    [Notification],
  ),
);

export default AppDataSource;
