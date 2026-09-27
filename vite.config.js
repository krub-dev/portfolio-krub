import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

import contact from './api/contact.js'

/*
  Asset location: `assets/`, `icons/` and `uploads/` are copied to `public/`,
  not to `src/assets/`. The stack icons and project images are referenced by
  name from the files in `src/data/`, and the CV is a plain link, so stable
  literal paths (`/icons/vuejs/vuejs-original.svg`) are worth more here than
  bundler hashing — otherwise every icon would need its own import or a glob.
  https://vite.dev/config/
*/

/*
  The contact endpoint, in development only.

  api/contact.js is the same file Vercel runs in production, mounted here so
  `npm run dev` can send a real message without the Vercel CLI. It is the reason
  that file is a plain (req, res) handler. The key comes from .env.local, which
  the `*.local` rule already keeps out of git; in production it is an environment
  variable set in the project's settings.

  Deliberately not mounted for `npm run preview`: the end-to-end suite runs
  against a preview build, and a live endpoint would post a real message every
  time the suite ran.
*/
function contactEndpoint() {
  return {
    name: 'krub-contact-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/contact', (req, res, next) => {
        if (req.method !== 'POST') return next()

        // Vite hands a custom middleware the raw stream; the handler expects a
        // body, exactly as Vercel's runtime would have parsed one for it.
        let raw = ''
        req.on('data', (chunk) => {
          raw += chunk
        })
        req.on('end', () => {
          req.body = raw
          contact(req, res)
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.WEB3FORMS_KEY) process.env.WEB3FORMS_KEY = env.WEB3FORMS_KEY

  return {
    plugins: [vue(), contactEndpoint()],

    server: {
      // Bind to every network interface, not just localhost, so a phone on the
      // same Wi-Fi can open the dev server. Vite prints the LAN address as
      // "Network:" when it starts. This is the local network only — nothing is
      // exposed to the internet.
      host: true,
    },
  }
})
