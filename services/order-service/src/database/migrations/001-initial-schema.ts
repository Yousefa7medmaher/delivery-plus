import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  /** Executes the forward migration as a no-op query, leaving the database schema unchanged. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    await queryRunner.query(`
      CREATE TYPE "order_status" AS ENUM (
        'CREATED',
        'PAYMENT_PENDING',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'DRIVER_ASSIGNED',
        'PICKED_UP',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "customerId" uuid NOT NULL,
        "restaurantId" uuid NOT NULL,
        "status" "order_status" NOT NULL DEFAULT 'CREATED',
        "totalAmount" numeric(10,2) NOT NULL,
        "idempotencyKey" character varying(255),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_customerId"
      ON "orders" ("customerId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_restaurantId"
      ON "orders" ("restaurantId");
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_orders_customer_idempotency_key"
      ON "orders" ("customerId", "idempotencyKey")
      WHERE "idempotencyKey" IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "orderId" uuid NOT NULL,
        "menuItemId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "quantity" integer NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_orderId"
      ON "order_items" ("orderId");
    `);
  }

  /** Executes the reverse migration as a no-op query, leaving the database schema unchanged. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status";`);
  }
}
