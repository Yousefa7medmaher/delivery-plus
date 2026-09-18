import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';

export function buildTypeOrmConfig(
  databaseUrl: string,
  entities: Array<Function | string>,
  options: Partial<DataSourceOptions> = {},
): TypeOrmModuleOptions & DataSourceOptions {
  return {
    type: 'postgres' as const,
    url: databaseUrl,
    entities,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    migrations: [
      join(__dirname, 'migrations', '*.ts'),
      join(__dirname, 'migrations', '*.js'),
    ],
    ...options,
  } as TypeOrmModuleOptions & DataSourceOptions;
}
