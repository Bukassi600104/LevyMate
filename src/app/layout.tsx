import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavigationProvider } from '@/components/navigation/navigation-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LevyMate - Your Everyday Tax Companion',
  description: 'Simple tax clarity for hustlers & microbusinesses in Nigeria',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </div>
      </body>
    </html>
  )
}