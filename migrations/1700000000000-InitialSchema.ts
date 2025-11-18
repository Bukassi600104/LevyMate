import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR NOT NULL UNIQUE,
        "password_hash" VARCHAR NOT NULL,
        "full_name" VARCHAR,
        "business_name" VARCHAR,
        "business_type" VARCHAR,
        "subscription_plan" VARCHAR NOT NULL DEFAULT 'free',
        "subscription_expires_at" TIMESTAMP WITH TIME ZONE,
        "onboarded" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "income" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" NUMERIC NOT NULL,
        "category" VARCHAR NOT NULL,
        "description" VARCHAR,
        "date" DATE NOT NULL,
        "tags" JSONB,
        "ocr_meta" JSONB,
        "source" VARCHAR NOT NULL DEFAULT 'manual',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" NUMERIC NOT NULL,
        "category" VARCHAR NOT NULL,
        "description" VARCHAR,
        "date" DATE NOT NULL,
        "tags" JSONB,
        "ocr_meta" JSONB,
        "source" VARCHAR NOT NULL DEFAULT 'manual',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tax_rules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "rule_version" VARCHAR NOT NULL UNIQUE,
        "effective_date" DATE NOT NULL,
        "rule_json" JSONB NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_income_user" ON "income"("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_income_date" ON "income"("date");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_expenses_user" ON "expenses"("userId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_expenses_date" ON "expenses"("date");`);

    const taxRules = {
      version: "2025-07-01-v1",
      effectiveDate: "2025-07-01",
      pitBands: [
        { bandFrom: 0, bandTo: 800000, rate: 0 },
        { bandFrom: 800000, bandTo: 3000000, rate: 0.15 },
        { bandFrom: 3000000, bandTo: 12000000, rate: 0.18 },
        { bandFrom: 12000000, bandTo: 25000000, rate: 0.21 },
        { bandFrom: 25000000, bandTo: 50000000, rate: 0.23 },
        { bandFrom: 50000000, bandTo: null, rate: 0.25 }
      ],
      rentRelief: { percent: 0.20, cap: 500000 },
      cgt: 0.1
    };

    await queryRunner.query(
      `INSERT INTO "tax_rules" ("rule_version", "effective_date", "rule_json") VALUES ($1, $2, $3)`,
      [taxRules.version, taxRules.effectiveDate, JSON.stringify(taxRules)]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tax_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "income"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
