"use strict";
/**
 * Tax Engine Service
 * Stateless tax calculation service with support for PIT bands, deductions, and rent relief
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTaxEstimate = calculateTaxEstimate;
exports.getDefaultTaxRules = getDefaultTaxRules;
/**
 * Calculate tax based on income, deductions, and tax rules
 */
function calculateTaxEstimate(totalIncome, deductibleExpenses, annualRentPaid, rules, ruleVersion = "2025-v1") {
    // Calculate rent relief (20% of rent paid, capped at 500k)
    const rentRelief = Math.min(rules.rent_relief.cap, annualRentPaid * rules.rent_relief.percent);
    // Calculate taxable income
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses - rentRelief);
    // Calculate tax across bands
    let tax = 0;
    let remaining = taxableIncome;
    const breakdown = [];
    for (const band of rules.pit_bands) {
        if (remaining <= 0)
            break;
        const bandFrom = band.band_from;
        const bandTo = band.band_to === null ? Infinity : band.band_to;
        const bandWidth = bandTo - bandFrom;
        // Skip if income is below this band
        if (taxableIncome <= bandFrom)
            continue;
        // Calculate amount in this band
        const amountInBand = Math.min(remaining, bandWidth);
        const taxInBand = amountInBand * band.rate;
        tax += taxInBand;
        remaining -= amountInBand;
        breakdown.push({
            band,
            amount: amountInBand,
            tax: taxInBand,
        });
    }
    return {
        taxable_income: Math.round(taxableIncome),
        tax_due: Math.round(tax),
        rent_relief: Math.round(rentRelief),
        rule_version: ruleVersion,
        breakdown,
    };
}
/**
 * Get default Nigerian tax rules for a given year
 */
function getDefaultTaxRules(year = 2025) {
    return {
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
    };
}
//# sourceMappingURL=tax-engine.js.map