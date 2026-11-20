import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Header from './Header'
import { SHARE_PATH } from '@/shared/config/cardPaths'

describe('Header mobile menu', () => {
    it('opens and closes without crashing (the X icon must be imported)', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        )

        // Closed: only the desktop nav renders each label once.
        expect(screen.getAllByText('About')).toHaveLength(1)

        const toggle = screen.getByRole('button')
        fireEvent.click(toggle)
        // Open: the mobile overlay renders a second copy of every link.
        expect(screen.getAllByText('About')).toHaveLength(2)

        fireEvent.click(screen.getByRole('button'))
        expect(screen.getAllByText('About')).toHaveLength(1)
    })
})

describe('Header navigation', () => {
    it('has Contact in the main navigation, marked as the current page on /contact', () => {
        render(<MemoryRouter initialEntries={['/contact']}><Header /></MemoryRouter>)
        const link = screen.getByRole('navigation', { name: 'Main' }).querySelector('a[href="/contact"]')
        expect(link).toHaveTextContent('Contact')
        expect(link.className).toMatch(/text-cyber-pink/)
        expect(screen.getByRole('navigation', { name: 'Main' }).querySelector('a[href="/about"]').className).not.toMatch(/text-cyber-pink/)
    })

    it('lists Home, Portfolio, Blog, About and Contact in that order', () => {
        render(<MemoryRouter><Header /></MemoryRouter>)
        const hrefs = [...screen.getByRole('navigation', { name: 'Main' }).querySelectorAll('a')].map((a) => a.getAttribute('href'))
        expect(hrefs).toEqual(['/', '/projects', '/blog', '/about', '/contact'])
        expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('href', '/projects')
    })
})

describe('Header share', () => {
    it('links to the QR page from the header on desktop and phone, as plain links (it is not a React route)', () => {
        render(<MemoryRouter><Header /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'Share' })).toHaveAttribute('href', SHARE_PATH)
        expect(screen.getByRole('link', { name: 'Share (QR code)' })).toHaveAttribute('href', SHARE_PATH)
        expect(screen.getByRole('navigation', { name: 'Main' }).querySelector(`a[href="${SHARE_PATH}"]`)).toBeNull()
    })
})

describe('Header mobile menu style', () => {
    it('marks the current page with a pink prompt and lists Share last', () => {
        render(<MemoryRouter initialEntries={['/contact']}><Header /></MemoryRouter>)
        fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
        const links = [...screen.getByRole('navigation', { name: 'Mobile' }).querySelectorAll('a')]
        const current = links.find((a) => a.getAttribute('href') === '/contact')
        expect(current).toHaveAttribute('aria-current', 'page')
        expect(current.className).toMatch(/text-cyber-pink/)
        expect(current).toHaveTextContent('>Contact_')
        expect(links.at(-1)).toHaveAttribute('href', SHARE_PATH)
        expect(links.find((a) => a.getAttribute('href') === '/about')).not.toHaveAttribute('aria-current')
    })
})

describe('Header desktop navigation', () => {
    it('sits on the right next to Share, and the current-page line has no glow', () => {
        render(<MemoryRouter initialEntries={['/contact']}><Header /></MemoryRouter>)
        const nav = screen.getByRole('navigation', { name: 'Main' })
        expect(nav.className).toMatch(/\bml-auto\b/)
        expect(nav.innerHTML).not.toMatch(/shadow-neon/)
    })
})
