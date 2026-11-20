import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Footer from './Footer'
import { profile } from '@/shared/config/profile'
import { CARD_PATH, SHARE_PATH } from '@/shared/config/cardPaths'

describe('Footer', () => {
    it('links to the legal pages and shows build info', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
        expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
        expect(screen.getByTestId('build-info').textContent).toMatch(/^v\d+\.\d+\.\d+\S*/)
        expect(screen.getByTestId('build-info').textContent).not.toMatch(/build/)
    })

    it('opens external links safely', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('links to the contact card and its QR code in the same tab', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        for (const [name, href] of [['Contact card', CARD_PATH], ['QR code', SHARE_PATH]]) {
            const link = screen.getByRole('link', { name })
            expect(link).toHaveAttribute('href', href)
            expect(link).not.toHaveAttribute('target')
        }
    })
})

describe('Footer reduce-effects switch', () => {
    it('toggles and reports its state', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        const button = screen.getByRole('button', { name: /Reduce effects/ })
        expect(button).toHaveAttribute('aria-pressed', 'false')
        fireEvent.click(button)
        expect(screen.getByRole('button', { name: /Reduce effects: on/ })).toHaveAttribute('aria-pressed', 'true')
        fireEvent.click(screen.getByRole('button', { name: /Reduce effects/ }))
    })
})

describe('Footer licence', () => {
    it('states the code licence once, from profile data', () => {
        render(<MemoryRouter><Footer /></MemoryRouter>)
        expect(screen.getByRole('link', { name: 'MIT licence' })).toHaveAttribute('href', profile.license.url)
    })
})
