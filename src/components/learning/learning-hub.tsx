'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Video, FileText, Users } from 'lucide-react'

const learningModules = [
  {
    id: 1,
    title: 'Tax for Salary Earners',
    description: 'Understand how personal income tax works for employees',
    icon: Users,
    category: 'Basics',
    duration: '5 min read',
    type: 'article'
  },
  {
    id: 2,
    title: 'Small Business Tax Guide',
    description: 'Tax basics for entrepreneurs and small business owners',
    icon: BookOpen,
    category: 'Business',
    duration: '8 min read',
    type: 'article'
  },
  {
    id: 3,
    title: 'Crypto Gains Explained',
    description: 'How capital gains tax applies to cryptocurrency',
    icon: Video,
    category: 'Investments',
    duration: '3 min video',
    type: 'video'
  },
  {
    id: 4,
    title: 'Side Hustle Tax Rules',
    description: 'Managing taxes when you have multiple income streams',
    icon: FileText,
    category: 'Freelance',
    duration: '6 min read',
    type: 'article'
  },
  {
    id: 5,
    title: 'Deductible Expenses Guide',
    description: 'What expenses can you claim against your taxes?',
    icon: BookOpen,
    category: 'Savings',
    duration: '4 min read',
    type: 'article'
  },
  {
    id: 6,
    title: 'Tax Compliance Checklist',
    description: 'Step-by-step guide to staying tax compliant',
    icon: FileText,
    category: 'Compliance',
    duration: '5 min read',
    type: 'checklist'
  }
]

export function LearningHub() {
  return (
    <div className="space-y-6">
      {/* Featured Content */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-2">Featured: Nigeria Tax Basics 2026</h2>
          <p className="text-blue-100 mb-4">Everything you need to know about the new tax regime</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Start Learning
          </button>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['All', 'Basics', 'Business', 'Investments', 'Freelance', 'Savings', 'Compliance'].map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              category === 'All' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Learning Modules */}
      <div className="space-y-4">
        {learningModules.map((module) => {
          const Icon = module.icon
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {module.category}
                      </span>
                      <span className="text-xs text-gray-500">{module.duration}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">Keep receipts for all business expenses</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">File your taxes before March 31st each year</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">You can claim up to 20% rent relief (max ₦500k)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}