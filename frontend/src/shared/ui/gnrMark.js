// The GNR mark: "GNR" in a thin frame on a solid black square. The letters are the outlines of JetBrains Mono
// ExtraBold (800), the font and weight of the bold GNR in the header wordmark, turned into a path so they look the
// same in a browser tab, where web fonts are not loaded, and in the QR code on /card/share.
// Coordinates are on a 64 x 64 grid. public/favicon.svg uses the same shapes (gnrMark.test.js checks they match).
// Relative-import safe: modules/card/qrSvg.js, which vite.config.js loads, imports it.

export const MARK_SIZE = 64;

/** Inset of the frame from the edge, and its stroke width. */
export const MARK_FRAME = { inset: 5, stroke: 3 };

/**
 * G, N and R as one filled path: public/fonts/jetbrains-mono-latin.woff2 at wght 800, ink 40 wide, centred.
 * Made with fontTools (varLib.instancer + SVGPathPen); redo it the same way if the font changes.
 */
export const MARK_LETTERS = 'M17.74 40.8Q16.01 40.8 14.72 40.15Q13.43 39.51 12.72 38.35Q12 37.18 12 35.64V28.36Q12 26.79 12.72 25.64Q13.43 24.49 14.72 23.85Q16.01 23.2 17.74 23.2Q19.46 23.2 20.74 23.85Q22.02 24.49 22.73 25.64Q23.45 26.78 23.45 28.36H19.93Q19.93 27.33 19.35 26.79Q18.77 26.25 17.72 26.25Q16.67 26.25 16.09 26.8Q15.52 27.34 15.52 28.36V35.64Q15.52 36.64 16.09 37.2Q16.67 37.75 17.72 37.75Q18.77 37.75 19.35 37.19Q19.93 36.64 19.93 35.63V34.16H17.4V31.18H23.45V35.64Q23.45 37.19 22.73 38.35Q22.02 39.51 20.74 40.15Q19.46 40.8 17.74 40.8ZM26.08 40.56V23.44H30.18L34.62 36.69Q34.55 35.82 34.45 34.69Q34.36 33.55 34.3 32.41Q34.24 31.27 34.24 30.48V23.44H37.34V40.56H33.23L28.84 27.31Q28.91 28.06 28.99 29.09Q29.06 30.12 29.11 31.18Q29.17 32.23 29.17 33.06V40.56ZM40.27 40.56V23.44H45.78Q47.61 23.44 48.95 24.07Q50.29 24.7 51.03 25.88Q51.77 27.05 51.77 28.65Q51.77 30.31 50.96 31.62Q50.15 32.94 48.76 33.52L52 40.56H48.18L45.41 34.09H43.77V40.56ZM43.77 31.04H45.78Q46.96 31.04 47.6 30.45Q48.25 29.87 48.25 28.81Q48.25 27.71 47.6 27.1Q46.96 26.49 45.78 26.49H43.77Z';
