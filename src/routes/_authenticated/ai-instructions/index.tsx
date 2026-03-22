import { createFileRoute } from '@tanstack/react-router'
import { getAIInstructions } from '@/modules/ai-instructions/api/get-ai-instructions'

export const Route = createFileRoute('/_authenticated/ai-instructions/')({
  loader: async () => getAIInstructions(),
})
