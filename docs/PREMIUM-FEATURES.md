# Premium Features — SIMRS Petala Bumi

> Fitur-fitur premium yang membedakan SIMRS Petala Bumi dari SIMRS standar.
> Dibangun untuk memberikan nilai tambah tinggi bagi operasional rumah sakit.

---

## Implemented Features

### 1. Critical Lab Value Alert System

**Problem:** Hasil lab kritis (CRITICAL_HIGH / CRITICAL_LOW) sering terlambat sampai ke dokter, membahayakan keselamatan pasien. Standar akreditasi SNARS mengharuskan notifikasi real-time untuk nilai kritis.

**Solution:** Sistem alert otomatis yang mendeteksi nilai kritis saat analis lab menginput hasil, dan menampilkan banner darurat di halaman Lab.

**How it works:**
```
Analis input hasil → Flag CRITICAL_HIGH/LOW terdeteksi
→ Alert muncul di halaman Lab (banner merah + dot-pulse)
→ Tampilkan: nama pasien, parameter, hasil vs normal, nama dokter
→ Dokter/petugas klik "Acknowledge" → timestamp tercatat
→ Alert hilang dari banner aktif
```

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/lab/alerts/active` | Daftar alert kritis belum di-acknowledge |
| GET | `/lab/alerts/stats` | Statistik (total, unacknowledged, today) |
| POST | `/lab/alerts/:resultId/acknowledge` | Acknowledge alert |

**Backend:** `apps/api/src/modules/laboratory/critical-alert.service.ts`

**Frontend:** Banner merah di atas halaman `/laboratorium` dengan:
- Dot-pulse live indicator (animasi berkedip)
- Per-alert card: pasien, parameter, hasil, normal range, dokter
- Tombol Acknowledge per alert
- Auto-refresh saat ada data baru

**Impact:**
- Memenuhi standar akreditasi SNARS untuk critical value reporting
- Waktu notifikasi: dari berjam-jam → real-time (< 1 detik)
- Audit trail lengkap (siapa acknowledge, kapan)

---

### 2. Patient Journey Timeline

**Problem:** Data medis pasien tersebar di banyak modul terpisah (rawat jalan, lab, resep, billing). Dokter harus buka banyak tab untuk melihat riwayat lengkap. SIMRS Khanza menampilkan data per-modul terpisah.

**Solution:** Timeline chronological terpadu yang menampilkan SEMUA interaksi pasien dengan RS dalam satu scrollable view.

**How it works:**
```
Buka Rekam Medis → Cari pasien → Klik "Timeline"
→ Panel kanan menampilkan timeline visual
→ 6 jenis event ditampilkan dengan warna berbeda:
   - Kunjungan (ungu) — rawat jalan, IGD, rawat inap
   - Diagnosis (amber) — ICD-10 codes
   - Resep (teal) — nama obat
   - Lab (biru) — pemeriksaan + status
   - Radiologi (violet) — modalitas + kesan
   - Billing (teal) — invoice + total
→ Sorted by date (terbaru di atas)
```

**API Endpoint:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/patients/:id/timeline?limit=50` | Patient journey timeline |

**Backend:** `apps/api/src/modules/patients/timeline.service.ts`
- Aggregates from 6 tables: encounters, diagnoses, prescriptions, labOrders, radiologyOrders, bills
- Sorted chronologically, limited by default to 50 events

**Frontend:** Split-panel layout di `/rekam-medis`:
- Kiri: DataTable pencarian pasien
- Kanan: Visual timeline dengan:
  - Colored dots per event type
  - Vertical connecting lines
  - Status badges (FINISHED/COMPLETED = green, else yellow)
  - Date labels, truncated subtitles
  - Detail links

**Impact:**
- Dokter bisa review riwayat lengkap pasien dalam 10 detik (vs. menit)
- Paradigma baru: dari per-modul → unified timeline
- Mendukung clinical decision making yang lebih baik

---

### 3. Predictive Drug Stock Alert

**Problem:** Sistem alert stok minimum bersifat reaktif — baru tahu saat obat SUDAH habis. Ini menyebabkan stockout yang merugikan pasien dan operasional farmasi.

**Solution:** Prediksi berbasis data yang menghitung KAPAN obat akan habis berdasarkan rata-rata pemakaian 30 hari terakhir.

**How it works:**
```
Sistem mengambil data dispensing 30 hari terakhir
→ Hitung avg_daily_usage = total_dispensed_30d / 30
→ days_until_stockout = current_stock / avg_daily_usage
→ Flag: KRITIS (≤3 hari), SEGERA (≤7 hari)
→ Tampilkan di banner kuning halaman Farmasi
→ Sorted: kritis dulu, lalu segera
```

