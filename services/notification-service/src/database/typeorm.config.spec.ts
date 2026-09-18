import { buildTypeOrmConfig } from './typeorm.config';
import { Notification } from '../entities/notification.entity';

describe('buildTypeOrmConfig', () => {
  it('disables automatic schema synchronization for production-safe migrations', () => {
    const config = buildTypeOrmConfig('postgres://postgres:postgres@localhost:5432/notification_service', [Notification]);

    expect(config.type).toBe('postgres');
    expect(config.synchronize).toBe(false);
    expect(config.migrationsRun).toBe(false);
    expect(config.migrations).toEqual(
      expect.arrayContaining([expect.stringContaining('migrations')]),
    );
  });
});
