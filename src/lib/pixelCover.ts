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

