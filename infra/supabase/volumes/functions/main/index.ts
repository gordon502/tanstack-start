console.log('main function started')

const VERIFY_JWT = Deno.env.get('VERIFY_JWT') === 'true'

function getServiceName(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  return parts[0] ?? ''
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'OPTIONS' && VERIFY_JWT) {
    const auth = req.headers.get('authorization')
    if (!auth) {
      return new Response(
        JSON.stringify({ msg: 'Missing authorization header' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  }

  const url = new URL(req.url)
  const serviceName = getServiceName(url.pathname)

  if (!serviceName) {
    return new Response(
      JSON.stringify({ msg: 'missing function name in request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const servicePath = `/home/deno/functions/${serviceName}`
  const memoryLimitMb = 150
  const workerTimeoutMs = 60 * 1000
  const noModuleCache = false
  const importMapPath = null
  const envVarsObj = Deno.env.toObject()
  const envVars = Object.keys(envVarsObj).map((key) => [key, envVarsObj[key]])

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb,
      workerTimeoutMs,
      noModuleCache,
      importMapPath,
      envVars,
    })

    return await worker.fetch(req)
  } catch (error) {
    return new Response(JSON.stringify({ msg: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
