import { MobileLayout } from '@/components/layout/mobile-layout'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default function Home() {
  return (
    <MobileLayout>
      <div className="px-4 pb-20">
        <header className="py-6">
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your financial overview</p>
        </header>
        
        <DashboardOverview />
      </div>
    </MobileLayout>
  )
}