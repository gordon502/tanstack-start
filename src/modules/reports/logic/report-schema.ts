import { z } from 'zod'

export const REPORTS_STORAGE_BUCKET = 'reports-input'

export const reportStatusSchema = z.enum([
  'New',
  'Processing',
  'Done',
  'FAILED',
])

export type ReportStatus = z.infer<typeof reportStatusSchema>

export const reportErrorSchema = z.object({
  error_index: z.number().int().nonnegative(),
  error_description: z.string(),
  error: z.string(),
  request_id: z.string(),
})

export type ReportError = z.infer<typeof reportErrorSchema>

const reportErrorsSchema = z.array(reportErrorSchema)

export const reportRowSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  status: reportStatusSchema,
  created_at: z.string(),
  storage_bucket: z.string(),
  storage_path: z.string(),
  mime_type: z.string().nullable(),
  file_size_bytes: z.number().int().nullable(),
  error_payload: z.unknown().nullable(),
})

export const reportSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  status: reportStatusSchema,
  createdAt: z.string(),
  storageBucket: z.string(),
  storagePath: z.string(),
  mimeType: z.string().nullable(),
  fileSizeBytes: z.number().int().nullable(),
  errors: reportErrorsSchema.optional(),
})

export type Report = z.infer<typeof reportSchema>

export const createReportInputSchema = z.object({
  fileName: z.string().trim().min(1, 'File name is required'),
  storageBucket: z.string().trim().min(1).default(REPORTS_STORAGE_BUCKET),
  storagePath: z.string().trim().min(1, 'Storage path is required'),
  mimeType: z.string().trim().min(1).nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
})

export const deleteReportInputSchema = z.object({
  id: z.string().uuid(),
})

export const REPORT_COLUMNS =
  'id,file_name,status,created_at,storage_bucket,storage_path,mime_type,file_size_bytes,error_payload'

function formatCreatedAt(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().replace('T', ' ').slice(0, 19)
}

function parseErrors(value: unknown): ReportError[] | undefined {
  if (value == null) {
    return undefined
  }

  const parsed = reportErrorsSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function mapRowToReport(row: z.infer<typeof reportRowSchema>): Report {
  return reportSchema.parse({
    id: row.id,
    fileName: row.file_name,
    status: row.status,
    createdAt: formatCreatedAt(row.created_at),
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    errors: parseErrors(row.error_payload),
  })
}
