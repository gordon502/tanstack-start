import { createLazyFileRoute } from '@tanstack/react-router'
import AIInstructionsScreen from '@/modules/ai-instructions/pages/AIInstructionsScreen'

export const Route = createLazyFileRoute('/_authenticated/ai-instructions/')({
  component: AIInstructionsScreen,
})
