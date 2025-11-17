'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ArrowUpRight } from 'lucide-react'

export function AnalyticsDashboard() {
  const { incomes, expenses } = useAppStore()

  const monthlyBreakdown = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    incomes.forEach((income) => {
      const key = new Date(income.timestamp).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      })
      const record = map.get(key) || { income: 0, expense: 0 }
      record.income += income.amount
      map.set(key, record)
    })
    expenses.forEach((expense) => {
      const key = new Date(expense.timestamp).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      })
      const record = map.get(key) || { income: 0, expense: 0 }
      record.expense += expense.amount
      map.set(key, record)
    })

    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-6)
  }, [incomes, expenses])

  const categorySpread = useMemo(() => {
    const cat = new Map<string, number>()
    expenses.forEach((expense) => {
      cat.set(expense.category, (cat.get(expense.category) || 0) + expense.amount)
    })
    return Array.from(cat.entries()).sort((a, b) => b[1] - a[1])
  }, [expenses])

  const rollingNet = useMemo(() => {
    return monthlyBreakdown.map(([label, value]) => ({
      label,
      net: value.income - value.expense,
    }))
  }, [monthlyBreakdown])

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics & reports</h1>
          <p className="text-sm text-gray-600">
            Visualise your cashflow, understand spending habits, and export your records.
          </p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {monthlyBreakdown.length === 0 ? (
            <p className="text-sm text-gray-500">Start logging transactions to activate analytics.</p>
          ) : (
            monthlyBreakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">
                    Income ₦{value.income.toLocaleString()} · Expense ₦{value.expense.toLocaleString()}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${value.income - value.expense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ₦{(value.income - value.expense).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySpread.length === 0 ? (
              <p className="text-sm text-gray-500">Add expenses to see where your money is going.</p>
            ) : (
              categorySpread.map(([category, total]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-500">₦{total.toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net income trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rollingNet.length === 0 ? (
              <p className="text-sm text-gray-500">Log income and expenses to track your monthly net position.</p>
            ) : (
              rollingNet.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">{entry.label}</div>
                  <div
                    className={`text-sm font-semibold ${entry.net >= 0 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {entry.net >= 0 ? '+' : ''}₦{entry.net.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpRight className="h-4 w-4 text-primary" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Keep your deductible expenses updated to refine tax estimates.</p>
          <p>• Use WhatsApp import to capture customer payments faster.</p>
          <p>• Need investor-ready reports? Upgrade to LevyMate Pro for PDF exports.</p>
        </CardContent>
      </Card>
    </div>
  )
}
