/*
  Warming the CV before it is asked for.

  pdf.js, its worker and the PDF are about 610 KB gzipped together — more than the
  3D scene — so they are not loaded with the page: a visitor who never looks at
  the CV should not pay for them. They are fetched the moment there is a sign of
  intent instead, so the dialog is usually ready by the time it is opened.

  Three fetches, because importing pdf.js only pulls the core:
    - the core, through the dynamic import;
    - the worker, which is a file of its own and is not fetched by importing its
      URL, so it is asked for with a prefetch;
    - the document itself, the same URL the dialog will open.

  Once per visit: `warmed` is module state, so a second hover costs nothing.
*/

let warmed = false

function prefetch(url) {
  if (!url || document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

export function warmCv(href) {
  if (warmed) return
  warmed = true

  import('pdfjs-dist/legacy/build/pdf.mjs')
  import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url').then(({ default: url }) => prefetch(url))
  prefetch(href)
}
