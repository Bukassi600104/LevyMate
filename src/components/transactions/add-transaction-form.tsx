'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { queueStorage } from '@/lib/storage'
import {
  Plus,
  Minus,
  UploadCloud,
  Camera,
  Tag,
  Split,
  X,
  Check,
} from 'lucide-react'
import { TransactionAttachment, TransactionSplit } from '@/types'

const incomeCategories = [
  'Salary',
  'Business Income',
  'Freelance Work',
  'Sales',
  'Investment',
  'Windfall',
  'Other',
]

const expenseCategories = [
  'Cost of Goods Sold',
  'POS Fees',
  'Transportation',
  'Materials',
  'Rent',
  'Utilities',
  'Marketing',
  'Taxes',
  'Other',
]

const paymentMethods = ['transfer', 'cash', 'pos', 'digital', 'other'] as const

export function AddTransactionForm() {
  const searchParams = useSearchParams()
  const { addIncome, addExpense, refreshSyncQueueLength } = useAppStore()

  const typeFromUrl = searchParams.get('type') as 'income' | 'expense' | null
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    typeFromUrl === 'expense' ? 'expense' : 'income'
  )

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethods[0],
    isBusiness: true,
    isDeductible: false,
  })

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [attachments, setAttachments] = useState<TransactionAttachment[]>([])
  const [splits, setSplits] = useState<TransactionSplit[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeFromUrl) {
      setTransactionType(typeFromUrl)
      setFormData((prev) => ({ ...prev, category: '' }))
    }
  }, [typeFromUrl])

  const categoryOptions = useMemo(
    () => (transactionType === 'income' ? incomeCategories : expenseCategories),
    [transactionType]
  )

  const splitTotal = useMemo(() => {
    return splits.reduce((total, split) => total + (split.amount || 0), 0)
  }, [splits])

  const remainingSplitBalance = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0
    const balance = amount - splitTotal
    return Math.round(balance * 100) / 100
  }, [formData.amount, splitTotal])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (!tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files
    if (!files) return

    const uploaded: TransactionAttachment[] = []
    Array.from(files).forEach((file) => {
      const id = crypto.randomUUID()
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      uploaded.push({
        id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl,
        source: 'upload',
        status: 'pending',
      })
    })

    setAttachments((prev) => [...prev, ...uploaded])
    event.target.value = ''
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId))
  }

  const handleAddSplit = () => {
    setSplits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category: '',
        amount: 0,
      },
    ])
  }

  const updateSplit = (splitId: string, updates: Partial<TransactionSplit>) => {
    setSplits((prev) =>
      prev.map((split) => (split.id === splitId ? { ...split, ...updates } : split))
    )
  }

  const handleRemoveSplit = (splitId: string) => {
    setSplits((prev) => prev.filter((split) => split.id !== splitId))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      setStatusMessage('Amount must be greater than zero')
      return
    }

    if (!formData.category) {
      setStatusMessage('Please select a category')
      return
    }

    const timestamp = new Date(formData.date)
    const payloadBase = {
      id: crypto.randomUUID(),
      userId: 'placeholder-user',
      amount,
      category: formData.category,
      timestamp,
      notes: formData.description,
      tags,
      attachments,
      splits,
      isBusiness: formData.isBusiness,
      createdOffline: true,
      sourceSystem: 'manual' as const,
    }

    if (transactionType === 'income') {
      const newIncome = {
        ...payloadBase,
        type: 'income' as const,
        source: formData.source,
        paymentMethod: formData.paymentMethod,
      }
      addIncome(newIncome as any)
      queueStorage.addToQueue({
        action: 'add_income',
        payload: newIncome,
        baseVersion: 0,
        syncRequired: true,
        synced: false,
        retries: 0,
      })
    } else {
      const newExpense = {
        ...payloadBase,
        type: 'expense' as const,
        isDeductible: formData.isDeductible,
      }
      addExpense(newExpense as any)
      queueStorage.addToQueue({
        action: 'add_expense',
        payload: newExpense,
        baseVersion: 0,
        syncRequired: true,
        synced: false,
        retries: 0,
      })
    }

    refreshSyncQueueLength()

    setFormData((prev) => ({
      ...prev,
      amount: '',
      description: '',
      category: '',
      source: '',
      paymentMethod: paymentMethods[0],
    }))
    setAttachments([])
    setTags([])
    setSplits([])
    setStatusMessage('Transaction queued for sync!')
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Add {transactionType === 'income' ? 'Income' : 'Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, category: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {transactionType === 'income' ? 'Source' : 'Merchant'}
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, source: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={
                    transactionType === 'income'
                      ? 'Where did the money come from?'
                      : 'Who did you pay?'
                  }
                  required
                />
              </div>

              {transactionType === 'income' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: event.target.value as (typeof paymentMethods)[number],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business or Personal
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="radio"
                      name="transaction-scope"
                      checked={formData.isBusiness}
                      onChange={() => setFormData((prev) => ({ ...prev, isBusiness: true }))}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span>Business</span>
                  </label>
                  <label className="inline-flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="radio"
                      name="transaction-scope"
                      checked={!formData.isBusiness}
                      onChange={() => setFormData((prev) => ({ ...prev, isBusiness: false }))}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span>Personal</span>
                  </label>
                </div>
              </div>

              {transactionType === 'expense' && (
                <div className="flex items-center space-x-2">
                  <input
                    id="deductible"
                    type="checkbox"
                    checked={formData.isDeductible}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, isDeductible: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="deductible" className="text-sm text-gray-600">
                    Mark as tax-deductible expense
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, description: event.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Add context, invoice numbers, or reminders"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                Tags
                <span className="text-xs text-gray-500">Press Enter to add</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. market run, school fees"
                />
                <Button type="button" variant="ghost" onClick={handleAddTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      <span>{tag}</span>
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Split into categories
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddSplit}>
                  <Split className="mr-2 h-4 w-4" /> Add split
                </Button>
              </div>
              {splits.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Break the transaction into multiple categories (e.g. fuel + food).
                </p>
              ) : (
                <div className="space-y-2">
                  {splits.map((split) => (
                    <div key={split.id} className="grid gap-2 md:grid-cols-[1fr,120px,40px]">
                      <input
                        value={split.category}
                        onChange={(event) =>
                          updateSplit(split.id, { category: event.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Category"
                      />
                      <input
                        type="number"
                        value={split.amount || ''}
                        onChange={(event) =>
                          updateSplit(split.id, { amount: Number(event.target.value) })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Amount"
                      />
                      <Button type="button" variant="ghost" onClick={() => handleRemoveSplit(split.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {splits.length > 0 && (
                <p
                  className={`text-xs font-medium ${
                    remainingSplitBalance === 0 ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  Remaining balance: ₦{remainingSplitBalance.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Attach receipts or files</label>
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                <p className="text-sm text-gray-600">
                  Upload clear photos or PDFs of your receipts. We will extract the amounts using OCR.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <label className="flex cursor-pointer items-center space-x-2 rounded-full bg-primary/10 px-3 py-2 text-sm text-primary">
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload file</span>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} multiple />
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-600">
                    <Camera className="h-4 w-4" />
                    <span>Use camera</span>
                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="relative rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024).toFixed(1)} KB · {attachment.fileType || 'unknown'}
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            OCR processing pending
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {attachment.previewUrl && (
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.fileName}
                          className="mt-3 h-32 w-full rounded-md object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Need to scan many receipts?{' '}
                <Link href="/receipts/upload" className="text-primary underline">
                  Open the OCR workspace
                </Link>
              </p>
            </div>

            {statusMessage && (
              <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <Check className="h-4 w-4" />
                <span>{statusMessage}</span>
              </div>
            )}

            <Button type="submit" className="w-full md:w-auto">
              Save {transactionType === 'income' ? 'Income' : 'Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
