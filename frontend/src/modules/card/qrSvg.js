// Draws a QR matrix as a classic square-module SVG with the GNRdigital G mark in the middle.
// Colours come from CSS classes (qr-bg, qr-dot, qr-logo-*) that the page defines, so the page decides
// whether the code is dark on light or light on dark.
import { encodeQr } from './qr.js';

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
    // The favicon's G (viewBox 64), scaled into the hole with a little margin.
    const scale = Number(((hole - 1) / 64).toFixed(4));
    const lx = QUIET + h0 + 0.5;
    const g = 'M52 15H15v34h37V35H35';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="${label}">`
        + `<rect class="qr-bg" width="${total}" height="${total}"/>`
        + `<path class="qr-dot" shape-rendering="crispEdges" d="${parts.join('')}"/>`
        + `<g transform="translate(${lx} ${lx}) scale(${scale})" fill="none" stroke-linejoin="miter">`
        + `<path class="qr-logo-edge" d="${g}" stroke-width="12"/><path class="qr-logo" d="${g}" stroke-width="6"/></g>`
        + '</svg>';
}
