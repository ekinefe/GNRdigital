// The contact card: two plain HTML pages with inline CSS and no JavaScript, so they show at once even on
// slow conference Wi-Fi. They are not React routes: vite.config.js writes them into dist/ at build time
// (served by Cloudflare as static files) and serves them from memory in `npm run dev`.
//   /card        my name and a button per link, plus "Share" that opens the QR page
//   /card/share  a large QR code that opens /card, with the address written under it
// Text and links come from profile.js, about.js and brand.js; colours from the :root tokens in index.css.
// Relative imports on purpose: vite.config.js loads this file, and the '@' alias does not exist there.
import { profile } from '../../shared/config/profile.js';
import { brand } from '../../shared/config/brand.js';
import { about } from '../../shared/content/about.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Globe, FolderCode, Mail, UserPlus, QrCode, Contrast } from 'lucide-react';
import { Github, Linkedin, Instagram } from '../../shared/ui/brandIcons.js';
import { qrSvg } from './qrSvg.js';

export const CARD_PATH = '/card';
export const SHARE_PATH = '/card/share';
export const VCARD_PATH = `/card/${about.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vcf`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// The site's lucide icons, rendered to plain SVG at build time (decorative: the label says what the button does).
const icon = (Icon) => renderToStaticMarkup(createElement(Icon, { size: 18, 'aria-hidden': 'true', focusable: 'false' }));

