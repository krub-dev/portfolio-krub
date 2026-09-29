import { beforeEach, describe, expect, it, vi } from 'vitest'

import handler from '../../api/contact.js'
import { hasErrors, validateContact } from '../../src/utils/contact'

const LABELS = { required: 'required', badEmail: 'bad', shortMessage: 'short' }
const GOOD = {
  name: 'Kiko',
  email: 'kikorubioillan@gmail.com',
  message: 'Hola, te escribo por lo del backend.',
}

function fakeRes() {
  return {
    statusCode: 0,
    headers: {},
    payload: null,
    setHeader(key, value) {
      this.headers[key] = value
    },
    end(body) {
      this.payload = JSON.parse(body)
    },
  }
}

describe('validateContact', () => {
  it('passes a complete message', () => {
    expect(hasErrors(validateContact(GOOD, LABELS))).toBe(false)
  })

  it('asks for each missing field', () => {
    const errors = validateContact({ name: '', email: '', message: '' }, LABELS)
    expect(errors).toEqual({ name: 'required', email: 'required', message: 'required' })
  })

  it('tells an empty address apart from a malformed one', () => {
    expect(validateContact({ ...GOOD, email: '' }, LABELS).email).toBe('required')
    expect(validateContact({ ...GOOD, email: 'kiko@' }, LABELS).email).toBe('bad')
    expect(validateContact({ ...GOOD, email: 'kiko@gmail' }, LABELS).email).toBe('bad')
  })

  it('wants more than one word for the message', () => {
    expect(validateContact({ ...GOOD, message: 'hola' }, LABELS).message).toBe('short')
  })
})

describe('the contact endpoint', () => {
  // A fresh client each call, so the endpoint's per-IP rate limit never carries
  // between tests.
  let n = 0
  const req = (body, method = 'POST') => ({
    method,
    body,
    headers: { 'x-forwarded-for': `10.0.0.${++n}` },
  })

  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_TO = 'owner@example.com'
    delete process.env.TURNSTILE_SECRET_KEY
    vi.restoreAllMocks()
  })

  it('refuses anything but a POST', async () => {
    const res = fakeRes()
    await handler(req(GOOD, 'GET'), res)
    expect(res.statusCode).toBe(405)
  })

  it('refuses to send when it is not configured', async () => {
    delete process.env.RESEND_API_KEY
    const res = fakeRes()
    await handler(req(GOOD), res)
    expect(res.statusCode).toBe(500)
  })

  it('rejects a payload the browser would have caught, without calling the service', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = fakeRes()
    await handler(req({ ...GOOD, email: 'nope' }), res)
    expect(res.statusCode).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('drops a filled honeypot as if it had worked', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = fakeRes()
    await handler(req({ ...GOOD, trap: 'bot' }), res)
    expect(res.statusCode).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('sends a rebuilt payload, and nothing else', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true })

    const res = fakeRes()
    await handler(req({ ...GOOD, extra: 'ignored', trap: '' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.payload).toEqual({ ok: true })

    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key')
    const sent = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(sent.to).toEqual(['owner@example.com'])
    expect(sent.reply_to).toBe(GOOD.email)
    expect(sent.text).toContain('Kiko')
    expect(sent.text).toContain(GOOD.message)
    expect(sent).not.toHaveProperty('extra')
    expect(sent).not.toHaveProperty('trap')
  })

  it('demands a Turnstile token when its secret is configured', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = fakeRes()
    await handler(req(GOOD), res)
    expect(res.statusCode).toBe(400)
    expect(res.payload.error).toBe('captcha')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('reports a failure from the service instead of pretending', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, text: async () => 'nope' })
    const res = fakeRes()
    await handler(req(GOOD), res)
    expect(res.statusCode).toBe(502)
  })
})
