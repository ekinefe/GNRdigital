import { readFileSync } from 'node:fs'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// public/card/share.js is a plain browser script: run it against a copy of the share page's link.
const code = readFileSync('public/card/share.js', 'utf8')
const URL_ = 'https://example.dev/card'

function setup({ touch, share, clipboard }) {
    document.body.innerHTML = `<a class="url" href="${URL_}"><span class="url-text">example.dev/card</span></a>`
    window.matchMedia = vi.fn(() => ({ matches: touch }))
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
    new Function(code)()
    const link = document.querySelector('a.url')
    const click = () => { const e = new MouseEvent('click', { bubbles: true, cancelable: true }); link.dispatchEvent(e); return e }
    return { link, click }
}

describe('share script (/card/share)', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

    it('on a phone, opens the share sheet with the card address', async () => {
        const share = vi.fn().mockResolvedValue()
        const { click } = setup({ touch: true, share, clipboard: { writeText: vi.fn() } })
        expect(click().defaultPrevented).toBe(true)
        expect(share).toHaveBeenCalledWith({ title: document.title, url: URL_ })
    })

    it('with a mouse, copies the address and says so for two seconds', async () => {
        const writeText = vi.fn().mockResolvedValue()
        const { link, click } = setup({ touch: false, share: vi.fn(), clipboard: { writeText } })
        expect(click().defaultPrevented).toBe(true)
        await vi.waitFor(() => expect(link.textContent).toBe('Link copied'))
        expect(writeText).toHaveBeenCalledWith(URL_)
        vi.advanceTimersByTime(2000)
        expect(link.textContent).toBe('example.dev/card')
    })

    it('leaves the link alone when the browser can neither share nor copy', () => {
        const { click } = setup({ touch: true, share: undefined, clipboard: undefined })
        expect(click().defaultPrevented).toBe(false)
    })
})
