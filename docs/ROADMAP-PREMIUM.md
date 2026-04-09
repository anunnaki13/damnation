# Roadmap Fitur Premium — SIMRS Petala Bumi

> **Dokumen Perencanaan Pengembangan Fitur Lanjutan**
> CV Panda Global Teknologi · April 2026
> Prioritas berdasarkan WOW factor, kemudahan implementasi, dan dampak operasional

---

## Status Overview

| Status | Count |
|--------|-------|
| Implemented | 4 fitur |
| Tier 1 — WOW Factor Tertinggi | 5 fitur |
| Tier 2 — Premium Differentiator | 5 fitur |
| Tier 3 — Operational Excellence | 5 fitur |
| Tier 4 — Forward-Looking | 5 fitur |
| **Total** | **24 fitur** |

---

## IMPLEMENTED (4 Fitur)

Fitur yang sudah selesai diimplementasi dan siap digunakan.

### 1. Critical Lab Value Alert System
- **Status:** Done
- **File:** `apps/api/src/modules/laboratory/critical-alert.service.ts`
- **Endpoints:** `GET /lab/alerts/active`, `GET /lab/alerts/stats`, `POST /lab/alerts/:id/acknowledge`
- **Frontend:** Banner merah berkedip di halaman `/laboratorium`
- **Deskripsi:** Saat analis lab menginput hasil dengan flag CRITICAL_HIGH atau CRITICAL_LOW, sistem otomatis menampilkan alert darurat. Dokter yang merequest dapat melihat alert dan melakukan acknowledge. Semua tercatat sebagai audit trail klinis.
- **Impact:** Memenuhi standar akreditasi SNARS, waktu notifikasi dari berjam-jam → real-time

### 2. Patient Journey Timeline
- **Status:** Done
- **File:** `apps/api/src/modules/patients/timeline.service.ts`
- **Endpoint:** `GET /patients/:id/timeline`
- **Frontend:** Split-panel di halaman `/rekam-medis` dengan visual timeline
- **Deskripsi:** Menampilkan seluruh riwayat interaksi pasien dengan RS dalam satu timeline chronological: kunjungan, diagnosis, resep, hasil lab, radiologi, billing. 6 jenis event dengan warna berbeda, connected dots, status badges.
- **Impact:** Dokter bisa review riwayat lengkap dalam 10 detik, mendukung clinical decision making

### 3. Predictive Drug Stock Alert
- **Status:** Done
- **File:** `apps/api/src/modules/pharmacy/stock-prediction.service.ts`
- **Endpoint:** `GET /pharmacy/stock/predictions?days=7`
- **Frontend:** Banner kuning di halaman `/farmasi`
- **Deskripsi:** Menghitung prediksi hari kehabisan stok per obat berdasarkan rata-rata pemakaian 30 hari terakhir. Flag: KRITIS (≤3 hari), SEGERA (≤7 hari). Sorted prioritas tertinggi di atas.
- **Impact:** Mencegah stockout, lead time pengadaan lebih baik, mengurangi emergency purchase

### 4. SATUSEHAT Retry Dashboard
- **Status:** Done
- **File:** `apps/api/src/modules/satusehat/satusehat.service.ts` → `retryAllFailed()`
- **Endpoint:** `POST /satusehat/retry-failed`
- **Frontend:** Tombol "Retry Failed (N)" di halaman `/satusehat`
- **Deskripsi:** Menemukan semua encounter FINISHED yang belum tersinkronisasi ke SATUSEHAT, lalu sync ulang semuanya. Report berapa yang success/failed.
- **Impact:** Compliance assurance, self-service IT, tidak ada data yang "hilang"

---

## TIER 1 — WOW Factor Tertinggi

Fitur yang langsung membuat kesan saat demo ke direksi dan memiliki dampak operasional terbesar.

### 5. Live Bed Intelligence Map
- **Prioritas:** #1
- **Effort:** 1 minggu
- **Impact:** Demo killer — fitur paling impresif secara visual

**Deskripsi:**
Peta visual lantai per bangsal (SVG/Canvas) dengan warna-coded status real-time. Bukan tabel daftar kamar — visual map interaktif. Hijau = kosong, Merah = terisi (nama pasien + hari ke-N + DPJP), Kuning = cleaning, Biru = reservasi. Hover → popup mini info pasien. Update via WebSocket tanpa refresh.

**Implementasi:**
- NestJS WebSocket Gateway (`@WebSocketGateway`) publish event `bed.status.changed`
- Next.js SVG layout di-generate dari data `beds` + `locations`
- Socket.io-client subscribe, re-render hanya bed yang berubah
- Data source: tabel `beds` + `encounters` + `kamar_inap` yang sudah ada

