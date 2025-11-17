'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { parseWhatsAppText, WhatsAppCandidate } from '@services/whatsapp/parseWhatsApp'
import { useAppStore } from '@/store/app-store'
import { queueStorage } from '@/lib/storage'

interface CandidateWithMeta extends WhatsAppCandidate {
  id: string
  include: boolean
  overrideType: 'income' | 'expense'
}

export function WhatsAppImport() {
  const { addIncome, addExpense, refreshSyncQueueLength } = useAppStore()
  const [candidates, setCandidates] = useState<CandidateWithMeta[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const suggestedTotals = useMemo(() => {
    const totals: Record<'income' | 'expense', number> = { income: 0, expense: 0 }
    candidates
      .filter((candidate) => candidate.include)
      .forEach((candidate) => {
        if (candidate.amount) {
          totals[candidate.overrideType] += candidate.amount
        }
      })
    return totals
  }, [candidates])

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result?.toString() ?? ''
      const parsed = parseWhatsAppText(text)
      setCandidates(
        parsed.map((candidate) => ({
          ...candidate,
          id: crypto.randomUUID(),
          include: true,
          overrideType: candidate.tag === 'income' ? 'income' : 'expense',
        }))
      )
      setFileName(file.name)
      setStatusMessage(`Found ${parsed.length} potential transactions`)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const toggleCandidate = (id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? { ...candidate, include: !candidate.include }
          : candidate
      )
    )
  }

  const updateCandidateType = (id: string, overrideType: 'income' | 'expense') => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, overrideType } : candidate
      )
    )
  }

  const acceptSelected = () => {
    if (candidates.length === 0) return
    const selected = candidates.filter((candidate) => candidate.include)
    if (selected.length === 0) {
      setStatusMessage('Select at least one suggestion to import')
      return
    }

    selected.forEach((candidate) => {
      const amount = candidate.amount ?? 0
      if (amount <= 0) return

      const timestamp = candidate.date ? new Date(candidate.date) : new Date()
      const basePayload = {
        id: crypto.randomUUID(),
        userId: 'placeholder-user',
        amount,
        category: candidate.overrideType === 'income' ? 'Sales' : 'Other',
        timestamp,
        notes: candidate.line,
        tags: ['whatsapp'],
        createdOffline: true,
        sourceSystem: 'whatsapp' as const,
        attachments: [],
      }

      if (candidate.overrideType === 'income') {
        const incomePayload = {
          ...basePayload,
          paymentMethod: 'transfer' as const,
          source: 'WhatsApp import',
        }
        addIncome(incomePayload as any)
        queueStorage.addToQueue({
          action: 'add_income',
          payload: incomePayload,
          baseVersion: 0,
          syncRequired: true,
          synced: false,
          retries: 0,
        })
      } else {
        const expensePayload = {
          ...basePayload,
          isDeductible: false,
          isBusiness: true,
        }
        addExpense(expensePayload as any)
        queueStorage.addToQueue({
          action: 'add_expense',
          payload: expensePayload,
          baseVersion: 0,
          syncRequired: true,
          synced: false,
          retries: 0,
        })
      }
    })

    refreshSyncQueueLength()
    setStatusMessage(`Queued ${selected.length} transactions for sync`)
  }

  const clearSuggestions = () => {
    setCandidates([])
    setFileName(null)
    setStatusMessage(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <Upload className="h-8 w-8 text-primary" />
            <p className="mt-3 text-sm text-gray-600">
              Upload your exported WhatsApp chat (.txt). We will suggest transactions for review.
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center space-x-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
              <span>Select file</span>
              <input type="file" accept="text/plain" className="hidden" onChange={handleFileUpload} />
            </label>
            {fileName && <p className="mt-2 text-xs text-gray-500">Loaded {fileName}</p>}
          </div>
        </CardContent>
      </Card>

      {statusMessage && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {statusMessage}
        </div>
      )}

      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions ({candidates.length})</CardTitle>
            <p className="text-sm text-gray-500">
              {candidates.filter((candidate) => candidate.include).length} selected · ₦{suggestedTotals.income.toLocaleString()} income · ₦{suggestedTotals.expense.toLocaleString()} expense
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`rounded-lg border px-3 py-3 ${
                    candidate.include ? 'border-primary/40 bg-primary/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{candidate.line}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Confidence: {(candidate.confidence * 100).toFixed(0)}%</span>
                        {candidate.amount && (
                          <span className="font-semibold text-gray-700">
                            Amount: ₦{candidate.amount.toLocaleString()}
                          </span>
                        )}
                        {candidate.date && (
                          <span>{new Date(candidate.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={candidate.overrideType}
                        onChange={(event) =>
                          updateCandidateType(
                            candidate.id,
                            event.target.value as 'income' | 'expense'
                          )
                        }
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-primary focus:ring-primary"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                      <Button
                        size="sm"
                        variant={candidate.include ? 'default' : 'outline'}
                        onClick={() => toggleCandidate(candidate.id)}
                      >
                        {candidate.include ? 'Selected' : 'Include'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:justify-between">
              <div className="text-xs text-gray-500">
                Tip: deselect items that are not actual payments before importing.
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearSuggestions}>
                  Clear all
                </Button>
                <Button onClick={acceptSelected}>Import selected</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
