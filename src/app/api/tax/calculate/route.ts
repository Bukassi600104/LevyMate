import { NextRequest, NextResponse } from 'next/server'
import { computePIT, TaxRules } from '@/lib/tax-engine'
import taxRulesJson from '@/data/tax-rules.json'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { annualIncome, deductibleExpenses, annualRent } = body

    // Validate input
    if (!annualIncome || annualIncome < 0) {
      return NextResponse.json(
        { error: 'Invalid annual income' },
        { status: 400 }
      )
    }

    // Transform JSON data to match TaxRules interface
    const taxRules: TaxRules = {
      version: taxRulesJson.version,
      pitBands: taxRulesJson.pit_bands.map(band => ({
        bandFrom: band.band_from,
        bandTo: band.band_to,
        rate: band.rate
      })),
      rentRelief: taxRulesJson.rent_relief
    }

    const result = computePIT(
      annualIncome,
      deductibleExpenses || 0,
      annualRent || 0,
      taxRules
    )

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Tax calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}