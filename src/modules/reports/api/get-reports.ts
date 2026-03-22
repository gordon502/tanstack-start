import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'
import {
  mapRowToReport,
  REPORT_COLUMNS,
  reportRowSchema,
} from '@/modules/reports/logic/report-schema'

export const getReports = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to view reports.')
    }

    const { data, error } = await supabase
      .from('reports')
      .select(REPORT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Unable to load reports.')
    }

    return data.map((row) => mapRowToReport(reportRowSchema.parse(row)))
  },
)
