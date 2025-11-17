import { AuthLayout } from '@/components/auth/auth-layout'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata = {
  title: 'Reset password · LevyMate',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Reset your password" subtitle="Create a new password to secure your account">
      <ResetPasswordForm />
    </AuthLayout>
  )
}
