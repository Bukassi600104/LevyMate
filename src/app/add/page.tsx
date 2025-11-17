import { Suspense } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { AddTransactionForm } from '@/components/transactions/add-transaction-form'

export default function AddPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-20">
        <header className="py-6">
          <h1 className="text-2xl font-bold text-foreground">Add Transaction</h1>
          <p className="text-muted-foreground mt-1">Record your income or expenses</p>
        </header>

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
