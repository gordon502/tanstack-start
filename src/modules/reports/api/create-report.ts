import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/modules/auth/utils/supabase-server'
import {
  createReportInputSchema,
  mapRowToReport,
  REPORT_COLUMNS,
  reportRowSchema,
} from '@/modules/reports/logic/report-schema'

async function invokeReportProcessor(
  reportId: string,
  supabase: ReturnType<typeof getSupabaseServerClient>,
) {
  const { error } = await supabase.functions.invoke('process-report-step', {
    body: {
      reportId,
    },
  })

  if (error) {
    throw new Error(`Unable to invoke report processor: ${error.message}`)
  }
}

export const createReport = createServerFn({ method: 'POST' })
  .inputValidator(createReportInputSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('You must be logged in to create reports.')
    }

    const { data: created, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        file_name: data.fileName,
        status: 'New',
        storage_bucket: data.storageBucket,
        storage_path: data.storagePath,
        mime_type: data.mimeType ?? null,
        file_size_bytes: data.fileSizeBytes ?? null,
      })
      .select(REPORT_COLUMNS)
      .single()

    if (error) {
      throw new Error('Unable to create report.')
    }

    // Fire-and-forget trigger so create flow returns immediately.
    void invokeReportProcessor(created.id, supabase).catch((invokeError) => {
      console.error('Unable to invoke report processor', invokeError)
    })

    return mapRowToReport(reportRowSchema.parse(created))
  })
