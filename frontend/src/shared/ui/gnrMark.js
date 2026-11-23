// The GNR mark: "GNR" in a thin frame on a solid black square, drawn as strokes (not a font) so it looks the
// same in a browser tab, where web fonts are not loaded, and in the QR code on /card/share.
// Coordinates are on a 64 x 64 grid. public/favicon.svg uses the same shapes (mark.test.js checks they match).
// Relative-import safe: modules/card/qrSvg.js, which vite.config.js loads, imports it.

export const MARK_SIZE = 64;

/** Inset of the frame from the edge, and its stroke width. */
export const MARK_FRAME = { inset: 5, stroke: 3 };

/** Stroke width of the letters. */
export const MARK_LETTER_STROKE = 4.5;

/** G, N and R as one path. */
export const MARK_LETTERS = 'M23 21H11v22h12V33h-6M28 43V21l9 22V21M42 43V21h10v11H42m4 0l7 11';
