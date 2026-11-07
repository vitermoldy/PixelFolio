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

export function mountPixelField(canvas: HTMLCanvasElement): FieldApi | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const v = (name: string, fallback: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  let PAL: { colour: string; alpha: number }[] = [];
  /** Baca ulang warna dari palet aktif (dipanggil lagi saat pengunjung menukar palet). */
  function readColours() {
    const mid = v('--mid', '#1f6e44');
    const cold = v('--px-cold', '#0f3d2e');
    PAL = [
      { colour: cold, alpha: 1 },
      { colour: mid, alpha: 1 },
      { colour: v('--px-warm', '#f0b429'), alpha: 1 },
      { colour: v('--px-hot', '#fff36b'), alpha: 1 },
      { colour: v('--accent', '#e4572e'), alpha: 1 },
      { colour: v('--ink', '#121a14'), alpha: 1 },
      { colour: v('--px-soft', '#f8de8f'), alpha: 1 },
      { colour: mid, alpha: 0.42 },
      { colour: cold, alpha: 0.42 },
      { colour: mid, alpha: 0.55 },
    ];
  }
  readColours();
  const FACE_BODY = [LIME, BLUE, YELLOW];
  const FACE_FRECKLES = [
    [YELLOW, SPARK],
    [YELLOW, LIME, SPARK],
    [LIME, SPARK],
  ];

  const cell = parseFloat(v('--px', '14')) || 14;
  let enabled = true;
  let sigma = SIGMA[2];
  let W = 0;
  let H = 0;
  let cols = 0;
  let rows = 0;
  let baseRow = 0; // baris dokumen di tepi atas kanvas
  let offY = 0; // sisa gulir di bawah satu sel
  let heat = new Float32Array(0);
  let zone = new Uint8Array(0); // 1 = di bawah teks
  let buf = new Int8Array(0); // warna akhir per sel, -1 = kosong
  let zoneDirty = true;
  let zoneEls: Element[] = [];

  const pointer = { x: -1, y: -1, inside: false, lastMove: 0, px: -1, py: -1 };
  const rings: Ring[] = [];
  const hearts: Heart[] = [];
  let face: Face | null = null;
  let raf = 0;
  let last = performance.now();
  let timer = 0;

  // pita tanah di dasar hero, dalam koordinat dokumen
  const ground = document.querySelector<HTMLElement>('[data-px-ground]');
  let groundRows = new Map<number, Uint8Array>();
  let groundTop = 0;
  let groundBottom = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introStart = reduced ? -Infinity : performance.now();

  /* ---------- ukuran & grid ---------- */

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = document.documentElement.clientWidth;
    H = window.innerHeight;
    cols = Math.ceil(W / cell) + 1;
    rows = Math.ceil(H / cell) + 2;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    heat = new Float32Array(cols * rows);
    zone = new Uint8Array(cols * rows);
    buf = new Int8Array(cols * rows);
    baseRow = Math.floor(window.scrollY / cell);
    zoneEls = [...document.querySelectorAll(TEXT_ZONES)];
    buildGround();
    zoneDirty = true;
  }

  function buildGround() {
    groundRows = new Map();
    if (!ground) return;
    const r = ground.getBoundingClientRect();
    const bottom = Math.floor((r.bottom + window.scrollY) / cell);
    const band = Math.max(8, Math.round((r.height / cell) * 0.3));
    groundTop = bottom - band;
    groundBottom = bottom;
    for (let row = groundTop; row < bottom; row++) {
      const line = new Uint8Array(cols);
      for (let c = 0; c < cols; c++) {
        const wave = Math.sin(c * 0.11) * 0.08 + Math.sin(c * 0.037 + 1.7) * 0.12;
        const p = (row - groundTop) / band + wave;
        const t = (BAYER[row % 4][c % 4] + 0.5) / 16;
        let k = 0;
        if (p > 0.66 + t * 0.34) k = NAVY + 1;
        else if (p > 0.3 + t * 0.4) k = BLUE + 1;
        else if (p > 0.12 + t * 0.85 && hash(c, row) > 0.55) k = hash(row, c) > 0.8 ? LIME + 1 : YELLOW + 1;
        line[c] = k;
      }
      groundRows.set(row, line);
    }
  }

  /** Geser larik panas saat dokumen bergulir, agar jejak menempel di konten. */
  function syncScroll() {
    const nb = Math.floor(window.scrollY / cell);
    offY = window.scrollY - nb * cell;
    const d = nb - baseRow;
    if (d === 0) return;
    if (Math.abs(d) >= rows) heat.fill(0);
    else if (d > 0) {
      heat.copyWithin(0, d * cols);
      heat.fill(0, (rows - d) * cols);
    } else {
      heat.copyWithin(-d * cols, 0, (rows + d) * cols);
      heat.fill(0, 0, -d * cols);
    }
    baseRow = nb;
    zoneDirty = true;
  }

  function buildZones() {
    zone.fill(0);
    const pad = cell * 0.25;
    const sy = window.scrollY;
    for (const el of zoneEls) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < -cell || r.top > H + cell) continue;
      const c0 = Math.max(0, Math.floor((r.left - pad) / cell));
      const c1 = Math.min(cols - 1, Math.ceil((r.right + pad) / cell) - 1);
      const r0 = Math.max(0, Math.floor((r.top + sy - pad) / cell) - baseRow);
      const r1 = Math.min(rows - 1, Math.ceil((r.bottom + sy + pad) / cell) - 1 - baseRow);
      for (let y = r0; y <= r1; y++) zone.fill(1, y * cols + c0, y * cols + c1 + 1);
    }
    zoneDirty = false;
  }

  /* ---------- panas ---------- */

  function deposit(cx: number, cy: number, amount: number, s: number) {
    const rad = Math.ceil(s * 3);
    const inv = 1 / (2 * s * s);
    const row0 = cy - baseRow;
    for (let dy = -rad; dy <= rad; dy++) {
      const r = row0 + dy;
      if (r < 0 || r >= rows) continue;
      for (let dx = -rad; dx <= rad; dx++) {
        const c = cx + dx;
        if (c < 0 || c >= cols) continue;
        const w = Math.exp(-(dx * dx + dy * dy) * inv);
        if (w < 0.02) continue;
        const i = r * cols + c;
        heat[i] = Math.min(1, heat[i] + amount * w);
      }
    }
  }

  const docCell = (x: number, y: number) => ({ c: Math.floor(x / cell), r: Math.floor((y + window.scrollY) / cell) });

  /* ---------- wajah ---------- */

  const faceRadius = () => (W < 640 ? 4 : 5);
  const inFace = (x: number, y: number, R: number) => x * x + y * y <= R * R + R * 0.6;

  function spawnFace(cx: number, cy: number, now: number, ttl = Infinity) {
    // di atas pita tanah yang biru, wajah biru tenggelam: pakai lime atau kuning saja
    const onGround = cy >= groundTop - faceRadius() && cy < groundBottom;
    const choices = onGround ? [0, 2] : [0, 1, 2];
    const variant = choices[Math.floor(Math.random() * choices.length)];
    const R = faceRadius();
    const freckles = new Map<string, number>();
    const palette = FACE_FRECKLES[variant];
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        if (inFace(x, y, R) && Math.random() < 0.09) freckles.set(`${x},${y}`, palette[Math.floor(Math.random() * palette.length)]);
      }
    }
    face = {
      cx,
      cy,
      t0: now,
      variant,
      freckles,
      expr: 'smile',
      exprUntil: Infinity,
      blinkUntil: 0,
      nextBlink: now + 1600 + Math.random() * 2400,
      expireAt: now + ttl,
    };
  }

  function featureCells(f: Face, now: number): Set<string> {
    const s = new Set<string>();
    const add = (...pts: number[]) => {
      for (let i = 0; i < pts.length; i += 2) s.add(`${pts[i]},${pts[i + 1]}`);
    };
    const blinking = now < f.blinkUntil;
    if (f.expr === 'happy') add(-3, -1, -2, -2, -1, -1, 1, -1, 2, -2, 3, -1);
    else {
      const eye = (x: number, closed: boolean) => (closed ? add(x - 1, -1, x, -1, x + 1, -1) : add(x, -2, x, -1));
      eye(-2, blinking || f.expr === 'wink');
      eye(2, blinking);
    }
    if (f.expr === 'o') add(-1, 1, 0, 1, 1, 1, -1, 2, 1, 2, -1, 3, 0, 3, 1, 3);
    else add(-3, 1, 3, 1, -2, 2, -1, 2, 0, 2, 1, 2, 2, 2);
    return s;
  }

  function dissolveFace() {
    if (!face) return;
    const R = faceRadius();
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) if (inFace(x, y, R)) deposit(face.cx + x, face.cy + y, 0.7, 0.6);
    }
    face = null;
  }

  /* ---------- gambar ---------- */

  /** Tulis satu sel; yang ditulis belakangan menang (lapisan atas). */
  function put(p: number, c: number, r: number) {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    const i = r * cols + c;
    const q = zone[i] ? UNDER_TEXT[p] : p;
    if (q >= 0) buf[i] = q;
  }

  function draw(now: number) {
    if (zoneDirty) buildZones();
    buf.fill(-1);
    const tick = Math.floor(now / 140);

    // 1. tanah hero (statis setelah intro), tidak tampil di bawah teks
    if (groundRows.size) {
      const p = Math.min(1, (now - introStart) / 900);
      const visibleFrom = groundBottom - Math.round((groundBottom - groundTop) * (Math.ceil(p * 8) / 8));
      for (let r = 0; r < rows; r++) {
        const docRow = r + baseRow;
        if (docRow < visibleFrom || docRow >= groundBottom) continue;
        const line = groundRows.get(docRow);
        if (!line) continue;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (line[c] && !zone[i]) buf[i] = line[c] - 1;
        }
      }
    }

    if (enabled) {
      // 2. panas kursor
      for (let r = 0; r < rows; r++) {
        const docRow = r + baseRow;
        for (let c = 0; c < cols; c++) {
          const h = heat[r * cols + c];
          if (h < 0.04) continue;
          let p: number;
          if (h > 0.86) p = LIME;
          else if (h > 0.62) p = YELLOW;
          else if (h > 0.4) p = BLUE;
          else if (h > 0.22) p = NAVY;
          else {
            // ujung dingin: titik ber-dither, pudar seperti lavender
            if ((BAYER[docRow & 3][c & 3] + 0.5) / 16 > h / 0.22) continue;
            p = hash(c, docRow) > 0.3 ? BLUE_FAINT : NAVY_FAINT;
          }
          if (h > 0.45 && hash(c, docRow, tick) > 0.965) p = SPARK;
          put(p, c, r);
        }
      }

      // 3. gelombang cincin
      for (const ring of rings) {
        const t = Math.min(1, (now - ring.t0) / RING_MS);
        const radius = 1.5 + 22 * (1 - Math.pow(1 - t, 2.2));
        const R = Math.ceil(radius) + 1;
        for (let dy = -R; dy <= R; dy++) {
          const r = ring.cy + dy - baseRow;
          if (r < 0 || r >= rows) continue;
          for (let dx = -R; dx <= R; dx++) {
            if (Math.abs(Math.hypot(dx, dy) - radius) > 0.55) continue;
            const hs = hash(dx, dy, ring.seed);
            if (hs < t * 0.6) continue; // makin jarang saat melebar
            const c = ring.cx + dx;
            put(hs > 0.97 ? LIME : hs > 0.86 ? YELLOW : t > 0.65 ? DIM_BLUE : BLUE, c, r);
            if (c >= 0 && c < cols && hash(dx, dy, ring.seed + tick) > 0.93) {
              const i = r * cols + c;
              heat[i] = Math.max(heat[i], 0.3); // serpihan yang ikut mendingin
            }
          }
        }
      }

      // 4. wajah
      if (face) {
        const R = faceRadius();
        const grow = Math.min(R, 1 + Math.floor((now - face.t0) / 55));
        const feats = grow === R ? featureCells(face, now) : null;
        for (let y = -grow; y <= grow; y++) {
          for (let x = -grow; x <= grow; x++) {
            if (!inFace(x, y, grow)) continue;
            const key = `${x},${y}`;
            const p = feats?.has(key) ? INK : (face.freckles.get(key) ?? FACE_BODY[face.variant]);
            put(p, face.cx + x, face.cy + y - baseRow);
          }
        }
      }

      // 5. hati: naik satu sel tiap 100ms
      for (const h of hearts) {
        const age = now - h.t0;
        const lift = Math.floor(age / 100);
        const thin = age > HEART_MS - 450 ? (age - (HEART_MS - 450)) / 450 : 0;
        HEART.forEach((line, y) => {
          for (let x = 0; x < line.length; x++) {
            if (line[x] !== '#') continue;
            const s = hash(x, y, h.seed);
            if (s < thin) continue; // menipis sebelum hilang
            const p = s > 0.82 ? LIME : s > 0.45 ? YELLOW : SPARK;
            put(p, h.cx + x - 4, h.cy + y - 8 - lift - baseRow);
          }
        });
      }
    }

    // gambar per warna
    ctx!.clearRect(0, 0, W, H);
    const s = cell - 2;
    for (let p = 0; p < PAL.length; p++) {
      ctx!.globalAlpha = PAL[p].alpha;
      ctx!.fillStyle = PAL[p].colour;
      for (let i = 0; i < buf.length; i++) {
        if (buf[i] !== p) continue;
        const c = i % cols;
        const r = (i - c) / cols;
        ctx!.fillRect(c * cell + 1, r * cell - offY + 1, s, s);
      }
    }
    ctx!.globalAlpha = 1;
  }

  /* ---------- loop ---------- */

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(50, now - last);
    last = now;
    syncScroll();

    let busy = now - introStart < 950;

    // panas mendingin
    const k = Math.exp(-dt / TAU);
    for (let i = 0; i < heat.length; i++) {
      const h = heat[i];
      if (h === 0) continue;
      const n = h * k;
      heat[i] = n < 0.035 ? 0 : n;
      busy = true;
    }

    if (enabled) {
      // gumpalan di bawah kursor; berhenti setelah kursor diam agar loop bisa tidur
      if (pointer.inside && !face && now - pointer.lastMove < IDLE_FACE_MS + 300) {
        const { c, r } = docCell(pointer.x, pointer.y);
        deposit(c, r, 0.085 * (dt / 16), sigma);
        busy = true;
        // wajah hanya muncul bila titik tengahnya di area kosong, bukan di atas teks
        const row = r - baseRow;
        const free = row >= 0 && row < rows && c >= 0 && c < cols && !zone[row * cols + c];
        if (now - pointer.lastMove > IDLE_FACE_MS && free) spawnFace(c, r, now);
      }

      if (face) {
        if (now >= face.expireAt) dissolveFace();
        else {
          if (now - face.t0 < 400) busy = true;
          if (now > face.exprUntil) {
            face.expr = 'smile';
            face.exprUntil = Infinity;
          }
          if (face.expr === 'smile' && now - face.t0 > 6500) face.expr = 'happy';
          if (now >= face.nextBlink) {
            face.blinkUntil = now + 150;
            if (Math.random() < 0.18 && face.expr === 'smile') {
              face.expr = 'wink';
              face.exprUntil = now + 450;
            }
            face.nextBlink = now + 2200 + Math.random() * 2600;
          }
          if (now < face.blinkUntil) busy = true;
        }
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        if (now - rings[i].t0 > RING_MS) rings.splice(i, 1);
        else busy = true;
      }

      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        if (now - h.t0 > HEART_MS) {
          deposit(h.cx, h.cy - 4 - Math.floor(HEART_MS / 100), 0.9, 1.6); // meleleh jadi panas
          hearts.splice(i, 1);
        }
        busy = true;
      }
    }

    draw(now);

    if (busy) raf = requestAnimationFrame(frame);
    else scheduleFaceTimer(now);
  }

  /** Saat diam, wajah tetap hidup lewat timer (kedip, ekspresi) tanpa loop 60fps. */
  function scheduleFaceTimer(now: number) {
    clearTimeout(timer);
    if (!face || !enabled) return;
    const next = Math.min(face.nextBlink, face.exprUntil, face.expireAt, face.expr === 'smile' ? face.t0 + 6500 : Infinity);
    if (Number.isFinite(next)) timer = window.setTimeout(wake, Math.max(16, next - now));
  }

  function wake() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------- input ---------- */

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch' || !enabled) return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      pointer.lastMove = performance.now();
      const { c, r } = docCell(e.clientX, e.clientY);
      if (face && Math.abs(c - face.cx) + Math.abs(r - face.cy) > 1) dissolveFace();
      // jejak sepanjang lintasan agar gerakan cepat tetap menyambung, lebih ramping dari kepala
      if (pointer.px >= 0) {
        const p0 = docCell(pointer.px, pointer.py);
        const steps = Math.min(48, Math.max(Math.abs(c - p0.c), Math.abs(r - p0.r)));
        for (let s = 1; s <= steps; s++) {
          deposit(Math.round(p0.c + ((c - p0.c) * s) / steps), Math.round(p0.r + ((r - p0.r) * s) / steps), 0.26, sigma * 0.62);
        }
      }
      pointer.px = e.clientX;
      pointer.py = e.clientY;
      wake();
    },
    { passive: true },
  );

  document.documentElement.addEventListener('pointerleave', () => {
    pointer.inside = false;
    pointer.px = -1;
    wake();
  });

  addEventListener(
    'pointerdown',
    (e) => {
      if (!enabled) return;
      const now = performance.now();
      const { c, r } = docCell(e.clientX, e.clientY);
      if (face && Math.hypot(c - face.cx, r - face.cy) <= faceRadius() + 1) {
        // klik wajah: kaget sebentar, lalu hati piksel naik
        face.expr = 'o';
        face.exprUntil = now + 700;
        hearts.push({ cx: face.cx, cy: face.cy - faceRadius(), t0: now, seed: Math.random() * 100 });
        if (hearts.length > 4) hearts.shift();
        if (face.expireAt !== Infinity) face.expireAt = Math.max(face.expireAt, now + 1800);
      } else {
        rings.push({ cx: c, cy: r, t0: now, seed: Math.random() * 100 });
        if (rings.length > 6) rings.shift();
        deposit(c, r, 1.1, sigma * 1.3);
        const row = r - baseRow;
        const free = row >= 0 && row < rows && c >= 0 && c < cols && !zone[row * cols + c];
        if (e.pointerType === 'touch' && !face && free) spawnFace(c, r, now, 2600);
      }
      wake();
    },
    { passive: true },
  );

  addEventListener('scroll', wake, { passive: true });

  let lastW = document.documentElement.clientWidth;
  addEventListener('resize', () => {
    if (document.documentElement.clientWidth === lastW && Math.abs(window.innerHeight - H) < 120) return; // bilah alamat ponsel
    lastW = document.documentElement.clientWidth;
    size();
    wake();
  });
  // tata letak berubah (font termuat, menu dibuka): hitung ulang zona teks dan tanah
  new ResizeObserver(() => {
    zoneEls = [...document.querySelectorAll(TEXT_ZONES)];
    buildGround();
    zoneDirty = true;
    wake();
  }).observe(document.body);

  size();
  wake();

  return {
    setEnabled(on) {
      enabled = on;
      if (!on) {
        heat.fill(0);
        rings.length = 0;
        hearts.length = 0;
        face = null;
        clearTimeout(timer);
      }
      wake();
    },
    setBrush(sz) {
      sigma = SIGMA[sz];
    },
    refreshColours() {
      readColours();
      wake();
    },
  };
}
