'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'

export function AddTransactionForm() {
  const searchParams = useSearchParams()
  const { addIncome, addExpense } = useAppStore()
  const typeFromUrl = searchParams.get('type') as 'income' | 'expense' | null
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    typeFromUrl === 'expense' ? 'expense' : 'income'
  )
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    source: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const transaction = {
      id: Date.now().toString(),
      userId: '1', // TODO: Get from user store
      amount: parseFloat(formData.amount),
      category: formData.category,
      source: formData.source,
      timestamp: new Date(),
      notes: formData.description,
      ...(transactionType === 'income' 
        ? { paymentMethod: 'transfer' as const }
        : { isDeductible: false }
      )
    }

    if (transactionType === 'income') {
      addIncome(transaction as any)
    } else {
      addExpense(transaction as any)
    }

    // Reset form
    setFormData({ amount: '', category: '', source: '', description: '' })
  }

  const incomeCategories = [
    'Salary',
    'Business Income',
    'Freelance',
    'Investment',
    'Other'
  ]

  const expenseCategories = [
    'Rent',
    'Food',
    'Transportation',
    'Utilities',
    'Business Expenses',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Transaction Type Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={transactionType === 'income' ? 'default' : 'outline'}
              onClick={() => setTransactionType('income')}
              className="flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Income</span>
            </Button>
            <Button
              variant={transactionType === 'expense' ? 'default' : 'outline'}
              onClick={() => setTransactionType('expense')}
              className="flex items-center justify-center space-x-2"
            >
              <Minus className="w-4 h-4" />
              <span>Expense</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            Add {transactionType === 'income' ? 'Income' : 'Expense'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {(transactionType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Source/Payee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {transactionType === 'income' ? 'Source' : 'Payee'}
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={transactionType === 'income' ? 'Where did this come from?' : 'Who did you pay?'}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Add any notes..."
              />
            </div>

            <Button type="submit" className="w-full">
              Add {transactionType === 'income' ? 'Income' : 'Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}