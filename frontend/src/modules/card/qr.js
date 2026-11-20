// A small QR code encoder (ISO/IEC 18004), byte mode only, versions 1 to 10. Written here instead of
// adding a dependency; it runs at build time to draw the QR on /card/share. Follows the structure of
// Project Nayuki's reference implementation (MIT). Returns a square matrix of booleans (true = dark).

const LEVELS = { L: 0, M: 1, Q: 2, H: 3 };
const FORMAT_BITS = [1, 0, 3, 2]; // L, M, Q, H as written into the format information
// Index [level][version]; version 0 is unused.
const ECC_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28],
];
const BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8],
];
const MAX_VERSION = 10;

const bit = (x, i) => ((x >>> i) & 1) !== 0;

function rawDataModules(ver) {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
        const n = Math.floor(ver / 7) + 2;
        result -= (25 * n - 10) * n - 55;
        if (ver >= 7) result -= 36;
    }
    return result;
}

const dataCodewords = (ver, lvl) => Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[lvl][ver] * BLOCKS[lvl][ver];

// GF(256) with the QR polynomial x^8 + x^4 + x^3 + x^2 + 1.
function gfMul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }
    return z;
}

function rsDivisor(degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
        for (let j = 0; j < degree; j++) {
            result[j] = gfMul(result[j], root);
            if (j + 1 < degree) result[j] ^= result[j + 1];
        }
        root = gfMul(root, 0x02);
    }
    return result;
}

// Reed-Solomon error correction bytes for one block of data.
export function rsRemainder(data, degree) {
    const divisor = rsDivisor(degree);
    const result = new Array(degree).fill(0);
    for (const b of data) {
        const factor = b ^ result.shift();
        result.push(0);
        for (let i = 0; i < degree; i++) result[i] ^= gfMul(divisor[i], factor);
    }
    return result;
}

function alignmentPositions(ver, size) {
    if (ver === 1) return [];
    const n = Math.floor(ver / 7) + 2;
    const step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < n; pos -= step) result.splice(1, 0, pos);
    return result;
}

function encodeData(bytes, ver, lvl) {
    const bits = [];
    const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    push(0b0100, 4); // byte mode
    push(bytes.length, ver <= 9 ? 8 : 16);
    for (const b of bytes) push(b, 8);
    const capacity = dataCodewords(ver, lvl) * 8;
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - (bits.length % 8)) % 8);
    for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);
    const out = [];
    for (let i = 0; i < bits.length; i += 8) out.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
    return out;
}

function addEccAndInterleave(data, ver, lvl) {
    const numBlocks = BLOCKS[lvl][ver];
    const eccLen = ECC_PER_BLOCK[lvl][ver];
    const raw = Math.floor(rawDataModules(ver) / 8);
    const numShort = numBlocks - (raw % numBlocks);
    const shortLen = Math.floor(raw / numBlocks);
    const blocks = [];
    for (let i = 0, k = 0; i < numBlocks; i++) {
        const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
        k += dat.length;
        const ecc = rsRemainder(dat, eccLen);
        if (i < numShort) dat.push(0);
        blocks.push(dat.concat(ecc));
    }
    const result = [];
    for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block, j) => {
            if (i !== shortLen - eccLen || j >= numShort) result.push(block[i]);
        });
    }
    return result;
}

const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

// Penalty score from the standard (lower is easier to scan).
function penalty(m) {
    const size = m.length;
    let score = 0;
    const lines = [];
    for (let i = 0; i < size; i++) {
        lines.push(m[i]);
        lines.push(m.map((row) => row[i]));
    }
    const finderA = '10111010000';
    const finderB = '00001011101';
    for (const line of lines) {
        let run = 1;
        for (let i = 1; i <= size; i++) {
            if (i < size && line[i] === line[i - 1]) run++;
            else { if (run >= 5) score += run - 2; run = 1; }
        }
        const s = line.map((v) => (v ? '1' : '0')).join('');
        for (let i = 0; i + 11 <= size; i++) {
            const part = s.slice(i, i + 11);
            if (part === finderA || part === finderB) score += 40;
        }
    }
    for (let y = 0; y + 1 < size; y++) {
        for (let x = 0; x + 1 < size; x++) {
            const c = m[y][x];
            if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
        }
    }
    const dark = m.flat().filter(Boolean).length;
    score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
    return score;
}

/**
 * Encode text as a QR code.
 * @param {string} text  UTF-8 text (a URL)
 * @param {{ level?: 'L'|'M'|'Q'|'H' }} [opts]  error correction; H survives a logo over the centre
 * @returns {{ version: number, size: number, modules: boolean[][] }}
 */
export function encodeQr(text, { level = 'M' } = {}) {
    const lvl = LEVELS[level];
    if (lvl === undefined) throw new Error(`Unknown error correction level: ${level}`);
    const bytes = [...new TextEncoder().encode(text)];
    let ver = 1;
    const fits = (v) => 4 + (v <= 9 ? 8 : 16) + bytes.length * 8 <= dataCodewords(v, lvl) * 8;
    while (ver <= MAX_VERSION && !fits(ver)) ver++;
    if (ver > MAX_VERSION) throw new Error(`Text too long for a version ${MAX_VERSION} QR code at level ${level}`);

    const size = ver * 4 + 17;
    const modules = Array.from({ length: size }, () => new Array(size).fill(false));
    const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, dark) => { modules[y][x] = dark; isFunction[y][x] = true; };

    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
        for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
                const x = cx + dx; const y = cy + dy;
                const dist = Math.max(Math.abs(dx), Math.abs(dy));
                if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
            }
        }
    }
    const align = alignmentPositions(ver, size);
    const last = align.length - 1;
    align.forEach((ax, i) => align.forEach((ay, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }));

    const drawFormat = (mask) => {
        const data = (FORMAT_BITS[lvl] << 3) | mask;
        let rem = data;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const bits = ((data << 10) | rem) ^ 0x5412;
        for (let i = 0; i <= 5; i++) set(8, i, bit(bits, i));
        set(8, 7, bit(bits, 6));
        set(8, 8, bit(bits, 7));
        set(7, 8, bit(bits, 8));
        for (let i = 9; i < 15; i++) set(14 - i, 8, bit(bits, i));
        for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(bits, i));
        for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(bits, i));
        set(8, size - 8, true);
    };
    drawFormat(0); // reserves the format area before the data is placed

    if (ver >= 7) {
        let rem = ver;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
        const bits = (ver << 12) | rem;
        for (let i = 0; i < 18; i++) {
            const a = size - 11 + (i % 3); const b = Math.floor(i / 3);
            set(a, b, bit(bits, i));
            set(b, a, bit(bits, i));
        }
    }

    const codewords = addEccAndInterleave(encodeData(bytes, ver, lvl), ver, lvl);
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
                if (!isFunction[y][x] && i < codewords.length * 8) {
                    modules[y][x] = bit(codewords[i >>> 3], 7 - (i & 7));
                    i++;
                }
            }
        }
    }

    const applyMask = (mask) => {
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!isFunction[y][x] && MASKS[mask](x, y)) modules[y][x] = !modules[y][x];
    };
    let best = 0;
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask++) {
        applyMask(mask);
        drawFormat(mask);
        const score = penalty(modules);
        if (score < bestScore) { best = mask; bestScore = score; }
        applyMask(mask); // XOR again to undo
    }
    applyMask(best);
    drawFormat(best);
    return { version: ver, size, modules };
}
