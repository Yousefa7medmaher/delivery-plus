import { join } from 'node:path';
import { QueryRunner } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';
import { AppDataSource, default as defaultDataSource } from './data-source';
import { InitialSchema1700000000000 } from './migrations/001-initial-schema';
import { buildTypeOrmConfig } from './typeorm.config';

const databaseUrl = 'postgres://db.example.test:5432/order';

describe('buildTypeOrmConfig', () => {
  it('builds a production-safe PostgreSQL configuration for every order entity', () => {
    const config = buildTypeOrmConfig(databaseUrl, [Order, OrderItem]);
    expect(config).toMatchObject({
      type: 'postgres',
      url: databaseUrl,
      entities: [Order, OrderItem],
      synchronize: false,
      migrationsRun: false,
      logging: false,
    });
    expect(config.migrations).toEqual([
      join(__dirname, 'migrations', '*.ts'),
      join(__dirname, 'migrations', '*.js'),
    ]);
  });

  it('preserves entity globs and merges optional data-source settings', () => {
    const entities = ['dist/entities/*.js'];
    const config = buildTypeOrmConfig(databaseUrl, entities, {
      migrationsTableName: 'service_migrations',
      ssl: true,
    });
    expect(config.entities).toBe(entities);
    expect(config).toMatchObject({
      migrationsTableName: 'service_migrations',
      ssl: true,
      synchronize: false,
      migrationsRun: false,
    });
  });
});

describe('AppDataSource', () => {
  it('wires all order entities without connecting or enabling implicit schema changes', () => {
    const entities = AppDataSource.options.entities as Array<{ name?: string }>;
    expect(defaultDataSource).toBe(AppDataSource);
    expect(entities.map((entity) => entity.name)).toEqual(['Order', 'OrderItem']);
    expect(AppDataSource.options.synchronize).toBe(false);
    expect(AppDataSource.options.migrationsRun).toBe(false);
    expect(AppDataSource.isInitialized).toBe(false);
  });
});

describe('InitialSchema1700000000000', () => {
  it('executes reversible migration probes through the supplied query runner', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;
    const migration = new InitialSchema1700000000000();
    await migration.up(queryRunner);
    await migration.down(queryRunner);
    expect(migration.name).toBe('InitialSchema1700000000000');
    expect(query).toHaveBeenNthCalledWith(1, 'SELECT 1;');
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1;');
  });
});
