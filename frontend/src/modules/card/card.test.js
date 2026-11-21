import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { encodeQr, rsRemainder } from './qr.js'
import { qrSvg } from './qrSvg.js'
import { CARD_PATH, SHARE_PATH, VCARD_PATH, displayName, cardLinks, cardPageHtml, sharePageHtml, vcard, cleanPhone, colourTokens, shortUrl, SHARE_SCRIPT } from './cardPages.js'
import { profile } from '@/shared/config/profile.js'
import { brand } from '@/shared/config/brand.js'

const tokens = colourTokens(readFileSync('src/index.css', 'utf8'))
const origin = 'https://example.dev'

describe('QR encoder', () => {
    it('computes Reed-Solomon bytes (the HELLO WORLD 1-M example from the standard)', () => {
        const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17]
        expect(rsRemainder(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23])
    })

    it('picks the smallest version that fits and draws the three finder patterns', () => {
        const { version, size, modules } = encodeQr('https://example.dev/card', { level: 'H' })
        expect(version).toBe(3)
        expect(size).toBe(29)
        const finder = (x0, y0) => [0, 1, 2, 3, 4, 5, 6].map((y) => [0, 1, 2, 3, 4, 5, 6].map((x) => modules[y0 + y][x0 + x] ? 1 : 0).join('')).join('/')
        const expected = '1111111/1000001/1011101/1011101/1011101/1000001/1111111'
        expect([finder(0, 0), finder(size - 7, 0), finder(0, size - 7)]).toEqual([expected, expected, expected])
    })

    it('rejects text that does not fit in version 10', () => {
        expect(() => encodeQr('x'.repeat(300), { level: 'H' })).toThrow(/too long/)
    })
})

