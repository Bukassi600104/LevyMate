import { AuthLayout } from '@/components/auth/auth-layout'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = {
  title: 'Forgot password · LevyMate',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we’ll send reset instructions">
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
