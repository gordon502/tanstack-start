import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0'

type ReportJob = {
  id: number
  report_id: string
  job_type: 'set_processing' | 'set_done'
  run_at: string
  attempt_count: number
}

const MAX_JOBS_PER_INVOCATION = 4
const MAX_WAIT_MS = 20_000
const MAX_INVOCATION_MS = 75_000

function isServiceRoleRequest(request: Request, serviceRoleKey: string) {
  const authorization = request.headers.get('authorization')
  const tokenMatch = authorization?.match(/^Bearer\s+(.+)$/i)

  if (!tokenMatch) {
    return false
  }

  return tokenMatch[1].trim() === serviceRoleKey
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function markJobDone(
  supabaseAdmin: ReturnType<typeof createClient>,
  jobId: number,
) {
  await supabaseAdmin
    .from('report_jobs')
    .update({
      status: 'done',
      finished_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('id', jobId)
}

async function markJobFailed(
  supabaseAdmin: ReturnType<typeof createClient>,
  job: ReportJob,
  reason: string,
) {
  await supabaseAdmin
    .from('report_jobs')
    .update({
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_message: reason,
    })
    .eq('id', job.id)

  await supabaseAdmin
    .from('reports')
    .update({
      status: 'FAILED',
      error_payload: [
        {
          error_index: 1,
          error_description: reason,
          error: 'PROCESSING_ERROR',
          request_id: `job_${job.id}`,
        },
      ],
      processing_finished_at: new Date().toISOString(),
    })
    .eq('id', job.report_id)
}

async function processJob(
  supabaseAdmin: ReturnType<typeof createClient>,
  job: Pick<ReportJob, 'id' | 'report_id' | 'job_type'>,
) {
  if (job.job_type === 'set_processing') {
    const { error: updateError } = await supabaseAdmin
      .from('reports')
      .update({
        status: 'Processing',
        error_payload: null,
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', job.report_id)

    if (updateError) {
      throw new Error(`Unable to set Processing status: ${updateError.message}`)
    }

    const { error: enqueueError } = await supabaseAdmin
      .from('report_jobs')
      .insert({
        report_id: job.report_id,
        job_type: 'set_done',
        run_at: new Date(Date.now() + 15_000).toISOString(),
      })

    if (enqueueError) {
      throw new Error(`Unable to enqueue Done step: ${enqueueError.message}`)
    }

    return
  }

  const { error: doneError } = await supabaseAdmin
    .from('reports')
    .update({
      status: 'Done',
      processing_finished_at: new Date().toISOString(),
    })
    .eq('id', job.report_id)

  if (doneError) {
    throw new Error(`Unable to set Done status: ${doneError.message}`)
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return Response.json(
      { error: 'Missing Supabase environment variables' },
      { status: 500 },
    )
  }

  if (!isServiceRoleRequest(request, supabaseServiceRoleKey)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  let reportId: string | null = null
  try {
    const body = (await request.json()) as { reportId?: string }
    reportId = body.reportId ?? null
  } catch {
    // Ignore empty body and process any due jobs.
  }

  const startedAt = Date.now()
  let processedJobs = 0

  while (
    processedJobs < MAX_JOBS_PER_INVOCATION &&
    Date.now() - startedAt < MAX_INVOCATION_MS
  ) {
    let query = supabaseAdmin
      .from('report_jobs')
      .select('id,report_id,job_type,run_at,attempt_count')
      .eq('status', 'pending')
      .order('run_at', { ascending: true })
      .limit(1)

    if (reportId) {
      query = query.eq('report_id', reportId)
    }

    const { data: jobs, error: loadError } = await query

    if (loadError) {
      return Response.json(
        { error: `Unable to load report jobs: ${loadError.message}` },
        { status: 500 },
      )
    }

    if (!jobs || jobs.length === 0) {
      break
    }

    const job = jobs[0] as ReportJob
    const waitMs = new Date(job.run_at).getTime() - Date.now()

    if (waitMs > 0) {
      if (waitMs > MAX_WAIT_MS) {
        break
      }

      await sleep(waitMs)
    }

    const { data: claimedJob, error: claimError } = await supabaseAdmin
      .from('report_jobs')
      .update({
        status: 'processing',
        attempt_count: job.attempt_count + 1,
        started_at: new Date().toISOString(),
      })
      .eq('id', job.id)
      .eq('status', 'pending')
      .select('id,report_id,job_type')
      .single()

    if (claimError || !claimedJob) {
      continue
    }

    try {
      await processJob(supabaseAdmin, claimedJob)
      await markJobDone(supabaseAdmin, claimedJob.id)
      processedJobs += 1
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown report processing error'
      await markJobFailed(supabaseAdmin, job, message)
      processedJobs += 1
    }
  }

  return Response.json({
    processedJobs,
    reportId,
  })
})
