import { MobileLayout } from '@/components/layout/mobile-layout'
import { TaxCalculator } from '@/components/tax/tax-calculator'

export default function TaxPage() {
  return (
    <MobileLayout title="Tax estimate" subtitle="Nigeria’s PIT bands with monthly and annual breakdowns">
      <div className="pb-20 md:pb-0">
        <TaxCalculator />
      </div>
    </MobileLayout>
  )
}
