import { MobileLayout } from '@/components/layout/mobile-layout'
import { LearningHub } from '@/components/learning/learning-hub'

export default function LearnPage() {
  return (
    <MobileLayout>
      <div className="px-4 pb-20">
        <header className="py-6">
          <h1 className="text-2xl font-bold text-foreground">Learning Hub</h1>
          <p className="text-muted-foreground mt-1">Learn about Nigerian taxes</p>
        </header>
        
        <LearningHub />
      </div>
    </MobileLayout>
  )
}