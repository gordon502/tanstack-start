import { createLazyFileRoute } from '@tanstack/react-router'
import ReportsScreen from '@/modules/reports/pages/ReportsScreen'

export const Route = createLazyFileRoute('/')({
  component: ReportsScreen,
})