**Diferensiasi:** Tidak ada SIMRS di Indonesia yang punya visual bed map interaktif real-time. Semua masih pakai tabel.

---

### 6. Smart SEP Auto-Pilot
- **Prioritas:** #2
- **Effort:** 1-2 minggu
- **Impact:** Memangkas waktu registrasi BPJS dari 8-12 menit → < 1 menit

**Deskripsi:**
Zero-click BPJS processing. Saat pasien BPJS didaftarkan, sistem otomatis: cek kepesertaan VClaim → validasi rujukan → terbitkan SEP → assign nomor antrean JKN → kirim ke dokter. Semua dalam < 3 detik tanpa intervensi petugas. Jika error → tampilkan action button spesifik ("Perpanjang Rujukan" / "Kuota Habis").

**Implementasi:**
- NestJS BullMQ queue chain: `bpjs.auto-sep` job
- Saga pattern: VClaim → SEP → Antrol API sequential
- Server-Sent Events (SSE) untuk status real-time di layar petugas
- Rollback jika ada step yang gagal

**Diferensiasi:** Trustmedis masih memerlukan trigger manual untuk SEP.

---

### 7. Executive Command Center Dashboard
- **Prioritas:** #3
- **Effort:** 2 minggu
- **Impact:** Sales closer — fitur yang paling memengaruhi keputusan pembelian

**Deskripsi:**
Dashboard direktur yang BUKAN sekadar grafik statis. Satu layar besar berisi: BOR real-time dengan sparkline 30 hari, pendapatan hari ini vs target (progress bar), jumlah pasien per status semua unit, alarm merah jika KPI kritis (BOR > 90%, klaim pending > threshold). Setiap card bisa drill-down. Layar ini selalu ON di ruang direktur.

**Implementasi:**
- NestJS `GET /analytics/executive-summary` — aggregate dari semua tables
- Redis cache 60 detik untuk performa
- WebSocket push update setiap event signifikan
- Apache ECharts untuk chart interaktif (sparkline, gauge, area)
- Next.js fullscreen mode (F11)

**Diferensiasi:** Sebagian besar SIMRS menyajikan laporan. Ini command center yang buka 24/7.

---

