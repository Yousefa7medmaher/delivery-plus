import { DataSource } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { buildTypeOrmConfig } from './typeorm.config';

export const AppDataSource = new DataSource(
  buildTypeOrmConfig(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/driver_service',
    [Driver],
  ),
);

export default AppDataSource;
