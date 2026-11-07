# PixelFolio: arah desain

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3

Design Read: portofolio desainer dan developer web untuk calon klien, gaya editorial kertas dan tinta dengan motif piksel.

Referensi rasa: craft.wild.as (grid piksel, judul besar, label kecil, gerak bertahap, kursor piksel di seluruh halaman). Efek kursor dibuat atas permintaan pemilik, ditulis ulang dari nol: tidak ada kode, teks, atau gambar referensi yang disalin. Permainan di footer referensi tidak ditiru.

## Identitas

- **Motif:** piksel persegi. Muncul di lapisan kursor seluruh halaman, pita tanah hero, sampul proyek, bar progres proses, sudut tombol yang berundak, garis bawah tautan yang putus-putus, dan nama di footer.
- **Satu aksen per palet:** hanya sebagai isian (titik status, piksel, bar progres), tidak pernah sebagai warna teks.

## Palet

Pengunjung bisa menukar palet lewat kontrol "Piksel" di pojok kiri bawah; pilihannya disimpan di browser dan diterapkan sebelum halaman tergambar (tanpa kedipan warna). Bawaan: **Hutan** (ubah di `src/data/palettes.ts`). Setiap palet mengisi peran yang sama:

| Peran | Hutan (bawaan) | Kertas | Neon | Bara |
|---|---|---|---|---|
| Kertas | `#eef0e6` | `#f3f0e8` | `#ffffff` | `#f6efe7` |
| Tinta | `#121a14` | `#14130f` | `#0a0a0a` | `#1a1210` |
| Warna kedua (hover, fokus) | `#1f6e44` | `#2b44e0` | `#3b5bd9` | `#a8360a` |
| Aksen (isian) | `#e4572e` | `#ff5a1f` | `#e0492a` | `#22b8cf` |
| Panas: dingin | `#0f3d2e` | `#1c2541` | `#1c2541` | `#4a1e12` |
| Panas: hangat | `#f0b429` | `#f2c230` | `#f5c518` | `#f59e0b` |
| Panas: paling panas | `#fff36b` | `#e2f95b` | `#d8ff00` | `#fde68a` |
| Hangat lembut (di bawah teks) | `#f8de8f` | `#f6d66b` | `#f8de72` | `#fbd99a` |

Kontras dicek untuk setiap palet (WCAG AA, 0 gagal): tinta, tinta-2, dan abu-abu di atas kertas, kertas-2, hangat lembut, dan paling panas; teks terang di panel gelap; teks putih di atas warna kedua. Hijau daun Hutan digelapkan dari `#2f8f5b` ke `#1f6e44` agar teks putih di tombol hover mencapai 6,2:1. Sampul proyek, efek kursor, dan nama piksel di footer membaca warna dari palet aktif, jadi semuanya ikut berganti tanpa muat ulang.

## Alasan setiap keputusan (antislop R-31)

| Keputusan | Alasan |
|---|---|
| Kertas + tinta di setiap palet | Kesan cetak; latar tidak pernah putih murni kecuali palet Neon yang memang meniru referensi. |
| Warna kedua untuk hover dan skala piksel | Satu warna kerja selain tinta, agar aksen tetap langka. |
| Hutan sebagai bawaan | Pilihan pemilik: hijau jarang dipakai portofolio, jadi langsung berbeda dari template lain. |
| Tema terang tanpa toggle gelap | Identitasnya kertas dan tinta; panel gelap (proyek unggulan, proses) dipakai sebagai jeda ritme, bukan mode. |
| Schibsted Grotesk | Grotesk editorial dengan karakter tegas di ukuran besar, bukan Inter/Geist bawaan AI. |
| Tiny5 untuk label kecil | Font piksel yang angka dan huruf kecilnya tetap terbaca di 15px (Pixelify Sans diuji dan ditolak: angka 5 terbaca seperti S). Huruf biasa, bukan kapital berjarak lebar. |
| Bitmap 5x7 buatan sendiri di footer | Tajam di setiap ukuran dan tidak bergantung pada pemuatan font. |
| Skala panas efek: dingin, warna kedua, hangat, paling panas, plus percikan aksen | Satu skala per palet, bukan lima warna lepas. Hanya isian piksel, tidak pernah warna teks. |
| Di bawah teks hanya "paling panas" dan "hangat lembut" | Teks tetap lolos AA di keempat palet (terendah 4,77:1). Kuning biasa ditolak (Kertas: 4,23:1). Mata dan mulut wajah tidak digambar di bawah teks, dan wajah hanya muncul di area kosong. |
| Grid sel 14px tipis di latar | Memperlihatkan papan tempat kursor menggambar; ikut hilang saat efek dimatikan (antislop R-07). |
| Grid 8px | Semua jarak kelipatan satu "piksel besar", agar motif terasa sampai ke tata letak. |
| Proyek unggulan + indeks baris | Hierarki jelas: satu proyek besar, sisanya daftar yang cepat dipindai. Bukan grid kartu seragam (R-14). |
| Panel pratinjau di arsip | Memberi gambar pada bagian yang tadinya hanya teks; berganti saat hover dan saat fokus keyboard. |
| Empat tahap proses dengan bar progres | Bar menunjukkan posisi tahap (1/4 sampai 4/4), jadi berfungsi, bukan hiasan. Empat, bukan pola tiga langkah. |
| Panah piksel di baris arsip | Satu-satunya panah di situs: menandai baris sebagai tautan ke halaman studi kasus. |
| Sudut berundak pada tombol | Satu bentuk tombol untuk seluruh situs, menyambung motif piksel tanpa radius pil. |
| Radius 16px hanya pada panel gelap dan gambar | Membedakan bidang besar dari kontrol kecil yang bersudut tegas. |

