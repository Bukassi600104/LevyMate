import { TaxRules, PitBand, TaxCalculation, TaxCalculationBandBreakdown } from '@/types'

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
  const breakdown: TaxCalculationBandBreakdown[] = []

  for (const band of rules.pitBands) {
    if (remaining <= 0) {
      break
    }

    const bandFrom = band.bandFrom
    const bandTo = band.bandTo ?? Infinity

    if (taxableIncome <= bandFrom) {
      continue
    }

    const availableInBand = bandTo - bandFrom
    const taxablePortion = band.bandTo === null ? remaining : Math.min(remaining, Math.max(availableInBand, 0))
    if (taxablePortion <= 0) {
      continue
    }

    const taxForBand = taxablePortion * band.rate
    tax += taxForBand
    remaining -= taxablePortion

    breakdown.push({
      bandFrom,
      bandTo: band.bandTo,
      rate: band.rate,
      taxableAmount: Math.round(taxablePortion),
      taxForBand: Math.round(taxForBand),
    })
  }

  const roundedTax = Math.max(0, Math.round(tax))
  const monthlyTax = roundedTax / 12
  const quarterlyTax = roundedTax / 4
  const effectiveRate = totalIncome > 0 ? roundedTax / totalIncome : 0

  return {
    taxableIncome,
    taxDue: roundedTax,
    rentRelief: rentRel,
    ruleVersion: rules.version,
    bandBreakdown: breakdown,
    monthlyTax: Math.round(monthlyTax),
    quarterlyTax: Math.round(quarterlyTax),
    effectiveTaxRate: Math.round(effectiveRate * 1000) / 1000,
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
      personalTax: computePIT(profit, 0, 0, rules),
    }
  } else {
    const corporateRate = 0.3
    return {
      profit,
      corporateEstimatedTax: profit * corporateRate,
    }
  }
}
