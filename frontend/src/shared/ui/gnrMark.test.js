import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { MARK_SIZE, MARK_FRAME, MARK_LETTERS } from './gnrMark.js'

describe('GNR mark', () => {
    const favicon = readFileSync('public/favicon.svg', 'utf8')

    it('public/favicon.svg draws the same mark: black square, frame and letters', () => {
        const { inset, stroke } = MARK_FRAME
        expect(favicon).toContain(`viewBox="0 0 ${MARK_SIZE} ${MARK_SIZE}"`)
        expect(favicon).toContain(`<rect width="${MARK_SIZE}" height="${MARK_SIZE}" fill="#000"/>`)
        expect(favicon).toContain(`<rect x="${inset}" y="${inset}" width="${MARK_SIZE - inset * 2}" height="${MARK_SIZE - inset * 2}" fill="none" stroke="#EEE" stroke-width="${stroke}"/>`)
        expect(favicon).toContain(`<path d="${MARK_LETTERS}" fill="#EEE"/>`)
    })

    it('letters are font outlines (filled curves), not hand-drawn strokes', () => {
        expect(MARK_LETTERS).toMatch(/Q/)
        expect(favicon).not.toMatch(/stroke-width="4\.5"/)
    })

    it('has no pink G left', () => {
        expect(favicon).not.toMatch(/FF318C|M52 15H15/i)
    })
})
