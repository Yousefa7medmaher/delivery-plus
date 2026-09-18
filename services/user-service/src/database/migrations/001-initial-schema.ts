import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "phone" character varying,
        "address" character varying,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_profiles" PRIMARY KEY ("id")
      );
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles";`);
  }
}
