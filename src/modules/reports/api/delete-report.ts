import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'
import { deleteReportInputSchema } from '@/modules/reports/logic/report-schema'

export const deleteReport = createServerFn({ method: 'POST' })
  .inputValidator(deleteReportInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to delete reports.')
    }

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id,storage_bucket,storage_path')
      .eq('id', data.id)
      .eq('user_id', user.id)
      .single()

    if (reportError) {
      throw new Error('Unable to find report.')
    }

    const { error: storageError } = await supabase.storage
      .from(report.storage_bucket)
      .remove([report.storage_path])

    if (storageError) {
      throw new Error('Unable to delete file from storage.')
    }

    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)

    if (deleteError) {
      throw new Error('Unable to delete report.')
    }

    return {
      id: data.id,
    }
  })
