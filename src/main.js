import { createApp } from 'vue'

import App from './App.vue'
import { initAccent } from './composables/useAccent'
import { initLang } from './composables/useLang'
import { initTheme } from './composables/useTheme'
import i18n from './i18n'
import router from './router'
import './styles/tokens.css'

// Restore the saved theme, accent and language before mounting, so the first
// paint is already correct instead of flipping once the app boots.
initTheme()
initAccent()
initLang()

createApp(App).use(router).use(i18n).mount('#app')
