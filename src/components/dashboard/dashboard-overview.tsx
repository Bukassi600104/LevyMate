'use client'

import React from 'react'
import { useAppStore } from '@/store/app-store'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardOverview() {
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
      value: '₦0',
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
          <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Add Income
          </button>
          <button className="w-full py-3 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
            Add Expense
          </button>
          <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Calculate Tax
          </button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-2">Start adding your income and expenses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}