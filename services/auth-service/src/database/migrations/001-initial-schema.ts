import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role" AS ENUM ('CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN');
    `);

    await queryRunner.query(`
      CREATE TABLE "credentials" (
        "id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'CUSTOMER',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_credentials" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_credentials_email"
      ON "credentials" ("email");
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "credentials";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role";`);
  }
}
