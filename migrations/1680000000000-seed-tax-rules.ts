import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedTaxRules1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tax_rules (
        id SERIAL PRIMARY KEY,
        rule_version VARCHAR(80) NOT NULL,
        effective_date DATE NOT NULL,
        rule_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `)

    const ruleJson = {
      rule_version: '2025-v1',
      effective_date: '2025-07-01',
      pit_bands: [
        { band_from: 0, band_to: 800000, rate: 0.0 },
        { band_from: 800001, band_to: 3000000, rate: 0.15 },
        { band_from: 3000001, band_to: 12000000, rate: 0.18 },
        { band_from: 12000001, band_to: 25000000, rate: 0.21 },
        { band_from: 25000001, band_to: 50000000, rate: 0.23 },
        { band_from: 50000001, band_to: null, rate: 0.25 }
      ],
      rent_relief: { percent: 0.2, cap: 500000 },
      cgt_rules: { use_pit_rates: true, exemption: 0 }
    }

    await queryRunner.query(
      `INSERT INTO tax_rules (rule_version, effective_date, rule_json) VALUES ($1, $2, $3)`,
      [ruleJson.rule_version, ruleJson.effective_date, JSON.stringify(ruleJson)]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM tax_rules WHERE rule_version = '2025-v1'`)
  }
}
