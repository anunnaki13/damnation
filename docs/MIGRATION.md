# Panduan Migrasi Data: SIMRS Khanza → SIMRS Petala Bumi

## Overview

Dokumen ini menjelaskan proses migrasi (ETL) data dari database SIMRS Khanza (MySQL, charset `latin1`) ke database SIMRS Petala Bumi baru (MySQL 8.0, charset `utf8mb4`).

**Source:** Database Khanza (`sik`) — ~200+ tabel
**Target:** Database baru (`simrs_petala_bumi`) — Prisma schema

---

## Prinsip Migrasi

1. **Data-first:** Migrasi data master terlebih dahulu, baru data transaksi
2. **Khanza PK dipertahankan:** Field `no_rkm_medis`, `kd_dokter`, `no_rawat`, `kode_brng` tetap tersimpan untuk referensi
3. **Auto-increment PK baru:** Semua tabel baru menggunakan BigInt auto-increment sebagai PK
4. **Charset conversion:** `latin1` → `utf8mb4`
5. **Null safety:** Field yang nullable di Khanza tetap nullable di sistem baru
6. **Tidak destructive:** Data Khanza tidak dihapus/diubah, hanya di-copy

---

## Urutan Migrasi (Dependency Order)

### Phase 1 — Reference Data
```
1. penjab          → Penjab
2. spesialis       → Spesialis
3. penyakit        → Penyakit
4. propinsi        → (embedded di patients)
5. kabupaten       → (embedded di patients)
6. kecamatan       → (embedded di patients)
7. kelurahan       → (embedded di patients)
```

### Phase 2 — Master Data
```
8.  pegawai        → Employee
9.  dokter         → Practitioner (jenisNakes=DOKTER*)
10. petugas        → Practitioner (jenisNakes=PERAWAT/etc)
11. poliklinik     → Location (tipe=POLI)
12. bangsal        → Location (tipe=BANGSAL/ICU/etc)
13. kamar          → Bed
14. pasien         → Patient
15. databarang     → Medicine
16. jadwal         → PractitionerSchedule
```

### Phase 3 — Transactional Data
```
17. reg_periksa         → Encounter
18. bridging_sep        → BridgingSep
19. kamar_inap          → KamarInap
20. diagnosa_pasien     → Diagnosis
21. rawat_jl_dr/pr/drpr → Procedure (statusRawat='Ralan')
22. rawat_inap_dr/pr/drpr → Procedure (statusRawat='Ranap')
23. resep_obat          → Prescription
24. detail_pemberian_obat → PrescriptionItem
25. periksa_lab         → LabOrder
26. detail_periksa_lab  → LabResult
27. periksa_radiologi   → RadiologyOrder
28. nota_jalan + billing → Bill + BillItem
```

---

## Detail Mapping per Tabel

### pasien → Patient

```sql
INSERT INTO patients (no_rm, nik, no_bpjs, nama_lengkap, tempat_lahir,
  tanggal_lahir, jenis_kelamin, golongan_darah, agama, status_nikah,
  pekerjaan, alamat, no_telp, nama_ibu, nama_pj, hubungan_pj,
  kd_pj, kd_kel, kd_kec, kd_kab, kd_prop, umur, tgl_daftar)
SELECT
  no_rkm_medis,
  NULLIF(no_ktp, ''),
  NULLIF(no_peserta, ''),
  nm_pasien,
  tmp_lahir,
  tgl_lahir,
  jk,                           -- 'L'/'P' → sama
  gol_darah,                    -- 'A','B','O','AB','-' → sama
  agama,
  CASE stts_nikah
    WHEN 'BELUM MENIKAH' THEN 'BELUM_KAWIN'
    WHEN 'MENIKAH' THEN 'KAWIN'
    WHEN 'JANDA' THEN 'CERAI_HIDUP'
    WHEN 'DUDHA' THEN 'CERAI_HIDUP'
    ELSE stts_nikah
  END,
  pekerjaan,
  alamat,
  no_tlp,
  nm_ibu,
  namakeluarga,                 -- → nama_pj
  CASE keluarga
    WHEN 'AYAH' THEN 'Ayah'
    WHEN 'IBU' THEN 'Ibu'
    WHEN 'SUAMI' THEN 'Suami'
    WHEN 'ISTRI' THEN 'Istri'
    WHEN 'ANAK' THEN 'Anak'
    ELSE keluarga
  END,
  kd_pj,
  kd_kel, kd_kec, kd_kab, kd_prop,
  umur,
  tgl_daftar
FROM sik.pasien;
```

