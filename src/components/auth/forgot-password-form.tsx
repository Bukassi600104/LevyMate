'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setStatus('submitted')
  }

  if (status === 'submitted') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          If an account exists for <span className="font-medium">{email}</span>, we’ve sent a reset link.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="you@business.com"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Send reset link
      </Button>

      <div className="text-center text-sm text-gray-600">
        Remembered it?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  )
}
