import { computed, reactive, ref, watch } from 'vue'

import { config } from '../data'
import { hasErrors, validateContact } from '../utils/contact'

/*
  The contact form: the fields, their errors, the consent and the one request.

  The state lives here rather than in the component, which only paints — the rule
  from docs/components.md. Nothing here knows the mail provider's key: the
  request goes to our own endpoint and api/contact.js is what talks to the
  service, holding the key as a server-side environment variable.

  Validation is "reward early, punish late": a field shows its error only once the
  visitor has left it, and from then on it updates live, so a mistake clears the
  moment it is fixed. `canSend` is that same verdict, which is what keeps the send
  button off until the four things are right.

  `status` is one of idle / sending / sent / error, and the component reads it to
  decide what the button says and what the live region announces.
*/
export function useContactForm(labels) {
  const fields = reactive({ name: '', email: '', message: '', trap: '', consent: false })
  const errors = reactive({ name: '', email: '', message: '', consent: '' })
  // What the visitor has already left, or tried to send. Nothing shows before it.
  const touched = reactive({ name: false, email: false, message: false, consent: false })
  const status = ref('idle')
  // The endpoint's error code, so the form can say more than "failed" — a captcha
  // that expired reads differently from a send that broke.
  const errorCode = ref('')
  // The Turnstile token, set by the widget in ContactForm. Empty without the key,
  // which is how the form runs locally.
  const token = ref('')

  // The rules, run against whatever is in the fields right now.
  const verdict = () => validateContact(fields, labels())

  // The button's state: everything passes and nothing is in flight.
  const canSend = computed(() => !hasErrors(verdict()) && status.value !== 'sending')

  // Repaint the errors the visitor is allowed to be shown.
  function refresh() {
    const result = verdict()
    for (const key of Object.keys(errors)) {
      errors[key] = touched[key] ? result[key] : ''
    }
  }

  // Called when a field loses focus, or when the consent box is ticked.
  function touch(field) {
    touched[field] = true
    refresh()
  }

  // A change to a field the visitor has already met updates its error live.
  watch(fields, refresh)

  async function send() {
    // The button is off while sending, but a second Enter press can still get
    // here before the state has painted.
    if (status.value === 'sending') return

    // Submitting shows everything at once, touched or not.
    for (const key of Object.keys(touched)) touched[key] = true
    const result = verdict()
    Object.assign(errors, result)
    if (hasErrors(result)) return

    status.value = 'sending'
    errorCode.value = ''

    try {
      const response = await fetch(config.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          trap: fields.trap,
          consent: fields.consent,
          token: token.value,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) {
        errorCode.value = data.error ?? ''
        throw new Error(data.error ?? 'request failed')
      }

      status.value = 'sent'
      fields.name = ''
      fields.email = ''
      fields.message = ''
      fields.consent = false
      // Empty again: it must not scold the visitor for fields they just cleared.
      for (const key of Object.keys(touched)) touched[key] = false
    } catch {
      // The message is not lost: it is still in the textarea, and the component
      // shows the address to write to instead.
      status.value = 'error'
    }
  }

  return { fields, errors, status, errorCode, token, canSend, touch, send }
}
