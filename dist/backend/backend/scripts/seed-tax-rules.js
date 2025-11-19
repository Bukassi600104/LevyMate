"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const TaxRule_1 = require("../entities/TaxRule");
async function seedTaxRules() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("✓ Database connected");
        const taxRuleRepository = data_source_1.AppDataSource.getRepository(TaxRule_1.TaxRule);
        const existingRule = await taxRuleRepository.findOne({
            where: { rule_version: "2025-07-01-v1" },
        });
        if (existingRule) {
            console.log("✓ Tax rules already seeded");
            process.exit(0);
        }
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
        const taxRule = taxRuleRepository.create({
            rule_version: taxRules.version,
            effective_date: taxRules.effectiveDate,
            rule_json: taxRules,
        });
        await taxRuleRepository.save(taxRule);
        console.log("✓ Tax rules seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("✗ Error seeding tax rules:", error);
        process.exit(1);
    }
}
seedTaxRules();
