'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import { 
  Home, 
  PlusCircle, 
  Calculator, 
  BookOpen, 
  User 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  { id: 'dashboard', label: 'Home', icon: Home, route: '/' },
  { id: 'add', label: 'Add', icon: PlusCircle, route: '/add' },
  { id: 'tax', label: 'Tax', icon: Calculator, route: '/tax' },
  { id: 'learn', label: 'Learn', icon: BookOpen, route: '/learn' },
  { id: 'profile', label: 'Profile', icon: User, route: '/profile' },
]

export function BottomNavigation() {
  const router = useRouter()
  const { activeTab } = useAppStore()

  const handleNavigation = (route: string) => {
    router.push(route)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors',
                  'min-w-[60px]',
                  isActive 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}