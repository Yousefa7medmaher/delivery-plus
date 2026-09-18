import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "delivery_status" AS ENUM ('CREATED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
    `);

    await queryRunner.query(`
      CREATE TABLE "deliveries" (
        "id" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "driverId" uuid,
        "status" "delivery_status" NOT NULL DEFAULT 'CREATED',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deliveries" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_deliveries_orderId"
      ON "deliveries" ("orderId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_deliveries_driverId"
      ON "deliveries" ("driverId");
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "deliveries";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "delivery_status";`);
  }
}
