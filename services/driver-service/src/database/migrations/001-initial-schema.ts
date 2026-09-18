import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "driver_status" AS ENUM ('OFFLINE', 'AVAILABLE', 'BUSY', 'SUSPENDED');
    `);

    await queryRunner.query(`
      CREATE TABLE "drivers" (
        "id" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "vehicleType" character varying NOT NULL,
        "licensePlate" character varying NOT NULL,
        "status" "driver_status" NOT NULL DEFAULT 'OFFLINE',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_drivers" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_drivers_userId"
      ON "drivers" ("userId");
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "driver_status";`);
  }
}
