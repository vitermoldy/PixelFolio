/**
 * PixelFolio: satu-satunya file yang perlu Anda ubah.
 *
 * Semua teks di bawah adalah ISIAN TEMPLATE. Ganti dengan data asli Anda.
 * Jangan menambahkan angka, klien, atau testimoni yang tidak bisa dibuktikan.
 * Bagian yang dikosongkan (array kosong / string kosong) tidak akan tampil.
 */

export type Project = {
  /** Dipakai sebagai URL: /karya/<slug>/ */
  slug: string;
  title: string;
  /** Satu kalimat: apa yang dibuat dan untuk siapa. */
  summary: string;
  kind: string;
  year: number;
  role: string;
  tools: string[];
  /**
   * Path gambar di /public, misal "/images/proyek-satu.jpg".
   * Kosongkan untuk memakai sampul piksel otomatis (penanda sampai screenshot asli siap).
   */
  cover?: string;
  /** Angka 0 sampai 3, memilih pasangan warna sampul piksel otomatis. */
  tone: 0 | 1 | 2 | 3;
  /** Tautan ke situs live. Kosongkan bila tidak ada. */
  url?: string;
  /** Isi halaman studi kasus. */
  caseStudy: { heading: string; body: string }[];
};

export const profile = {
  name: 'Nama Anda',
  initials: 'NA',
  role: 'desainer & developer web',
  /** Kota atau kawasan saja, tanpa alamat lengkap. */
  city: 'Jakarta',
  /** Path foto di /public, misal "/images/foto.jpg". Kosong = avatar inisial. */
  photo: '',
  /** Kalimat pendek di bawah judul hero, 15 sampai 30 kata. */
  intro:
    'Saya merancang dan membangun situs serta aplikasi web untuk brand kecil dan tim produk, dari riset pertama sampai halaman yang siap rilis.',
  /** Status ketersediaan. Kosongkan bila tidak ingin ditampilkan. */
  availability: 'Menerima proyek baru mulai Januari 2027',
  /** Gunakan alamat asli Anda. Domain .example hanya penanda template. */
  email: 'halo@namaanda.example',
  /** Janji balasan yang benar-benar bisa Anda tepati. Kosongkan bila tidak yakin. */
  replyNote: 'Tulis singkat tentang proyek, tenggat, dan kisaran anggaran Anda.',
  /** Path file CV di /public, misal "/cv.pdf". Kosongkan untuk menyembunyikan tombol. */
  cvFile: '',
  socials: [] as { label: string; url: string }[],
};

