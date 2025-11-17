import { MobileLayout } from '@/components/layout/mobile-layout'
import { SubscriptionPlans } from '@/components/subscription/subscription-plans'

export default function SubscriptionPage() {
  return (
    <MobileLayout title="Subscription" subtitle="Switch plans and manage your LevyMate billing">
      <SubscriptionPlans />
    </MobileLayout>
  )
}
