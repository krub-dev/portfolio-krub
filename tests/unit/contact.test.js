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
  beforeEach(() => {
    process.env.WEB3FORMS_KEY = 'test-key'
    vi.restoreAllMocks()
  })

  it('refuses anything but a POST', async () => {
    const res = fakeRes()
    await handler({ method: 'GET' }, res)
    expect(res.statusCode).toBe(405)
  })

  it('refuses to send when the key is not configured', async () => {
    delete process.env.WEB3FORMS_KEY
    const res = fakeRes()
    await handler({ method: 'POST', body: GOOD }, res)
    expect(res.statusCode).toBe(500)
  })

  it('rejects a payload the browser would have caught, without calling the service', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = fakeRes()
    await handler({ method: 'POST', body: { ...GOOD, email: 'nope' } }, res)
    expect(res.statusCode).toBe(400)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('drops a filled honeypot as if it had worked', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const res = fakeRes()
    await handler({ method: 'POST', body: { ...GOOD, trap: 'bot' } }, res)
    expect(res.statusCode).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('sends the key and the four fields, and nothing else', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) })

    const res = fakeRes()
    await handler({ method: 'POST', body: { ...GOOD, extra: 'ignored' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.payload).toEqual({ ok: true })

    const sent = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(sent.access_key).toBe('test-key')
    expect(sent.name).toBe('Kiko')
    expect(sent.email).toBe(GOOD.email)
    expect(sent).not.toHaveProperty('extra')
    expect(sent).not.toHaveProperty('trap')
  })

  it('reports a failure from the service instead of pretending', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, json: async () => ({ success: false }) })
    const res = fakeRes()
    await handler({ method: 'POST', body: GOOD }, res)
    expect(res.statusCode).toBe(502)
  })
})
