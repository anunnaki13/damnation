# Database Schema Documentation

## Overview

Database SIMRS Petala Bumi menggunakan **MySQL 8.0** dengan **Prisma ORM**. Schema dirancang untuk:
1. Mendukung semua 23 modul SIMRS
2. Kompatibel dengan database SIMRS Khanza untuk migrasi data (ETL)
3. Siap integrasi SATUSEHAT (FHIR R4) dan BPJS Kesehatan

**Schema file:** `apps/api/src/database/schema.prisma`

---

## Entity Relationship Overview

```
patients ──────── encounters ──────── diagnoses
    │                  │                procedures
    │                  │                medical_records
    │                  │                observations
    │                  │                prescriptions ── prescription_items ── medicines
    │                  │                lab_orders ── lab_order_items ── lab_results
    │                  │                radiology_orders
    │                  │                bills ── bill_items
    │                  │                       └─ payments
    │                  │                bridging_sep
    │                  │                kamar_inap
    │                  │
    │                  ├── practitioners ── practitioner_schedules
    │                  ├── locations ── beds
    │                  └── penjab (payer)
    │
    └── queue_tickets

users ── user_roles ── roles
employees ── practitioners
```

---

## Tabel Utama & Mapping Khanza

### 1. `patients` — Master Pasien

**Khanza source:** `pasien` (PK: `no_rkm_medis`)

| Column (Prisma) | DB Column | Type | Khanza Column | Keterangan |
|---|---|---|---|---|
| `id` | `id` | BigInt PK | - | Auto-increment (baru) |
| `noRm` | `no_rm` | VARCHAR(15) UNIQUE | `no_rkm_medis` | Format: PB-XXXXXX |
| `nik` | `nik` | VARCHAR(20) | `no_ktp` | NIK KTP |
| `noBpjs` | `no_bpjs` | VARCHAR(25) | `no_peserta` | No. peserta BPJS |
| `namaLengkap` | `nama_lengkap` | VARCHAR(200) | `nm_pasien` | Khanza max 40 char |
| `tempatLahir` | `tempat_lahir` | VARCHAR(100) | `tmp_lahir` | |
| `tanggalLahir` | `tanggal_lahir` | DATE | `tgl_lahir` | |
| `jenisKelamin` | `jenis_kelamin` | ENUM(L,P) | `jk` | Sama |
| `golonganDarah` | `golongan_darah` | ENUM | `gol_darah` | A, B, AB, O, - |
| `agama` | `agama` | VARCHAR(20) | `agama` | |
| `statusNikah` | `status_nikah` | VARCHAR(30) | `stts_nikah` | Khanza: enum string |
| `alamat` | `alamat` | VARCHAR(200) | `alamat` | |
| `noTelp` | `no_telp` | VARCHAR(40) | `no_tlp` | |
| `namaIbu` | `nama_ibu` | VARCHAR(200) | `nm_ibu` | Untuk verifikasi |
| `namaPj` | `nama_pj` | VARCHAR(200) | `namakeluarga` | Penanggung jawab |
| `hubunganPj` | `hubungan_pj` | VARCHAR(30) | `keluarga` | Khanza: enum |
| `kdPj` | `kd_pj` | VARCHAR(5) | `kd_pj` | FK → penjab |
| `kdKel/Kec/Kab/Prop` | `kd_kel/kec/kab/prop` | INT | Same | FK kode wilayah |
| `umur` | `umur` | VARCHAR(30) | `umur` | Khanza: '37 Th 11 Bl 8 Hr' |
| `sukuBangsa` | `suku_bangsa` | VARCHAR(60) | via FK `suku_bangsa.id` | Denormalized |
| `satusehatId` | `satusehat_id` | VARCHAR(64) | - | IHS Number (baru) |

### 2. `practitioners` — Dokter & Tenaga Kesehatan

**Khanza source:** `dokter` (PK: `kd_dokter`) + `petugas` (PK: `nip`), kedua FK → `pegawai.nik`

| Column | DB Column | Type | Khanza Column | Keterangan |
|---|---|---|---|---|
| `id` | `id` | BigInt PK | - | Auto-increment |
| `kdDokter` | `kd_dokter` | VARCHAR(20) UNIQUE | `dokter.kd_dokter` | Khanza PK |
| `nip` | `nip` | VARCHAR(20) UNIQUE | `pegawai.nik` | Shared key |
| `namaLengkap` | `nama_lengkap` | VARCHAR(200) | `nm_dokter` / `nama` | |
| `kdSps` | `kd_sps` | VARCHAR(5) | `dokter.kd_sps` | FK → spesialis |
| `spesialisasi` | `spesialisasi` | VARCHAR(100) | via `spesialis.nm_sps` | Denormalized |
| `sipNumber` | `sip_number` | VARCHAR(120) | `no_ijn_praktek` | SIP (120 char di Khanza) |
| `jenisNakes` | `jenis_nakes` | ENUM | - | Unified: DOKTER/PERAWAT/etc |
| `satusehatId` | `satusehat_id` | VARCHAR(64) | - | IHS Number (baru) |

**Catatan migrasi:** Khanza memisahkan `dokter` dan `petugas` dalam tabel terpisah. Di sistem baru, keduanya digabung di `practitioners` dengan field `jenisNakes` sebagai pembeda.

### 3. `encounters` — Kunjungan/Registrasi

**Khanza source:** `reg_periksa` (PK: `no_rawat`)

