/**
 * Lapisan piksel untuk seluruh halaman.
 *
 * - Kanvas tetap (fixed) di belakang konten; sel menempel ke grid dokumen 14px,
 *   jadi jejak ikut bergulir bersama konten.
 * - Kursor meninggalkan "panas": paling panas lime, lalu kuning, biru, navy,
 *   dan di ujung yang dingin piksel pecah menjadi titik ber-dither.
 * - Klik/ketuk: gelombang cincin piksel dari titik klik.
 * - Kursor diam: wajah piksel muncul, berkedip, berganti ekspresi.
 *   Bergerak lagi: wajah meleleh jadi panas. Klik wajahnya: hati piksel naik.
 * - Di bawah teks piksel tetap tergambar, tapi hanya dengan warna terang (lime, kuning lembut)
 *   agar teks di atasnya tetap lolos kontras WCAG AA.
 * - Loop animasi hanya berjalan saat ada yang berubah. Tanpa interaksi, CPU diam.
 */

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const TAU = 620; // ms, kecepatan panas mendingin
const IDLE_FACE_MS = 900;
const RING_MS = 680;
const HEART_MS = 1500;
const SIGMA = [0, 1.15, 1.7, 2.5]; // ukuran kuas S, M, L
/** Elemen berisi teks: piksel di bawahnya memakai warna terang saja. */
const TEXT_ZONES =
  'h1, h2, h3, p, dt, dd, li, .btn--ghost, .row, [data-wordmark-root], .next-link, .skip-link, input, textarea, label';

const HEART = ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];

type Ring = { cx: number; cy: number; t0: number; seed: number };
type Heart = { cx: number; cy: number; t0: number; seed: number };
type Expr = 'smile' | 'happy' | 'o' | 'wink';
type Face = {
  cx: number;
  cy: number;
  t0: number;
  variant: number;
  freckles: Map<string, number>;
  expr: Expr;
  exprUntil: number;
  blinkUntil: number;
  nextBlink: number;
  expireAt: number;
};

function hash(a: number, b: number, c = 0) {
  const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export type FieldApi = {
  setEnabled(on: boolean): void;
  setBrush(size: 1 | 2 | 3): void;
  refreshColours(): void;
};

// indeks palet (nama mengikuti palet "kertas"; warnanya mengikuti palet aktif: dingin, tengah, hangat, panas)
const NAVY = 0;
const BLUE = 1;
const YELLOW = 2;
const LIME = 3;
const SPARK = 4;
const INK = 5;
const SOFT = 6; // kuning lembut, aman di bawah teks
const BLUE_FAINT = 7;
const NAVY_FAINT = 8;
const DIM_BLUE = 9; // cincin yang memudar
/** Warna pengganti di bawah teks; -1 = jangan digambar. */
// mata dan mulut wajah (tinta) tidak digambar di bawah teks, agar huruf tidak tertumpuk tinta
const UNDER_TEXT = [SOFT, LIME, SOFT, LIME, SOFT, -1, SOFT, -1, -1, -1];

