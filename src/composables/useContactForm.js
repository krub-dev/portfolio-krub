import { reactive, ref } from 'vue'

import { config } from '../data'
import { hasErrors, validateContact } from '../utils/contact'

/*
  The contact form: the fields, their errors and the one request.

  The state lives here rather than in the component, which only paints — the rule
  from docs/components.md. Nothing here knows the Web3Forms key: the request goes
  to our own endpoint and api/contact.js is what talks to the service, holding
  the key as a server-side environment variable.

  `status` is one of idle / sending / sent / error, and the component reads it to
  decide what the button says and what the live region announces.
*/
export function useContactForm(labels) {
  const fields = reactive({ name: '', email: '', message: '', trap: '' })
  const errors = reactive({ name: '', email: '', message: '' })
  const status = ref('idle')

  async function send() {
    // The button is disabled while sending, but a second Enter press can still
    // get here before the state has painted.
    if (status.value === 'sending') return

    Object.assign(errors, validateContact(fields, labels()))
    if (hasErrors(errors)) return

    status.value = 'sending'

    try {
      const response = await fetch(config.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          trap: fields.trap,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) throw new Error(data.error ?? 'request failed')

      status.value = 'sent'
      fields.name = ''
      fields.email = ''
      fields.message = ''
    } catch {
      // The message is not lost: it is still in the textarea, and the component
      // shows the address to write to instead.
      status.value = 'error'
    }
  }

  return { fields, errors, status, send }
}
