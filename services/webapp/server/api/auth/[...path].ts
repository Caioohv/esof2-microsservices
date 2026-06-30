export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const targetBase = config.authServiceUrl

  // Replaces the gateway prefix to route to the internal microservice
  // e.g. /api/auth/login -> /login
  const path = event.path.replace(/^\/api\/auth/, '')
  const targetUrl = `${targetBase}${path}`

  try {
    return await proxyRequest(event, targetUrl, {
      headers: {
        host: new URL(targetBase).host,
      },
    })
  } catch (err: any) {
    console.error(`[Proxy Error] Failed to proxy request to ${targetUrl}:`, err)
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: `Failed to connect to internal auth-service at ${targetUrl}. Details: ${err.message || err}`,
      data: {
        targetUrl,
        code: err.code,
      },
    })
  }
})
