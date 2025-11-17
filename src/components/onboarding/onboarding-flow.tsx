'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { ProfileType } from '@/types'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const incomeOptions = [
  { value: 'small_business', label: 'I own a small business' },
  { value: 'salary_earner', label: 'I’m employed' },
  { value: 'freelancer', label: 'I freelance' },
  { value: 'student', label: 'I’m a student' },
  { value: 'mixed_income', label: 'Multiple income sources' },
] as const

const goalOptions = [
  'Track daily expenses',
  'Track income',
  'Help me know my taxes',
  'All of the above',
]

const businessTypes = [
  'Fashion & tailoring',
  'POS / Agent banking',
  'Food & catering',
  'Logistics & delivery',
  'Freelance / creative',
  'E-commerce / online store',
  'Other',
]

export function OnboardingFlow() {
  const { user, setUser, setOnboardingCompleted, setAuthenticated } = useAppStore()
  const [step, setStep] = useState(0)
  const [selectedIncome, setSelectedIncome] = useState<ProfileType | null>(user?.profileType ?? null)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [businessName, setBusinessName] = useState(user?.businessName ?? '')
  const [businessType, setBusinessType] = useState(user?.businessType ?? '')
  const [completed, setCompleted] = useState(false)

  const canContinue = useMemo(() => {
    if (step === 0) return true
    if (step === 1) return Boolean(selectedIncome)
    if (step === 2) return selectedGoals.length > 0
    return true
  }, [step, selectedIncome, selectedGoals])

  const nextStep = () => {
    if (step < 3) {
      setStep((prev) => prev + 1)
    } else {
      finishOnboarding()
    }
  }

  const previousStep = () => {
    if (step === 0) return
    setStep((prev) => prev - 1)
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    )
  }

  const finishOnboarding = () => {
    const updatedUser = user
      ? {
          ...user,
          profileType: selectedIncome ?? user.profileType,
          onboardingCompleted: true,
          businessName: businessName || user.businessName,
          businessType: businessType || user.businessType,
        }
      : null

    if (updatedUser) {
      setUser(updatedUser)
    }

    setOnboardingCompleted(true)
    setAuthenticated(true)
    setCompleted(true)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 pb-14 pt-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          LevyMate
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Let’s personalise your experience</h1>
        <p className="text-sm text-gray-600">
          Answer a few quick questions so we can tailor LevyMate to your hustle.
        </p>
      </header>

      <div className="mt-8 flex-1">
        {completed ? (
          <Card className="border-green-200 bg-green-50 text-green-700">
            <CardContent className="flex flex-col items-center space-y-3 p-6 text-center">
              <CheckCircle2 className="h-10 w-10" />
              <h2 className="text-xl font-semibold">You’re all set!</h2>
              <p className="text-sm">
                Welcome to LevyMate. We’ve prepared your dashboard based on your selections.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                Go to dashboard
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="rounded-full bg-gray-100 p-1">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>

            {step === 0 && (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">Welcome to LevyMate</h2>
                  <p className="text-sm text-gray-600">
                    We bring tax clarity to your daily payments. Let’s capture the important bits so we can send better insights.
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                    <li>Track income & expenses without the stress</li>
                    <li>Know how much tax to set aside every month</li>
                    <li>Use OCR and WhatsApp imports to save time</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    What kind of income do you earn?
                  </h2>
                  <div className="space-y-3">
                    {incomeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedIncome(option.value)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary ${
                          selectedIncome === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-primary/40'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    What do you want LevyMate to help you with?
                  </h2>
                  <div className="space-y-3">
                    {goalOptions.map((goal) => {
                      const active = selectedGoals.includes(goal)
                      return (
                        <label
                          key={goal}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                            active ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:border-primary/40'
                          }`}
                        >
                          <span>{goal}</span>
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleGoal(goal)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </label>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">Tell us about your business</h2>
                  <p className="text-sm text-gray-500">This helps us provide better category suggestions. You can skip if not ready.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500">
                        Business name (optional)
                      </label>
                      <input
                        value={businessName}
                        onChange={(event) => setBusinessName(event.target.value)}
                        placeholder="eg. Chioma’s Kitchen"
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-gray-500">
                        Business type (optional)
                      </label>
                      <select
                        value={businessType}
                        onChange={(event) => setBusinessType(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="">Select industry</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {!completed && (
        <footer className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
          <Button variant="ghost" onClick={previousStep} disabled={step === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center space-x-2">
            {step < 3 && (
              <Button variant="ghost" onClick={finishOnboarding}>
                Skip
              </Button>
            )}
            <Button onClick={nextStep} disabled={!canContinue}>
              {step === 3 ? (
                <>
                  Finish <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
