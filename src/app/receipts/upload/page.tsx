import { MobileLayout } from '@/components/layout/mobile-layout'
import { ReceiptUpload } from '@/components/transactions/receipt-upload'

export default function ReceiptUploadPage() {
  return (
    <MobileLayout title="Receipt OCR" subtitle="Upload receipts and turn them into transactions">
      <ReceiptUpload />
    </MobileLayout>
  )
}
