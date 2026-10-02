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
import { RouterLink } from 'vue-router'

import BaseButton from '../base/BaseButton.vue'
import { useContactForm } from '../../composables/useContactForm'
import { useLang } from '../../composables/useLang'
import { useLemonVoice } from '../../composables/useLemonVoice'
import { copy, email } from '../../data'

const { t } = useI18n()
const { lang } = useLang()
// Limonacho says why the send button will not go, when you hover it.
const { say, hush } = useLemonVoice()
const lemon = computed(() => copy.lemon[lang.value])

// A function, not an object: the labels have to be read at validation time, in
// whatever language is on screen then.
const labels = () => ({
  required: t('form.required'),
  badEmail: t('form.badEmail'),
  shortMessage: t('form.shortMessage'),
  consent: t('form.consentRequired'),
})

const { fields, errors, status, errorCode, token, canSend, touch, send } = useContactForm(labels)

const statusText = computed(() => {
  if (status.value === 'sent') return t('form.sent')
  if (status.value === 'error') {
    return errorCode.value === 'captcha' ? t('form.captcha') : t('form.error', { email })
  }
  return ''
})

/*
  Turnstile, loaded only when the form is about to be seen and only when its site
  key is set. The script is 694 KB, so a visitor who never scrolls this far never
  fetches it: an IntersectionObserver loads it as the widget approaches the
  viewport, the same way AboutSection warms the CV. The token it drops is
  single-use, so the widget is reset after every attempt.
*/
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
const turnstileEl = ref(null)
let widgetId = null
let loader = null
let observer = null

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

function renderTurnstile() {
  loadTurnstile().then(() => {
    widgetId = window.turnstile.render(turnstileEl.value, {
      sitekey: siteKey,
      // interaction-only: no badge on the ordinary path, so the form does not
      // carry a "success" box. Cloudflare only shows itself if it has to
      // challenge the visitor.
      appearance: 'interaction-only',
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
      callback: (value) => (token.value = value),
      'expired-callback': () => (token.value = ''),
      'error-callback': () => (token.value = ''),
    })
  })
}

onMounted(() => {
  if (!siteKey) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      renderTurnstile()
    },
    { rootMargin: '400px' },
  )
  observer.observe(turnstileEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
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

/*
  A disabled button does not take mouse events, so the hint is heard on the
  wrapper around it: hovering the send button while it cannot go is the one
  moment the visitor needs telling why.
*/
function onSendHover() {
  if (!canSend.value) say(lemon.value.form)
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
        @blur="touch('name')"
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
        @blur="touch('email')"
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
        @blur="touch('message')"
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

    <!--
      The consent. It is the form's legal basis, so it is required: an empty box
      is validated like an empty field, and api/contact.js refuses a payload
      without it. The native checkbox, tinted with the accent — the honest
      control, which the browser already knows how to draw and announce.
    -->
    <div class="consent">
      <label class="consent-row">
        <input
          v-model="fields.consent"
          class="box"
          type="checkbox"
          :aria-invalid="Boolean(errors.consent)"
          :aria-describedby="errors.consent ? 'contact-consent-error' : undefined"
          @change="touch('consent')"
        />
        <span class="consent-text">
          <i18n-t keypath="form.consent">
            <template #policy>
              <RouterLink class="policy" to="/privacy">{{ t('form.policyLink') }}</RouterLink>
            </template>
          </i18n-t>
        </span>
      </label>

      <p v-if="errors.consent" id="contact-consent-error" class="error">{{ errors.consent }}</p>
    </div>

    <div class="foot">
      <span
        class="send"
        :class="{ blocked: !canSend }"
        @mouseenter="onSendHover"
        @mouseleave="hush()"
      >
        <BaseButton variant="solid" size="md" type="submit" :disabled="!canSend">
          {{ status === 'sending' ? t('form.sending') : t('form.send') }}
        </BaseButton>
      </span>

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

/*
  The consent. A sentence, not a label: set in the sans rather than another
  uppercase mono tag, so it reads as prose. The checkbox is the browser's own,
  tinted with the accent — it already knows how to draw and announce one, and a
  hand-drawn box buys nothing here.
*/
.consent {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.consent-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.box {
  flex: none;
  width: 15px;
  height: 15px;
  margin: 2px 0 0;
  accent-color: var(--acc-text);
  cursor: pointer;
}

.consent-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--fg-2);
}

.policy {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.16s ease;
}

.policy:hover {
  color: var(--acc-text);
}


.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
}

/*
  The wrapper around the send button. A disabled control does not take mouse
  events, so the hint about why it will not go is heard here; the button keeps
  the click target when it is live and steps out of the way when it is not.
*/
.send {
  display: inline-flex;
}

.send.blocked {
  cursor: not-allowed;
}

.send.blocked :deep(.btn) {
  pointer-events: none;
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

@media (prefers-reduced-motion: reduce) {
  .input,
  .policy {
    transition: none;
  }
}
</style>
