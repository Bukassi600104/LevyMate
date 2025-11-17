import { AuthLayout } from '@/components/auth/auth-layout'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Create account · LevyMate',
}

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your LevyMate account" subtitle="Let’s set you up in under a minute">
      <RegisterForm />
    </AuthLayout>
  )
}
