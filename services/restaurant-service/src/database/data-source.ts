import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { buildTypeOrmConfig } from './typeorm.config';

export const AppDataSource = new DataSource(
  buildTypeOrmConfig(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/restaurant_service',
    [Restaurant],
  ),
);

export default AppDataSource;
