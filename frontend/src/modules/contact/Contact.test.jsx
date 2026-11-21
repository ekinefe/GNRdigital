import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Contact from './Contact'
import { profile } from '@/shared/config/profile'
import { CARD_PATH, SHARE_PATH, VCARD_PATH } from '@/shared/config/contactLinks'

describe('Contact', () => {
    it('shows the address once with a mailto link', () => {
        render(<Contact />)
        expect(screen.getAllByText(profile.email)).toHaveLength(1)
        expect(screen.getByRole('link', { name: /Send email/ })).toHaveAttribute('href', `mailto:${profile.email}`)
    })

    it('links to GitHub and LinkedIn in a new tab safely', () => {
        render(<Contact />)
        for (const [name, href] of [[/GitHub/, profile.github], [/LinkedIn/, profile.linkedin]]) {
            const link = screen.getByRole('link', { name })
            expect(link).toHaveAttribute('href', href)
            expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
        }
    })

    it('offers the contact card, its QR code and a vCard as plain links (they are not React routes)', () => {
        render(<Contact />)
        expect(screen.getByRole('link', { name: /Show QR/ })).toHaveAttribute('href', SHARE_PATH)
        expect(screen.getByRole('link', { name: /Contact card/ })).toHaveAttribute('href', CARD_PATH)
        expect(screen.getByRole('link', { name: /Save contact/ })).toHaveAttribute('href', VCARD_PATH)
        expect(screen.getByRole('link', { name: /CV/ })).toHaveAttribute('href', profile.cv)
        expect(screen.getByRole('link', { name: /CV/ })).toHaveAttribute('target', '_blank')
        expect(screen.getByRole('link', { name: /CV/ })).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByRole('link', { name: /Save contact/ })).toHaveAttribute('download')
    })

    it('shows Instagram only when profile.js has its URL', () => {
        render(<Contact />)
        expect(screen.queryByRole('link', { name: /Instagram/ }) !== null).toBe(Boolean(profile.instagram))
    })

    it('copies the address and confirms it', async () => {
        const writeText = vi.fn().mockResolvedValue()
        Object.assign(navigator, { clipboard: { writeText } })
        render(<Contact />)
        fireEvent.click(screen.getByRole('button', { name: /Copy email/ }))
        await waitFor(() => expect(screen.getByRole('button', { name: /Copied/ })).toBeInTheDocument())
        expect(writeText).toHaveBeenCalledWith(profile.email)
        expect(screen.getByRole('status')).toHaveTextContent(/copied/i)
    })

    it('says so when the clipboard is blocked', async () => {
        Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
        render(<Contact />)
        fireEvent.click(screen.getByRole('button', { name: /Copy email/ }))
        await waitFor(() => expect(screen.getByText(/Could not copy - select/)).toBeInTheDocument())
    })
})
