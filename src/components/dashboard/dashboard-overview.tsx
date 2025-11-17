'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Zap,
  CheckCircle2,
  Clock3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computePIT, TaxRules } from '@/lib/tax-engine'
import taxRulesJson from '@/data/tax-rules.json'
import { cn } from '@/lib/utils'

interface MonthlySeriesPoint {
  label: string
  income: number
  expense: number
}

export function DashboardOverview() {
  const router = useRouter()
  const { incomes, expenses, syncQueueLength, subscriptionTier } = useAppStore()

  const taxRules: TaxRules = useMemo(
    () => ({
      version: taxRulesJson.version,
      pitBands: taxRulesJson.pit_bands.map((band) => ({
        bandFrom: band.band_from,
        bandTo: band.band_to,
        rate: band.rate,
      })),
      rentRelief: taxRulesJson.rent_relief,
    }),
    []
  )

  const totals = useMemo(() => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const net = totalIncome - totalExpenses

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthlyIncome = incomes
      .filter((income) => {
        const date = new Date(income.timestamp)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, income) => sum + income.amount, 0)

    const monthlyExpenses = expenses
      .filter((expense) => {
        const date = new Date(expense.timestamp)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const prevMonthIncome = incomes
      .filter((income) => {
        const date = new Date(income.timestamp)
        return (
          date.getMonth() === prevMonthDate.getMonth() &&
          date.getFullYear() === prevMonthDate.getFullYear()
        )
      })
      .reduce((sum, income) => sum + income.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      net,
      monthlyIncome,
      monthlyExpenses,
      prevMonthIncome,
    }
  }, [incomes, expenses])

  const monthlySeries: MonthlySeriesPoint[] = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      const label = date.toLocaleString('default', { month: 'short' })
      const income = incomes
        .filter((income) => {
          const d = new Date(income.timestamp)
          return d.getMonth() === month && d.getFullYear() === year
        })
        .reduce((sum, income) => sum + income.amount, 0)
      const expense = expenses
        .filter((expense) => {
          const d = new Date(expense.timestamp)
          return d.getMonth() === month && d.getFullYear() === year
        })
        .reduce((sum, expense) => sum + expense.amount, 0)

      return { label, income, expense }
    })
  }, [incomes, expenses])

  const deductibleExpenses = useMemo(
    () => expenses.filter((expense) => expense.isDeductible).reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  )

  const estimatedTax = useMemo(() => {
    if (totals.monthlyIncome === 0) return null
    const annualIncome = totals.monthlyIncome * 12
    const deductible = deductibleExpenses * 12
    return computePIT(annualIncome, deductible, 0, taxRules)
  }, [totals.monthlyIncome, deductibleExpenses, taxRules])

  const topExpenseCategories = useMemo(() => {
    const categoryTotals = new Map<string, number>()
    expenses.forEach((expense) => {
      categoryTotals.set(
        expense.category,
        (categoryTotals.get(expense.category) || 0) + expense.amount
      )
    })
    return Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [expenses])

  const incomeGrowth = totals.prevMonthIncome === 0
    ? null
    : ((totals.monthlyIncome - totals.prevMonthIncome) / totals.prevMonthIncome) * 100

  const stats = [
    {
      title: 'Monthly income',
      value: totals.monthlyIncome,
      icon: TrendingUp,
      trend: incomeGrowth,
      accent: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Monthly expenses',
      value: totals.monthlyExpenses,
      icon: TrendingDown,
      trend: null,
      accent: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Net position',
      value: totals.net,
      icon: BarChart3,
      trend: null,
      accent: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Tax estimate',
      value: estimatedTax?.monthlyTax ? estimatedTax.monthlyTax : 0,
      icon: Target,
      trend: null,
      accent: 'text-purple-600',
      bg: 'bg-purple-50',
      description: estimatedTax ? 'Monthly to set aside' : 'Add income to see estimates',
    },
  ]

  const recentActivity = useMemo(() => {
    return [...incomes, ...expenses]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [incomes, expenses])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          const displayValue = `₦${item.value.toLocaleString()}`
          const trendText =
            item.trend !== null
              ? `${item.trend > 0 ? '+' : ''}${item.trend.toFixed(1)}% vs last month`
              : item.description
          const trendColor = item.trend && item.trend !== 0 ? (item.trend > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'

          return (
            <Card key={item.title} className="border-gray-200">
              <CardContent className="space-y-2 p-4">
                <div className={`inline-flex rounded-lg ${item.bg} p-2`}>
                  <Icon className={`h-4 w-4 ${item.accent}`} />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{item.title}</p>
                <p className="text-lg font-semibold text-gray-900">{displayValue}</p>
                {trendText && <p className={cn('text-xs', trendColor)}>{trendText}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Cashflow (last 6 months)</CardTitle>
            <span className="text-xs text-gray-500">Income vs expenses</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-6 items-end gap-3">
              {monthlySeries.map((point) => {
                const incomeHeight = Math.min(100, point.income / 1000)
                const expenseHeight = Math.min(100, point.expense / 1000)
                return (
                  <div key={point.label} className="flex flex-col items-center space-y-1">
                    <div className="flex w-full items-end space-x-1">
                      <div
                        className="w-1/2 rounded-t-md bg-green-500/80"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income ₦${point.income.toLocaleString()}`}
                      />
                      <div
                        className="w-1/2 rounded-t-md bg-red-400/80"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expense ₦${point.expense.toLocaleString()}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{point.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                <span>Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>Top categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topExpenseCategories.length === 0 && (
              <p className="text-sm text-gray-500">Log some expenses to unlock category insights.</p>
            )}
            {topExpenseCategories.map(([category, total]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <span className="text-sm text-gray-500">₦{total.toLocaleString()}</span>
              </div>
            ))}
            <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary">
              Premium tip: upgrade to Pro to export category breakdowns as CSV.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Button className="w-full" onClick={() => router.push('/add?type=income')}>
              <TrendingUp className="mr-2 h-4 w-4" /> Add income
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push('/add?type=expense')}>
              <TrendingDown className="mr-2 h-4 w-4" /> Add expense
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/tax')}>
              <Target className="mr-2 h-4 w-4" /> Calculate tax
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/receipts/upload')}>
              <Zap className="mr-2 h-4 w-4" /> Receipt OCR workspace
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/import/whatsapp')}>
              <BarChart3 className="mr-2 h-4 w-4" /> WhatsApp import
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/analytics')}>
              <PieChart className="mr-2 h-4 w-4" /> Analytics & reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              {syncQueueLength > 0 ? (
                <Clock3 className="mt-1 h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="mt-1 h-4 w-4 text-green-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {syncQueueLength > 0
                    ? `${syncQueueLength} item${syncQueueLength > 1 ? 's' : ''} pending sync`
                    : 'All caught up'}
                </p>
                <p className="text-xs text-gray-500">
                  We automatically sync when you’re back online.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Current plan</p>
              <p className="text-sm font-semibold text-gray-800">{subscriptionTier.toUpperCase()}</p>
              <Button variant="ghost" size="sm" className="mt-2 px-2" onClick={() => router.push('/subscription')}>
                View plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No transactions yet. Start by adding your first income or expense.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((transaction) => {
                const isIncome = 'paymentMethod' in transaction
                const Icon = isIncome ? TrendingUp : TrendingDown
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn('rounded-lg p-2', isIncome ? 'bg-green-50' : 'bg-red-50')}>
                        <Icon className={cn('h-4 w-4', isIncome ? 'text-green-600' : 'text-red-500')} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isIncome ? transaction.source : transaction.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.timestamp).toLocaleDateString()} ·{' '}
                          {new Date(transaction.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={cn('text-sm font-semibold', isIncome ? 'text-green-600' : 'text-red-500')}>
                      {isIncome ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </p>
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