### 8. Critical Value Lab → Doctor Alert (Real-time Push)
- **Prioritas:** #4
- **Effort:** 3 hari (extend existing #1)
- **Impact:** Standar akreditasi SNARS, patient safety

**Deskripsi:**
Extend dari fitur #1 yang sudah ada. Saat hasil kritis terdeteksi: (1) push notifikasi real-time ke aplikasi/browser dokter via WebSocket, (2) kirim WhatsApp ke HP dokter, (3) jika tidak di-ack dalam 15 menit → eskalasi ke kepala ruangan.

**Implementasi:**
- NestJS EventEmitter saat lab result critical → emit event
- NotificationGateway kirim WebSocket push ke dokter_id
- BullMQ delayed job untuk eskalasi timeout 15 menit
- Frontend: toast notification merah dengan sound alert
- WhatsApp via Fonnte API (opsional)

---

### 9. WhatsApp-Native Notifikasi Pasien
- **Prioritas:** #5
- **Effort:** 1 minggu
- **Impact:** Patient experience langsung terasa

**Deskripsi:**
Setiap touchpoint pasien dapat notifikasi WhatsApp otomatis: konfirmasi pendaftaran (nomor antrean + estimasi waktu), reminder H-1 kontrol, hasil lab siap diambil, tagihan + link pembayaran QRIS, feedback setelah pulang. Template configurable.

**Implementasi:**
- NestJS `NotificationModule` dengan adapter pattern
- `WhatsAppAdapter` via Fonnte API (Rp 150K/bulan, tanpa perlu WA Business API)
- Template pesan configurable via admin panel
- BullMQ queue untuk rate limiting (max 100 pesan/menit)
- Trigger: event-based dari registration, lab, billing modules

**Diferensiasi:** 95%+ pasien Indonesia pakai WhatsApp. Ini patient experience yang langsung terasa berbeda.

---

## TIER 2 — Premium Differentiator

Fitur yang secara signifikan meningkatkan value proposition dan revenue.

### 10. Remunerasi Dokter Otomatis
- **Prioritas:** #6
- **Effort:** 2 minggu
- **Impact:** Buy-in dokter — fitur yang paling diminta dokter mitra

**Deskripsi:**
Menghitung jasa medis dokter otomatis dari setiap transaksi: e-resep divalidasi, tindakan dilakukan, konsultasi selesai → jasa terakumulasi real-time. Akhir bulan: satu klik generate slip remunerasi per dokter (PDF/XLSX), breakdown per tindakan, per kelas pasien (BPJS/Umum), per poli.

**Implementasi:**
- Tabel `remuneration_rules` (dokter, tindakan, kelas, persentase/nominal)
- Tabel `remuneration_ledger` — populated via event listener setiap `billing.item.created`
- NestJS scheduled job akhir bulan untuk aggregasi
- PDF generation via pdf-lib atau Puppeteer
- Portal dokter: dokter cek sendiri via mobile

**Diferensiasi:** Trustmedis punya ini hanya di paket enterprise tertinggi.

---

### 11. AI-Assisted ICD-10 Coding
- **Prioritas:** #7
- **Effort:** 3 minggu
- **Impact:** Revenue protection BPJS — mencegah undercoding

**Deskripsi:**
Saat dokter mengetik diagnosis bebas, sistem memberikan rekomendasi ICD-10 ranked berdasarkan: (1) riwayat diagnosis pasien sebelumnya, (2) 10 diagnosis terbanyak di poli bulan ini, (3) obat yang sudah di-order. Peringatan jika kombinasi diagnosis+tindakan akan masuk tarif INA-CBGs lebih rendah dari seharusnya.

**Implementasi:**
- MySQL FULLTEXT search + pre-computed frequency dari data historis encounters
- Redis cache top-10 per poli per bulan
- Rule-based INA-CBGs grouper check (bukan AI berat — rule engine)
- Next.js combobox dengan debounce 300ms
- Tidak butuh LLM eksternal

**Diferensiasi:** SIMRS lain hanya punya autocomplete ICD-10 statis.

---

### 12. Smart Queue + Estimasi Waktu Tunggu
- **Prioritas:** #8
- **Effort:** 2 minggu
- **Impact:** Visible ke publik, langsung terasa

**Deskripsi:**
Multi-channel antrean (web, WhatsApp, kiosk, loket) dengan estimasi waktu tunggu AKURAT berdasarkan rata-rata durasi konsultasi dokter + jumlah pasien sebelumnya. Display TV real-time via WebSocket. Pasien dapat WhatsApp "Antrean No. 14, estimasi 25 menit lagi."

**Implementasi:**
- Algoritma: `avg_consultation_time_per_doctor` × `patients_before`
- Data historis dari `encounters` (tanggal_masuk → tanggal_keluar per encounter)
- NestJS WebSocket untuk display TV update
- WhatsApp notification saat antrean mendekati

---

### 13. Drug Interaction + Allergy Checker
- **Prioritas:** #9
- **Effort:** 1 minggu
- **Impact:** Patient safety, standar akreditasi

**Deskripsi:**
Real-time saat dokter input e-resep: cek interaksi antar obat yang diresepkan, kontraindikasi terhadap diagnosis, alergi yang tercatat. 3 level: Info (kuning), Warning (oranye), Critical-stop (merah — harus konfirmasi override dengan alasan).

**Implementasi:**
- Seed database interaksi obat (WHO Model List / MIMS Indonesia)
- Tabel `drug_interactions` (drug_a, drug_b, severity, description)
- Check di service layer setiap POST /prescriptions, < 200ms
- Override audit trail: alasan dokter tersimpan

---

### 14. Patient Timeline dengan Grafik Lab Trend
- **Prioritas:** #10
- **Effort:** 1 minggu (extend existing #2)
- **Impact:** Clinical decision support mendalam

**Deskripsi:**
Extend Patient Timeline yang sudah ada. Untuk hasil lab numerik (gula darah, hemoglobin, dll), tampilkan mini line chart trend over time. Dokter bisa lihat apakah HbA1c pasien trending naik/turun dalam 6 bulan terakhir.

**Implementasi:**
- Query `observations` + `lab_results` per LOINC code, grouped by date
- ECharts mini sparkline dalam timeline card
- Highlight jika trend memburuk (slope detection sederhana)

---

## TIER 3 — Operational Excellence

Fitur yang meningkatkan efisiensi operasional dan mengurangi beban kerja staf.

### 15. Laporan RL 1-6 Auto-Generate
- **Prioritas:** #11
- **Effort:** 1 minggu
- **Impact:** Mengurangi 2-3 hari kerja/bulan petugas rekam medis

**Deskripsi:**
Laporan RL 1-6 ke Kemenkes via SIRS Online adalah kewajiban bulanan. Saat ini dikerjakan manual. Dengan data SIMRS, sistem auto-generate semua format RL sesuai template Kemenkes, siap diupload. Satu tombol "Generate Laporan Bulan X" → Excel download.

**Implementasi:**
- NestJS Report Service dengan query aggregation per variable RL
- RL 1.1 Data Dasar, RL 2 Ketenagaan, RL 3 Pelayanan, RL 4 Morbiditas, RL 5 Penggunaan Obat
- Output via ExcelJS library
- Endpoint: `GET /sirs/rl/:number?month=&year=`

---

### 16. Kiosk Self-Check-in Digital
- **Prioritas:** #12
- **Effort:** 1 minggu
- **Impact:** Mengurangi beban loket, showpiece di lobby

**Deskripsi:**
Next.js fullscreen app untuk tablet/PC touchscreen di lobby. Pasien: tap NIK/scan KTP → sistem temukan data → pilih poli + dokter → konfirmasi antrean. BPJS: auto cek kepesertaan. Tidak butuh hardware khusus — tablet Android Rp 2-3 juta.

**Implementasi:**
- Next.js `/kiosk` route dengan UI XXL, touch-friendly
- Fullscreen mode CSS + browser kiosk mode
- Endpoint `POST /kiosk/checkin` → VClaim + queue assignment
- QR Code output untuk konfirmasi

---

### 17. Stok Obat Auto-Reorder
- **Prioritas:** #13
- **Effort:** 3 hari (extend existing #3)
- **Impact:** Efisiensi pengadaan farmasi

**Deskripsi:**
Extend Predictive Stock. Saat obat diprediksi habis dalam 7 hari, sistem otomatis generate draft Surat Permintaan Barang ke gudang farmasi / supplier. Kepala farmasi tinggal approve.

**Implementasi:**
- Tabel `purchase_requests` (medicine_id, quantity, status, requested_by)
- Auto-populate dari stock prediction service
- Approval workflow (draft → submitted → approved → received)

---

### 18. SATUSEHAT Auto-Sync Background Job
- **Prioritas:** #14
- **Effort:** 3 hari (extend existing #4)
- **Impact:** Zero-maintenance compliance

**Deskripsi:**
Extend SATUSEHAT Retry. Setiap encounter yang selesai (status FINISHED) otomatis di-queue untuk sync ke SATUSEHAT via BullMQ background job. Retry otomatis dengan exponential backoff (1min → 5min → 30min → 2hr). Dashboard menampilkan queue status.

**Implementasi:**
- BullMQ producer di `outpatient.service.ts` saat finishEncounter()
- BullMQ consumer di `satusehat-sync.worker.ts`
- Exponential backoff: attempt 1 → 60s, 2 → 300s, 3 → 1800s
- Max 5 retries per encounter

---

### 19. Cetak Dokumen (PDF Generation)
- **Prioritas:** #15
- **Effort:** 2 minggu
- **Impact:** Operasional harian — kwitansi, label, resume

**Deskripsi:**
Generate PDF untuk: kwitansi pembayaran, label obat (etiket), hasil lab, resume medis, surat rujukan, SEP. Template RS yang bisa di-customize.

**Implementasi:**
- NestJS module `PrintModule` dengan pdf-lib atau Puppeteer
- Template HTML → PDF conversion
- Endpoint: `GET /print/kwitansi/:billId`, `/print/label-obat/:prescriptionId`, dll
- Frontend: tombol "Cetak" di setiap halaman relevan

---

## TIER 4 — Forward-Looking

Fitur inovatif untuk roadmap 6-12 bulan.

### 20. Dokter Mobile Worklist (React Native)
- **Prioritas:** #16
- **Effort:** 3 minggu
- **Impact:** Mobilitas klinis, ALOS berkurang

**Deskripsi:**
Dokter jaga bisa buka worklist, lihat tanda vital perawat, input SOAP, kirim e-resep dari smartphone. Push notification saat pasien baru/lab kritis. Offline-first: draft SOAP tersimpan lokal, sync saat online.

**Implementasi:**
- React Native (Expo) — `apps/mobile/(doctor)/`
- Reuse API endpoints yang sama
- MMKV storage untuk offline draft
- Expo Push Notification via FCM/APNs

---

### 21. AI Voice-to-SOAP
- **Prioritas:** #17
- **Effort:** 2 minggu
- **Impact:** Efisiensi input dokter — bicara > ketik

**Deskripsi:**
Dokter bicara (Bahasa Indonesia) → Whisper transcribe → auto-fill SOAP fields. Review dan edit minor sebelum sign. Tidak butuh GPU besar — Whisper-small cukup untuk Bahasa Indonesia, ~5 detik per 1 menit audio.

**Implementasi:**
- NestJS `POST /emr/transcribe` menerima audio blob
- Whisper API (OpenAI) atau self-hosted Docker container
- Rule-based template matching: "keluhan pasien" → Subjective, "pemeriksaan fisik" → Objective
- Frontend: MediaRecorder API untuk rekam audio

---

### 22. Telemedicine Built-in
- **Prioritas:** #18
- **Effort:** 1 bulan
- **Impact:** Patient access, revenue baru

**Deskripsi:**
Video konsultasi langsung dari portal pasien. Dokter menerima panggilan dari workstation. Setelah konsultasi → langsung input e-resep + diagnosis + billing otomatis. Rekaman disimpan di MinIO.

**Implementasi:**
- WebRTC peer-to-peer dengan LiveKit (self-hosted)
- NestJS signaling server
- Integrasi scheduling + billing yang sudah ada

---

### 23. Predictive BOR Alert
- **Prioritas:** #19
- **Effort:** 2 minggu
- **Impact:** Capacity planning proaktif

**Deskripsi:**
Prediksi BOR 7 hari ke depan berdasarkan data historis 2 tahun (dari Khanza) + tren saat ini + seasonality (Lebaran, liburan sekolah). Alert jika prediksi > 90% dalam 3 hari.

**Implementasi:**
- Linear Regression / ARIMA sederhana pada data `inpatient_admissions` per hari
- Python microservice atau NestJS dengan ml-regression
- Hasil: tabel `bor_predictions`, ECharts area chart actual vs predicted

---

### 24. BPJS Claim Revenue Leakage Monitor
- **Prioritas:** #20
- **Effort:** 2 minggu
- **Impact:** Revenue recovery

**Deskripsi:**
Dashboard khusus keuangan: klaim pending (berapa hari), klaim ditolak (alasan grouped), potential revenue yang bisa di-recover, tarif INA-CBGs diterima vs ekspektasi. Auto-flag encounter yang kemungkinan coding error.

**Implementasi:**
- Analytics query dari `bpjs_sync_logs` + `bills` + `encounters`
- ECharts funnel chart klaim lifecycle
- Tabel interaktif + export Excel

---

## Timeline Implementasi Rekomendasi

```
Bulan 1 (Minggu 1-4):
├── #8  Critical Alert Push (3 hari) ← extend existing
├── #9  WhatsApp Notifications (1 minggu)
├── #15 Laporan RL Auto (1 minggu)
└── #5  Live Bed Map (1 minggu)

Bulan 2 (Minggu 5-8):
├── #6  Smart SEP Auto-Pilot (2 minggu)
├── #10 Remunerasi Dokter (2 minggu)

Bulan 3 (Minggu 9-12):
├── #7  Executive Command Center (2 minggu)
├── #12 Smart Queue Estimasi (2 minggu)

Bulan 4 (Minggu 13-16):
├── #11 AI ICD-10 Coding (3 minggu)
├── #13 Drug Interaction Checker (1 minggu)

Bulan 5-6:
├── #19 Cetak Dokumen PDF (2 minggu)
├── #20 Mobile Worklist (3 minggu)
├── #16 Kiosk Self Check-in (1 minggu)

Bulan 7+:
├── #21 AI Voice-to-SOAP
├── #22 Telemedicine
├── #23 Predictive BOR
└── #24 BPJS Revenue Monitor
```

---

## Catatan Teknis

Semua fitur kompatibel dengan arsitektur yang sudah ada:
- **BullMQ** (ada) → notifikasi, BPJS auto-pilot, SATUSEHAT sync
- **WebSocket** NestJS → bed map real-time, lab alerts, antrean display
- **MinIO** (ada) → storage PDF, rekaman video
- **Redis** (ada) → cache ICD-10, session kiosk, pub/sub
- **Schema** sudah ready: `queue_tickets`, `beds`, `lab_results`, `satusehat_sync_logs`

Tidak ada dependency baru kecuali untuk:
- Telemedicine: LiveKit (self-hosted)
- AI Voice: Whisper API atau Docker
- WhatsApp: Fonnte API (Rp 150K/bulan)

---

*Dokumen ini disiapkan oleh CV Panda Global Teknologi untuk RSUD Petala Bumi.*
*Prioritas dapat disesuaikan berdasarkan kebutuhan dan feedback pengguna.*
