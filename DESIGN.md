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