**API Endpoint:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/pharmacy/stock/predictions?days=7` | Prediksi kehabisan stok |

**Response:**
```json
{
  "predictions": [
    {
      "medicineId": 145,
      "kode": "OBT-AMX",
      "namaGenerik": "Amoxicillin 500mg",
      "currentStock": 50,
      "avgDailyUsage": 15.3,
      "daysUntilStockout": 3,
      "predictedStockoutDate": "2026-04-12",
      "isCritical": true,
      "isUrgent": true
    }
  ],
  "summary": {
    "totalTracked": 1245,
    "urgent": 12,
    "critical": 3
  }
}
```

**Backend:** `apps/api/src/modules/pharmacy/stock-prediction.service.ts`
- Queries `prescriptionItem.groupBy(medicineId)` for last 30 days
- Calculates per-medicine prediction
- Sorts: critical first, then urgent

**Frontend:** Banner amber di halaman `/farmasi`:
- Dot-pulse warning indicator
- Top-8 obat mendekati kehabisan
- Per-obat: nama, kode, hari tersisa, stok saat ini, daily usage
- Badge KRITIS (merah) / SEGERA (kuning)

**Impact:**
- Mencegah stockout: dari reaktif → prediktif
- Lead time pengadaan: petugas farmasi bisa order SEBELUM habis
- Mengurangi emergency purchase (biasanya lebih mahal)

---

### 4. SATUSEHAT Retry Dashboard

**Problem:** Sinkronisasi ke SATUSEHAT sering gagal (network timeout, token expired, data invalid). Tanpa monitoring, data tidak terkirim ("silent failure") dan RS tidak comply dengan Kemenkes.

**Solution:** Dashboard monitoring + tombol "Retry All Failed" untuk memproses ulang semua yang gagal.

**How it works:**
```
Halaman /satusehat menampilkan:
→ Status koneksi (connected / simulation)
→ Statistik: total sync, success, failed, pending, unsynced encounters
→ Jika ada failed/unsynced → tombol "Retry Failed (N)" muncul
→ Klik → sistem loop semua unsynced FINISHED encounters
→ Sync setiap encounter + FHIR resources (Encounter, Condition, Observation)
→ Report: N/M berhasil, detail per encounter
```

**API Endpoint:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/satusehat/retry-failed` | Retry semua sync yang gagal |

**Response:**
```json
{
  "message": "Retry completed: 8/10 success",
  "total": 10,
  "success": 8,
  "failed": 2,
  "details": [
    { "encounterId": 1, "noRawat": "2026/04/09/000001", "status": "SUCCESS", "resources": 4 },
    { "encounterId": 2, "noRawat": "2026/04/09/000002", "status": "FAILED", "error": "..." }
  ]
}
```

**Backend:** `retryAllFailed()` in `apps/api/src/modules/satusehat/satusehat.service.ts`
- Finds unsynced FINISHED encounters (limit 50 per batch)
- Calls `syncEncounter()` for each
- Returns aggregated results

**Frontend:** Header button di `/satusehat`:
- "Retry Failed (N)" danger button
- Loading state saat processing
- Alert with success/failed count

**Impact:**
- Compliance assurance: tidak ada data yang "hilang"
- Self-service: petugas IT bisa retry sendiri tanpa bantuan developer
- Visibility: selalu tahu berapa data yang belum terkirim

---

## Planned Features (Roadmap)

| Priority | Feature | Effort | Description |
|----------|---------|--------|-------------|
| 1 | Live Bed Map Visual | 1 minggu | Peta lantai SVG per bangsal, real-time WebSocket |
| 2 | Smart SEP Auto-Pilot | 1-2 minggu | Zero-click BPJS registration flow |
| 3 | Executive Command Center | 2 minggu | Director dashboard, real-time KPI, alarm kritis |
| 4 | WhatsApp Notifications | 1 minggu | Patient notifications via Fonnte API |
| 5 | Remunerasi Dokter | 2 minggu | Auto-calculate doctor fees per procedure |
| 6 | AI ICD-10 Smart Coding | 3 minggu | Context-aware ICD-10 recommendations |
| 7 | Smart Queue Estimation | 2 minggu | Accurate wait time prediction |
| 8 | Drug Interaction Checker | 1 minggu | Real-time interaction + allergy check |
| 9 | Auto RL 1-6 Reports | 1 minggu | One-click Kemenkes SIRS reporting |
| 10 | Kiosk Self Check-in | 1 minggu | Tablet check-in di lobby |
| 11 | Doctor Mobile Worklist | 3 minggu | React Native SOAP from phone |
| 12 | AI Voice-to-SOAP | 2 minggu | Whisper transcription → SOAP fields |
| 13 | Telemedicine Built-in | 1 bulan | WebRTC video consultation |
| 14 | Predictive BOR | 2 minggu | 7-day BOR prediction |
| 15 | BPJS Claim Analytics | 2 minggu | Revenue leakage detection |
| 16 | Asset Utilization Dashboard | 1 minggu | Medical equipment performance |

---

## Technical Architecture

All premium features follow the same pattern:
1. **Service** — business logic in dedicated `*.service.ts`
2. **Controller** — REST endpoints with Swagger docs
3. **Module** — registered in `app.module.ts`
4. **Frontend** — integrated into existing pages (not separate)

No new dependencies required. All features use existing stack:
- Prisma for data queries
- NestJS for API
- Next.js for frontend
- CSS design system variables for styling

---

*Premium features by CV Panda Global Teknologi — SIMRS Petala Bumi*