| Column | DB Column | Type | Khanza Column | Keterangan |
|---|---|---|---|---|
| `noRawat` | `no_rawat` | VARCHAR(20) UNIQUE | `no_rawat` | Format: YYYY/MM/DD/NNNNNN |
| `noReg` | `no_reg` | VARCHAR(8) | `no_reg` | Nomor urut harian |
| `tipe` | `tipe` | ENUM | `status_lanjut` | Ralan→RAWAT_JALAN, Ranap→RAWAT_INAP |
| `status` | `status` | ENUM | `stts` | Mapping enum berbeda |
| `kdPj` | `kd_pj` | VARCHAR(5) | `kd_pj` | FK → penjab |
| `biayaReg` | `biaya_reg` | DECIMAL | `biaya_reg` | Biaya registrasi |
| `sttsDaftar` | `stts_daftar` | VARCHAR(5) | `stts_daftar` | 'Baru'/'Lama' |
| `statusBayar` | `status_bayar` | VARCHAR(20) | `status_bayar` | 'Sudah Bayar'/'Belum Bayar' |
| `noSep` | `no_sep` | VARCHAR(40) | via `bridging_sep.no_sep` | |

### 4. `medicines` — Obat & Alkes

**Khanza source:** `databarang` (PK: `kode_brng`)

| Column | DB Column | Type | Khanza Column | Keterangan |
|---|---|---|---|---|
| `kode` | `kode` | VARCHAR(15) UNIQUE | `kode_brng` | |
| `namaGenerik` | `nama_generik` | VARCHAR(200) | `nama_brng` | Khanza: single field |
| `hargaBeli` | `harga_beli` | DECIMAL | `h_beli` | |
| `hargaJualRalan` | `harga_jual_ralan` | DECIMAL | `ralan` | Harga rawat jalan |
| `hargaJualKelas1` | `harga_jual_kelas1` | DECIMAL | `kelas1` | |
| `hargaJualKelas2` | `harga_jual_kelas2` | DECIMAL | `kelas2` | |
| `hargaJualKelas3` | `harga_jual_kelas3` | DECIMAL | `kelas3` | |
| `hargaJualUtama` | `harga_jual_utama` | DECIMAL | `utama` | |
| `hargaJualVip` | `harga_jual_vip` | DECIMAL | `vip` | |
| `hargaJualVvip` | `harga_jual_vvip` | DECIMAL | `vvip` | |
| `isi` | `isi` | DECIMAL | `isi` | Konversi satuan besar→kecil |
| `kodeIndustri` | `kode_industri` | VARCHAR(5) | `kode_industri` | FK Khanza |

### 5. `procedures` — Tindakan Medis

**Khanza source:** `rawat_jl_dr` + `rawat_jl_pr` + `rawat_jl_drpr` (rawat jalan), `rawat_inap_dr/pr/drpr` (rawat inap)

Tarif breakdown mengikuti struktur Khanza:
- `material` — biaya bahan
- `bhp` — biaya BHP
- `tarifTindakanDr` — jasa dokter
- `tarifTindakanPr` — jasa perawat
- `kso` — bagi hasil KSO
- `menejemen` — fee manajemen
- `biayaRawat` — total

### 6. Model Tambahan dari Khanza

| Model | Khanza Source | Keterangan |
|---|---|---|
| `Penjab` | `penjab` | Tabel penjamin/asuransi |
| `Spesialis` | `spesialis` | Referensi spesialisasi dokter |
| `Penyakit` | `penyakit` | ICD-10 reference (format Khanza) |
| `BridgingSep` | `bridging_sep` | Data SEP BPJS lengkap |
| `KamarInap` | `kamar_inap` | History bed occupancy per encounter |

---

## Seed Data

Seed script: `apps/api/src/database/seeds/index.ts`

Data yang di-seed:
1. **10 Roles** — ADMIN, DOKTER, PERAWAT, APOTEKER, REGISTRASI, KASIR, LAB_ANALIS, RADIOGRAFER, MANAJEMEN, IT
2. **1 Admin user** — username: admin, password: admin123
3. **24 Lokasi** — 10 poli, 1 IGD, 5 bangsal, 1 VIP, 1 ICU, 1 OK, lab, radiologi, farmasi, gizi, admin
4. **5 Dokter sample** — 3 spesialis, 1 umum, 1 gigi

---

## Konvensi Penamaan

| Area | Convention | Contoh |
|------|-----------|--------|
| Prisma Model | PascalCase | `Patient`, `MedicalRecord` |
| Prisma Field | camelCase | `namaLengkap`, `tanggalLahir` |
| DB Table | snake_case (via @@map) | `patients`, `medical_records` |
| DB Column | snake_case (via @map) | `nama_lengkap`, `tanggal_lahir` |
| Enum | UPPER_SNAKE_CASE | `RAWAT_JALAN`, `KELAS_1` |

---

## Catatan Penting untuk Migrasi

1. **Primary Key:** Khanza menggunakan string-based PK (no_rkm_medis, kd_dokter, no_rawat). Sistem baru menggunakan BigInt auto-increment + kolom string sebagai unique key.

2. **Charset:** Khanza menggunakan `latin1`. Sistem baru menggunakan `utf8mb4`. Perlu konversi charset saat ETL.

3. **Billing:** Khanza `billing` table adalah denormalized print log (tanpa PK). Perlu normalisasi saat migrasi ke `bills` + `bill_items`.

4. **Harga Obat:** Khanza menyimpan 7 tier harga di kolom terpisah. Sistem baru mempertahankan struktur ini untuk kompatibilitas.

5. **Dokter vs Petugas:** Khanza memisahkan tabel `dokter` dan `petugas`. Sistem baru menggabungkan di `practitioners` dengan `jenisNakes` sebagai pembeda.
