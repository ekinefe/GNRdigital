import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Github, Linkedin } from './brandIcons'

describe('brand icons', () => {
    it('render as lucide-style SVGs and pass className through', () => {
        const { container } = render(<><Github className="w-4 h-4" /><Linkedin className="w-4 h-4" /></>)
        const svgs = container.querySelectorAll('svg')
        expect(svgs).toHaveLength(2)
        for (const svg of svgs) {
            expect(svg).toHaveClass('w-4', 'h-4')
            expect(svg.getAttribute('stroke')).toBe('currentColor')
        }
    })
})
