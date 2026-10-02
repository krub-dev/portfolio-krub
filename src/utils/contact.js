/*
  The contact form's rules, as a pure function.

  Here rather than inside the composable so it can be tested without a browser:
  no mounting, no fetch, no fixtures — the same reason format.js exists. The
  labels are passed in rather than imported, so this file stays free of i18n.

  api/contact.js runs its own copy of these rules. A rule that only lives in the
  browser is not a rule: anyone can post to the endpoint directly.
*/
const MIN = { name: 2, message: 10 }
// Kept in step with the copy in api/contact.js by hand: the server's is the one
// that actually matters, this one only saves a round trip.
const EMAIL = /^[^\s@,;:"()<>[\]\\]+@[^\s@,;:"()<>[\]\\]+\.[^\s@,;:"()<>[\]\\]{2,}$/

export function validateContact({ name, email, message, consent }, labels) {
  const errors = { name: '', email: '', message: '', consent: '' }

  const trimmedEmail = email.trim()
  if (name.trim().length < MIN.name) errors.name = labels.required
  if (!trimmedEmail) errors.email = labels.required
  else if (!EMAIL.test(trimmedEmail)) errors.email = labels.badEmail
  if (message.trim().length < MIN.message) {
    errors.message = message.trim() ? labels.shortMessage : labels.required
  }
  // The consent is the form's legal basis, so an empty box blocks the send the
  // same way an empty field does.
  if (!consent) errors.consent = labels.consent

  return errors
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean)
