
1) Data model — tax_rules (JSON structure)
{
  "version": "2025-07-01-v1",
  "pit_bands": [
    {"band_from": 0, "band_to": 800000, "rate": 0},
    {"band_from": 800001, "band_to": 3000000, "rate": 0.15},     // Next 2,200,000 => 15%
    {"band_from": 3000001, "band_to": 12000000, "rate": 0.18},   // Next 9m =>18%
    {"band_from": 12000001, "band_to": 25000000, "rate": 0.21},  // Next 13m =>21%
    {"band_from": 25000001, "band_to": 50000000, "rate": 0.23},  // Next 25m =>23%
    {"band_from": 50000001, "band_to": null, "rate": 0.25}       // Above 50m =>25%
  ],
  "rent_relief": {"percent": 0.20, "cap": 500000}
}


(These bands come from the NTA 2025 summary — store as canonical and versioned). 
KPMG Assets

2) PIT calculation pseudocode
def compute_taxable_income(total_income, deductions):
    # deductions includes deductible_expenses + pension etc.
    return max(0, total_income - deductions)

def rent_deduction(annual_rent_paid, rules):
    # rules.rent_relief.percent, rules.rent_relief.cap
    return min(rules['rent_relief']['cap'], annual_rent_paid * rules['rent_relief']['percent'])

def compute_pit(total_income, deductible_expenses, annual_rent_paid, rules):
    rent_rel = rent_deduction(annual_rent_paid, rules)
    taxable_income = compute_taxable_income(total_income, deductible_expenses + rent_rel)
    remaining = taxable_income
    tax = 0.0
    for band in rules['pit_bands']:
        band_from = band['band_from']
        band_to = band['band_to'] or float('inf')
        band_width = band_to - band_from
        if taxable_income <= band_from:
            break
        amount_in_band = min(remaining, band_width if band_width>0 else 0)
        tax += amount_in_band * band['rate']
        remaining -= amount_in_band
        if remaining <= 0:
            break
    return {'taxable_income': taxable_income, 'tax_due': round(tax,0), 'rent_relief': rent_rel}


Notes: this approach expects pit_bands to be normalized from cumulative bands (first band to next). Ensure the bands’ band_from/band_to logic matches stored data. Use exact band boundaries from the official rule JSON.

3) Capital Gains (CGT) — pseudocode

Rule: CGT tax rate follows PIT band of the taxpayer (i.e., gains are added to tax base or taxed progressively using banded rates). Implementation choices:

Option A (recommended): Add net capital gains to other taxable income and recompute PIT (preferred for progressive result).

Option B: Use separate CGT calculation applying rates equal to PIT marginal — available as alternative.

Pseudocode (Option A):

def compute_tax_with_cgt(total_income, deductible_expenses, annual_rent, net_cg_gain, rules):
    total_income_including_gains = total_income + net_cg_gain
    return compute_pit(total_income_including_gains, deductible_expenses, annual_rent, rules)

4) Small Business estimator (turnover -> profit -> tax)

Input: monthly/annual turnover, COGS, deductible operating expenses

Output: estimated profit = turnover - COGS - deductible_operating_expenses

Tax: if profit <= threshold for small business exemptions (apply rules), otherwise apply PIT if owner taxed personally or corporate tax if registered company. For micro informal sellers we present presumptive tax scenarios (educational).

Pseudocode:

def estimate_business_tax(annual_turnover, cog, deductible_ops, owner_profile, rules):
    profit = annual_turnover - cog - deductible_ops
    if owner_profile == 'sole_proprietor':
        # treat as personal income
        return compute_pit(profit, 0, 0, rules)
    else:
        # show corporate suggestion (educational)
        corporate_rate = rules.get('corporate_tax_rate', 0.30) 
        return {'profit': profit, 'corporate_estimated_tax': profit * corporate_rate}

5) Mixed income

Sum salary + business profit + net capital gains → compute PIT with rent relief etc. Show breakdown of where tax comes from.

6) Versioning & audit

Rule: tax_rules table is authoritative; each computation must include rule_version returned so UI shows “Computed using rule v2025-07-01”. Keep rule history for reproducibility of exported PDFs.

7) Error handling & warnings

If user inputs suspiciously low expenses or no receipts, show “accuracy warning” and a short explanation. Never claim legal certainty.
