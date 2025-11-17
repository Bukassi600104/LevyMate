'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { authStorage, userStorage } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const { setUser, setAuthenticated, setOnboardingCompleted } = useAppStore()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setError(null)

    if (!formData.fullName.trim()) {
      setError('Enter your full name')
      return
    }
    if (!formData.email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    const mockUser = {
      id: crypto.randomUUID(),
      fullName: formData.fullName,
      email: formData.email,
      phone: '+2340000000000',
      profileType: 'small_business' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: false,
      subscriptionTier: 'trial' as const,
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
        <label className="block text-sm font-medium text-gray-700" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          value={formData.fullName}
          onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Ayomide Lawal"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
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
          placeholder="Create password"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          placeholder="Repeat password"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}
