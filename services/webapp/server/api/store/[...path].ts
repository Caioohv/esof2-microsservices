export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const targetBase = config.storeServiceUrl

  // Replaces the gateway prefix to route to the internal microservice
  // e.g. /api/store/products -> /products (or /store/products depending on store-service routing)
  // Let's check: store-service has route /store/... so if the frontend calls /api/store/...,
  // we want to proxy it. Wait! In store-service, it mounts routes on /store (e.g. app.use('/store', storeRoutes)).
  // If the path is /api/store/some-route, and we replace /api/store with /store, wait, if targetBase is
  // http://store-service:3004, and path is /store/some-route, then targetUrl is http://store-service:3004/store/some-route.
  // Wait, if we replace /api/store with nothing, e.g. event.path is /api/store/stores, replacing /api/store yields /stores.
  // But store-service routes are under /store/..., so if targetUrl needs to be http://store-service:3004/store/stores,
  // we should map /api/store/... to http://store-service:3004/store/... !
  // Let's do:
  const path = event.path.replace(/^\/api\/store/, '/store')
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
      message: `Failed to connect to internal store-service at ${targetUrl}. Details: ${err.message || err}`,
      data: {
        targetUrl,
        code: err.code,
      },
    })
  }
})
