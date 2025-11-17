'use client'

import React from 'react'
import { BottomNavigation } from './bottom-navigation'

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* Main content */}
        <main className="pb-16">
          {children}
        </main>
        
        {/* Bottom navigation */}
        <BottomNavigation />
      </div>
    </div>
  )
}