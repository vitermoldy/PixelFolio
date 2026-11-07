# PixelFolio

Template portofolio dengan motif piksel, dibangun dengan [Astro](https://astro.build) dan TypeScript. Hasil build berupa HTML statis tanpa framework di browser (sekitar 96 KiB total, JavaScript 6 KiB gzip).

## Efek piksel

Di seluruh halaman, kursor meninggalkan jejak piksel yang mendingin dari lime ke kuning, biru, lalu navy. Klik di mana saja untuk gelombang cincin. Diamkan kursor sebentar untuk memunculkan wajah piksel, lalu klik wajahnya untuk hati. Di bawah teks, piksel otomatis memakai warna terang agar teks tetap terbaca. Di layar sentuh, ketukan memunculkan cincin dan wajah.

Pengunjung bisa mematikan efek, mengganti ukuran kuas, dan menukar palet warna lewat kontrol "Piksel" di pojok kiri bawah. Kodenya ada di [`src/scripts/pixelField.ts`](src/scripts/pixelField.ts); warna diatur lewat variabel `--px-*` di [`src/styles/global.css`](src/styles/global.css).

## Palet warna

Ada empat palet: **Hutan** (bawaan), **Kertas**, **Neon**, dan **Bara**. Pilihan pengunjung diingat browser.

- Ganti palet bawaan: ubah `defaultPalette` di [`src/data/palettes.ts`](src/data/palettes.ts).
- Ubah warnanya: edit blok `[data-palette='...']` di [`src/styles/global.css`](src/styles/global.css). Setiap palet punya peran yang sama (kertas, tinta, warna kedua, aksen, skala panas); penjelasan dan hasil cek kontras ada di [DESIGN.md](DESIGN.md).
- Tambah palet: salin satu blok di `global.css` dengan nama baru, lalu daftarkan namanya di `palettes.ts`. Tombolnya muncul otomatis.

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # cek tipe + build ke folder dist/
npm run preview   # lihat hasil build
```

Butuh Node 22 atau lebih baru.

