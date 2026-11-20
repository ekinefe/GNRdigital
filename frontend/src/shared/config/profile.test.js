import { describe, it, expect, vi, afterEach } from 'vitest'
import { profile, PROFILE_ENV, invalidProfileEnv } from './profile.js'
import { contactLinks } from './contactLinks.js'

describe('profile build variables (GNR-182)', () => {
    afterEach(() => vi.unstubAllEnvs())

    it('uses the values written in profile.js when no variable is set', () => {
        for (const name of Object.values(PROFILE_ENV)) vi.stubEnv(name, '')
        expect(profile.email).toMatch(/@/)
        expect(profile.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\//)
        expect(profile.github).toMatch(/^https:\/\/github\.com\//)
        expect(profile.instagram).toBe(null)
        expect(invalidProfileEnv()).toEqual([])
    })

    it('a set variable replaces the link everywhere, Instagram included', () => {
        vi.stubEnv('PROFILE_EMAIL', ' hello@example.dev ')
        vi.stubEnv('PROFILE_INSTAGRAM', 'https://www.instagram.com/example/')
        expect(profile.email).toBe('hello@example.dev')
        const links = contactLinks()
        expect(links.find((l) => l.key === 'email').href).toBe('mailto:hello@example.dev')
        expect(links.find((l) => l.key === 'instagram')).toMatchObject({ href: 'https://www.instagram.com/example/', detail: '@example' })
    })

    it('ignores a value that is not a valid address and names it', () => {
        vi.stubEnv('PROFILE_EMAIL', 'not an email')
        vi.stubEnv('PROFILE_GITHUB', 'http://github.com/x') // not https
        vi.stubEnv('PROFILE_LINKEDIN', 'javascript:alert(1)')
        expect(profile.email).toMatch(/^[^\s]+@/)
        expect(profile.github).toMatch(/^https:\/\/github\.com\//)
        expect(profile.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\//)
        expect(invalidProfileEnv()).toEqual(['PROFILE_EMAIL', 'PROFILE_GITHUB', 'PROFILE_LINKEDIN'])
    })
})
