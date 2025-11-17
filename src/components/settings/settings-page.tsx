'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authStorage, userStorage } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import { UploadCloud, Shield, LogOut, Trash2 } from 'lucide-react'

export function SettingsPage() {
  const router = useRouter()
  const { user, setUser, setAuthenticated, setOnboardingCompleted } = useAppStore()
  const [businessName, setBusinessName] = useState(user?.businessName ?? '')
  const [businessType, setBusinessType] = useState(user?.businessType ?? '')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleSaveBusiness = () => {
    setSaving(true)
    setStatus(null)
    const updatedUser = user
      ? {
          ...user,
          businessName,
          businessType,
          updatedAt: new Date(),
        }
      : null
    if (updatedUser) {
      setUser(updatedUser)
      userStorage.setUser(updatedUser)
    }
    setTimeout(() => {
      setSaving(false)
      setStatus('Business profile updated!')
    }, 400)
  }

  const handleLogout = () => {
    authStorage.clearToken()
    userStorage.clearUser()
    setUser(null)
    setAuthenticated(false)
    setOnboardingCompleted(false)
    router.push('/auth/login')
  }

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This is a soft delete.')) {
      return
    }
    setUser(null)
    authStorage.clearToken()
    userStorage.clearUser()
    setAuthenticated(false)
    router.push('/auth/register')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center space-x-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            {user?.fullName?.[0] ?? 'L'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{user?.fullName ?? 'Guest user'}</h2>
            <p className="text-sm text-gray-500">{user?.email ?? 'No email on file'}</p>
            {user?.profileType && (
              <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {user.profileType.replace('_', ' ')}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/onboarding')}>
            Update preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Business name</label>
            <input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="eg. Ada’s Food Hub"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Business type</label>
            <input
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value)}
              placeholder="eg. Catering"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <Button onClick={handleSaveBusiness} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {status && <p className="text-xs text-green-600">{status}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border border-gray-100 p-3">
            <UploadCloud className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-800">Export data (CSV)</p>
              <p className="text-xs text-gray-500">Download your transactions for accountant review.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => alert('CSV export will be available soon. Contact support to get early access.')}
              >
                Download CSV
              </Button>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-gray-100 p-3">
            <Shield className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-800">Two-factor authentication</p>
              <p className="text-xs text-gray-500">Coming soon. We’ll notify you when 2FA is available.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardContent className="space-y-3 p-4">
          <Button variant="outline" className="w-full justify-center text-red-600" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
          <Button variant="ghost" className="w-full justify-center text-red-500" onClick={handleDeleteAccount}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
