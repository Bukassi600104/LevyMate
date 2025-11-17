'use client'

import React from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Settings, HelpCircle, LogOut, Bell, Shield } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAppStore()

  const menuItems = [
    {
      icon: User,
      label: 'Personal Information',
      description: 'Update your profile details',
      action: 'Edit Profile'
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notifications',
      action: 'Configure'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Password and security settings',
      action: 'Update'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help with LevyMate',
      action: 'Contact'
    },
    {
      icon: Settings,
      label: 'App Settings',
      description: 'Preferences and app settings',
      action: 'Configure'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.fullName || 'Guest User'}
              </h2>
              <p className="text-gray-600">{user?.email || 'Not logged in'}</p>
              {user?.profileType && (
                <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {user.profileType.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-xs text-gray-600">Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">₦0</div>
            <div className="text-xs text-gray-600">Total Tracked</div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    {item.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <button className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-medium">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-500">LevyMate v1.0.0</p>
        <p className="text-xs text-gray-500 mt-1">Your everyday tax companion</p>
      </div>
    </div>
  )
}