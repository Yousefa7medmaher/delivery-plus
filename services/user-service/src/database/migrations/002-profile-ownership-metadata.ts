import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfileOwnershipMetadata1700000000001 implements MigrationInterface {
  name = 'ProfileOwnershipMetadata1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        ADD COLUMN "authCredentialId" uuid,
        ADD COLUMN "createdByService" character varying NOT NULL DEFAULT 'auth-service'
    `);
    await queryRunner.query(`
      UPDATE "user_profiles"
      SET "authCredentialId" = "id"
      WHERE "authCredentialId" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        ALTER COLUMN "authCredentialId" SET NOT NULL,
        ALTER COLUMN "createdByService" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        ADD CONSTRAINT "UQ_user_profiles_authCredentialId" UNIQUE ("authCredentialId"),
        ADD CONSTRAINT "CHK_user_profiles_auth_credential_id" CHECK ("authCredentialId" = "id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        DROP CONSTRAINT IF EXISTS "CHK_user_profiles_auth_credential_id",
        DROP CONSTRAINT IF EXISTS "UQ_user_profiles_authCredentialId"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_profiles"
        DROP COLUMN IF EXISTS "createdByService",
        DROP COLUMN IF EXISTS "authCredentialId"
    `);
  }
}
