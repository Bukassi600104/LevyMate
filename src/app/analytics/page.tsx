import { MobileLayout } from '@/components/layout/mobile-layout'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export const dynamic = 'force-static'

export default function AnalyticsPage() {
  return (
    <MobileLayout title="Analytics" subtitle="Breakdowns, trends, and export-ready summaries">
      <AnalyticsDashboard />
    </MobileLayout>
  )
}
