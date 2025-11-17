'use client'

import React from 'react'
import Link from 'next/link'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-white to-white">
      <header className="px-6 py-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          LevyMate
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            {children}
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} LevyMate. All rights reserved.
      </footer>
    </div>
  )
}
