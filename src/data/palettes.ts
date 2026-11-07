/**
 * Palet warna yang bisa dipilih pengunjung lewat kontrol "Piksel".
 * Nilai warnanya ada di src/styles/global.css ([data-palette='...']).
 *
 * Ganti `defaultPalette` untuk memilih palet yang dilihat pengunjung pertama kali.
 */

export const palettes = [
  { id: 'hutan', name: 'Hutan' },
  { id: 'kertas', name: 'Kertas' },
  { id: 'neon', name: 'Neon' },
  { id: 'bara', name: 'Bara' },
] as const;

export type PaletteId = (typeof palettes)[number]['id'];

export const defaultPalette: PaletteId = 'hutan';
