'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { queueStorage } from '@/lib/storage'
import { UploadCloud, Check, X, Loader2 } from 'lucide-react'

interface ReceiptCandidate {
  id: string
  fileName: string
  fileSize: number
  previewUrl?: string
  amount: string
  date: string
  status: 'pending' | 'accepted' | 'rejected'
  confidence: number
  type: 'income' | 'expense'
}

export function ReceiptUpload() {
  const { addIncome, addExpense, refreshSyncQueueLength } = useAppStore()
  const [candidates, setCandidates] = useState<ReceiptCandidate[]>([])
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files
    if (!files) return

    const nextCandidates: ReceiptCandidate[] = []
    Array.from(files).forEach((file) => {
      const id = crypto.randomUUID()
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      nextCandidates.push({
        id,
        fileName: file.name,
        fileSize: file.size,
        previewUrl,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        confidence: 0.58,
        type: 'expense',
      })
    })
    setCandidates((prev) => [...prev, ...nextCandidates])
    event.target.value = ''
    setMessage(null)
  }

  const runMockOcr = async () => {
    setProcessing(true)
    setTimeout(() => {
      setCandidates((prev) =>
        prev.map((candidate) => ({
          ...candidate,
          amount: candidate.amount || (Math.random() * 6000 + 2000).toFixed(2),
          confidence: 0.6 + Math.random() * 0.3,
        }))
      )
      setProcessing(false)
      setMessage('OCR complete. Please review and confirm the suggested information.')
    }, 1200)
  }

  const updateCandidate = (id: string, updates: Partial<ReceiptCandidate>) => {
    setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, ...updates } : candidate)))
  }

  const acceptReceipt = (candidate: ReceiptCandidate) => {
    const amount = parseFloat(candidate.amount)
    if (!amount || amount <= 0) {
      setMessage('Enter a valid amount before accepting a receipt.')
      return
    }
    const timestamp = new Date(candidate.date)

    if (candidate.type === 'income') {
      const payload = {
        id: crypto.randomUUID(),
        userId: 'placeholder-user',
        amount,
        category: 'Business Income',
        timestamp,
        notes: `OCR import: ${candidate.fileName}`,
        tags: ['ocr'],
        isBusiness: true,
        attachments: [
          {
            id: candidate.id,
            fileName: candidate.fileName,
            fileSize: candidate.fileSize,
            fileType: 'image/png',
            previewUrl: candidate.previewUrl,
            source: 'ocr' as const,
            confidence: candidate.confidence,
            status: 'processed' as const,
          },
        ],
        paymentMethod: 'transfer' as const,
        source: 'Receipt import',
        createdOffline: true,
        sourceSystem: 'ocr' as const,
      }
      addIncome(payload as any)
      queueStorage.addToQueue({
        action: 'add_income',
        payload,
        baseVersion: 0,
        syncRequired: true,
        synced: false,
        retries: 0,
      })
    } else {
      const payload = {
        id: crypto.randomUUID(),
        userId: 'placeholder-user',
        amount,
        category: 'Materials',
        timestamp,
        notes: `OCR import: ${candidate.fileName}`,
        tags: ['ocr'],
        isBusiness: true,
        attachments: [
          {
            id: candidate.id,
            fileName: candidate.fileName,
            fileSize: candidate.fileSize,
            fileType: 'image/png',
            previewUrl: candidate.previewUrl,
            source: 'ocr' as const,
            confidence: candidate.confidence,
            status: 'processed' as const,
          },
        ],
        createdOffline: true,
        sourceSystem: 'ocr' as const,
        isDeductible: true,
      }
      addExpense(payload as any)
      queueStorage.addToQueue({
        action: 'add_expense',
        payload,
        baseVersion: 0,
        syncRequired: true,
        synced: false,
        retries: 0,
      })
    }

    refreshSyncQueueLength()
    setCandidates((prev) => prev.filter((item) => item.id !== candidate.id))
    setMessage('Receipt accepted and queued for sync')
  }

  const rejectReceipt = (id: string) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload receipts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              Snap or upload receipts (PNG, JPG, PDF). We will preprocess them with our OCR engine and pull out the totals for you.
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center space-x-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
              <UploadCloud className="h-4 w-4" />
              <span>Choose files</span>
              <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {candidates.length > 0 && (
            <Button type="button" onClick={runMockOcr} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Run OCR on {candidates.length} file(s)
            </Button>
          )}
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  {candidate.previewUrl && (
                    <Image
                      src={candidate.previewUrl}
                      alt={candidate.fileName}
                      width={120}
                      height={128}
                      className="h-32 w-full max-w-[120px] rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{candidate.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(candidate.fileSize / 1024).toFixed(1)} KB · Confidence {(candidate.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                          Amount (₦)
                        </label>
                        <input
                          type="number"
                          value={candidate.amount}
                          onChange={(event) =>
                            updateCandidate(candidate.id, { amount: event.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                          Transaction Date
                        </label>
                        <input
                          type="date"
                          value={candidate.date}
                          onChange={(event) =>
                            updateCandidate(candidate.id, { date: event.target.value })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                          Treat as
                        </label>
                        <select
                          value={candidate.type}
                          onChange={(event) =>
                            updateCandidate(candidate.id, {
                              type: event.target.value as 'income' | 'expense',
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => acceptReceipt(candidate)}>
                        <Check className="mr-1 h-4 w-4" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rejectReceipt(candidate.id)}>
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
