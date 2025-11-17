'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computePIT, TaxRules } from '@/lib/tax-engine'
import taxRulesJson from '@/data/tax-rules.json'

export function DashboardOverview() {
  const router = useRouter()
  const { incomes, expenses } = useAppStore()
  
  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netIncome = totalIncome - totalExpenses
  
  // Get current month data
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyIncome = incomes
    .filter(income => {
      const date = new Date(income.timestamp)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, income) => sum + income.amount, 0)
    
  const monthlyExpenses = expenses
    .filter(expense => {
      const date = new Date(expense.timestamp)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate estimated annual tax
  const estimatedTax = useMemo(() => {
    if (totalIncome === 0) return 0
    
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

    // Estimate annual income by projecting monthly income
    const estimatedAnnualIncome = monthlyIncome * 12
    const deductibleExpenses = expenses
      .filter(exp => exp.isDeductible)
      .reduce((sum, expense) => sum + expense.amount, 0) * 12

    const result = computePIT(
      estimatedAnnualIncome,
      deductibleExpenses,
      0, // No rent data available in dashboard
      taxRules
    )
    
    return result.taxDue
  }, [totalIncome, monthlyIncome, expenses])

  const stats = [
    {
      title: 'Monthly Income',
      value: `₦${monthlyIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Expenses',
      value: `₦${monthlyExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Net Income',
      value: `₦${(monthlyIncome - monthlyExpenses).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Tax Est.',
      value: `₦${estimatedTax.toLocaleString()}`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{stat.title}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => router.push('/add?type=income')}
          >
            Add Income
          </Button>
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={() => router.push('/add?type=expense')}
          >
            Add Expense
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => router.push('/tax')}
          >
            Calculate Tax
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 && expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet</p>
              <p className="text-sm mt-2">Start adding your income and expenses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Combine and sort transactions by date */}
              {[...incomes, ...expenses]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5)
                .map((transaction) => {
                  const isIncomes = 'paymentMethod' in transaction
                  const Icon = isIncomes ? TrendingUp : TrendingDown
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isIncomes ? 'bg-green-50' : 'bg-red-50'}`}>
                          <Icon className={`w-4 h-4 ${isIncomes ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {isIncomes ? transaction.source : transaction.category}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${isIncomes ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncomes ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}