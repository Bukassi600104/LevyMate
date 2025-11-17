import { MobileLayout } from '@/components/layout/mobile-layout'
import { ProfilePage } from '@/components/profile/profile-page'

export default function ProfilePageRoute() {
  return (
    <MobileLayout>
      <div className="px-4 pb-20">
        <header className="py-6">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account</p>
        </header>
        
        <ProfilePage />
      </div>
    </MobileLayout>
  )
}