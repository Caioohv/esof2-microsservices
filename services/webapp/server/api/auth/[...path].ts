export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const targetBase = config.authServiceUrl

  // Replaces the gateway prefix to route to the internal microservice
  // e.g. /api/auth/login -> /login
  const path = event.path.replace(/^\/api\/auth/, '')
  const targetUrl = `${targetBase}${path}`

  return proxyRequest(event, targetUrl)
})
