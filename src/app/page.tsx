import { MobileLayout } from '@/components/layout/mobile-layout'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export const dynamic = 'force-static'

export default function Home() {
  return (
    <MobileLayout title="Dashboard" subtitle="Stay on top of income, expenses, and tax in seconds">
      <div className="px-1 pb-20 md:px-0 md:pb-0">
        <DashboardOverview />
      </div>
    </MobileLayout>
  )
}
