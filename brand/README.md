# Brand assets

The vector logo and anything derived from it that is **not** served by the site.

The Open Graph banner is the exception and lives in `public/assets/img/og-banner.png`, because
crawlers fetch it from the live site. Everything else that gets uploaded by hand — a LinkedIn
header, a square avatar — belongs here, outside `public/`, since anything in `public/` ships
with every deploy.

## og-banner.png (in public/)

1200×630, the Open Graph ratio. The page background with its 72px grid, the stacked KIKO /
RUBIO in the hero's colours, the headline, the yellow rule, three differentiated info lines,
and the logo with `.dev` bottom-aligned to it.

**It contains text.** If the headline, the role or the locations change, it has to be
regenerated — it is a rendered artifact and cannot read from `src/data/`.
