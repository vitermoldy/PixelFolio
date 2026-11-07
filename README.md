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

## Mengisi dengan data Anda

Semua teks ada di satu file: [`src/data/profile.ts`](src/data/profile.ts).

1. Ganti nama, peran, kota, dan kalimat pembuka di `profile`.
2. Ganti `email` dengan alamat asli. Domain `.example` hanya penanda template.
3. Isi `projects`. Proyek pertama tampil besar sebagai proyek unggulan; sisanya masuk daftar "Proyek lainnya". Setiap proyek otomatis mendapat halaman di `/karya/<slug>/`.
4. Taruh screenshot proyek di `public/images/` lalu isi `cover: '/images/nama-file.jpg'`. Tanpa `cover`, proyek memakai sampul piksel otomatis.
5. Taruh foto Anda di `public/images/` lalu isi `photo`. Tanpa foto, yang tampil adalah inisial.
6. Isi `cvFile` dan `socials` bila ingin tombol CV dan tautan media sosial muncul.
7. Ganti `site` di [`astro.config.mjs`](astro.config.mjs) dengan domain Anda.

Bagian yang dikosongkan tidak akan tampil. Jangan menambahkan angka, klien, atau testimoni yang tidak bisa dibuktikan.

## Struktur

```
src/
  data/profile.ts        semua konten
  data/palettes.ts       daftar palet dan palet bawaan
  components/            Header, Hero, Work, About, Process, Footer, Cover, PixelField
  scripts/               pixelField.ts (efek kursor), pixelWordmark.ts (footer)
  lib/pixelCover.ts      generator sampul piksel (dijalankan saat build)
  pages/                 beranda, /karya/[slug], 404
  styles/global.css      token warna, tipografi, tombol
DESIGN.md                arah desain dan alasan setiap keputusan
```

