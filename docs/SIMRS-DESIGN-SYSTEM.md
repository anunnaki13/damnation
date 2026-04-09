# SIMRS Design System Blueprint

> **Glassmorphism UI Style Guide — RSUD Petala Bumi**
> Versi 1.0 · April 2026 · CV Panda Global Teknologi

---

## Daftar Isi

- [1. Pendahuluan & Visi Desain](#1-pendahuluan--visi-desain)
- [2. Design Principles](#2-design-principles)
- [3. Color System](#3-color-system)
- [4. Typography](#4-typography)
- [5. Spacing & Layout Grid](#5-spacing--layout-grid)
- [6. Glassmorphism Specifications](#6-glassmorphism-specifications)
- [7. Component Library](#7-component-library)
- [8. Iconography](#8-iconography)
- [9. Data Visualization](#9-data-visualization)
- [10. Motion & Animation](#10-motion--animation)
- [11. Accessibility](#11-accessibility)
- [12. Dark Mode & Light Mode](#12-dark-mode--light-mode)
- [13. Responsive Breakpoints](#13-responsive-breakpoints)
- [14. Implementation Guidelines](#14-implementation-guidelines)

---

## 1. Pendahuluan & Visi Desain

### Tujuan Dokumen

Dokumen ini merupakan **single source of truth** untuk seluruh aspek visual dan interaksi pada aplikasi SIMRS RSUD Petala Bumi. Setiap developer wajib merujuk dokumen ini untuk menjaga konsistensi tampilan dan pengalaman pengguna di seluruh modul aplikasi.

Aplikasi SIMRS ini dirancang dengan pendekatan **Glassmorphism Premium** — estetika modern yang menggabungkan efek transparan kaca (frosted glass), background animasi halus, dan palet warna sophisticated. Pendekatan ini memberikan kesan profesional sekaligus modern, serta membantu memisahkan layer informasi secara visual tanpa membebani pengguna.

### Target Pengguna

Desain dioptimalkan untuk empat kelompok utama:

1. **Dokter & tenaga medis** — akses cepat ke data pasien
2. **Staf administrasi & pendaftaran** — form-intensive workflow
3. **Manajemen rumah sakit** — dashboard analitik
4. **Farmasi & laboratorium** — interface presisi, minim error

### Platform & Environment

| Parameter | Spesifikasi |
|---|---|
| Platform | Web Application (Browser-based) |
| Framework | React.js / Next.js dengan Tailwind CSS |
| Browser Target | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Resolusi Minimum | 1366 × 768 px (Laptop) |
| Resolusi Optimal | 1920 × 1080 px (Full HD) |
| Responsive | Adaptive layout untuk tablet (768px+) |
| Mode Tampilan | Dark Mode (Primary) + Light Mode (Secondary) |

---

## 2. Design Principles

Setiap keputusan desain berpijak pada lima prinsip fundamental. Prinsip ini menjadi filter utama saat membuat keputusan desain baru atau memodifikasi komponen.

### 2.1 Clarity Over Decoration

Setiap elemen visual harus memiliki fungsi. Efek glassmorphism digunakan untuk membentuk hierarki informasi, bukan sekadar estetika. Jangan menambahkan efek blur atau transparansi jika tidak membantu pengguna memahami konten.

### 2.2 Consistent & Predictable

Komponen yang sama harus berperilaku dan terlihat sama di seluruh modul. Seorang perawat yang sudah terbiasa dengan modul rawat inap harus langsung familiar dengan modul rawat jalan.

### 2.3 Data Density with Comfort

Rumah sakit membutuhkan tampilan data padat namun tetap nyaman dibaca. Gunakan spacing, tipografi, dan warna untuk menciptakan visual breathing room tanpa membuang ruang layar.

### 2.4 Accessible & Inclusive

Contrast ratio minimum 4.5:1 untuk teks normal dan 3:1 untuk teks besar. Seluruh interaksi harus bisa diakses via keyboard. Warna tidak boleh menjadi satu-satunya cara menyampaikan informasi.

### 2.5 Performance First

Efek glassmorphism (`backdrop-filter`, `blur`) harus diimplementasikan secara hemat. Batasi jumlah layer blur aktif dalam satu viewport. Prioritaskan kecepatan render di atas visual fidelity.

---

## 3. Color System

Sistem warna menggunakan pendekatan layered color yang dioptimalkan untuk dark mode sebagai mode utama.

### 3.1 Primary Palette

```css
--primary:       #7C3AED;   /* Violet — aksi utama */
--primary-dark:  #6D28D9;   /* Violet gelap — hover state */
--primary-soft:  #A78BFA;   /* Violet lembut — teks aktif, aksen */
--primary-dim:   rgba(139, 92, 246, 0.12);  /* Background highlight */
--primary-bg:    #F3F0FF;   /* Light mode background tint */
```

### 3.2 Semantic Colors

```css
/* Success / Teal */
--teal:          #5EEAD4;
--teal-dim:      rgba(94, 234, 212, 0.12);

/* Danger / Rose */
--rose:          #FDA4AF;
--rose-dim:      rgba(253, 164, 175, 0.12);

/* Warning / Amber */
--amber:         #FCD34D;
--amber-dim:     rgba(252, 211, 77, 0.12);

/* Info / Sky */
--sky:           #7DD3FC;
--sky-dim:       rgba(125, 211, 252, 0.12);
```

### 3.3 Neutral / Gray Scale

```css
--gray-900:  #111827;
--gray-800:  #1F2937;
--gray-700:  #374151;
--gray-600:  #4B5563;
--gray-500:  #6B7280;
--gray-400:  #9CA3AF;
--gray-300:  #D1D5DB;
--gray-200:  #E5E7EB;
--gray-100:  #F3F4F6;
--gray-50:   #F9FAFB;
```

### 3.4 Text Colors (Dark Mode)

```css
--text-1:  #F8FAFC;                       /* Primary text */
--text-2:  rgba(248, 250, 252, 0.60);     /* Secondary text */
--text-3:  rgba(248, 250, 252, 0.32);     /* Muted / placeholder */
```

### 3.5 Penggunaan Warna Semantik di SIMRS

| Warna | Fungsi | Contoh Penggunaan |
|---|---|---|
| **Primary (Violet)** | Aksi utama, navigasi aktif | Tombol submit, menu sidebar aktif, link utama |
| **Teal / Success** | Status positif, konfirmasi | Pasien aktif, pembayaran lunas, lab normal, badge online |
| **Rose / Danger** | Error, kritis, hapus | Alergi pasien, hasil lab kritis, tombol hapus, stok habis |
| **Amber / Warning** | Peringatan, pending | Antrian menunggu, resep belum diverifikasi, stok menipis |
| **Sky / Info** | Informasi, secondary action | Tooltip, info badge, link sekunder, catatan informasi |
| **Gray** | Netral, disabled, border | Teks sekunder, divider, status nonaktif, placeholder |

> **⚠️ Aturan Warna Konteks Medis:**
> Dalam konteks medis, warna memiliki asosiasi kritis. **MERAH/ROSE** selalu untuk kondisi darurat atau kritis (alergi, hasil lab kritis, triage emergency). **KUNING/AMBER** untuk peringatan atau status pending. **HIJAU/TEAL** untuk kondisi normal atau selesai. Konsistensi ini wajib dijaga agar tidak membahayakan keselamatan pasien.

---

## 4. Typography

### 4.1 Font Stack

```css
/* Primary — semua UI text */
--font:       'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Accent — greeting, hero text italic */
--font-serif: 'Instrument Serif', Georgia, serif;

/* Data — nomor rekam medis, kode ICD, ID transaksi */
--font-mono:  'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### 4.2 Type Scale

| Token | Size | Weight | Line Height | Penggunaan |
|---|---|---|---|---|
| `display-lg` | 36px | 800 | 1.1 | Hero section, halaman landing |
| `display-sm` | 28px | 700 | 1.2 | Judul halaman (Dashboard, Rawat Inap) |
| `heading-lg` | 20px | 700 | 1.3 | Judul card, judul section |
| `heading-sm` | 16px | 600 | 1.4 | Sub-judul, label grup |
| `body-lg` | 15px | 400 | 1.6 | Paragraf utama, deskripsi panjang |
| `body-sm` | 13px | 400 | 1.5 | Teks tabel, form label, navigasi |
| `caption` | 11.5px | 500 | 1.4 | Badge, meta info, timestamp |
| `overline` | 10.5px | 600 | 1.3 | Section label, kategori (uppercase, letter-spacing 0.1em) |
| `mono-data` | 13px | 400 | 1.5 | Nomor RM, kode ICD, ID transaksi (font-mono) |

### 4.3 Aturan Tipografi

- **Minimum font size:** 10.5px. Tidak ada teks di bawah ukuran ini.
- **Body text medis:** minimal 13px agar mudah dibaca dalam kondisi pencahayaan beragam dan shift malam.
- **Data numerik kritis** (dosis obat, hasil lab): minimal 14px bold.
- **Letter spacing:** -0.03em pada display sizes, -0.01em pada heading, 0 pada body.
- **Heading letter-spacing:** Negatif untuk display/heading, positif untuk overline/label.

---

## 5. Spacing & Layout Grid

### 5.1 Spacing Scale (Base: 4px)

| Token | Value | Penggunaan |
|---|---|---|
| `space-1` | 4px | Gap antar ikon dan teks inline |
| `space-2` | 8px | Padding internal pill/badge, gap antar badge |
| `space-3` | 12px | Gap antar item dalam list, padding tombol kecil |
| `space-4` | 16px | Padding internal card, gap antar form field |
| `space-5` | 20px | Padding card content area |
| `space-6` | 24px | Gap antar card dalam grid, margin section |
| `space-8` | 32px | Gap antar major section dalam halaman |
| `space-10` | 40px | Padding halaman, margin top-level container |
| `space-12` | 48px | Spacing antar major content blocks |

### 5.2 Layout Grid

| Parameter | Spesifikasi |
|---|---|
| Sidebar Width | 250px (expanded) / 64px (collapsed) |
| Main Content | Fluid, sidebar + padding offset |
| Grid System | CSS Grid, 12-column implisit |
| Card Grid Gap | 12px (compact) / 16px (normal) |
| Stat Card Grid | 4 kolom (desktop) / 2 kolom (tablet) / 1 kolom (mobile) |
| Content Padding | 28px horizontal, 28px vertikal |

---

## 6. Glassmorphism Specifications

### 6.1 Glass Card Properties

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: border-color 0.25s ease;
}

.glass:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.14);
}
```

### 6.2 Glass Hierarchy (4 Levels)

| Level | Background Alpha | Blur | Penggunaan |
|---|---|---|---|
| **Level 0** (Base) | `rgba(255,255,255, 0.025)` | 28px | Sidebar, app shell |
| **Level 1** (Card) | `rgba(255,255,255, 0.05)` | 28px | Card utama, panel konten |
| **Level 2** (Surface) | `rgba(255,255,255, 0.08)` | 16px | Dropdown, tooltip, popover |
| **Level 3** (Overlay) | `rgba(255,255,255, 0.12)` | 32px | Modal, dialog, drawer |

### 6.3 Background Surface

```css
body {
  background: #09090F;
}
```

### 6.4 Background Orbs (Animated)

Background menggunakan animated gradient orbs untuk kedalaman visual.

| Orb | Warna | Size | Position | Filter |
|---|---|---|---|---|
| Primary | `rgba(139,92,246, 0.18)` | 500px | Top-left | `blur(120px)` |
| Teal | `rgba(94,234,212, 0.12)` | 420px | Bottom-right | `blur(120px)` |
| Rose | `rgba(253,164,175, 0.08)` | 300px | Center | `blur(120px)` |

```css
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  animation: drift 30s ease-in-out infinite;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(30px, -20px) scale(1.03); }
  66%      { transform: translate(-20px, 25px) scale(0.97); }
}
```

> **⚡ Performance Rule:**
> Maksimum 3 orbs per viewport. Animasi hanya menggunakan `transform` (GPU-accelerated). Durasi minimum 30 detik. Gunakan `will-change: transform` pada orb elements.

---

## 7. Component Library

### 7.1 Buttons

**Variants:**

| Variant | Background | Text | Border | Penggunaan |
|---|---|---|---|---|
| Primary | `--primary` | white | none | Submit form, aksi utama |
| Secondary | `--glass-bg` | `--text-1` | `--glass-border` | Cancel, aksi sekunder |
| Ghost | transparent | `--primary-soft` | none | Inline action, link-style |
| Danger | `--rose` | white | none | Hapus, cancel kritis |
| Icon Only | `--glass-bg` | `--text-2` | `--glass-border` | Toolbar, compact actions |

**Sizes:**

| Size | Height | Padding | Font |
|---|---|---|---|
| `sm` | 32px | 0 12px | 12px / weight 500 |
| `md` | 36px | 0 16px | 13px / weight 500 |
| `lg` | 42px | 0 20px | 14px / weight 600 |

**States:**

```css
/* Hover */
opacity: 0.9;
transform: translateY(-1px);

/* Active */
transform: scale(0.98);

/* Disabled */
opacity: 0.4;
pointer-events: none;

/* Focus */
box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
```

**Border radius:** `10px` untuk semua button variants.

### 7.2 Form Inputs

```css
.input {
  height: 36px;                                    /* md size, 42px for lg */
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--text-1);
  font-size: 13px;
  font-family: var(--font);
  padding: 0 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  outline: none;
}

.input::placeholder {
  color: var(--text-3);
}

/* Error state */
.input-error {
  border-color: var(--rose);
  box-shadow: 0 0 0 3px rgba(253, 164, 175, 0.15);
}
```

**Label styling:**

```css
.label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
  margin-bottom: 6px;
}
```

### 7.3 Cards

| Tipe Card | Padding | Radius | Penggunaan |
|---|---|---|---|
| **Stat Card** | 18px | 16px | KPI metrics: total pasien, revenue, bed occupancy |
| **Content Card** | 20px | 16px | Chart, tabel, form section |
| **Action Card** | 16px | 16px | Quick action buttons, shortcut menu |
| **Patient Card** | 16px | 16px | Info pasien ringkas, list rawat inap |

**Card Header pattern:**

```css
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-1);
}

.card-subtitle {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 1px;
}
```

### 7.4 Status Badges / Pills

| Status | Background | Text Color | Konteks SIMRS |
|---|---|---|---|
| **Active** | `rgba(94,234,212, 0.12)` | `#5EEAD4` | Pasien rawat inap, staf on-duty |
| **Pending** | `rgba(252,211,77, 0.12)` | `#FCD34D` | Antrian, resep belum verifikasi |
| **Critical** | `rgba(253,164,175, 0.12)` | `#FDA4AF` | Lab kritis, alergi, darurat |
| **Completed** | `rgba(139,92,246, 0.12)` | `#A78BFA` | Pasien pulang, resep selesai |
| **Inactive** | `rgba(255,255,255, 0.06)` | `var(--text-3)` | Nonaktif, archived |

```css
.pill {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2.5px 9px;
  border-radius: 6px;
  display: inline-block;
}
```

### 7.5 Tables

```css
/* Table header */
thead th {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  text-align: left;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--primary);  /* Accent line */
}

/* Table rows */
tbody td {
  padding: 10px 0;
  font-size: 12.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  vertical-align: middle;
}

/* Row hover */
tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}
```

**Aturan tabel:**
- Tidak menggunakan zebra striping (gunakan hover saja).
- Sticky header dengan `backdrop-filter` saat scroll.
- Minimum column width: 80px.
- Action column (edit/delete) selalu di kanan, align right.

### 7.6 Sidebar Navigation

```css
/* Sidebar container */
.sidebar {
  width: 250px;                          /* Collapsed: 64px */
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 16px;
}

/* Nav item */
.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  transition: all 0.15s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-1);
}

.nav-link.active {
  background: var(--primary-dim);
  color: var(--primary-soft);
}

/* Nav icon */
.nav-link svg {
  width: 17px;
  height: 17px;
  opacity: 0.55;
}

.nav-link.active svg {
  opacity: 1;
}

/* Section label */
.nav-label {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  padding: 20px 10px 6px;
}
```

### 7.7 Modals / Dialogs

```css
/* Overlay */
.modal-overlay {
  background: rgba(9, 9, 15, 0.7);
  backdrop-filter: blur(4px);
}

/* Modal card */
.modal {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 24px;
  max-width: 520px;
  width: 90%;
}
```

### 7.8 Tabs / Period Selector

```css
.tabs {
  display: flex;
  gap: 1px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 2.5px;
}

.tab {
  font-size: 11.5px;
  font-weight: 500;
  padding: 4px 11px;
  border-radius: 6px;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  background: none;
}

.tab.active {
  background: var(--primary-dim);
  color: var(--primary-soft);
}
```

### 7.9 Search Input

```css
.search-field {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 7px 12px;
}

.search-field input {
  background: none;
  border: none;
  outline: none;
  color: var(--text-1);
  font-size: 12.5px;
  width: 160px;
}
```

### 7.10 Avatar

```css
/* Avatar with gradient ring */
.avatar-ring {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, var(--primary), var(--teal));
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1A1A2E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: var(--primary-soft);
}
```

### 7.11 Notification Badge

```css
.notif-dot {
  width: 7px;
  height: 7px;
  background: var(--rose);
  border-radius: 50%;
  position: absolute;
  top: 7px;
  right: 7px;
  border: 1.5px solid var(--surface);
}
```

### 7.12 Stat Card with Sparkline

```css
.stat-card {
  padding: 18px;
  position: relative;
  overflow: hidden;
}

/* Decorative background glow */
.stat-card::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  opacity: 0.12;
  background: var(--stat-color);  /* Set per card */
}

/* Icon container */
.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Background: color-dim, Color: color-soft */
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
}

/* Delta badge */
.stat-delta {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
}

.stat-delta.up {
  background: var(--teal-dim);
  color: var(--teal);
}

.stat-delta.down {
  background: var(--rose-dim);
  color: var(--rose);
}

/* Sparkline container */
.sparkline {
  height: 32px;
  margin-top: auto;
}
```

---

## 8. Iconography

Library: **Lucide Icons** (`lucide-react`)

| Property | Value |
|---|---|
| Stroke Width | 1.8px (reduced from Lucide default 2 for refined look) |
| Size — Navigation | 17px |
| Size — Inline/Table | 15px |
| Size — Action Button | 16px |
| Size — Stat Card Icon | 18px (dalam container 36px) |
| Color Default | Inherit dari parent (`--text-2`) |
| Opacity Default | 0.55 (nav), 0.7 (general) |
| Active Opacity | 1.0 |
| Stroke Line Cap | Round |
| Stroke Line Join | Round |

**Penggunaan di SIMRS:**

| Modul | Contoh Icon (Lucide Name) |
|---|---|
| Dashboard | `layout-grid`, `bar-chart-3`, `activity` |
| Pasien | `user`, `users`, `heart-pulse`, `clipboard-list` |
| Rawat Inap | `bed-double`, `stethoscope`, `thermometer` |
| Farmasi | `pill`, `flask-round`, `package` |
| Kasir | `credit-card`, `receipt`, `wallet` |
| Laboratorium | `microscope`, `test-tubes`, `file-text` |
| Laporan | `file-bar-chart`, `download`, `printer` |
| Settings | `settings`, `shield`, `key` |

---

## 9. Data Visualization

### 9.1 Chart Style Guide

| Property | Value |
|---|---|
| Library | Recharts atau custom SVG |
| Grid Lines | `rgba(255,255,255, 0.04)`, stroke-width: 0.5 |
| Axis Label | 9.5px, `rgba(255,255,255, 0.2)`, Plus Jakarta Sans |
| Line Chart Stroke | 2px primary line, 1.5px dashed secondary |
| Area Fill | Linear gradient: primary 0.2 opacity → 0 opacity |
| Data Point Dots | 3px radius, fill: surface color, stroke: line color |
| Bar Chart | Top corners radius: 4px |
| Donut Ring | Width: 16px |
| Animation | 1.2s ease-out draw-in |

### 9.2 Chart Color Assignment

Gunakan warna berikut secara berurutan untuk multi-series chart:

1. `--primary-soft` (#A78BFA) — Series utama
2. `--teal` (#5EEAD4) — Series kedua
3. `--rose` (#FDA4AF) — Series ketiga
4. `--amber` (#FCD34D) — Series keempat
5. `--sky` (#7DD3FC) — Series kelima

### 9.3 Sparkline Specs

```css
/* Inside stat cards */
.sparkline svg {
  width: 100%;
  height: 32px;
}

/* Line */
stroke-width: 1.5px;
stroke-linecap: round;

/* Area fill */
fill: linear-gradient(
  to bottom,
  {line-color} opacity 0.25,
  {line-color} opacity 0
);

/* Curve */
curve-type: monotone bezier;
```

### 9.4 Tooltip (Chart)

```css
.chart-tooltip {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

---

## 10. Motion & Animation

### 10.1 Animation Tokens

| Token | Duration | Easing | Penggunaan |
|---|---|---|---|
| `instant` | 0.1s | ease | Hover state, button press |
| `fast` | 0.15s | ease-out | Toggle, checkbox, focus ring |
| `normal` | 0.25s | ease-out | Border color, bg change, fade |
| `smooth` | 0.5s | ease-out | Page entry, card reveal |
| `slow` | 1.2s | ease-out | Chart draw-in animation |
| `drift` | 30s+ | ease-in-out | Background orb movement |

### 10.2 Page Entry Animation (Staggered Reveal)

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeUp 0.5s ease-out forwards;
  opacity: 0;
}

/* Stagger: 50ms per element, max 400ms (8 elements) */
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.10s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.20s; }
.delay-5 { animation-delay: 0.25s; }
.delay-6 { animation-delay: 0.30s; }
.delay-7 { animation-delay: 0.35s; }
.delay-8 { animation-delay: 0.40s; }
```

### 10.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  .bg-orb {
    animation: none !important;
  }
}
```

---

## 11. Accessibility

### 11.1 Contrast Requirements (WCAG 2.1 AA)

| Elemen | Min Ratio | Actual | Status |
|---|---|---|---|
| Body text (`--text-1` on surface) | 4.5:1 | 18.2:1 | ✅ Pass |
| Secondary text (`--text-2`) | 4.5:1 | ~7.5:1 | ✅ Pass |
| Muted text (`--text-3`) | 3:1 | ~4.2:1 | ✅ Pass (non-essential only) |
| Button label (white on primary) | 4.5:1 | 5.8:1 | ✅ Pass |
| Status badge text | 3:1 | Verify per combination | ⚠️ Check each |

### 11.2 Keyboard Navigation

- Semua komponen interaktif harus focusable via Tab.
- Focus ring: `box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3)`.
- Tab order mengikuti visual order: sidebar → header → main content (kiri→kanan, atas→bawah).
- Escape key menutup modal/dropdown.
- Arrow keys untuk navigasi dalam tab groups dan dropdown.

### 11.3 Screen Reader

- Gunakan semantic HTML: `<nav>`, `<main>`, `<header>`, `<table>`, `<button>`.
- Semua icon-only buttons memerlukan `aria-label`.
- Chart harus memiliki `role="img"` dengan `aria-label` deskriptif.
- Status badges memerlukan `aria-label` yang jelas (bukan hanya warna).
- Loading states menggunakan `aria-live="polite"`.

### 11.4 Warna Bukan Satu-satunya Indikator

Selalu sertakan indikator tambahan selain warna:
- Status badge: teks label ("Active", "Critical") selain warna
- Chart: marker shape berbeda per series, bukan hanya warna
- Form error: icon + teks error message, bukan hanya border merah

---

## 12. Dark Mode & Light Mode

### 12.1 Token Mapping

| Token | Dark Mode (Default) | Light Mode |
|---|---|---|
| `--surface` | `#09090F` | `#F9FAFB` |
| `--glass-bg` | `rgba(255,255,255, 0.05)` | `rgba(255,255,255, 0.7)` |
| `--glass-border` | `rgba(255,255,255, 0.08)` | `rgba(0,0,0, 0.06)` |
| `--glass-hover` | `rgba(255,255,255, 0.10)` | `rgba(255,255,255, 0.85)` |
| `--text-1` | `#F8FAFC` | `#111827` |
| `--text-2` | `rgba(248,250,252, 0.6)` | `#4B5563` |
| `--text-3` | `rgba(248,250,252, 0.32)` | `#9CA3AF` |
| Orb opacity | 0.18 / 0.12 / 0.08 | 0.08 / 0.06 / 0.04 |

### 12.2 Implementation

```css
/* Dark mode (default) */
:root {
  --surface: #09090F;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.08);
  --text-1: #F8FAFC;
  --text-2: rgba(248, 250, 252, 0.6);
  --text-3: rgba(248, 250, 252, 0.32);
}

/* Light mode */
[data-theme="light"] {
  --surface: #F9FAFB;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.06);
  --text-1: #111827;
  --text-2: #4B5563;
  --text-3: #9CA3AF;
}
```

> **💡 Light Mode Glassmorphism:** Glass effect menggunakan white background dengan opacity tinggi (0.7+) dan border gelap. Blur tetap 28px. Background orbs harus sangat subtle (opacity < 0.08).

---

## 13. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| **Desktop XL** | ≥ 1440px | Full layout, 4-column stats, sidebar expanded |
| **Desktop** | 1100–1439px | Full layout, 2-column stats, sidebar expanded |
| **Tablet** | 768–1099px | Sidebar collapsed (icon-only 64px), 2-col stats, 1-col content |
| **Mobile** | < 768px | Sidebar hidden (hamburger menu), 1-col everything, stacked cards |

```css
/* Breakpoint variables */
--bp-xl:     1440px;
--bp-lg:     1100px;
--bp-md:     768px;

/* Example usage */
@media (max-width: 1099px) {
  .sidebar { width: 64px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .content-row { grid-template-columns: 1fr; }
}

@media (max-width: 767px) {
  .sidebar { display: none; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
```

> **📌 Desktop-First:** SIMRS adalah aplikasi desktop-first karena mayoritas pengguna mengakses dari PC di nurse station, meja pendaftaran, dan ruang dokter. Responsive support untuk tablet disediakan untuk visite dokter (iPad/tablet Android).

---

## 14. Implementation Guidelines

### 14.1 Complete CSS Variables

```css
:root {
  /* Colors — Primary */
  --primary: #7C3AED;
  --primary-dark: #6D28D9;
  --primary-soft: #A78BFA;
  --primary-dim: rgba(139, 92, 246, 0.12);

  /* Colors — Semantic */
  --teal: #5EEAD4;
  --teal-dim: rgba(94, 234, 212, 0.12);
  --rose: #FDA4AF;
  --rose-dim: rgba(253, 164, 175, 0.12);
  --amber: #FCD34D;
  --amber-dim: rgba(252, 211, 77, 0.12);
  --sky: #7DD3FC;
  --sky-dim: rgba(125, 211, 252, 0.12);

  /* Surface & Glass */
  --surface: #09090F;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-surface: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(255, 255, 255, 0.14);
  --glass-blur: 28px;

  /* Text */
  --text-1: #F8FAFC;
  --text-2: rgba(248, 250, 252, 0.60);
  --text-3: rgba(248, 250, 252, 0.32);

  /* Typography */
  --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Radius */
  --radius: 16px;
  --radius-sm: 10px;
  --radius-xs: 6px;
  --radius-full: 9999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Transitions */
  --transition-instant: 0.1s ease;
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.25s ease-out;
  --transition-smooth: 0.5s ease-out;
}
```

### 14.2 Tailwind CSS Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          soft: '#A78BFA',
        },
        surface: '#09090F',
        teal: '#5EEAD4',
        rose: '#FDA4AF',
        amber: '#FCD34D',
        sky: '#7DD3FC',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        glass: '16px',
        'glass-sm': '10px',
      },
      backdropBlur: {
        glass: '28px',
      },
    },
  },
};
```

### 14.3 Naming Convention

| Tipe | Format | Contoh |
|---|---|---|
| Component | PascalCase | `StatCard`, `GlassButton`, `PatientBadge` |
| CSS Class | kebab-case | `stat-card`, `glass-btn`, `patient-badge` |
| CSS Variable | --kebab-case | `--primary`, `--glass-bg`, `--text-1` |
| Design Token | kebab-case | `body-sm`, `space-4`, `heading-lg` |
| File Name | kebab-case | `stat-card.tsx`, `glass-button.tsx` |
| Hook | camelCase | `useGlassTheme`, `usePatientData` |
| Utility | camelCase | `formatRmNumber`, `parseIcdCode` |

### 14.4 File Structure (Recommended)

```
src/
├── components/
│   ├── ui/                    # Reusable glass components
│   │   ├── glass-card.tsx
│   │   ├── glass-button.tsx
│   │   ├── glass-input.tsx
│   │   ├── glass-modal.tsx
│   │   ├── status-pill.tsx
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx
│   │   └── sparkline.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── top-bar.tsx
│   │   └── page-wrapper.tsx
│   └── charts/
│       ├── area-chart.tsx
│       ├── donut-chart.tsx
│       └── chart-tooltip.tsx
├── styles/
│   ├── globals.css             # CSS variables, glass mixins
│   ├── animations.css          # fadeUp, drift, draw-in
│   └── themes/
│       ├── dark.css
│       └── light.css
├── lib/
│   └── tokens.ts               # Exported design tokens
└── hooks/
    └── use-glass-theme.ts
```

---

## Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | April 2026 | Initial release — complete design system |

---

> **Dokumen ini disiapkan oleh CV Panda Global Teknologi untuk proyek SIMRS RSUD Petala Bumi.**
> Untuk referensi visual interaktif, lihat file `glassmorphism-dashboard-pro.html`.
