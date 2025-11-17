'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { Check } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0/mo',
    description: 'Track essentials with manual entries and basic summaries.',
    features: [
      'Unlimited manual income & expense entries',
      'Mobile dashboard & quick actions',
      'Basic monthly analytics',
      'Offline queue & sync',
    ],
  },
  {
    id: 'pro',
    name: 'LevyMate Pro',
    price: '₦4,500/mo',
    description: 'Unlock automation, deeper analytics, and export-ready reports.',
    features: [
      'Receipt OCR with confidence scoring',
      'WhatsApp chat importer',
      'Advanced analytics & CSV/PDF exports',
      'Personal tax projection reports',
      'Priority support on WhatsApp',
    ],
  },
]

export function SubscriptionPlans() {
  const { subscriptionTier, setSubscriptionTier } = useAppStore()

  const handleUpgrade = (planId: 'free' | 'pro') => {
    if (planId === subscriptionTier) return
    if (planId === 'pro') {
      setSubscriptionTier('pro')
      window.location.href = 'https://paystack.com/pay/levymate-pro'
    } else {
      setSubscriptionTier('free')
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Manage subscription</h1>
        <p className="text-sm text-gray-600">
          Upgrade to LevyMate Pro to unlock automation and premium reporting.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const isActive = subscriptionTier === plan.id
          return (
            <Card
              key={plan.id}
              className={`relative ${isActive ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
            >
              {isActive && (
                <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Current plan
                </span>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  <span className="text-lg font-semibold">{plan.price}</span>
                </CardTitle>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.id === 'pro' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id as 'free' | 'pro')}
                >
                  {plan.id === subscriptionTier ? 'Active plan' : plan.id === 'pro' ? 'Upgrade to Pro' : 'Stay on Free'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing & support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• All payments are processed securely via Paystack.</p>
          <p>• Need to update your card or cancel? Email support@levymate.app</p>
          <p>• Webhook events are verified with HMAC SHA256 to secure your account.</p>
        </CardContent>
      </Card>
    </div>
  )
}
