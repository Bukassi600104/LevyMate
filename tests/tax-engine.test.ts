import { computePIT, computeTaxableIncome, rentDeduction } from '../src/lib/tax-engine';
import { TaxRules } from '../src/types';

const mockTaxRules: TaxRules = {
  version: '2025',
  effectiveDate: '2025-01-01',
  pitBands: [
    { bandFrom: 0, bandTo: 300000, rate: 0.07 },
    { bandFrom: 300000, bandTo: 600000, rate: 0.11 },
    { bandFrom: 600000, bandTo: 1100000, rate: 0.15 },
    { bandFrom: 1100000, bandTo: 1600000, rate: 0.19 },
    { bandFrom: 1600000, bandTo: 3200000, rate: 0.21 },
    { bandFrom: 3200000, bandTo: null, rate: 0.24 },
  ],
  rentRelief: {
    percent: 0.2,
    cap: 500000,
  },
  cgt: 0.1,
};

describe('Tax Engine', () => {
  describe('computeTaxableIncome', () => {
    it('should calculate taxable income correctly', () => {
      const result = computeTaxableIncome(1000000, 200000);
      expect(result).toBe(800000);
    });

    it('should not return negative taxable income', () => {
      const result = computeTaxableIncome(100000, 200000);
      expect(result).toBe(0);
    });
  });

  describe('rentDeduction', () => {
    it('should calculate rent relief correctly', () => {
      const result = rentDeduction(1000000, mockTaxRules);
      expect(result).toBe(200000);
    });

    it('should cap rent relief at maximum', () => {
      const result = rentDeduction(5000000, mockTaxRules);
      expect(result).toBe(500000);
    });

    it('should handle zero rent', () => {
      const result = rentDeduction(0, mockTaxRules);
      expect(result).toBe(0);
    });
  });

  describe('computePIT', () => {
    it('should calculate tax for income in first band', () => {
      const result = computePIT(200000, 0, 0, mockTaxRules);
      
      expect(result.taxableIncome).toBe(200000);
      expect(result.taxDue).toBe(14000); // 200,000 * 0.07
      expect(result.effectiveTaxRate).toBeCloseTo(0.07, 2);
    });

    it('should calculate tax across multiple bands', () => {
      const result = computePIT(1000000, 0, 0, mockTaxRules);
      
      expect(result.taxableIncome).toBe(1000000);
      expect(result.taxDue).toBeGreaterThan(0);
      expect(result.bandBreakdown.length).toBeGreaterThan(1);
    });

    it('should apply rent relief', () => {
      const withoutRent = computePIT(1000000, 0, 0, mockTaxRules);
      const withRent = computePIT(1000000, 0, 500000, mockTaxRules);
      
      expect(withRent.rentRelief).toBeGreaterThan(0);
      expect(withRent.taxDue).toBeLessThan(withoutRent.taxDue);
    });

    it('should apply deductions', () => {
      const withoutDeductions = computePIT(1000000, 0, 0, mockTaxRules);
      const withDeductions = computePIT(1000000, 200000, 0, mockTaxRules);
      
      expect(withDeductions.taxableIncome).toBe(800000);
      expect(withDeductions.taxDue).toBeLessThan(withoutDeductions.taxDue);
    });

    it('should calculate monthly and quarterly tax', () => {
      const result = computePIT(1200000, 0, 0, mockTaxRules);
      
      expect(result.monthlyTax).toBe(Math.round(result.taxDue / 12));
      expect(result.quarterlyTax).toBe(Math.round(result.taxDue / 4));
    });

    it('should handle zero income', () => {
      const result = computePIT(0, 0, 0, mockTaxRules);
      
      expect(result.taxableIncome).toBe(0);
      expect(result.taxDue).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
    });

    it('should calculate effective tax rate', () => {
      const result = computePIT(1000000, 0, 0, mockTaxRules);
      
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeLessThan(0.24);
    });

    it('should provide band breakdown', () => {
      const result = computePIT(1000000, 0, 0, mockTaxRules);
      
      expect(result.bandBreakdown).toBeDefined();
      expect(result.bandBreakdown.length).toBeGreaterThan(0);
      
      result.bandBreakdown.forEach(band => {
        expect(band.taxableAmount).toBeGreaterThanOrEqual(0);
        expect(band.taxForBand).toBeGreaterThanOrEqual(0);
        expect(band.rate).toBeGreaterThan(0);
      });
    });

    it('should handle high income in top band', () => {
      const result = computePIT(10000000, 0, 0, mockTaxRules);
      
      expect(result.taxableIncome).toBe(10000000);
      expect(result.taxDue).toBeGreaterThan(0);
      
      const topBand = result.bandBreakdown[result.bandBreakdown.length - 1];
      expect(topBand.rate).toBe(0.24);
    });
  });
});
