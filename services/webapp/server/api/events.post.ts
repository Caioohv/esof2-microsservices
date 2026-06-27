const ALLOWED_EVENTS = new Set([
  'login_success',
  'login_failure',
  'register_success',
  'register_failure',
  'client_validation_error',
])

interface EventBody {
  event: string
  level?: string
  data?: Record<string, unknown>
}

export default defineEventHandler(async (h3Event) => {
  const body = await readBody<EventBody>(h3Event)

  if (!body?.event || !ALLOWED_EVENTS.has(body.event)) {
    throw createError({ statusCode: 400, message: 'unknown event' })
  }

  const level = body.level === 'warn' || body.level === 'error' ? body.level.toUpperCase() : 'INFO'
  const ip = getRequestIP(h3Event, { xForwardedFor: true }) ?? 'unknown'

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'webapp',
    event: body.event,
    ip,
    ...(body.data ?? {}),
  }

  process.stdout.write(JSON.stringify(entry) + '\n')

  return { ok: true }
})
