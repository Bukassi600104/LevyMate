'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ResetPasswordForm() {
  const [formData, setFormData] = useState({ password: '', confirm: '' })
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setError(null)

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Button asChild className="w-full">
          <Link href="/auth/login">Go to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Create new password"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          value={formData.confirm}
          onChange={(event) => setFormData((prev) => ({ ...prev, confirm: event.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Repeat new password"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full">
        Reset password
      </Button>
    </form>
  )
}
