import { readFileSync, existsSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { projects } from './projects'

const routes = [...readFileSync('src/app/App.jsx', 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])

describe('launch content', () => {
    it('every project link resolves: case studies are routes, screenshots exist, live URLs are https', () => {
        for (const p of projects) {
            if (p.caseStudy) expect(routes).toContain(p.caseStudy)
            if (p.image) {
                expect(existsSync(`public${p.image}`)).toBe(true)
                expect(p.imageAlt).toBeTruthy()
            }
            if (p.url) expect(p.url).toMatch(/^https:\/\//)
        }
    })
    it('every project has a unique id, tech, and a public repo URL or none', () => {
        expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
        for (const p of projects) {
            expect(p.tech.length).toBeGreaterThan(0)
            expect(p.repo === null || /^https:\/\/github\.com\/ekinefe\//.test(p.repo)).toBe(true)
        }
    })
})

describe('projects', () => {
    it('uses known statuses, unique ids, and gives a live tool a url', async () => {
        const { projects, toolProjects } = await import('./projects')
        const all = [...projects, ...toolProjects]
        expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
        for (const p of all) expect(['live', 'soon', 'paused']).toContain(p.status)
        for (const p of toolProjects) if (p.status === 'live') expect(p.url, p.id).toMatch(/^https:\/\//)
    })
})

describe('matches the CV (Ekin_Efe_Gungor_CV.tex is the source of truth)', () => {
    const text = ['src/shared/content/about.js', 'src/shared/content/projects.js', 'src/shared/config/profile.js']
        .map((f) => readFileSync(f, 'utf8')).join('\n')

    it('has none of the outdated or overstated claims', () => {
        for (const old of ['40 Jira', 'about 60', '5 client projects', 'Istanbul', 'Endless Abroad', '9.9 MB',
            'Built an employee onboarding', 'AI blog CMS', 'team of 3', '18336a20a', 'plannedlost.gnrdigital']) {
            expect(text, old).not.toContain(old)
        }
    })

    it('has the CV numbers for the internship and Planned Lost', async () => {
        const { about } = await import('./about')
        const intern = about.log.find((g) => g.key === 'professional').entries[0]
        expect(intern.points.join(' ')).toMatch(/65\+ Jira tickets and 85\+ pull requests across 10\+ projects/)
        expect(about.results.map((r) => r.after)).toEqual(['0.006', '92 KB', '85+ pull requests'])
        const planned = projects.find((p) => p.id === 'planned-lost')
        expect(planned.points.join(' ')).toMatch(/750\+ commits, 250\+ merged pull requests and 1,900\+ automated tests/)
    })
})
