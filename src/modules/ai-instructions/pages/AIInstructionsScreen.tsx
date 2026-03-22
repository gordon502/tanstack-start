import { getRouteApi } from '@tanstack/react-router'
import AIInstructionsPage from '@/modules/ai-instructions/pages/AIInstructionsPage'

const aiInstructionsRouteApi = getRouteApi('/_authenticated/ai-instructions/')

export default function AIInstructionsScreen() {
  const initialData = aiInstructionsRouteApi.useLoaderData()

  return <AIInstructionsPage initialData={initialData} />
}
