import { MobileLayout } from '@/components/layout/mobile-layout'
import { TransactionsPage } from '@/components/transactions/transactions-page'

export const dynamic = 'force-static'

export default function TransactionsRoute() {
  return (
    <MobileLayout title="Transactions" subtitle="Review, filter, and manage your money trail">
      <TransactionsPage />
    </MobileLayout>
  )
}
