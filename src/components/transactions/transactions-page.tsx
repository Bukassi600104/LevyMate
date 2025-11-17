'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Filter,
  Search,
  ArrowUpDown,
  Edit,
  Trash2,
  Tag,
  FileText,
} from 'lucide-react'
import { TransactionAttachment } from '@/types'

interface UnifiedTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  timestamp: Date
  notes?: string
  tags?: string[]
  isDeductible?: boolean
  isBusiness?: boolean
  sourceLabel?: string
  attachments?: TransactionAttachment[]
}

const PAGE_SIZE = 10

export function TransactionsPage() {
  const {
    incomes,
    expenses,
    deleteIncome,
    deleteExpense,
    updateIncome,
    updateExpense,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDeductibleOnly, setIsDeductibleOnly] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' })
  const [sortDescending, setSortDescending] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    amount: '',
    category: '',
    notes: '',
    tags: '',
    isBusiness: false,
    isDeductible: false,
  })

  const unifiedTransactions = useMemo<UnifiedTransaction[]>(() => {
    const incomeTransactions = incomes.map((income) => ({
      id: income.id,
      type: 'income' as const,
      amount: income.amount,
      category: income.category,
      timestamp: new Date(income.timestamp),
      notes: income.notes,
      tags: income.tags,
      isBusiness: income.isBusiness,
      sourceLabel: income.source,
      attachments: income.attachments,
    }))

    const expenseTransactions = expenses.map((expense) => ({
      id: expense.id,
      type: 'expense' as const,
      amount: expense.amount,
      category: expense.category,
      timestamp: new Date(expense.timestamp),
      notes: expense.notes,
      tags: expense.tags,
      isBusiness: expense.isBusiness,
      isDeductible: expense.isDeductible,
      attachments: expense.attachments,
    }))

    return [...incomeTransactions, ...expenseTransactions]
  }, [incomes, expenses])

  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    unifiedTransactions.forEach((transaction) => cats.add(transaction.category))
    return Array.from(cats)
  }, [unifiedTransactions])

  const filteredTransactions = useMemo(() => {
    return unifiedTransactions
      .filter((transaction) => {
        if (activeTab !== 'all' && transaction.type !== activeTab) return false
        if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false
        if (isDeductibleOnly && transaction.type === 'expense' && !transaction.isDeductible) return false

        if (searchTerm) {
          const search = searchTerm.toLowerCase()
          const matchText = [
            transaction.category,
            transaction.notes,
            transaction.tags?.join(', '),
            transaction.sourceLabel,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          if (!matchText.includes(search)) return false
        }

        if (dateRange.start) {
          const startDate = new Date(dateRange.start)
          if (transaction.timestamp < startDate) return false
        }

        if (dateRange.end) {
          const endDate = new Date(dateRange.end)
          // include entire day
          endDate.setHours(23, 59, 59, 999)
          if (transaction.timestamp > endDate) return false
        }

        const minAmount = parseFloat(amountRange.min)
        if (!Number.isNaN(minAmount) && transaction.amount < minAmount) return false

        const maxAmount = parseFloat(amountRange.max)
        if (!Number.isNaN(maxAmount) && transaction.amount > maxAmount) return false

        return true
      })
      .sort((a, b) =>
        sortDescending
          ? b.timestamp.getTime() - a.timestamp.getTime()
          : a.timestamp.getTime() - b.timestamp.getTime()
      )
  }, [
    unifiedTransactions,
    activeTab,
    categoryFilter,
    isDeductibleOnly,
    searchTerm,
    dateRange,
    amountRange,
    sortDescending,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredTransactions.slice(start, start + PAGE_SIZE)
  }, [filteredTransactions, page])

  useEffect(() => {
    setPage(1)
  }, [activeTab, categoryFilter, searchTerm, dateRange.start, dateRange.end, amountRange.min, amountRange.max, isDeductibleOnly])

  const resetEditState = () => {
    setEditingTransactionId(null)
    setEditForm({ amount: '', category: '', notes: '', tags: '', isBusiness: false, isDeductible: false })
  }

  const beginEditing = (transaction: UnifiedTransaction) => {
    setEditingTransactionId(transaction.id)
    setEditForm({
      amount: transaction.amount.toString(),
      category: transaction.category,
      notes: transaction.notes || '',
      tags: transaction.tags?.join(', ') || '',
      isBusiness: transaction.isBusiness ?? false,
      isDeductible: transaction.isDeductible ?? false,
    })
  }

  const handleSaveEdit = () => {
    if (!editingTransactionId) return
    const transaction = unifiedTransactions.find((t) => t.id === editingTransactionId)
    if (!transaction) return

    const parsedAmount = parseFloat(editForm.amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const updatedFields = {
      amount: parsedAmount,
      category: editForm.category,
      notes: editForm.notes,
      tags: editForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isBusiness: editForm.isBusiness,
    }

    if (transaction.type === 'income') {
      updateIncome(transaction.id, {
        ...updatedFields,
      })
    } else {
      updateExpense(transaction.id, {
        ...updatedFields,
        isDeductible: editForm.isDeductible,
      })
    }

    resetEditState()
  }

  const handleDelete = (transaction: UnifiedTransaction) => {
    if (!confirm('Delete this transaction?')) return
    if (transaction.type === 'income') {
      deleteIncome(transaction.id)
    } else {
      deleteExpense(transaction.id)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                All
              </Button>
              <Button
                variant={activeTab === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('income')}
              >
                Income
              </Button>
              <Button
                variant={activeTab === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('expense')}
              >
                Expenses
              </Button>
            </div>

            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search description, notes, tags..."
                  className="w-full rounded-lg border border-gray-300 px-9 py-2 text-sm focus:border-primary focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters((value) => !value)}>
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortDescending((value) => !value)}
                title="Toggle sort order"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount Range (₦)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Min"
                    value={amountRange.min}
                    onChange={(event) => setAmountRange((prev) => ({ ...prev, min: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Max"
                    value={amountRange.max}
                    onChange={(event) => setAmountRange((prev) => ({ ...prev, max: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="deductible-checkbox"
                  type="checkbox"
                  checked={isDeductibleOnly}
                  onChange={(event) => setIsDeductibleOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="deductible-checkbox" className="text-sm text-gray-600">
                  Show only tax-deductible expenses
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col space-y-1">
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          <p className="text-sm text-gray-500">
            Showing page {page} of {totalPages}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No transactions found. Try adjusting your filters or add a new transaction.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTransactions.map((transaction) => {
                const isEditing = editingTransactionId === transaction.id
                const amountDisplay = `₦${transaction.amount.toLocaleString()}`
                return (
                  <div
                    key={transaction.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={cnTransactionTypeBadge(transaction.type)}
                          >
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.category}
                          </span>
                        </div>
                        <p className={cnAmountColor(transaction.type)}>{amountDisplay}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.timestamp.toLocaleDateString()} · {transaction.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {transaction.notes && (
                          <p className="mt-2 text-sm text-gray-600">{transaction.notes}</p>
                        )}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {transaction.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {transaction.attachments && transaction.attachments.length > 0 && (
                          <div className="mt-3 space-y-1 text-xs text-gray-500">
                            {transaction.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2">
                                <FileText className="h-3 w-3" />
                                <span>{attachment.fileName}</span>
                                {attachment.confidence !== undefined && (
                                  <span className="text-amber-600">
                                    {Math.round(attachment.confidence * 100)}% confidence
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => beginEditing(transaction)}
                        >
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(transaction)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Amount (₦)
                            </label>
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Category
                            </label>
                            <input
                              value={editForm.category}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Notes
                            </label>
                            <textarea
                              value={editForm.notes}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                              rows={2}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Tags (comma separated)
                            </label>
                            <input
                              value={editForm.tags}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, tags: event.target.value }))}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              id={`business-${transaction.id}`}
                              type="checkbox"
                              checked={editForm.isBusiness}
                              onChange={(event) => setEditForm((prev) => ({ ...prev, isBusiness: event.target.checked }))}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`business-${transaction.id}`} className="text-sm text-gray-600">
                              Business transaction
                            </label>
                          </div>
                          {transaction.type === 'expense' && (
                            <div className="flex items-center space-x-2">
                              <input
                                id={`deductible-${transaction.id}`}
                                type="checkbox"
                                checked={editForm.isDeductible}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, isDeductible: event.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor={`deductible-${transaction.id}`} className="text-sm text-gray-600">
                                Mark as tax-deductible
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save changes
                          </Button>
                          <Button size="sm" variant="ghost" onClick={resetEditState}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cnTransactionTypeBadge(type: 'income' | 'expense') {
  return type === 'income'
    ? 'inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600'
    : 'inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600'
}

function cnAmountColor(type: 'income' | 'expense') {
  return type === 'income'
    ? 'mt-2 text-lg font-semibold text-green-600'
    : 'mt-2 text-lg font-semibold text-red-600'
}
