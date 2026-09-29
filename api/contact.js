/*
  POST /api/contact — the contact form's one endpoint.

  Vercel picks this file up as a function because it lives in /api. The same file
  is mounted by vite.config.js in development, which is why it is written as a
  plain (req, res) handler rather than a Vercel-only shape.

  It sends through Resend, not Web3Forms: Web3Forms serves a Cloudflare
  JavaScript challenge to any server-side caller, so it can only be used from the
  browser — and proxying it needs a paid plan and a server-IP safelist. Resend is
  a plain server API with a secret key, which is what this endpoint is for.

  Everything is checked here, and the payload is rebuilt field by field rather
  than forwarded: whatever else a caller sends, Resend only ever sees these.

  The browser's rules are a courtesy to whoever is typing. A rule that only lives
  in the browser is not a rule — anyone can post here directly.
*/
const RESEND = 'https://api.resend.com/emails'
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const LIMITS = { name: 80, email: 120, message: 4000 }
const MIN = { name: 2, message: 10 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// A best-effort limit, not a promise: a serverless instance is one of many and
// can be recycled at any time, so this only ever catches a burst that lands on
// the same one. It is the cheap half of the antispam; Turnstile is the real one.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((at) => now - at < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // a floor under the map, not a cleanup pass
  return recent.length > MAX_PER_WINDOW
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

async function turnstileOk(secret, token, ip) {
  const response = await fetch(SITEVERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  })
  const outcome = await response.json().catch(() => ({}))
  return outcome.success === true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method' })

  const apiKey = (process.env.RESEND_API_KEY ?? '').trim()
  const to = (process.env.CONTACT_TO ?? '').trim()
  if (!apiKey || !to) return json(res, 500, { ok: false, error: 'not-configured' })

  const ip = clientIp(req)
  if (rateLimited(ip)) return json(res, 429, { ok: false, error: 'rate-limited' })

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body ?? {}

  // The honeypot. Answer as if it had worked: a bot that gets an error learns
  // which field to leave alone.
  if (body.trap) return json(res, 200, { ok: true })

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (name.length < MIN.name || name.length > LIMITS.name) {
    return json(res, 400, { ok: false, error: 'name' })
  }
  if (!EMAIL.test(email) || email.length > LIMITS.email) {
    return json(res, 400, { ok: false, error: 'email' })
  }
  if (message.length < MIN.message || message.length > LIMITS.message) {
    return json(res, 400, { ok: false, error: 'message' })
  }

  // Turnstile is required only when its secret is configured, so the form and
  // this handler can still be exercised locally without the keys.
  const turnstileSecret = (process.env.TURNSTILE_SECRET_KEY ?? '').trim()
  if (turnstileSecret) {
    const token = String(body.token ?? '')
    if (!token) return json(res, 400, { ok: false, error: 'captcha' })
    const passed = await turnstileOk(turnstileSecret, token, ip).catch(() => false)
    if (!passed) return json(res, 400, { ok: false, error: 'captcha' })
  }

  const from = (process.env.CONTACT_FROM ?? 'krub.dev <contact@krub.dev>').trim()

  try {
    const response = await fetch(RESEND, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `krub.dev — ${name}`,
        // Resend replies to this address, so the answer goes straight back.
        reply_to: email,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => `http ${response.status}`)
      // Logged for the deploy's function logs and echoed back: the handler
      // swallowing the provider's reason is what turned the first failure into a
      // mystery.
      console.error('[contact] resend rejected:', response.status, detail.slice(0, 300))
      return json(res, 502, { ok: false, error: 'send-failed', detail: detail.slice(0, 300) })
    }

    return json(res, 200, { ok: true })
  } catch (error) {
    console.error('[contact] resend unreachable:', error)
    return json(res, 502, { ok: false, error: 'send-failed', detail: 'unreachable' })
  }
}
