import { readFileSync } from "fs";
import { AppDataSource } from "../data-source";
import { TaxRule } from "../../entities";

export const seedTaxRules = async () => {
  const taxRuleRepository = AppDataSource.getRepository(TaxRule);

  // Check if rules already exist
  const existingRule = await taxRuleRepository.findOne({
    where: { rule_version: "2025-v1" },
  });

  if (existingRule) {
    console.log("Tax rules already seeded");
    return;
  }

  const rules = [
    {
      rule_version: "2025-v1",
      effective_date: "2025-07-01",
      rule_json: {
        pit_bands: [
          { band_from: 0, band_to: 800000, rate: 0.0 },
          { band_from: 800001, band_to: 3000000, rate: 0.15 },
          { band_from: 3000001, band_to: 12000000, rate: 0.18 },
          { band_from: 12000001, band_to: 25000000, rate: 0.21 },
          { band_from: 25000001, band_to: 50000000, rate: 0.23 },
          { band_from: 50000001, band_to: null, rate: 0.25 },
        ],
        rent_relief: {
          percent: 0.2,
          cap: 500000,
        },
      },
    },
  ];

  for (const ruleData of rules) {
    const rule = taxRuleRepository.create(ruleData);
    await taxRuleRepository.save(rule);
    console.log(`Seeded tax rule: ${ruleData.rule_version}`);
  }
};
