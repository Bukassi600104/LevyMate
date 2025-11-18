/**
 * Tax Engine Service
 * Stateless tax calculation service with support for PIT bands, deductions, and rent relief
 */
export interface TaxBand {
    band_from: number;
    band_to: number | null;
    rate: number;
}
export interface TaxRules {
    pit_bands: TaxBand[];
    rent_relief: {
        percent: number;
        cap: number;
    };
}
export interface TaxEstimate {
    taxable_income: number;
    tax_due: number;
    rent_relief: number;
    rule_version: string;
    breakdown: {
        band: TaxBand;
        amount: number;
        tax: number;
    }[];
}
/**
 * Calculate tax based on income, deductions, and tax rules
 */
export declare function calculateTaxEstimate(totalIncome: number, deductibleExpenses: number, annualRentPaid: number, rules: TaxRules, ruleVersion?: string): TaxEstimate;
/**
 * Get default Nigerian tax rules for a given year
 */
export declare function getDefaultTaxRules(year?: number): TaxRules;
//# sourceMappingURL=tax-engine.d.ts.map