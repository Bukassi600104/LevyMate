import { MobileLayout } from '@/components/layout/mobile-layout'
import { TaxCalculator } from '@/components/tax/tax-calculator'

export default function TaxPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-20">
        <header className="py-6">
          <h1 className="text-2xl font-bold text-foreground">Tax Calculator</h1>
          <p className="text-muted-foreground mt-1">Estimate your tax liability</p>
        </header>
        
        <TaxCalculator />
      </div>
    </MobileLayout>
  )
}