'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computePIT, TaxRules } from '@/lib/tax-engine'
import taxRulesJson from '@/data/tax-rules.json'
import { Calculator, TrendingUp } from 'lucide-react'

export function TaxCalculator() {
  const { incomes, expenses } = useAppStore()
  const [formData, setFormData] = useState({
    annualIncome: '',
    deductibleExpenses: '',
    annualRent: '',
  })
  const [calculation, setCalculation] = useState<any>(null)

  const handleCalculate = () => {
    const annualIncome = parseFloat(formData.annualIncome) || 0
    const deductibleExpenses = parseFloat(formData.deductibleExpenses) || 0
    const annualRent = parseFloat(formData.annualRent) || 0

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
      deductibleExpenses,
      annualRent,
      taxRules
    )

    setCalculation(result)
  }

  // Calculate from actual data
  const currentYearIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const currentYearExpenses = expenses
    .filter(exp => exp.isDeductible)
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Quick Calculation from Data */}
      {incomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Based on Your Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Income:</span>
                <span className="font-medium">₦{currentYearIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deductible Expenses:</span>
                <span className="font-medium">₦{currentYearExpenses.toLocaleString()}</span>
              </div>
              <Button 
                onClick={() => {
                  setFormData({
                    annualIncome: currentYearIncome.toString(),
                    deductibleExpenses: currentYearExpenses.toString(),
                    annualRent: '',
                  })
                }}
                variant="outline"
                className="w-full"
              >
                Use This Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Manual Calculation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Annual Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Income (₦)
              </label>
              <input
                type="number"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Deductible Expenses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductible Expenses (₦)
              </label>
              <input
                type="number"
                value={formData.deductibleExpenses}
                onChange={(e) => setFormData({ ...formData, deductibleExpenses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Annual Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Rent (₦)
              </label>
              <input
                type="number"
                value={formData.annualRent}
                onChange={(e) => setFormData({ ...formData, annualRent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Calculate Tax
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Taxable Income:</span>
                  <span className="font-medium">₦{calculation.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Rent Relief:</span>
                  <span className="font-medium text-green-600">-₦{calculation.rentRelief.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Estimated Tax:</span>
                    <span className="font-bold text-lg text-primary">₦{calculation.taxDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                <p>Calculated using rule {calculation.ruleVersion}</p>
                <p className="mt-1">This is an estimate for educational purposes only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}