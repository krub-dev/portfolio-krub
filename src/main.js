import { createApp } from 'vue'

import App from './App.vue'
import { initLang } from './composables/useLang'
import { initTheme } from './composables/useTheme'
import i18n from './i18n'
import router from './router'
import './styles/tokens.css'

// Restore the saved theme and language before mounting, so the first paint is
// already correct instead of flipping once the app boots.
initTheme()
initLang()

createApp(App).use(router).use(i18n).mount('#app')
