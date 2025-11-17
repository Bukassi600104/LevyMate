import { MobileLayout } from '@/components/layout/mobile-layout'
import { SettingsPage } from '@/components/settings/settings-page'

export default function SettingsRoute() {
  return (
    <MobileLayout title="Settings" subtitle="Manage profile, business, and account controls">
      <SettingsPage />
    </MobileLayout>
  )
}