// "https://example.com/card" -> "example.com/card" (what people read under the QR)
export const shortUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Only the --cyber-* colours from the first :root block in index.css, so the pages use the same tokens.
export function colourTokens(indexCss) {
    const root = indexCss.match(/:root\s*{([^}]*)}/);
    if (!root) throw new Error('index.css has no :root block');
    return [...root[1].matchAll(/(--cyber-[a-z]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => `${k}:${v.trim()}`).join(';');
}

/** The buttons on /card, in order. Links whose value in profile.js is empty are left out. */
export function cardLinks() {
    const links = [
        { label: 'Website', icon: Globe, detail: 'Home', href: '/' },
        { label: 'Portfolio', icon: FolderCode, detail: 'Projects', href: '/projects' },
        { label: 'LinkedIn', icon: Linkedin, detail: profile.linkedin && shortUrl(profile.linkedin).replace(/^www\.linkedin\.com\//, ''), href: profile.linkedin, external: true },
        { label: 'Instagram', icon: Instagram, detail: profile.instagram && `@${shortUrl(profile.instagram).split('/').pop()}`, href: profile.instagram, external: true },
        { label: 'GitHub', icon: Github, detail: profile.github && shortUrl(profile.github).replace(/^github\.com\//, ''), href: profile.github, external: true },
        { label: 'Email', icon: Mail, detail: profile.email, href: profile.email && `mailto:${profile.email}` },
        { label: 'Save contact', icon: UserPlus, detail: '.vcf', href: VCARD_PATH, download: true },
    ];
    return links.filter((l) => l.href);
}

const fontFaces = `@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:100 800;font-display:swap;src:url(/fonts/jetbrains-mono-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}`
    + `@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:100 800;font-display:swap;src:url(/fonts/jetbrains-mono-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`;

// Sizes follow the Tailwind scale (text-xs 0.75rem ... text-4xl 2.25rem); motion uses the fast token (150ms).
const css = `*,*::before,*::after{box-sizing:border-box;margin:0}
html{color-scheme:dark;-webkit-text-size-adjust:100%}
body{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem;background:rgb(var(--cyber-black));color:rgb(var(--cyber-text));font-family:'JetBrains Mono',ui-monospace,monospace;line-height:1.5;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:30rem}
main.wide{max-width:34rem}
a{color:inherit;text-decoration:none}
a:focus-visible{outline:2px solid rgb(var(--cyber-cyan));outline-offset:2px}
.prompt{font-size:0.75rem;color:rgb(var(--cyber-muted))}
.prompt b{color:rgb(var(--cyber-pink));font-weight:400}
h1{margin-top:0.75rem;font-size:1.875rem;line-height:1.15;font-weight:800;letter-spacing:-0.02em;overflow-wrap:anywhere}
.role{margin-top:0.5rem;font-size:0.875rem;color:rgb(var(--cyber-muted))}
.links{list-style:none;padding:0;margin-top:2rem;display:grid;gap:0.5rem}
.link{display:flex;align-items:center;gap:0.75rem;min-height:3rem;padding:0.75rem 1rem;border:1px solid rgb(var(--cyber-border));border-radius:var(--r);transition:border-color 150ms,color 150ms}
.link svg{flex:none}
.link span{font-size:0.875rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em}
.link small{margin-left:auto;font-size:0.75rem;color:rgb(var(--cyber-muted));text-align:right;overflow-wrap:anywhere}
.link i{font-style:normal;color:rgb(var(--cyber-muted))}
.link:hover{border-color:rgb(var(--cyber-pink));color:rgb(var(--cyber-pink))}
.share{justify-content:center;margin-top:1rem;background:rgb(var(--cyber-pink));border-color:rgb(var(--cyber-pink));color:rgb(var(--cyber-black))}
.share:hover{background:transparent}
footer{margin-top:2rem;font-size:0.75rem;color:rgb(var(--cyber-muted))}
.mark b{font-weight:800;color:rgb(var(--cyber-text))}.mark em{font-style:normal;font-weight:300}.mark u{text-decoration:none;color:rgb(var(--cyber-pink))}
.qr{display:block;width:100%;max-width:min(100%,64vh);margin:0 auto;border:1px solid rgb(var(--cyber-border));border-radius:var(--r);overflow:hidden}
.qr svg{display:block;width:100%;height:auto}
/* Light modules on dark (an inverted QR) by default: iPhone Camera and Google Lens read it. Some older scanner
   apps only read dark on light, so the "Light QR" button (a checkbox, so no JavaScript) flips the colours. */
.qr-bg{fill:rgb(var(--cyber-black))}.qr-dot{fill:rgb(var(--cyber-text))}.qr-logo-edge{stroke:rgb(var(--cyber-black))}.qr-logo{stroke:rgb(var(--cyber-pink))}
.flip{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.flip:checked ~ .center .qr-bg{fill:rgb(var(--cyber-text))}.flip:checked ~ .center .qr-dot{fill:rgb(var(--cyber-black))}
.toggle{justify-content:center;margin-top:1.5rem;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}
.toggle .to-dark,.flip:checked ~ .toggle .to-light{display:none}.flip:checked ~ .toggle .to-dark{display:inline}
.flip:focus-visible ~ .toggle{outline:2px solid rgb(var(--cyber-cyan));outline-offset:2px}
.center,.wide footer{text-align:center}
.center h1{font-size:1.5rem;margin-top:1.5rem}
.url{display:inline-block;margin-top:0.5rem;font-size:0.875rem;color:rgb(var(--cyber-cyan));overflow-wrap:anywhere}
.back{justify-content:center;margin-top:0.5rem}
@media (min-width:768px){h1{font-size:2.25rem}.center h1{font-size:1.875rem}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;

function page({ title, description, url, body, tokens, wide = false }) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="rgb(${tokens.match(/--cyber-black:([^;]+)/)[1]})">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(brand.publicUrl)}/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/jetbrains-mono-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>:root{${tokens};--r:var(--radius-lg,0.5rem)}${fontFaces}${css}</style>
</head>
<body>
<main${wide ? ' class="wide"' : ''}>
${body}
<footer><a class="mark" href="/"><b>GNR</b><em>${esc(brand.name.slice(3))}</em><u>_</u></a></footer>
</main>
</body>
</html>
`;
}

/** /card. `origin` is where the site runs (brand.publicUrl in the build, the dev server's address locally). */
export function cardPageHtml({ origin, tokens }) {
    const items = cardLinks().map((l) => {
        const attrs = l.external ? ' target="_blank" rel="noopener noreferrer"' : l.download ? ' download' : '';
        return `<li><a class="link" href="${esc(l.href)}"${attrs}>${icon(l.icon)}<span>${esc(l.label)}</span><small>${esc(l.detail)}</small><i aria-hidden="true">${l.external ? '↗' : '→'}</i></a></li>`;
    }).join('\n');
    return page({
        title: `${about.name} · ${brand.name}`,
        description: `${about.name}: ${about.role}. ${profile.location.city}, ${profile.location.country}.`,
        url: origin + CARD_PATH,
        tokens,
        body: `<p class="prompt" aria-hidden="true">${esc(brand.prompt)}<b>$</b> whoami</p>
<h1>${esc(about.name)}</h1>
<p class="role">${esc(about.role)}<br>${esc(profile.location.city)}, ${esc(profile.location.country)}</p>
<ul class="links">
${items}
</ul>
<a class="link share" href="${SHARE_PATH}">${icon(QrCode)}<span>Share</span></a>`,
    });
}

/** /card/share: the QR opens `${origin}/card`. */
export function sharePageHtml({ origin, tokens }) {
    const target = origin + CARD_PATH;
    return page({
        title: `${about.name} · QR`,
        description: `Scan to open ${about.name}'s links.`,
        url: origin + SHARE_PATH,
        tokens,
        wide: true,
        body: `<input type="checkbox" id="qr-light" class="flip">
<div class="center">
<div class="qr">${qrSvg(target, { label: `QR code that opens ${target}` })}</div>
<h1>${esc(about.name)}</h1>
<a class="url" href="${CARD_PATH}">${esc(shortUrl(target))}</a>
</div>
<label class="link toggle" for="qr-light">${icon(Contrast)}<span class="to-light">Light QR for older phones</span><span class="to-dark">Back to dark QR</span></label>
<a class="link back" href="${CARD_PATH}"><span>All links</span></a>`,
    });
}

const vEsc = (s) => String(s).replace(/[\\,;]/g, (c) => `\\${c}`);

/** A vCard 3.0 so people can save my name spelled right with one tap. */
export function vcard({ origin }) {
    const parts = about.name.split(' ');
    const family = parts.pop();
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vEsc(family)};${vEsc(parts.join(' '))};;;`,
        `FN:${vEsc(about.name)}`,
        `TITLE:${vEsc(about.role)}`,
        profile.email && `EMAIL;TYPE=INTERNET:${profile.email}`,
        `URL:${origin}/`,
        profile.linkedin && `URL:${profile.linkedin}`,
        profile.instagram && `URL:${profile.instagram}`,
        profile.github && `URL:${profile.github}`,
        `ADR:;;;${vEsc(profile.location.city)};;;${vEsc(profile.location.country)}`,
        'END:VCARD',
    ].filter(Boolean);
    return lines.join('\r\n') + '\r\n';
}
