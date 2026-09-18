import { DataSource } from 'typeorm';
import { Delivery } from '../entities/delivery.entity';
import { buildTypeOrmConfig } from './typeorm.config';

export default new DataSource(
  buildTypeOrmConfig(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/delivery_service',
    [Delivery],
  ),
);
