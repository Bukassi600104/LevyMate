import { MobileLayout } from '@/components/layout/mobile-layout'
import { WhatsAppImport } from '@/components/transactions/whatsapp-import'

export const dynamic = 'force-static'

export default function WhatsAppImportPage() {
  return (
    <MobileLayout title="WhatsApp Import" subtitle="Parse chat exports and turn them into transactions">
      <WhatsAppImport />
    </MobileLayout>
  )
}
