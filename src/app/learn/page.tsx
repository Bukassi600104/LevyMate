import { MobileLayout } from '@/components/layout/mobile-layout'
import { LearningHub } from '@/components/learning/learning-hub'

export const dynamic = 'force-static'

export default function LearnPage() {
  return (
    <MobileLayout title="Learn" subtitle="Tax education and resources for Nigerian microbusinesses">
      <div className="pb-20 md:pb-0">
        <LearningHub />
      </div>
    </MobileLayout>
  )
}
