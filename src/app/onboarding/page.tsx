import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'

export const dynamic = 'force-static'

export const metadata = {
  title: 'Get Started · LevyMate',
}

export default function OnboardingPage() {
  return <OnboardingFlow />
}
