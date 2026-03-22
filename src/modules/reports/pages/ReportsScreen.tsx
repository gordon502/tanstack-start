import { getRouteApi } from '@tanstack/react-router'
import ReportGeneratorPage from '@/modules/reports/pages/ReportGeneratorPage'

const reportsRouteApi = getRouteApi('/_authenticated/')

export default function ReportsScreen() {
  const initialData = reportsRouteApi.useLoaderData()

  return <ReportGeneratorPage initialData={initialData} />
}