### dokter → Practitioner

```sql
INSERT INTO practitioners (kd_dokter, nip, nama_lengkap, jenis_kelamin,
  kd_sps, sip_number, jenis_nakes, is_active, alumni, email)
SELECT
  d.kd_dokter,
  d.kd_dokter,                  -- nip = kd_dokter = pegawai.nik
  d.nm_dokter,
  d.jk,
  d.kd_sps,
  d.no_ijn_praktek,
  CASE
    WHEN s.nm_sps IS NOT NULL THEN 'DOKTER_SPESIALIS'
    WHEN d.nm_dokter LIKE 'drg%' THEN 'DOKTER_GIGI'
    ELSE 'DOKTER_UMUM'
  END,
  CASE d.status WHEN '1' THEN TRUE ELSE FALSE END,
  d.alumni,
  d.email
FROM sik.dokter d
LEFT JOIN sik.spesialis s ON d.kd_sps = s.kd_sps;
```

### reg_periksa → Encounter

```sql
INSERT INTO encounters (no_rawat, no_reg, patient_id, practitioner_id,
  location_id, tipe, status, tanggal_masuk, kd_pj, biaya_reg,
  stts_daftar, status_bayar, status_poli, umur_daftar, stts_umur,
  p_jawab, almt_pj, hubungan_pj)
SELECT
  r.no_rawat,
  r.no_reg,
  p.id,                          -- lookup patients.id by no_rm = no_rkm_medis
  pr.id,                         -- lookup practitioners.id by kd_dokter
  l.id,                          -- lookup locations.id by kd_poli_khanza
  CASE r.status_lanjut
    WHEN 'Ralan' THEN 'RAWAT_JALAN'
    WHEN 'Ranap' THEN 'RAWAT_INAP'
  END,
  CASE r.stts
    WHEN 'Belum' THEN 'PLANNED'
    WHEN 'Sudah' THEN 'FINISHED'
    WHEN 'Batal' THEN 'CANCELLED'
    WHEN 'Dirawat' THEN 'IN_PROGRESS'
    ELSE 'FINISHED'
  END,
  CONCAT(r.tgl_registrasi, ' ', r.jam_reg),
  r.kd_pj,
  r.biaya_reg,
  r.stts_daftar,
  r.status_bayar,
  r.status_poli,
  r.umurdaftar,
  r.sttsumur,
  r.p_jawab,
  r.almt_pj,
  r.hubunganpj
FROM sik.reg_periksa r
JOIN patients p ON p.no_rm = r.no_rkm_medis
LEFT JOIN practitioners pr ON pr.kd_dokter = r.kd_dokter
LEFT JOIN locations l ON l.kd_poli_khanza = r.kd_poli;
```

---

## Catatan Penting

### Charset Conversion
```sql
-- Convert Khanza tables from latin1 to utf8mb4 before migration
ALTER TABLE sik.pasien CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Billing Migration
Khanza `billing` table adalah **denormalized print log** tanpa PK. Perlu logic khusus:
- Filter hanya rows dengan `status` yang bukan label/header ('TtlObat', 'TtlKamar', dll = skip)
- Group by `no_rawat` untuk membuat 1 `Bill` per encounter
- Map `status` ke `KategoriBilling` enum

### Data Validation Post-Migration
```sql
-- Cek jumlah records
SELECT 'Khanza pasien' as src, COUNT(*) FROM sik.pasien
UNION ALL
SELECT 'New patients', COUNT(*) FROM simrs_petala_bumi.patients;

-- Cek integritas FK
SELECT COUNT(*) FROM encounters e
LEFT JOIN patients p ON e.patient_id = p.id
WHERE p.id IS NULL;  -- Harus 0
```

---

## ETL Script

Script migrasi akan dibuat di `scripts/migrate-khanza.ts`. Script ini:
1. Connect ke database Khanza (source) dan database baru (target)
2. Migrate per tabel sesuai urutan dependency
3. Log progress dan error
4. Validasi jumlah record post-migration
5. Bisa di-run ulang (idempotent — skip jika data sudah ada)
