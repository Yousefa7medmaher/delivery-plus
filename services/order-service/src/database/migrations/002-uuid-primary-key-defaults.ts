import { MigrationInterface, QueryRunner } from 'typeorm';

export class UuidPrimaryKeyDefaults1700000000001 implements MigrationInterface {
  name = 'UuidPrimaryKeyDefaults1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
    await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "id" DROP DEFAULT`);
  }
}
