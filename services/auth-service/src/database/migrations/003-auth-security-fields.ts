import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthSecurityFields1700000000002 implements MigrationInterface {
  name = 'AuthSecurityFields1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "credentials"
      ADD COLUMN "emailVerified" boolean NOT NULL DEFAULT false,
      ADD COLUMN "lockedUntil" TIMESTAMPTZ NULL,
      ADD COLUMN "failedLoginCount" integer NOT NULL DEFAULT 0,
      ADD COLUMN "lastFailedLoginAt" TIMESTAMPTZ NULL,
      ADD COLUMN "verificationTokenHash" character varying NULL,
      ADD COLUMN "verificationTokenExpiresAt" TIMESTAMPTZ NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_credentials_locked_until"
      ON "credentials" ("lockedUntil");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_credentials_locked_until";
    `);

    await queryRunner.query(`
      ALTER TABLE "credentials"
      DROP COLUMN IF EXISTS "emailVerified",
      DROP COLUMN IF EXISTS "lockedUntil",
      DROP COLUMN IF EXISTS "failedLoginCount",
      DROP COLUMN IF EXISTS "lastFailedLoginAt",
      DROP COLUMN IF EXISTS "verificationTokenHash",
      DROP COLUMN IF EXISTS "verificationTokenExpiresAt";
    `);
  }
}
