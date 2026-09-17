/*
  POST /api/contact — the only place the Web3Forms key is used.

  Vercel picks this file up as a function because it lives in /api, and the key
  arrives as an environment variable (WEB3FORMS_KEY, set in the project's
  settings), so it is never in the bundle the browser downloads. The same file is
  mounted by vite.config.js in development, which is why it is written as a plain
  (req, res) handler rather than a Vercel-only shape.

  Everything is checked again here, and the payload is rebuilt field by field
  rather than forwarded: whatever else a caller sends, Web3Forms only ever sees
  these four keys.

  The browser's rules are a courtesy to whoever is typing. A rule that only lives
  in the browser is not a rule — anyone can post here directly.
*/
const WEB3FORMS = 'https://api.web3forms.com/submit'

const LIMITS = { name: 80, email: 120, message: 4000 }
const MIN = { name: 2, message: 10 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method' })

  const key = process.env.WEB3FORMS_KEY
  if (!key) return json(res, 500, { ok: false, error: 'not-configured' })

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

  try {
    const response = await fetch(WEB3FORMS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: `krub.dev — ${name}`,
        from_name: name,
        // Web3Forms replies to this address, so the answer goes straight back.
        email,
        name,
        message,
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.success === false) throw new Error('rejected')

    return json(res, 200, { ok: true })
  } catch {
    return json(res, 502, { ok: false, error: 'send-failed' })
  }
}
