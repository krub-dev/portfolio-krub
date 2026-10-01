---
name: final-audit
description: Use when running the final, pre-publication audit of this portfolio or a similar static front-end project — the SEO, accessibility (WCAG/axe), performance (Lighthouse), security, links and content sweep that has to pass before the repository goes public. Trigger on "final audit", "audit", "pre-publication", "before going public", "Lighthouse", "accessibility pass", "WCAG", "axe".
---

# Final audit

A repeatable sweep for the last pass before a static front-end project goes public — this portfolio
(Vue 3 + Vite on Vercel) or one built the same way. Run it, record pass / fail / deferred for every
line, and fix or file the rest. A checklist that is not written down is a checklist that gets run
twice.

## Before you start

- Read the project's own rules first (`AGENTS.md`) and its docs (`docs/design-spec.md`,
  `docs/decisions.md`, `docs/backlog.md`). The audit must respect them; where the spec and the log
  disagree, the log wins.
- Run the whole verification, not a subset. Here: `npm run build`, `npm run test` and
  `npm run test:e2e`. If any is red, stop and fix it before auditing.
- Audit the **deployed build** for anything that depends on the network — headers, redirects,
  Lighthouse, the social preview. `E2E_BASE_URL` points the suite at a deployment.

## The checklist

### Secrets and transport
- Nothing sensitive in the client bundle: grep the built `dist/` for key names (`RESEND`,
  `TURNSTILE_SECRET`, `CONTACT_`) and confirm only the intended public ones (a `VITE_` site key) are
  there.
- HTTPS enforced; apex and `www` resolve to one canonical host.
- Server-only env vars set in the host, never committed; `.env.local` ignored.

### SEO and metadata
- One `<title>` and one `meta[name=description]` per route; descriptions around 150–160 chars.
- `canonical`, Open Graph and Twitter tags, absolute URLs, `og:image` with its `width`/`height`.
- `sitemap.xml` and `robots.txt` present and correct (no `Disallow: /`).
- Structured data (JSON-LD) valid and matching the page.
- Favicon (SVG) plus the iOS touch icon; `theme-color` per scheme.

### Content and copy
- No visible string hardcoded in a template (the house rule): it comes from the data or the locales,
  both languages in step.
- Every image has real `alt` text, or is decorative and hidden.
- No em dashes in visitor-facing copy if the project bans them; no placeholders, TODOs or dead links.

### Accessibility (WCAG AA)
- An automated pass (axe / Lighthouse a11y) on every route; fix what it finds.
- Keyboard: everything reachable and operable, focus visible, focus trapped in dialogs and given back
  on close.
- Contrast at 4.5:1 for text (3:1 for large text and boundaries).
- Landmarks and headings in order, `lang` set, `prefers-reduced-motion` honoured.

### Performance
- Lighthouse mobile and desktop against the deployment; note LCP, CLS, TBT and total weight.
- Images compressed and sized (no 1× viewport captures served to retina); fonts self-hosted with
  `font-display: swap`.
- No layout shift from late content; heavy chunks (3D, PDF) lazy and out of the initial bundle.

### Links, forms and errors
- Every internal anchor and outbound link checked (no 404s; `target="_blank"` always with
  `rel="noopener"`).
- A real 404 route.
- The form validates and shows its errors; spam protection (captcha / rate limit) works; the privacy
  notice is linked.

### Security
- `npm audit` (or the host's scanner) clean of high and critical.
- No `eval`, no unvalidated input reaching the server, no HTML-injection sink.
- Security headers where feasible (CSP, `X-Content-Type-Options`, `Referrer-Policy`).

### Cookies, analytics, legal
- Decide on analytics before adding it: a tool that sets a cookie pulls in a consent banner the
  project may not have.
- Privacy notice, and only the terms the project actually needs.

### Housekeeping
- Repository public-ready: no secrets in history, a licence, a README that matches reality.
- The docs (decisions, backlog, components) reflect what shipped.
- Every dev-only route and scaffolding gone from the production build.

## Reporting

Record the result in `docs/backlog.md` (or a dedicated audit note): the item, the command that
produced it, and the number. Keep the "already in place" items marked as verified, not rebuilt.
