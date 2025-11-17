'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles } from 'lucide-react'

export function WelcomeScreen() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-9 w-9" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">LevyMate · Your tax sidekick</h1>
        <p className="text-sm text-gray-600">
          Track income, monitor expenses, and know your tax estimate in minutes.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm">
        <div className="flex items-start space-x-3 text-sm text-gray-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
          <span>Mobile-first dashboard designed for Nigerian hustlers.</span>
        </div>
        <div className="mt-3 flex items-start space-x-3 text-sm text-gray-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
          <span>Automate entries with receipt OCR and WhatsApp chat parsing.</span>
        </div>
        <div className="mt-3 flex items-start space-x-3 text-sm text-gray-600">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
          <span>Get monthly, quarterly and annual tax estimates instantly.</span>
        </div>
      </div>
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/auth/register">Create an account</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/login">I already have an account</Link>
        </Button>
      </div>
    </div>
  )
}
