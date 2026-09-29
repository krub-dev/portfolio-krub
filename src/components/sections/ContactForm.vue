<script setup>
/*
  The form, in the middle of Contact.

  The panel is the reference's; the materials are this project's. The fields are
  a line in --line that turns accent on focus rather than a box, and the caret is
  the browser's own, coloured with `caret-color`. A drawn caret is the one detail
  of the reference that cannot be copied honestly: it cannot follow the insertion
  point inside a textarea, so it would sit still while the text moved under it.

  Every string comes from src/locales/ and the address from src/data/. This
  component paints; the state is in useContactForm.
*/
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '../base/BaseButton.vue'
import { useContactForm } from '../../composables/useContactForm'
import { email } from '../../data'

const { t } = useI18n()

// A function, not an object: the labels have to be read at validation time, in
// whatever language is on screen then.
const labels = () => ({
  required: t('form.required'),
  badEmail: t('form.badEmail'),
  shortMessage: t('form.shortMessage'),
})

const { fields, errors, status, errorCode, token, send } = useContactForm(labels)

const statusText = computed(() => {
  if (status.value === 'sent') return t('form.sent')
  if (status.value === 'error') {
    return errorCode.value === 'captcha' ? t('form.captcha') : t('form.error', { email })
  }
  return ''
})

/*
  Turnstile, loaded only with the form and only when its site key is set, so no
  third-party script reaches a visitor who is not going to submit. The token it
  drops is single-use, so the widget is reset after every attempt.
*/
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
const turnstileEl = ref(null)
let widgetId = null
let loader = null

function loadTurnstile() {
  if (!loader) {
    loader = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = resolve
      document.head.appendChild(script)
    })
  }
  return loader
}

onMounted(() => {
  if (!siteKey) return
  loadTurnstile().then(() => {
    widgetId = window.turnstile.render(turnstileEl.value, {
      sitekey: siteKey,
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      callback: (value) => (token.value = value),
      'expired-callback': () => (token.value = ''),
      'error-callback': () => (token.value = ''),
    })
  })
})

onBeforeUnmount(() => {
  if (widgetId !== null && window.turnstile) window.turnstile.remove(widgetId)
})

async function onSubmit() {
  await send()
  // Spent either way: a fresh token is needed for the next attempt.
  if (widgetId !== null && window.turnstile) {
    window.turnstile.reset(widgetId)
    token.value = ''
  }
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <p class="title">{{ t('form.title') }}</p>

    <div class="field">
      <label class="label" for="contact-name">{{ t('form.name') }}</label>
      <input
        id="contact-name"
        v-model="fields.name"
        class="input"
        type="text"
        name="name"
        maxlength="80"
        autocomplete="name"
        :aria-invalid="Boolean(errors.name)"
        :aria-describedby="errors.name ? 'contact-name-error' : undefined"
        @input="errors.name = ''"
      />
      <p v-if="errors.name" id="contact-name-error" class="error">{{ errors.name }}</p>
    </div>

    <div class="field">
      <label class="label" for="contact-email">{{ t('form.email') }}</label>
      <input
        id="contact-email"
        v-model="fields.email"
        class="input"
        type="email"
        name="email"
        maxlength="120"
        autocomplete="email"
        :aria-invalid="Boolean(errors.email)"
        :aria-describedby="errors.email ? 'contact-email-error' : undefined"
        @input="errors.email = ''"
      />
      <p v-if="errors.email" id="contact-email-error" class="error">{{ errors.email }}</p>
    </div>

    <div class="field">
      <label class="label" for="contact-message">{{ t('form.message') }}</label>
      <textarea
        id="contact-message"
        v-model="fields.message"
        class="input"
        name="message"
        rows="4"
        maxlength="4000"
        :aria-invalid="Boolean(errors.message)"
        :aria-describedby="errors.message ? 'contact-message-error' : undefined"
        @input="errors.message = ''"
      />
      <p v-if="errors.message" id="contact-message-error" class="error">{{ errors.message }}</p>
    </div>

    <!--
      The honeypot. Nobody can see or reach it; a bot filling every field it
      finds gets its request thrown away by api/contact.js.
    -->
    <input
      v-model="fields.trap"
      class="trap"
      type="text"
      name="company"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
    />

    <!-- Cloudflare Turnstile, rendered only when its site key is configured. -->
    <div v-if="siteKey" ref="turnstileEl" class="turnstile" />

    <div class="foot">
      <BaseButton variant="solid" size="md" type="submit" :class="{ busy: status === 'sending' }">
        {{ status === 'sending' ? t('form.sending') : t('form.send') }}
      </BaseButton>

      <p class="note">{{ t('form.note', { email }) }}</p>
    </div>

    <!--
      One live region for both outcomes. Empty when idle, and hidden while it is,
      so nothing is announced that has not happened.
    -->
    <p class="status" role="status" aria-live="polite">{{ statusText }}</p>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: clamp(18px, 2.4vw, 26px);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: clamp(20px, 3vw, 34px);
}

.title,
.label {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/*
  A line, not a box: the field's border is the theme's own, and focus turns it
  accent. That colour change is the whole affordance the field needs.
*/
.input {
  border: 0;
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: transparent;
  padding: 8px 0;
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.5;
  color: var(--fg);
  caret-color: var(--acc-text);
  transition: border-color 0.16s ease;
}

.input:focus {
  outline: none;
  border-bottom-color: var(--acc-text);
}

/* Both limits are the ones api/contact.js enforces. maxlength stops the typing;
   the height cap stops the field from being dragged down the page. */
textarea.input {
  min-height: 96px;
  max-height: 240px;
  resize: vertical;
}

.error {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--acc-text);
}

/* Off-screen rather than hidden: some bots skip what is not rendered. */
.trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

/* Turnstile's iframe; room reserved so the panel does not jump when it loads. */
.turnstile {
  min-height: 65px;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
}

.note {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.status {
  margin: 0;
  font-size: 14px;
  color: var(--fg-2);
}

.status:empty {
  display: none;
}

/* On the button itself, which is the child component's root. */
.busy {
  opacity: 0.6;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .input {
    transition: none;
  }
}
</style>
