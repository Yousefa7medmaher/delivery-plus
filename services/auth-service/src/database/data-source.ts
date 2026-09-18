import { DataSource } from 'typeorm';
import { Credential } from '../entities/credential.entity';
import { buildTypeOrmConfig } from './typeorm.config';

export default new DataSource(
  buildTypeOrmConfig(
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/auth_service',
    [Credential],
  ),
);