describe('QR picture', () => {
    it('draws the same picture every build', () => {
        expect(qrSvg('https://example.dev/card')).toBe(qrSvg('https://example.dev/card'))
    })

    it('is labelled for screen readers and uses only CSS classes for colour', () => {
        const svg = qrSvg('https://example.dev/card', { label: 'QR code that opens it' })
        expect(svg).toContain('role="img"')
        expect(svg).toContain('aria-label="QR code that opens it"')
        expect(svg).not.toMatch(/fill="#|stroke="#/)
    })
})

describe('card pages', () => {
    it('takes only the --cyber-* colours from index.css', () => {
        expect(tokens).toMatch(/^--cyber-black:\d+ \d+ \d+;/)
        expect(tokens.split(';').every((t) => t.startsWith('--cyber-'))).toBe(true)
    })

    it('lists a button for every link set in profile.js and hides the empty ones', () => {
        const links = cardLinks()
        expect(links.map((l) => l.href)).toEqual(expect.arrayContaining(['/', '/projects', profile.cv, profile.linkedin, profile.github, `mailto:${profile.email}`, VCARD_PATH]))
        expect(links.some((l) => l.label === 'Instagram')).toBe(Boolean(profile.instagram))
        expect(links.every((l) => l.href && l.detail)).toBe(true)
    })

    it('the CV button opens a PDF that is in public/ (and not dropped by the *.pdf rule in .gitignore)', () => {
        expect(readFileSync(`public${profile.cv}`).subarray(0, 5).toString()).toBe('%PDF-')
    })

    it('every button starts with a decorative icon', () => {
        const html = cardPageHtml({ origin, tokens })
        const buttons = [...html.matchAll(/<a class="link[^"]*"[^>]*>(<svg[^>]*>)/g)]
        expect(buttons).toHaveLength(cardLinks().length + 1) // the links plus Share
        for (const [, svg] of buttons) expect(svg).toContain('aria-hidden="true"')
    })

    it('/card has every link, a Share button and no JavaScript', () => {
        const html = cardPageHtml({ origin, tokens })
        for (const l of cardLinks()) expect(html).toContain(`href="${l.href.replace(/&/g, '&amp;')}"`)
        expect(html).toContain(`href="${SHARE_PATH}"`)
        expect(html).not.toMatch(/<script/i)
        expect(html.match(/target="_blank"/g)?.length).toBe(html.match(/rel="noopener noreferrer"/g)?.length)
    })

    it('/card/share shows a QR that opens /card and writes the address under it', () => {
        const html = sharePageHtml({ origin, tokens })
        expect(html).toContain(`aria-label="QR code that opens ${origin}${CARD_PATH}"`)
        expect(html).toMatch(new RegExp(`<a class="url" href="${origin}${CARD_PATH}"[^>]*><svg[^>]*aria-hidden="true"`))
        expect(html).toContain(`<span class="url-text" aria-live="polite">${shortUrl(origin + CARD_PATH)}</span></a>`)
    })

    it('/card/share loads only its own share script, and /card none', () => {
        expect(sharePageHtml({ origin, tokens }).match(/<script[^>]*>/g)).toEqual([`<script src="${SHARE_SCRIPT}" defer>`])
        expect(readFileSync(`public${SHARE_SCRIPT}`, 'utf8')).toContain("querySelector('a.url')")
        expect(cardPageHtml({ origin, tokens })).not.toMatch(/<script/i)
    })

    it('/card/share is dark by default and has a no-JavaScript button for a light QR', () => {
        const html = sharePageHtml({ origin, tokens })
        expect(html).toMatch(/<input type="checkbox" id="qr-light" class="flip">/)
        expect(html).not.toMatch(/id="qr-light"[^>]*checked/)
        expect(html).toContain('<label class="link toggle" for="qr-light">')
        expect(html).toContain('.flip:checked ~ .center .qr-bg{fill:rgb(var(--cyber-text))}')
    })

    it('writes the surname in capitals on both pages', () => {
        expect(displayName('Ekin Efe Gungor')).toBe('Ekin Efe GUNGOR')
        for (const html of [cardPageHtml({ origin, tokens }), sharePageHtml({ origin, tokens })]) {
            expect(html).toContain(`<span class="sr-only">${displayName()}</span>`)
        }
    })

    it('types the name in with CSS only, and not at all with reduced motion', () => {
        const html = cardPageHtml({ origin, tokens })
        const n = displayName().length
        expect(html).toContain(`animation-duration:${n * 75}ms;animation-timing-function:steps(${n},end)`)
        expect(html).toMatch(/<span class="type" aria-hidden="true">/)
        expect(html).toContain('@media (prefers-reduced-motion:reduce){*{transition:none!important}.typed,.cur{animation:none!important}}')
        expect(html).not.toMatch(/<script/i)
    })

    it('the vCard has my name split into family and given names, with CRLF lines', () => {
        const card = vcard({ origin })
        expect(card.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n')).toBe(true)
        expect(card).toContain('N:Gungor;Ekin Efe;;;\r\n')
        expect(card).toContain(`URL:${origin}/\r\n`)
        expect(card.endsWith('END:VCARD\r\n')).toBe(true)
    })

    it('the vCard has a phone number only when one is given at build time', () => {
        expect(vcard({ origin })).not.toContain('TEL')
        expect(vcard({ origin, phone: '' })).not.toContain('TEL')
        expect(vcard({ origin, phone: '+48 600 000 000' })).toContain('TEL;TYPE=CELL:+48 600 000 000\r\nEMAIL')
    })

    it('keeps only +, digits and spaces of the phone number, and drops junk', () => {
        expect(cleanPhone(' +48  600-000-000\n')).toBe('+48 600000000')
        expect(cleanPhone('+48 600 000 000\r\nNOTE:x')).toBe('+48 600 000 000')
        expect(cleanPhone('123')).toBe('')
        expect(cleanPhone(undefined)).toBe('')
    })

    it('the built QR points at the public site', () => {
        expect(sharePageHtml({ origin: brand.publicUrl, tokens })).toContain(`${shortUrl(brand.publicUrl)}/card`)
    })
})
