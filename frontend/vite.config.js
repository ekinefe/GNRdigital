import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { brand } from './src/shared/config/brand.js'
import { sitemapXml, robotsTxt } from './src/shared/config/seo.js'
import { CARD_PATH, SHARE_PATH, VCARD_PATH, cardPageHtml, sharePageHtml, vcard, colourTokens } from './src/modules/card/cardPages.js'

// Commit SHA baked in at build time: Cloudflare Pages sets CF_PAGES_COMMIT_SHA, local builds ask git.
function commitSha() {
  const fromEnv = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA
  if (fromEnv) return fromEnv.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return 'dev' }
}

// Installed versions of the main tools, shown on /colophon so the numbers are real, not typed by hand.
function installedVersions(names) {
  return Object.fromEntries(names.map((name) => {
    try { return [name, JSON.parse(readFileSync(`./node_modules/${name}/package.json`, 'utf8')).version] } catch { return [name, 'unknown'] }
  }))
}

// The contact card pages (/card, /card/share and the .vcf), built from src/modules/card/cardPages.js.
// `origin` goes into the QR code: brand.publicUrl in the build, the address you opened in dev.
function cardFiles(origin) {
  const tokens = colourTokens(readFileSync('./src/index.css', 'utf8'))
  return {
    [CARD_PATH]: { file: 'card.html', type: 'text/html; charset=utf-8', body: cardPageHtml({ origin, tokens }) },
    [SHARE_PATH]: { file: 'card/share.html', type: 'text/html; charset=utf-8', body: sharePageHtml({ origin, tokens }) },
    [VCARD_PATH]: { file: VCARD_PATH.slice(1), type: 'text/vcard; charset=utf-8', body: vcard({ origin }) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(JSON.parse(readFileSync('./package.json', 'utf8')).version),
    __BUILD_SHA__: JSON.stringify(commitSha()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __STACK__: JSON.stringify(installedVersions(['react', 'react-router-dom', 'vite', 'tailwindcss', 'vitest', 'gsap', 'lucide-react'])),
  },
  plugins: [
    react(),
    // Fills %BRAND_NAME% in index.html from src/config/brand.js (single source of truth)
    { name: 'brand-html', transformIndexHtml: (html) => html.replaceAll('%BRAND_NAME%', brand.name).replaceAll('%BRAND_URL%', brand.publicUrl) },
    // sitemap.xml and robots.txt from src/shared/config/seo.js, so the URLs follow brand.publicUrl
    {
      name: 'seo-files',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })
      },
    },
    // Static HTML, so the card shows at once without loading the React app. In dev the pages are served from
    // memory; open the dev server by its network address (`npm run dev -- --host`) and the QR points there.
    {
      name: 'card-pages',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const path = (req.url || '').split('?')[0].replace(/(.)\/$/, '$1')
          if (![CARD_PATH, SHARE_PATH, VCARD_PATH].includes(path)) return next()
          const { type, body } = cardFiles(`http://${req.headers.host}`)[path]
          res.setHeader('Content-Type', type)
          res.end(body)
        })
      },
      generateBundle() {
        for (const { file, body } of Object.values(cardFiles(brand.publicUrl))) this.emitFile({ type: 'asset', fileName: file, source: body })
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks cache well across deploys and keep the app chunk small.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor-react'
          if (/node_modules\/(motion|framer-motion|gsap)\//.test(id)) return 'vendor-motion'
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js', // We will create this next
    css: true,
  },
})
