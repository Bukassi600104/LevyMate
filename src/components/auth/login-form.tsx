'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { authStorage, userStorage } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const { setUser, setAuthenticated, setOnboardingCompleted } = useAppStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setError(null)

    if (!formData.email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    const mockUser = {
      id: crypto.randomUUID(),
      fullName: formData.email.split('@')[0],
      email: formData.email,
      phone: '+2340000000000',
      profileType: 'small_business' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      subscriptionTier: 'free' as const,
    }

    userStorage.setUser(mockUser)
    authStorage.setToken('demo-token')
    setUser(mockUser)
    setAuthenticated(true)
    setOnboardingCompleted(false)

    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/onboarding')
    }, 400)
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
          autoComplete="email"
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="you@business.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Enter password"
          required
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <span>Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        No account yet?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Create one
        </Link>
      </div>
    </form>
  )
}
