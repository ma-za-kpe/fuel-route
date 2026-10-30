# Working on this site

This repository was created and is published by Yard Crew's trusted delivery
code. It is a Next.js app (App Router, TypeScript) exported as a static site
for GitHub Pages. People and agents who change it follow the same rules.

- **What the crew writes.** Pages, layouts and components under `app/` and
  `components/`, styles (`app/globals.css`, CSS modules, `styles/`) and
  static files in `public/`. Keep colours, sizes and spacing in the design
  tokens at the top of `app/globals.css`.
- **Content in one place.** The brief's facts the pages show (prices, hours,
  contact, copy) are in `app/content.json`, and pages read them as
  `{facts.F1}`, never as copied text, so the owner changes a value without
  touching code. `tests/test_content.py` checks the file on every change.
- **What is frozen.** `tests/` belongs to the owner (CODEOWNERS): never edit
  it to make a change pass. `.github/`, `next.config.ts`, `package.json`,
  `package-lock.json` and `tsconfig.json` are platform files: a change needs
  the platform review's approval, keeps every version exact (no `^`, `~` or
  `latest`) and keeps the lockfile in step.
- **Static export only.** `output: "export"`: no API routes, server actions,
  middleware, `next/image` optimisation, cookies or runtime environment.
  Everything in the export is public. No keys, trackers or third-party
  scripts.
- **Built by trusted code.** `npm ci` and `npm run build` run in a pinned
  container with no network for the build. The base path (`NEXT_BASE_PATH`)
  and release marker (`SITE_RELEASE`) are set by the build, never by page
  code. Use `next/link` for links so the base path applies.
- **Test first.** The frozen tests run on the exported HTML in `out/`:
  `npm run build && python tests/site_view.py && python -m unittest discover -s tests`.
  `tests/test_brief.py`, when present, is generated from the approved brief
  and fails until the pages meet it.
- **Checked in a real browser.** CI also runs `tests/browser/qa.mjs` on the
  export at phone and desktop sizes: no overflow, keyboard focus, reduced
  motion and no axe WCAG 2.1 AA violations.
- **Accessible by default.** One `h1` per page, header, main and footer
  landmarks, alt text, visible focus, sufficient contrast, reduced-motion
  support.
- **Clean up after yourself.** No `node_modules`, `.next`, `out` or `site`
  in Git; keep files small.
- **Evidence over claims.** A change is done when the tests pass and the
  published page shows its release marker. The crew's trusted release
  publishes `main` after its checks pass (a merge alone does not), and a
  release counts only once the live page shows it.
