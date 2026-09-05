import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Asset location: `assets/`, `icons/` and `uploads/` are copied to `public/`,
// not to `src/assets/`. The stack icons and project images are referenced by
// name from the files in `src/data/`, and the CV is a plain link, so stable
// literal paths (`/icons/vuejs/vuejs-original.svg`) are worth more here than
// bundler hashing — otherwise every icon would need its own import or a glob.
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  server: {
    // Bind to every network interface, not just localhost, so a phone on the
    // same Wi-Fi can open the dev server. Vite prints the LAN address as
    // "Network:" when it starts. This is the local network only — nothing is
    // exposed to the internet.
    host: true,
  },
})
