import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectEntry from './ProjectEntry'
import { projects } from '@/shared/content/projects'

const show = (id) => render(<MemoryRouter><ProjectEntry project={projects.find((p) => p.id === id)} detailed /></MemoryRouter>)

describe('ProjectEntry repo label', () => {
    it('says PRIVATE REPO for a live project whose repo is private (Transcripter)', () => {
        show('transcripter')
        expect(screen.getByText('PRIVATE REPO')).toBeInTheDocument()
    })

    it('shows no repo label for something that is not code (Home Lab)', () => {
        show('home-lab')
        expect(screen.queryByText('PRIVATE REPO')).toBeNull()
        expect(screen.queryByRole('link', { name: /source code/i })).toBeNull()
    })
})
