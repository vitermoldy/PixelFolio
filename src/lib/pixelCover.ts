/**
 * Sampul piksel otomatis untuk proyek yang belum punya screenshot.
 * Dihasilkan saat build sebagai SVG (tanpa JavaScript di browser).
 * Komposisi ditentukan dari slug, jadi setiap proyek punya sampul berbeda tapi stabil.
 */

/** Warna disimpan sebagai variabel CSS, jadi sampul ikut berganti saat pengunjung menukar palet. */
const PALETTES = [
  { bg: '--paper', a: '--mid', b: '--paper-2', c: '--ink', d: '--accent' },
  { bg: '--ink', a: '--accent', b: '--ink-2', c: '--paper', d: '--mid' },
  { bg: '--mid', a: '--paper', b: '--px-cold', c: '--ink', d: '--accent' },
  { bg: '--accent', a: '--ink', b: '--px-warm', c: '--paper', d: '--mid' },
] as const;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

