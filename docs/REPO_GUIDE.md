# Repo guide: where everything is

One page. For the layout rules and access levels see [architecture.md](architecture.md); for wording see [copy.md](copy.md).

## What this is
A personal portfolio site (`frontend/`) that is only the portfolio. Brandbook Maker, CV Maker and Gym Tracker are separate projects (ADR 0007); this site links to them from `shared/content/projects.js`.

## Folders
| Path | What it is |
|---|---|
| `frontend/src/app/` | `App.jsx`: the route table. Every page except Home loads on demand. |
| `frontend/src/modules/<feature>/` | One folder per feature: `portfolio` (Home, About, Portfolio, /design), `blog`, `admin` (sign-in and the owner's screens), `legal`, `contact`, `colophon`. |
| `frontend/src/shared/` | Things any module may use: `ui` (buttons, inputs, modal...), `layout` (header, footer, page shell), `errors`, `animations`, `catalog` (searchable list page), `hooks`, `config` (brand, tokens, profile, effects, features). |
| `frontend/functions/` | The Worker: `worker.ts` (routing table, request id and log line, errors, security headers), `domain/` (projects, posts, messages, admin: rules and SQL), `app/` (public and admin HTTP handlers) and `infra/` (D1 type, HTTP helpers). See [architecture.md](architecture.md). |
| `frontend/db/migrations/` | Plain SQL migrations for the D1 database, numbered in order (`docs/database.md`). |
| `frontend/public/` | Favicon, web manifest, fonts and project screenshots (`projects/`). |
| `docs/` | This guide, architecture, copy rules, workflow guide, [easter eggs](easter-eggs.md), [observability](observability.md), [ascii](ascii.md), [architecture plan](architecture-plan.md). |
| `.github/workflows/` | CI (`gatekeeper.yml`: unit tests on PRs). |
| `graphify-out/` | A graph of the code for AI tools (ignored by git; refresh with `graphify update .`). |

## Docs index
- Decisions: `docs/adr/` (one file per decision, index in its README).
- Running the owner's parts: `docs/admin.md` (sign-in, posts, messages, projects), `docs/database.md`, `docs/backup.md`, `docs/observability.md`, `docs/limits.md`.
- How it should look and read: `docs/brand.md`, `docs/copy.md`, `docs/ascii.md`, `docs/easter-eggs.md`.
- Shipping: `docs/launch-checklist.md`, `docs/RELEASING.md`, `docs/WORKFLOW.md`.

**Rules that a test enforces:** `shared/` never imports `modules/` or `app/`; a module imports only `shared/` or itself. Colors are never hard-coded: use the Tailwind tokens (`text-cyber-pink`).

## Run it
```bash
cd frontend
nvm use                      # Node 24 (.nvmrc)
npm install
cp .env.example .env.local   # optional, nothing is required
npm run dev                  # http://localhost:5173
npm run lint && npm run test:unit && npm run build   # same checks CI runs
```
Optional: `.dev.vars` (copy `.dev.vars.example`) holds optional server secrets.

## Contact card (`/card`, `/card/share`)
Two static pages for meeting people: `/card` (name and a button per link) and `/card/share` (a QR code that opens `/card`, with the address under it). They are plain HTML with inline CSS and no JavaScript, so they show at once; they are not React routes. Source: `frontend/src/modules/card/` (`cardPages.js` the pages, `qr.js` a small QR encoder, `qrSvg.js` the drawing). `vite.config.js` writes them into `dist/` (`card.html`, `card/share.html`, the `.vcf`) and serves them in `npm run dev`. The list of links is `shared/config/contactLinks.js` (URLs from `profile.js`; a link set to `null` has no button), shared with the Contact page, which links to both pages with a plain `<a href>` because they are not React routes. Tapping the address under the QR opens the phone's share sheet (WhatsApp, Messenger…) or, with a mouse, copies it; that is the only script on these pages (`public/card/share.js`, same origin, so the CSP allows it), and without it the link just opens `/card`. `/card/share` is white on black by default; its "Light QR for older phones" button flips it with CSS only. The built QR points at `brand.publicUrl`, so after a domain change rebuild and print a new one. The phone number in the `.vcf` is kept out of git: the build reads `CARD_PHONE` (e.g. `CARD_PHONE=+48 600 000 000`) from `frontend/.env.local` locally and from the Cloudflare build variables (Workers Builds → Settings → Build → Variables) in production; when it is not set the `.vcf` simply has no phone. It is not shown on the pages, but anyone who downloads the `.vcf` sees it. To scan it from a phone locally, run `npm run dev -- --host` and open the page by the network address it prints: the QR then points there.

## Decisions
Architecture decisions are recorded in [adr/](adr/README.md).

## Branches and PRs
- **Integration branch:** `feat/auth-and-BrandBookEditor`. All work merges here through PRs, and it merges into `main` at launch. (`develop` is retired; see [WORKFLOW.md](WORKFLOW.md).)
- **Branch names:** `feature/GNR-<n>` or `hotfix/GNR-<n>`, where `GNR-<n>` is the ticket.
- **Commits:** `type(scope): summary`. Never commit straight to the integration branch or `main`.
- **Stacked PRs:** if one PR builds on another, set each PR's base to the previous branch **and retarget it to the integration branch before merging**, or it merges into its parent and never arrives.
- **Tickets** live in your ticket tool (export: `GNR-export.json`). A ticket is Done when its PR has merged into the integration branch.

## Build variables (contact details)
Set in Cloudflare Workers Builds → Settings → **Build** → Variables and secrets (not the runtime ones), or in `frontend/.env.local` for `npm run dev`. All are optional: when one is missing or invalid, the value in `frontend/src/shared/config/profile.js` is used, so a deploy never breaks. A change takes effect on the next build (Deployments → Retry build).

| Variable | What | Default |
| --- | --- | --- |
| `PROFILE_EMAIL` | Email on Contact, `/card`, footer, legal pages, `.vcf` | `profile.js` |
| `PROFILE_LINKEDIN` | LinkedIn URL (`https://` only) | `profile.js` |
| `PROFILE_GITHUB` | GitHub URL (`https://` only) | `profile.js` |
| `PROFILE_INSTAGRAM` | Instagram URL; the button appears once set | none |
| `CARD_PHONE` | Phone, only in the `.vcf` from Save contact; never in the app bundle | none |

`PROFILE_*` values end up in the public JavaScript (they are shown on the site anyway). An invalid value is ignored with a warning in the build log.

## Deploying
See [README.md](../README.md) (Deploy and Rollback). Hosting is a single Worker (ADR 0001).

## Still open / easy to trip on
