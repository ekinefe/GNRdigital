// Draws a QR matrix as a classic square-module SVG with the GNR mark (shared/ui/gnrMark.js) in the middle.
// Colours come from CSS classes the page defines: qr-bg and qr-dot decide whether the code is dark on light or
// light on dark; the mark (qr-mark-bg, qr-mark, qr-mark-text) is always light on solid black, the same either way.
import { encodeQr } from './qr.js';
import { MARK_SIZE, MARK_FRAME, MARK_LETTERS } from '../../shared/ui/gnrMark.js';

const QUIET = 4; // empty border around the code, in modules (the standard asks for 4)

/**
 * @param {string} text  what the code opens (a URL)
 * @param {{ label?: string }} [opts]
 * @returns {string} an <svg> element
 */
export function qrSvg(text, { label = 'QR code' } = {}) {
    const { size, modules } = encodeQr(text, { level: 'H' }); // H: still reads with the logo over 5% of it

    // Centre hole for the logo: an odd number of modules, about a fifth of the width.
    let hole = Math.round(size * 0.2);
    if (hole % 2 === 0) hole += 1;
    const h0 = (size - hole) / 2;
    const inHole = (x, y) => x >= h0 && x < h0 + hole && y >= h0 && y < h0 + hole;
    const on = (x, y) => x < size && modules[y][x] && !inHole(x, y);

    // One rectangle per horizontal run of modules keeps the path short and leaves no seams between squares.
    const parts = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!on(x, y)) continue;
            let end = x;
            while (on(end + 1, y)) end++;
            parts.push(`M${QUIET + x} ${QUIET + y}h${end - x + 1}v1h-${end - x + 1}z`);
            x = end;
        }
    }

    const total = size + QUIET * 2;
    // The mark fills the hole exactly: its black square covers the hole, so the modules around it stay untouched.
    const at = QUIET + h0;
    const scale = Number((hole / MARK_SIZE).toFixed(5));
    const { inset, stroke } = MARK_FRAME;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="${label}">`
        + `<rect class="qr-bg" width="${total}" height="${total}"/>`
        + `<path class="qr-dot" shape-rendering="crispEdges" d="${parts.join('')}"/>`
        + `<g transform="translate(${at} ${at}) scale(${scale})" aria-hidden="true">`
        + `<rect class="qr-mark-bg" width="${MARK_SIZE}" height="${MARK_SIZE}"/>`
        + `<rect class="qr-mark" x="${inset}" y="${inset}" width="${MARK_SIZE - inset * 2}" height="${MARK_SIZE - inset * 2}" fill="none" stroke-width="${stroke}"/>`
        + `<path class="qr-mark-text" d="${MARK_LETTERS}"/></g>`
        + '</svg>';
}
