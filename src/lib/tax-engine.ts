import { TaxRules, PitBand, TaxCalculation } from '@/types'

export type { TaxRules, PitBand, TaxCalculation }

export function computeTaxableIncome(totalIncome: number, deductions: number): number {
  return Math.max(0, totalIncome - deductions)
}

export function rentDeduction(annualRentPaid: number, rules: TaxRules): number {
  const reliefPercent = rules.rentRelief.percent
  const reliefCap = rules.rentRelief.cap
  return Math.min(reliefCap, annualRentPaid * reliefPercent)
}

export function computePIT(
  totalIncome: number,
  deductibleExpenses: number,
  annualRentPaid: number,
  rules: TaxRules
): TaxCalculation {
  const rentRel = rentDeduction(annualRentPaid, rules)
  const taxableIncome = computeTaxableIncome(totalIncome, deductibleExpenses + rentRel)
  
  let remaining = taxableIncome
  let tax = 0.0
  
  for (const band of rules.pitBands) {
    const bandFrom = band.bandFrom
    const bandTo = band.bandTo || Infinity
    const bandWidth = bandTo - bandFrom
    
    if (taxableIncome <= bandFrom) {
      break
    }
    
    const amountInBand = Math.min(remaining, bandWidth > 0 ? bandWidth : 0)
    tax += amountInBand * band.rate
    remaining -= amountInBand
    
    if (remaining <= 0) {
      break
    }
  }
  
  return {
    taxableIncome,
    taxDue: Math.round(tax),
    rentRelief: rentRel,
    ruleVersion: rules.version
  }
}

export function computeTaxWithCGT(
  totalIncome: number,
  deductibleExpenses: number,
  annualRent: number,
  netCapitalGains: number,
  rules: TaxRules
): TaxCalculation {
  const totalIncomeIncludingGains = totalIncome + netCapitalGains
  return computePIT(totalIncomeIncludingGains, deductibleExpenses, annualRent, rules)
}

export function estimateBusinessTax(
  annualTurnover: number,
  cogs: number,
  deductibleOps: number,
  ownerProfile: string,
  rules: TaxRules
) {
  const profit = annualTurnover - cogs - deductibleOps
  
  if (ownerProfile === 'sole_proprietor') {
    return {
      profit,
      personalTax: computePIT(profit, 0, 0, rules)
    }
  } else {
    const corporateRate = 0.30
    return {
      profit,
      corporateEstimatedTax: profit * corporateRate
    }
  }
}