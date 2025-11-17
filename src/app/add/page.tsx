import { Suspense } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { AddTransactionForm } from '@/components/transactions/add-transaction-form'

export default function AddPage() {
  return (
    <MobileLayout title="Add transaction" subtitle="Record income, expenses, and receipt uploads">
      <div className="pb-20 md:pb-0">
        <Suspense
          fallback={
            <div className="py-6 text-center text-muted-foreground">
              Loading transaction form...
            </div>
          }
        >
          <AddTransactionForm />
        </Suspense>
      </div>
    </MobileLayout>
  )
}
