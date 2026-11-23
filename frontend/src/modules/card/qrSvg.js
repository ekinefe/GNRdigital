// Draws a QR matrix as a classic square-module SVG with "GNR" in a thin frame in the middle.
// Colours come from CSS classes (qr-bg, qr-dot) that the page defines, so the page decides whether the code is
// dark on light or light on dark; GNR (qr-dot) and its frame (qr-frame) are always the modules' single colour.
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
    // A thin square frame just inside the hole, and "GNR" centred in it. textLength pins the text's width, so a
    // fallback font can never touch the frame; the font-size is what JetBrains Mono needs for that width (0.6em a letter).
    const mid = total / 2;
    const frame = hole - 1; // half a module of margin each side
    const fx = QUIET + h0 + 0.5;
    const width = hole - 2.6;
    const fontSize = Number((width / 1.8).toFixed(3));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" role="img" aria-label="${label}">`
        + `<rect class="qr-bg" width="${total}" height="${total}"/>`
        + `<path class="qr-dot" shape-rendering="crispEdges" d="${parts.join('')}"/>`
        + `<rect class="qr-frame" x="${fx}" y="${fx}" width="${frame}" height="${frame}" fill="none" stroke-width="0.3"/>`
        + `<text class="qr-dot" x="${mid}" y="${mid}" text-anchor="middle" dominant-baseline="central" font-family="'JetBrains Mono',ui-monospace,monospace" font-weight="500" font-size="${fontSize}" textLength="${Number(width.toFixed(3))}" lengthAdjust="spacingAndGlyphs" aria-hidden="true">GNR</text>`
        + '</svg>';
}
