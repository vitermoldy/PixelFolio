# PixelFolio

Template portofolio dengan motif piksel, dibangun dengan [Astro](https://astro.build) dan TypeScript. Hasil build berupa HTML statis tanpa framework di browser (sekitar 96 KiB total, JavaScript 6 KiB gzip).

## Efek piksel

Di seluruh halaman, kursor meninggalkan jejak piksel yang mendingin dari lime ke kuning, biru, lalu navy. Klik di mana saja untuk gelombang cincin. Diamkan kursor sebentar untuk memunculkan wajah piksel, lalu klik wajahnya untuk hati. Di bawah teks, piksel otomatis memakai warna terang agar teks tetap terbaca. Di layar sentuh, ketukan memunculkan cincin dan wajah.

Pengunjung bisa mematikan efek, mengganti ukuran kuas, dan menukar palet warna lewat kontrol "Piksel" di pojok kiri bawah. Kodenya ada di [`src/scripts/pixelField.ts`](src/scripts/pixelField.ts); warna diatur lewat variabel `--px-*` di [`src/styles/global.css`](src/styles/global.css).

