import { AuthLayout } from '@/components/auth/auth-layout'
import { WelcomeScreen } from '@/components/auth/welcome-screen'

export const dynamic = 'force-static'

export const metadata = {
  title: 'Welcome · LevyMate',
}

export default function AuthWelcomePage() {
  return (
    <AuthLayout title="Welcome to LevyMate" subtitle="Built for Nigerian micro businesses & hustlers">
      <WelcomeScreen />
    </AuthLayout>
  )
}
