import { createFileRoute } from '@tanstack/react-router'
import { getReports } from '@/modules/reports/api/get-reports'

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => getReports(),
})
