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
import { computed } from 'vue'
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

const { fields, errors, status, send } = useContactForm(labels)

const statusText = computed(() => {
  if (status.value === 'sent') return t('form.sent')
  if (status.value === 'error') return t('form.error', { email })
  return ''
})
</script>

<template>
  <form class="form" novalidate @submit.prevent="send">
    <p class="title">{{ t('form.title') }}</p>

    <div class="field">
      <label class="label" for="contact-name">{{ t('form.name') }}</label>
      <input
        id="contact-name"
        v-model="fields.name"
        class="input"
        type="text"
        name="name"
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
  font-size: 10px;
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

textarea.input {
  min-height: 96px;
  resize: vertical;
}

.error {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
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

.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
}

.note {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
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
