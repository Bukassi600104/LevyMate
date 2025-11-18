import { calculateTaxEstimate } from "../services/tax-engine";

describe("Tax Engine", () => {
  const taxRules2025 = {
    pit_bands: [
      { band_from: 0, band_to: 800000, rate: 0.0 },
      { band_from: 800001, band_to: 3000000, rate: 0.15 },
      { band_from: 3000001, band_to: 12000000, rate: 0.18 },
      { band_from: 12000001, band_to: 25000000, rate: 0.21 },
      { band_from: 25000001, band_to: 50000000, rate: 0.23 },
      { band_from: 50000001, band_to: null, rate: 0.25 },
    ],
    rent_relief: { percent: 0.2, cap: 500000 },
  };

  it("should calculate tax for income in first band (tax-free)", () => {
    const result = calculateTaxEstimate(
      500000, // income
      0, // expenses
      0, // rent
      taxRules2025
    );

    expect(result.taxable_income).toBe(500000);
    expect(result.tax_due).toBe(0);
  });

  it("should calculate tax for income in second band (15%)", () => {
    const result = calculateTaxEstimate(
      2000000, // income: 800k (0%) + 1.2m (15%)
      0,
      0,
      taxRules2025
    );

    expect(result.taxable_income).toBe(2000000);
    expect(result.tax_due).toBe(Math.round(1200000 * 0.15));
  });

  it("should apply rent deduction correctly", () => {
    const result = calculateTaxEstimate(
      2000000, // income
      0, // no expenses
      500000, // rent paid
      taxRules2025
    );

    // Rent relief: min(500k, 500k * 0.2) = 100k
    // Taxable: 2m - 100k = 1.9m
    // Tax: (800k * 0%) + (1.1m * 0.15) = 165k
    expect(result.rent_relief).toBe(100000);
    expect(result.taxable_income).toBe(1900000);
    expect(result.tax_due).toBeCloseTo(165000, -2);
  });

  it("should apply rent relief cap correctly", () => {
    const result = calculateTaxEstimate(
      5000000, // income
      0,
      3000000, // rent paid (exceeds cap)
      taxRules2025
    );

    // Rent relief capped at 500k
    expect(result.rent_relief).toBe(500000);
  });

  it("should deduct business expenses", () => {
    const result = calculateTaxEstimate(
      2000000, // income
      500000, // expenses
      0,
      taxRules2025
    );

    expect(result.taxable_income).toBe(1500000);
  });

  it("should handle multi-band income correctly", () => {
    const result = calculateTaxEstimate(
      30000000, // crosses multiple bands
      0,
      0,
      taxRules2025
    );

    // Band 1: 800k * 0% = 0
    // Band 2: 2.2m * 0.15 = 330k
    // Band 3: 9m * 0.18 = 1.62m
    // Band 4: 13m * 0.21 = 2.73m
    // Band 5: 3.8m * 0.23 = 874k
    // Total: ~5.554m
    expect(result.tax_due).toBeGreaterThan(5000000);
  });

  it("should return zero tax for negative taxable income", () => {
    const result = calculateTaxEstimate(
      1000000, // income
      2000000, // expenses exceed income
      0,
      taxRules2025
    );

    expect(result.taxable_income).toBe(0);
    expect(result.tax_due).toBe(0);
  });

  it("should include default rule version in output", () => {
    const result = calculateTaxEstimate(
      2000000,
      0,
      0,
      taxRules2025
    );

    expect(result.rule_version).toBe("2025-v1");
  });
});
