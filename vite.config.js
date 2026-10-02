import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

/*
  Asset location: `assets/`, `icons/` and `uploads/` are copied to `public/`,
  not to `src/assets/`. The stack icons and project images are referenced by
  name from the files in `src/data/`, and the CV is a plain link, so stable
  literal paths (`/icons/vuejs/vuejs-original.svg`) are worth more here than
  bundler hashing — otherwise every icon would need its own import or a glob.
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
const isLocal = (address) =>
  address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'

function contactEndpoint() {
  return {
    name: 'krub-contact-endpoint',
    async configureServer(server) {
      // Imported here rather than at the top of the file: the dev-only endpoint
      // must not be able to break `vite build` with a syntax error, and the
      // production bundle has no use for it.
      const { default: contact } = await import('./api/contact.js')

      server.middlewares.use('/api/contact', (req, res, next) => {
        if (req.method !== 'POST') return next()

        // `host: true` below puts the dev server on the LAN so a phone can read
        // the site. It must not also hand that network a live endpoint that
        // sends real mail with the key from .env.local, so only loopback posts.
        if (!isLocal(req.socket?.remoteAddress)) {
          res.statusCode = 403
          return res.end('The contact endpoint is local-only in development.')
        }

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

  /*
    The server-side keys, handed to the process so the dev endpoint can read them
    the way Vercel does in production. None of these is VITE_-prefixed on purpose:
    nothing here may reach the bundle.
  */
  for (const name of ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'TURNSTILE_SECRET_KEY']) {
    if (env[name]) process.env[name] = env[name]
  }

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
