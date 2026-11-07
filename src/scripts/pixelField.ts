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

