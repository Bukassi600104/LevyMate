'use client'

import React, { useMemo, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computePIT, TaxRules, TaxCalculation } from '@/lib/tax-engine'
import taxRulesJson from '@/data/tax-rules.json'
import { Calculator, TrendingUp } from 'lucide-react'

export function TaxCalculator() {
  const { incomes, expenses } = useAppStore()
  const [formData, setFormData] = useState({
    annualIncome: '',
    deductibleExpenses: '',
    annualRent: '',
  })
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null)

  const taxRules = useMemo<TaxRules>(() => ({
    version: taxRulesJson.version,
    pitBands: taxRulesJson.pit_bands.map((band) => ({
      bandFrom: band.band_from,
      bandTo: band.band_to,
      rate: band.rate,
    })),
    rentRelief: taxRulesJson.rent_relief,
  }), [])

  const handleCalculate = () => {
    const annualIncome = parseFloat(formData.annualIncome) || 0
    const deductibleExpenses = parseFloat(formData.deductibleExpenses) || 0
    const annualRent = parseFloat(formData.annualRent) || 0

    const result = computePIT(annualIncome, deductibleExpenses, annualRent, taxRules)
    setCalculation(result)
  }

  const currentYearIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const currentYearDeductible = expenses
    .filter((expense) => expense.isDeductible)
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {incomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Based on your tracked data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Year-to-date income</span>
              <span className="font-semibold">₦{currentYearIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tax-deductible expenses</span>
              <span className="font-semibold">₦{currentYearDeductible.toLocaleString()}</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setFormData({
                  annualIncome: currentYearIncome.toString(),
                  deductibleExpenses: currentYearDeductible.toString(),
                  annualRent: '',
                })
              }
            >
              Use this data
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Personal Income Tax calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Annual income (₦)</label>
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(event) => setFormData((prev) => ({ ...prev, annualIncome: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Deductible expenses (₦)</label>
              <input
                type="number"
                value={formData.deductibleExpenses}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, deductibleExpenses: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Annual rent (₦)</label>
              <input
                type="number"
                value={formData.annualRent}
                onChange={(event) => setFormData((prev) => ({ ...prev, annualRent: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>
          <Button className="w-full" onClick={handleCalculate}>
            Calculate tax
          </Button>
        </CardContent>
      </Card>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Tax estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-primary/10 p-4">
                <p className="text-xs uppercase tracking-wide text-primary">Annual</p>
                <p className="mt-1 text-2xl font-semibold text-primary">
                  ₦{calculation.taxDue.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-primary/80">Rule {calculation.ruleVersion}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Monthly set-aside</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ₦{(calculation.monthlyTax ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Effective tax rate: {((calculation.effectiveTaxRate ?? 0) * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Quarterly</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ₦{(calculation.quarterlyTax ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Rent relief: ₦{calculation.rentRelief.toLocaleString()}</p>
              </div>
            </div>

            {calculation.bandBreakdown && calculation.bandBreakdown.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Band-by-band breakdown</h3>
                <div className="mt-3 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                  {calculation.bandBreakdown.map((band, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          ₦{band.bandFrom.toLocaleString()} -{' '}
                          {band.bandTo ? `₦${band.bandTo.toLocaleString()}` : 'above'}
                        </p>
                        <p className="text-xs text-gray-500">Rate {(band.rate * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-gray-900">
                          Tax: ₦{band.taxForBand.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Taxable: ₦{band.taxableAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-gray-500">
              LevyMate uses Nigeria’s 2025 PIT bands for educational estimates. Consult a tax professional for official filings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
