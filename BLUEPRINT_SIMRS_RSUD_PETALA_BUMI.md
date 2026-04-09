# BLUEPRINT PENGEMBANGAN SIMRS TERINTEGRASI
## RSUD Petala Bumi — CV Panda Global Teknologi
### Panduan Teknis untuk Development dengan Claude Code di VPS

---

**Versi:** 1.0  
**Tanggal:** 9 April 2026  
**Referensi:** Final_Proposal_SIMRS.pdf (Bab I–XI)

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Arsitektur Sistem & Tech Stack](#2-arsitektur-sistem--tech-stack)
3. [Struktur Project & Monorepo Layout](#3-struktur-project--monorepo-layout)
4. [Database Schema Design](#4-database-schema-design)
5. [Modul-Modul SIMRS (23 Modul)](#5-modul-modul-simrs)
6. [Integrasi SATUSEHAT (HL7 FHIR R4)](#6-integrasi-satusehat)
7. [Bridging BPJS Kesehatan](#7-bridging-bpjs-kesehatan)
8. [Rekam Medis Elektronik (RME)](#8-rekam-medis-elektronik)
9. [Dashboard & Analitik](#9-dashboard--analitik)
10. [Keamanan & Compliance](#10-keamanan--compliance)
11. [Mobile Application](#11-mobile-application)
12. [DevOps & Deployment di VPS](#12-devops--deployment-di-vps)
13. [Urutan Development (Roadmap)](#13-urutan-development-roadmap)
14. [Claude Code — Instruksi Teknis](#14-claude-code--instruksi-teknis)
15. [Referensi & Sumber](#15-referensi--sumber)

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Tujuan Blueprint
Dokumen ini adalah panduan teknis komprehensif untuk membangun SIMRS dari nol (ground-up development) menggunakan Claude Code di VPS. Blueprint ini menerjemahkan proposal bisnis (65 halaman) menjadi spesifikasi teknis yang actionable.

### 1.2 Scope Proyek
- **Klien:** RSUD Petala Bumi Provinsi Riau (RS Kelas C, BLUD)
- **Vendor:** CV Panda Global Teknologi, Pekanbaru
- **Existing System:** SIMRS Khanza (Java Swing + MySQL), akan di-modernisasi ke web-based
- **Kontrak:** 1 tahun, rolling development per-modul
- **Nilai:** Rp 1.838.160.000 (incl. PPN 11%)
- **Total Modul:** 23 modul (11 Front Office + 8 Back Office + integrasi + mobile)

### 1.3 Pendekatan Teknis
Bukan migrasi dari Khanza, melainkan **build baru** dengan arsitektur modern web-based. Data dari database MySQL Khanza akan dimitigasi melalui proses ETL terstruktur.

---

## 2. ARSITEKTUR SISTEM & TECH STACK

### 2.1 Arsitektur Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  Web Browser (Desktop/Tablet)  │  Mobile App  │  Kiosk  │ Display│
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────────┐
│                   PRESENTATION LAYER                             │
│  Next.js 14+ (App Router)  │  React Native (Mobile)             │
│  Tailwind CSS + shadcn/ui  │  Recharts/ECharts (Dashboard)      │
│  Design System RSUD Petala Bumi                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │ RESTful API / WebSocket
┌──────────────────────▼──────────────────────────────────────────┐
│                   APPLICATION LAYER                               │
│  NestJS (TypeScript)                                              │
│  ├── Auth Module (JWT + OAuth 2.0 + MFA)                         │
│  ├── Business Logic Modules (per-modul SIMRS)                    │
│  ├── FHIR Engine (SATUSEHAT mapper)                              │
│  ├── BPJS Bridge Service                                         │
│  ├── Background Jobs (Bull Queue + Redis)                        │
│  └── Audit Trail & Logging (ELK-compatible)                      │
└──────────┬────────────────────────────┬─────────────────────────┘
           │ SQL / ORM                  │ HL7 FHIR / REST
┌──────────▼──────────┐    ┌────────────▼─────────────────────────┐
│     DATA LAYER      │    │       INTEGRATION LAYER               │
│  MySQL 8.0 (Primary)│    │  SATUSEHAT API (FHIR R4)             │
│  Redis (Cache/Queue) │    │  BPJS VClaim / SEP / INA-CBGs        │
│  MinIO (File Storage)│    │  SIRS Online                         │
└─────────────────────┘    │  Payment Gateway (QRIS)              │
                           │  LIS / PACS (DICOM)                   │
                           └───────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                                 │
│  Nginx (Reverse Proxy + SSL)  │  Docker + Docker Compose         │
│  GitHub Actions (CI/CD)       │  Prometheus + Grafana             │
│  ELK Stack (Logging)          │  Automated Backup                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack Final

| Layer | Teknologi | Versi Min. | Justifikasi |
|-------|-----------|------------|-------------|
| **Frontend** | Next.js (App Router) | 14.x | SSR, SEO, React ecosystem |
| **UI Library** | shadcn/ui + Tailwind CSS | - | Customizable, enterprise-grade |
| **State** | Zustand | 4.x | Lightweight, TypeScript-native |
| **Charts** | Recharts + Apache ECharts | - | Interactive dashboard |
| **Forms** | React Hook Form + Zod | - | Validasi real-time, performa |
| **Backend** | NestJS (TypeScript) | 10.x | Modular, decorator-based, mature |
| **ORM** | Prisma | 5.x | Type-safe, migration management |
| **Database** | MySQL | 8.0 | Kompatibel Khanza existing |
| **Cache** | Redis | 7.x | Session, queue, caching |
| **Queue** | BullMQ | - | Background jobs (FHIR sync, reports) |
| **File Storage** | MinIO | - | S3-compatible, dokumen medis & PACS |
| **Mobile** | React Native (Expo) | - | Cross-platform Android & iOS |
| **API Docs** | Swagger / OpenAPI 3.0 | - | Auto-generated dari NestJS |
| **Container** | Docker + Docker Compose | - | Konsistensi environment |
| **Web Server** | Nginx | - | Reverse proxy, SSL termination |
| **Monitoring** | Prometheus + Grafana | - | Real-time monitoring & alerting |
| **Logging** | Winston + Loki (atau ELK) | - | Centralized logging |
| **CI/CD** | GitHub Actions | - | Automated build, test, deploy |
| **VCS** | Git (GitHub) | - | Source code management |

### 2.3 Alasan Memilih NestJS + Next.js + MySQL

1. **NestJS** — Arsitektur modular cocok untuk 23 modul SIMRS; built-in support untuk Guards (RBAC), Interceptors (audit trail), dan Pipes (validasi). Decorator pattern memudahkan Claude Code generate kode terstruktur.

2. **Next.js** — Server-side rendering untuk kecepatan akses di jaringan RS; App Router untuk route-based code splitting per modul; API routes sebagai BFF (Backend for Frontend) jika diperlukan.

3. **MySQL 8.0** — Kompatibilitas langsung dengan database Khanza existing untuk proses migrasi data. JSON support untuk data fleksibel (FHIR resources). Mature, proven di healthcare Indonesia.

---

## 3. STRUKTUR PROJECT & MONOREPO LAYOUT

### 3.1 Monorepo dengan Turborepo

```
simrs-petala-bumi/
├── apps/
│   ├── web/                          # Next.js — Web SIMRS utama
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, forgot password
│   │   │   ├── (dashboard)/          # Layout dashboard per role
│   │   │   ├── registrasi/           # Modul Registrasi & Admisi
│   │   │   ├── rawat-jalan/          # Modul Rawat Jalan
│   │   │   ├── igd/                  # Modul IGD
│   │   │   ├── rawat-inap/           # Modul Rawat Inap
│   │   │   ├── kamar-operasi/        # Modul Kamar Operasi
│   │   │   ├── farmasi/              # Modul Farmasi/Apotek
│   │   │   ├── laboratorium/         # Modul Laboratorium
│   │   │   ├── radiologi/            # Modul Radiologi
│   │   │   ├── billing/              # Modul Billing & Kasir
│   │   │   ├── keuangan/             # Modul Keuangan & Akuntansi
│   │   │   ├── kepegawaian/          # Modul Kepegawaian/SDM
│   │   │   ├── logistik/             # Modul Logistik & Inventaris
│   │   │   ├── aset/                 # Modul Manajemen Aset
│   │   │   ├── gizi/                 # Modul Gizi/Dapur
│   │   │   ├── antrean/              # Modul Manajemen Antrean
│   │   │   ├── pendaftaran-online/   # Portal Pendaftaran Online
│   │   │   ├── rekam-medis/          # Modul RME
│   │   │   ├── dashboard-analitik/   # Dashboard & Pelaporan
│   │   │   ├── satusehat/            # Monitor Integrasi SATUSEHAT
│   │   │   ├── bpjs/                 # Monitor Bridging BPJS
│   │   │   └── admin/                # Admin system (users, roles, settings)
│   │   ├── components/               # Shared UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, API client
│   │   └── styles/                   # Tailwind config, design tokens
│   │
│   ├── api/                          # NestJS — Backend API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Authentication & Authorization
│   │   │   │   ├── users/            # User management
│   │   │   │   ├── patients/         # Master pasien
│   │   │   │   ├── practitioners/    # Master dokter/nakes
│   │   │   │   ├── registration/     # Registrasi & Admisi
│   │   │   │   ├── outpatient/       # Rawat Jalan
│   │   │   │   ├── emergency/        # IGD
│   │   │   │   ├── inpatient/        # Rawat Inap
│   │   │   │   ├── surgery/          # Kamar Operasi
│   │   │   │   ├── pharmacy/         # Farmasi
│   │   │   │   ├── laboratory/       # Laboratorium
│   │   │   │   ├── radiology/        # Radiologi
│   │   │   │   ├── billing/          # Billing & Kasir
│   │   │   │   ├── finance/          # Keuangan & Akuntansi
│   │   │   │   ├── hr/               # Kepegawaian
│   │   │   │   ├── logistics/        # Logistik & Inventaris
│   │   │   │   ├── assets/           # Manajemen Aset
│   │   │   │   ├── nutrition/        # Gizi/Dapur
│   │   │   │   ├── queue/            # Manajemen Antrean
│   │   │   │   ├── online-reg/       # Pendaftaran Online
│   │   │   │   ├── emr/              # Rekam Medis Elektronik
│   │   │   │   ├── analytics/        # Dashboard & Pelaporan
│   │   │   │   ├── satusehat/        # Integrasi SATUSEHAT
│   │   │   │   ├── bpjs/             # Bridging BPJS
│   │   │   │   └── sirs/             # Pelaporan SIRS Online
│   │   │   ├── common/
│   │   │   │   ├── guards/           # Auth guards, RBAC
│   │   │   │   ├── interceptors/     # Audit trail, logging, transform
│   │   │   │   ├── decorators/       # Custom decorators
│   │   │   │   ├── filters/          # Exception filters
│   │   │   │   ├── pipes/            # Validation pipes
│   │   │   │   └── middleware/       # Rate limiting, CORS
│   │   │   ├── integrations/
│   │   │   │   ├── fhir/             # FHIR R4 resource builders
│   │   │   │   ├── bpjs-vclaim/      # BPJS VClaim API client
│   │   │   │   ├── bpjs-eclaim/      # BPJS E-Klaim/INA-CBGs
│   │   │   │   ├── bpjs-antrol/      # BPJS Antrean Online
│   │   │   │   └── sirs-online/      # SIRS Kemenkes
│   │   │   ├── config/               # App config, env validation
│   │   │   └── database/
│   │   │       ├── migrations/       # Prisma migrations
│   │   │       ├── seeds/            # Seed data (ICD-10, LOINC, etc.)
│   │   │       └── schema.prisma     # Database schema
│   │   └── test/                     # E2E tests
│   │
│   └── mobile/                       # React Native (Expo)
│       ├── app/                      # Expo Router
│       │   ├── (patient)/            # Portal Pasien
│       │   ├── (doctor)/             # Portal Dokter
│       │   └── (management)/         # Portal Manajemen
│       └── components/
│
├── packages/
│   ├── shared/                       # Shared types, constants, utils
│   │   ├── types/                    # TypeScript interfaces
│   │   │   ├── patient.ts
│   │   │   ├── encounter.ts
│   │   │   ├── medication.ts
│   │   │   └── ...
│   │   ├── constants/                # ICD-10 codes, enums, config
│   │   ├── validators/              # Zod schemas (shared FE/BE)
│   │   └── utils/                   # Date, format, helpers
│   │
│   ├── fhir/                        # FHIR R4 Resource Builders
│   │   ├── resources/
│   │   │   ├── encounter.ts
│   │   │   ├── condition.ts
│   │   │   ├── observation.ts
│   │   │   ├── medication.ts
│   │   │   ├── procedure.ts
│   │   │   ├── service-request.ts
│   │   │   ├── allergy-intolerance.ts
│   │   │   ├── clinical-impression.ts
│   │   │   ├── diagnostic-report.ts
│   │   │   ├── composition.ts
│   │   │   └── patient.ts
│   │   ├── terminology/             # ICD-10, ICD-9-CM, LOINC, SNOMED-CT
│   │   ├── mappers/                 # SIMRS → FHIR mappers
│   │   └── validators/              # FHIR resource validators
│   │
│   ├── ui/                          # Design System Components
│   │   ├── components/
│   │   │   ├── DataTable/
│   │   │   ├── FormField/
│   │   │   ├── StatusBadge/
│   │   │   ├── PatientCard/
│   │   │   ├── BedMap/
│   │   │   └── ...
│   │   └── tokens/                  # Design tokens (colors, spacing)
│   │
│   └── eslint-config/               # Shared ESLint config
│
├── docker/
│   ├── docker-compose.yml           # Development stack
│   ├── docker-compose.prod.yml      # Production stack
│   ├── Dockerfile.api               # Backend Dockerfile
│   ├── Dockerfile.web               # Frontend Dockerfile
│   └── nginx/
│       └── nginx.conf               # Reverse proxy config
│
├── scripts/
│   ├── migrate-khanza.ts            # ETL script: Khanza MySQL → new schema
│   ├── seed-icd10.ts                # Seed ICD-10 codes
│   ├── seed-loinc.ts                # Seed LOINC codes
│   ├── seed-snomed.ts               # Seed SNOMED-CT subset
│   └── setup-dev.sh                 # Development environment setup
│
├── docs/
│   ├── api/                         # API documentation
│   ├── database/                    # ERD diagrams
│   ├── deployment/                  # Deployment guides
│   └── user-guides/                 # Per-module user guides
│
├── turbo.json                       # Turborepo config
├── package.json                     # Root package.json
├── .env.example                     # Environment variables template
└── README.md
```

---

## 4. DATABASE SCHEMA DESIGN

### 4.1 Skema Utama (Core Tables)

Berikut adalah desain schema database yang mencakup semua 23 modul. Schema menggunakan MySQL 8.0 dengan Prisma ORM.

#### A. Master Data

```sql
-- ============================================
-- MASTER PASIEN
-- ============================================
CREATE TABLE patients (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no_rm           VARCHAR(15) UNIQUE NOT NULL,        -- Nomor Rekam Medis (format: PB-XXXXXX)
  nik             VARCHAR(16) UNIQUE,                  -- NIK KTP
  no_bpjs         VARCHAR(13),                         -- Nomor Peserta BPJS
  satusehat_id    VARCHAR(64),                         -- Patient IHS Number dari SATUSEHAT
  nama_lengkap    VARCHAR(200) NOT NULL,
  tempat_lahir    VARCHAR(100),
  tanggal_lahir   DATE NOT NULL,
  jenis_kelamin   ENUM('L','P') NOT NULL,
  golongan_darah  ENUM('A','B','AB','O','-'),
  agama           VARCHAR(20),
  status_nikah    ENUM('BELUM_KAWIN','KAWIN','CERAI_HIDUP','CERAI_MATI'),
  pendidikan      VARCHAR(30),
  pekerjaan       VARCHAR(50),
  alamat          TEXT,
  rt              VARCHAR(5),
  rw              VARCHAR(5),
  kelurahan       VARCHAR(100),
  kecamatan       VARCHAR(100),
  kabupaten       VARCHAR(100),
  provinsi        VARCHAR(100),
  kode_pos        VARCHAR(5),
  no_telp         VARCHAR(20),
  no_hp           VARCHAR(20),
  email           VARCHAR(100),
  nama_ibu        VARCHAR(200),                        -- Untuk verifikasi identitas
  -- Penanggung Jawab
  nama_pj         VARCHAR(200),
  hubungan_pj     VARCHAR(30),
  alamat_pj       TEXT,
  telp_pj         VARCHAR(20),
  -- Alergi
  alergi_obat     TEXT,                                -- JSON array
  alergi_makanan  TEXT,                                -- JSON array
  -- Metadata
  foto            VARCHAR(255),                        -- Path ke MinIO
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      BIGINT UNSIGNED,
  INDEX idx_nik (nik),
  INDEX idx_no_bpjs (no_bpjs),
  INDEX idx_satusehat_id (satusehat_id),
  INDEX idx_nama (nama_lengkap),
  INDEX idx_tgl_lahir (tanggal_lahir)
);

-- ============================================
-- MASTER DOKTER / TENAGA KESEHATAN
-- ============================================
CREATE TABLE practitioners (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nip             VARCHAR(20) UNIQUE,
  nik             VARCHAR(16),
  satusehat_id    VARCHAR(64),                         -- Practitioner IHS Number
  sip_number      VARCHAR(30),                         -- Surat Izin Praktik
  str_number      VARCHAR(30),                         -- Surat Tanda Registrasi
  nama_lengkap    VARCHAR(200) NOT NULL,
  gelar_depan     VARCHAR(20),
  gelar_belakang  VARCHAR(50),
  jenis_kelamin   ENUM('L','P') NOT NULL,
  tempat_lahir    VARCHAR(100),
  tanggal_lahir   DATE,
  spesialisasi    VARCHAR(100),
  sub_spesialisasi VARCHAR(100),
  jenis_nakes     ENUM('DOKTER_UMUM','DOKTER_SPESIALIS','DOKTER_GIGI',
                       'PERAWAT','BIDAN','APOTEKER','NUTRISIONIS',
                       'RADIOGRAFER','ANALIS_LAB','FISIOTERAPIS','LAINNYA'),
  alamat          TEXT,
  no_hp           VARCHAR(20),
  email           VARCHAR(100),
  foto            VARCHAR(255),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_satusehat (satusehat_id),
  INDEX idx_spesialisasi (spesialisasi)
);

-- ============================================
-- MASTER LOKASI / UNIT
-- ============================================
CREATE TABLE locations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  satusehat_id    VARCHAR(64),                         -- Location IHS Number
  kode            VARCHAR(20) UNIQUE NOT NULL,
  nama            VARCHAR(200) NOT NULL,
  tipe            ENUM('POLI','BANGSAL','IGD','OK','ICU','PERINATOLOGI',
                       'LABORATORIUM','RADIOLOGI','FARMASI','GIZI',
                       'ADMIN','GUDANG','LAINNYA') NOT NULL,
  lantai          VARCHAR(10),
  gedung          VARCHAR(50),
  parent_id       BIGINT UNSIGNED,                     -- Hierarki lokasi
  kapasitas_bed   INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES locations(id)
);

-- ============================================
-- JADWAL PRAKTIK DOKTER
-- ============================================
CREATE TABLE practitioner_schedules (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id BIGINT UNSIGNED NOT NULL,
  location_id     BIGINT UNSIGNED NOT NULL,
  hari            ENUM('SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'),
  jam_mulai       TIME NOT NULL,
  jam_selesai     TIME NOT NULL,
  kuota_pasien    INT DEFAULT 30,
  is_active       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
```

#### B. Encounters & Registrasi

```sql
-- ============================================
-- KUNJUNGAN / ENCOUNTER
-- ============================================
CREATE TABLE encounters (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no_rawat        VARCHAR(20) UNIQUE NOT NULL,          -- Nomor Rawat unik
  satusehat_id    VARCHAR(64),                          -- Encounter IHS ID
  patient_id      BIGINT UNSIGNED NOT NULL,
  practitioner_id BIGINT UNSIGNED,
  location_id     BIGINT UNSIGNED NOT NULL,
  -- Tipe Kunjungan
  tipe            ENUM('RAWAT_JALAN','IGD','RAWAT_INAP') NOT NULL,
  kelas_rawat     ENUM('KELAS_1','KELAS_2','KELAS_3','VIP','VVIP') DEFAULT NULL,
  -- Status Lifecycle
  status          ENUM('PLANNED','ARRIVED','IN_PROGRESS','ON_LEAVE',
                       'FINISHED','CANCELLED') DEFAULT 'PLANNED',
  -- Waktu
  tanggal_masuk   DATETIME NOT NULL,
  tanggal_keluar  DATETIME,
  -- Penjamin
  penjamin        ENUM('UMUM','BPJS','ASURANSI','JAMKESDA','PERUSAHAAN') DEFAULT 'UMUM',
  no_sep          VARCHAR(20),                          -- Nomor SEP BPJS
  no_rujukan      VARCHAR(20),
  -- Cara Masuk / Keluar
  cara_masuk      ENUM('SENDIRI','RUJUKAN','LAHIR','PINDAHAN'),
  cara_keluar     ENUM('ATAS_PERSETUJUAN','DIRUJUK','PULANG_PAKSA',
                       'MENINGGAL','LARI','PINDAH_RS'),
  -- Triase (IGD)
  triase_level    ENUM('ESI_1','ESI_2','ESI_3','ESI_4','ESI_5'),
  -- Bed (Rawat Inap)
  bed_id          BIGINT UNSIGNED,
  -- FHIR Sync
  fhir_synced     BOOLEAN DEFAULT FALSE,
  fhir_synced_at  DATETIME,
  fhir_error      TEXT,
  -- Metadata
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      BIGINT UNSIGNED,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_patient (patient_id),
  INDEX idx_tanggal (tanggal_masuk),
  INDEX idx_status (status),
  INDEX idx_penjamin (penjamin),
  INDEX idx_fhir_sync (fhir_synced)
);

-- ============================================
-- DIAGNOSA (ICD-10)
-- ============================================
CREATE TABLE diagnoses (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  satusehat_id    VARCHAR(64),                          -- Condition IHS ID
  icd10_code      VARCHAR(10) NOT NULL,
  icd10_display   VARCHAR(500),
  tipe            ENUM('PRIMER','SEKUNDER','TAMBAHAN') DEFAULT 'PRIMER',
  rank_order      INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by      BIGINT UNSIGNED,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  INDEX idx_encounter (encounter_id),
  INDEX idx_icd10 (icd10_code)
);

-- ============================================
-- PROSEDUR / TINDAKAN (ICD-9-CM)
-- ============================================
CREATE TABLE procedures (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  satusehat_id    VARCHAR(64),
  icd9cm_code     VARCHAR(10) NOT NULL,
  icd9cm_display  VARCHAR(500),
  tanggal         DATETIME NOT NULL,
  practitioner_id BIGINT UNSIGNED,
  catatan         TEXT,
  tarif           DECIMAL(15,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);
```

#### C. Rekam Medis Elektronik (RME)

```sql
-- ============================================
-- ASESMEN & CATATAN MEDIS (SOAP, SBAR, CPPT)
-- ============================================
CREATE TABLE medical_records (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  practitioner_id BIGINT UNSIGNED NOT NULL,
  tipe            ENUM('SOAP','ADIME','SBAR','CPPT','ASESMEN_AWAL',
                       'CATATAN_KEPERAWATAN','RESUME_MEDIS') NOT NULL,
  -- SOAP Fields
  subjective      TEXT,
  objective       TEXT,
  assessment      TEXT,
  plan            TEXT,
  -- ADIME Fields (Gizi)
  adime_assessment   TEXT,
  adime_diagnosis    TEXT,
  adime_intervention TEXT,
  adime_monitoring   TEXT,
  adime_evaluation   TEXT,
  -- SBAR Fields (Keperawatan)
  sbar_situation     TEXT,
  sbar_background    TEXT,
  sbar_assessment    TEXT,
  sbar_recommendation TEXT,
  -- Tanda Vital (Observation)
  tekanan_darah_sistolik  INT,
  tekanan_darah_diastolik INT,
  nadi                    INT,
  suhu                    DECIMAL(4,1),
  pernapasan              INT,
  spo2                    INT,
  tinggi_badan            DECIMAL(5,1),
  berat_badan             DECIMAL(5,1),
  -- Digital Signature
  signed_by       BIGINT UNSIGNED,
  signed_at       DATETIME,
  signature_hash  VARCHAR(255),
  -- Metadata
  tanggal_input   DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_amendment     BOOLEAN DEFAULT FALSE,
  amendment_of    BIGINT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id),
  INDEX idx_encounter (encounter_id),
  INDEX idx_patient (patient_id),
  INDEX idx_tipe (tipe)
);

-- ============================================
-- TANDA VITAL (OBSERVATION - untuk FHIR)
-- ============================================
CREATE TABLE observations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  satusehat_id    VARCHAR(64),
  category        VARCHAR(50) NOT NULL,                 -- vital-signs, laboratory, etc
  loinc_code      VARCHAR(20),
  loinc_display   VARCHAR(200),
  value_quantity  DECIMAL(10,3),
  value_unit      VARCHAR(20),
  value_string    TEXT,
  value_code      VARCHAR(50),
  interpretation  VARCHAR(50),                          -- N, H, L, HH, LL, etc
  reference_low   DECIMAL(10,3),
  reference_high  DECIMAL(10,3),
  effective_at    DATETIME NOT NULL,
  issued_at       DATETIME,
  performer_id    BIGINT UNSIGNED,
  status          ENUM('REGISTERED','PRELIMINARY','FINAL','AMENDED','CANCELLED') DEFAULT 'FINAL',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_encounter (encounter_id),
  INDEX idx_loinc (loinc_code),
  INDEX idx_category (category)
);
```

#### D. Farmasi & Obat

```sql
-- ============================================
-- MASTER OBAT & ALKES
-- ============================================
CREATE TABLE medicines (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode            VARCHAR(20) UNIQUE NOT NULL,
  nama_generik    VARCHAR(200) NOT NULL,
  nama_dagang     VARCHAR(200),
  satuan          VARCHAR(20) NOT NULL,                 -- tablet, kapsul, ml, dll
  kategori        ENUM('OBAT','ALKES','BHP','LAINNYA') DEFAULT 'OBAT',
  golongan        ENUM('BEBAS','BEBAS_TERBATAS','KERAS','NARKOTIKA','PSIKOTROPIKA'),
  harga_beli      DECIMAL(15,2) DEFAULT 0,
  harga_jual      DECIMAL(15,2) DEFAULT 0,
  stok_minimum    INT DEFAULT 10,
  is_formularium  BOOLEAN DEFAULT TRUE,                 -- Apakah masuk formularium RS
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nama (nama_generik)
);

-- ============================================
-- STOK OBAT
-- ============================================
CREATE TABLE medicine_stocks (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  medicine_id     BIGINT UNSIGNED NOT NULL,
  location_id     BIGINT UNSIGNED NOT NULL,             -- Gudang/Depo mana
  batch_number    VARCHAR(30),
  expired_date    DATE,
  stok            INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  INDEX idx_expired (expired_date),
  INDEX idx_medicine_loc (medicine_id, location_id)
);

-- ============================================
-- RESEP / PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  prescriber_id   BIGINT UNSIGNED NOT NULL,
  no_resep        VARCHAR(20) UNIQUE NOT NULL,
  status          ENUM('DRAFT','SUBMITTED','VERIFIED','DISPENSED',
                       'PARTIALLY_DISPENSED','CANCELLED') DEFAULT 'DRAFT',
  jenis           ENUM('RACIKAN','NON_RACIKAN') DEFAULT 'NON_RACIKAN',
  catatan         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (prescriber_id) REFERENCES practitioners(id)
);

CREATE TABLE prescription_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prescription_id BIGINT UNSIGNED NOT NULL,
  medicine_id     BIGINT UNSIGNED NOT NULL,
  jumlah          DECIMAL(10,2) NOT NULL,
  dosis           VARCHAR(50),                          -- 3x1, 2x500mg, dll
  rute            VARCHAR(30),                          -- oral, iv, im, sc, dll
  frekuensi       VARCHAR(50),
  durasi_hari     INT,
  aturan_pakai    TEXT,
  catatan         TEXT,
  harga_satuan    DECIMAL(15,2),
  subtotal        DECIMAL(15,2),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
```

#### E. Billing & Keuangan

```sql
-- ============================================
-- BILLING / TAGIHAN
-- ============================================
CREATE TABLE bills (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  no_invoice      VARCHAR(20) UNIQUE NOT NULL,
  tanggal         DATE NOT NULL,
  total_tarif     DECIMAL(15,2) DEFAULT 0,
  total_diskon    DECIMAL(15,2) DEFAULT 0,
  total_bayar     DECIMAL(15,2) DEFAULT 0,
  sisa_bayar      DECIMAL(15,2) DEFAULT 0,
  penjamin        ENUM('UMUM','BPJS','ASURANSI','JAMKESDA','PERUSAHAAN'),
  -- BPJS specific
  tarif_inacbgs   DECIMAL(15,2) DEFAULT 0,
  selisih_klaim   DECIMAL(15,2) DEFAULT 0,
  status          ENUM('OPEN','CLOSED','VOID') DEFAULT 'OPEN',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE bill_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_id         BIGINT UNSIGNED NOT NULL,
  kategori        ENUM('JASA_DOKTER','JASA_PERAWAT','OBAT','ALKES','BHP',
                       'LABORATORIUM','RADIOLOGI','TINDAKAN','KAMAR',
                       'ADMINISTRASI','LAINNYA') NOT NULL,
  deskripsi       VARCHAR(500) NOT NULL,
  jumlah          DECIMAL(10,2) DEFAULT 1,
  tarif           DECIMAL(15,2) NOT NULL,
  diskon          DECIMAL(15,2) DEFAULT 0,
  subtotal        DECIMAL(15,2) NOT NULL,
  reference_type  VARCHAR(50),                          -- prescription, procedure, etc.
  reference_id    BIGINT UNSIGNED,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- ============================================
-- PEMBAYARAN / PAYMENTS
-- ============================================
CREATE TABLE payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bill_id         BIGINT UNSIGNED NOT NULL,
  tanggal         DATETIME NOT NULL,
  jumlah          DECIMAL(15,2) NOT NULL,
  metode          ENUM('TUNAI','DEBIT','KREDIT','TRANSFER','QRIS','EWALLET') NOT NULL,
  referensi       VARCHAR(100),                         -- Transaction ID
  kasir_id        BIGINT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
);
```

#### F. Laboratorium & Radiologi

```sql
-- ============================================
-- ORDER PEMERIKSAAN LAB
-- ============================================
CREATE TABLE lab_orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  requester_id    BIGINT UNSIGNED NOT NULL,
  no_order        VARCHAR(20) UNIQUE NOT NULL,
  tanggal_order   DATETIME NOT NULL,
  status          ENUM('ORDERED','SPECIMEN_COLLECTED','IN_PROGRESS',
                       'COMPLETED','CANCELLED') DEFAULT 'ORDERED',
  prioritas       ENUM('ROUTINE','URGENT','STAT') DEFAULT 'ROUTINE',
  catatan_klinis  TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (requester_id) REFERENCES practitioners(id)
);

CREATE TABLE lab_order_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lab_order_id    BIGINT UNSIGNED NOT NULL,
  pemeriksaan     VARCHAR(200) NOT NULL,
  loinc_code      VARCHAR(20),
  tarif           DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (lab_order_id) REFERENCES lab_orders(id)
);

CREATE TABLE lab_results (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lab_order_item_id BIGINT UNSIGNED NOT NULL,
  parameter       VARCHAR(200) NOT NULL,
  hasil           VARCHAR(200),
  satuan          VARCHAR(50),
  nilai_normal    VARCHAR(200),
  flag            ENUM('NORMAL','HIGH','LOW','CRITICAL_HIGH','CRITICAL_LOW'),
  validator_id    BIGINT UNSIGNED,                      -- Analis yang validasi
  validated_at    DATETIME,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_order_item_id) REFERENCES lab_order_items(id)
);

-- ============================================
-- ORDER RADIOLOGI
-- ============================================
CREATE TABLE radiology_orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  encounter_id    BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED NOT NULL,
  requester_id    BIGINT UNSIGNED NOT NULL,
  no_order        VARCHAR(20) UNIQUE NOT NULL,
  accession_number VARCHAR(30),                         -- DICOM Accession Number
  jenis_pemeriksaan VARCHAR(200) NOT NULL,
  modalitas       ENUM('XRAY','CT','MRI','USG','FLUOROSCOPY','MAMMOGRAPHY') NOT NULL,
  status          ENUM('ORDERED','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'),
  catatan_klinis  TEXT,
  hasil_bacaan    TEXT,                                  -- Expertise radiolog
  kesan           TEXT,                                  -- Impression
  radiologist_id  BIGINT UNSIGNED,
  tanggal_pemeriksaan DATETIME,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### G. Bed Management, Antrean, & Pendukung

```sql
-- ============================================
-- BED MANAGEMENT (RAWAT INAP)
-- ============================================
CREATE TABLE beds (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id     BIGINT UNSIGNED NOT NULL,
  nomor_bed       VARCHAR(10) NOT NULL,
  kelas           ENUM('KELAS_1','KELAS_2','KELAS_3','VIP','VVIP','ICU','NICU','PICU'),
  status          ENUM('TERSEDIA','TERISI','MAINTENANCE','RESERVASI') DEFAULT 'TERSEDIA',
  tarif_per_hari  DECIMAL(15,2) DEFAULT 0,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  UNIQUE KEY uq_bed (location_id, nomor_bed)
);

-- ============================================
-- ANTREAN
-- ============================================
CREATE TABLE queue_tickets (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tanggal         DATE NOT NULL,
  location_id     BIGINT UNSIGNED NOT NULL,
  patient_id      BIGINT UNSIGNED,
  nomor_antrean   INT NOT NULL,
  kode_booking    VARCHAR(20),                          -- Untuk integrasi Mobile JKN
  jenis           ENUM('ONLINE','OFFLINE') DEFAULT 'OFFLINE',
  status          ENUM('WAITING','CALLED','SERVING','DONE','CANCELLED') DEFAULT 'WAITING',
  waktu_daftar    DATETIME,
  waktu_dipanggil DATETIME,
  waktu_selesai   DATETIME,
  estimasi_menit  INT,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  INDEX idx_tanggal_loc (tanggal, location_id)
);

-- ============================================
-- KEPEGAWAIAN
-- ============================================
CREATE TABLE employees (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practitioner_id BIGINT UNSIGNED,                      -- Link ke practitioner jika nakes
  nip             VARCHAR(20),
  nama_lengkap    VARCHAR(200) NOT NULL,
  jabatan         VARCHAR(100),
  unit_kerja      VARCHAR(100),
  status_pegawai  ENUM('PNS','PPPK','KONTRAK','HONORER','MAGANG'),
  tanggal_masuk   DATE,
  rekening_bank   VARCHAR(30),
  nama_bank       VARCHAR(50),
  npwp            VARCHAR(20),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);

-- ============================================
-- LOGISTIK & INVENTARIS
-- ============================================
CREATE TABLE inventory_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode            VARCHAR(20) UNIQUE NOT NULL,
  nama            VARCHAR(200) NOT NULL,
  kategori        ENUM('ATK','LINEN','ALKES','OBAT','RT','LAINNYA'),
  satuan          VARCHAR(20),
  stok            INT DEFAULT 0,
  stok_minimum    INT DEFAULT 5,
  lokasi_gudang   VARCHAR(100),
  harga_satuan    DECIMAL(15,2) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MANAJEMEN ASET
-- ============================================
CREATE TABLE assets (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_aset       VARCHAR(30) UNIQUE NOT NULL,
  nama            VARCHAR(200) NOT NULL,
  kategori        ENUM('ALAT_MEDIS','KENDARAAN','BANGUNAN','MEUBELAIR',
                       'KOMPUTER','LAINNYA'),
  merk            VARCHAR(100),
  serial_number   VARCHAR(100),
  tahun_perolehan INT,
  harga_perolehan DECIMAL(15,2),
  umur_ekonomis   INT,                                  -- dalam tahun
  lokasi          VARCHAR(200),
  kondisi         ENUM('BAIK','RUSAK_RINGAN','RUSAK_BERAT','DIHAPUSKAN'),
  tanggal_maintenance_terakhir DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT TRAIL
-- ============================================
CREATE TABLE audit_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED,
  action          ENUM('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT',
                       'PRINT','EXPORT','FHIR_SYNC','BPJS_SYNC') NOT NULL,
  entity_type     VARCHAR(50) NOT NULL,                 -- Nama tabel/modul
  entity_id       BIGINT UNSIGNED,
  old_values      JSON,
  new_values      JSON,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);

-- ============================================
-- USERS & RBAC
-- ============================================
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50) UNIQUE NOT NULL,
  email           VARCHAR(100) UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  employee_id     BIGINT UNSIGNED,
  practitioner_id BIGINT UNSIGNED,
  is_active       BOOLEAN DEFAULT TRUE,
  mfa_enabled     BOOLEAN DEFAULT FALSE,
  mfa_secret      VARCHAR(100),
  last_login      DATETIME,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
);

CREATE TABLE roles (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(50) UNIQUE NOT NULL,          -- ADMIN, DOKTER, PERAWAT, APOTEKER, dll
  description     VARCHAR(200),
  permissions     JSON NOT NULL                         -- Array of permission strings
);

CREATE TABLE user_roles (
  user_id         BIGINT UNSIGNED NOT NULL,
  role_id         BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================
-- SATUSEHAT SYNC LOG
-- ============================================
CREATE TABLE satusehat_sync_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resource_type   VARCHAR(50) NOT NULL,                 -- Encounter, Condition, etc
  local_id        BIGINT UNSIGNED NOT NULL,
  satusehat_id    VARCHAR(64),
  action          ENUM('CREATE','UPDATE','DELETE') NOT NULL,
  status          ENUM('PENDING','SUCCESS','FAILED','RETRYING') DEFAULT 'PENDING',
  request_body    JSON,
  response_body   JSON,
  error_message   TEXT,
  retry_count     INT DEFAULT 0,
  next_retry_at   DATETIME,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_resource (resource_type, local_id)
);

-- ============================================
-- BPJS SYNC LOG
-- ============================================
CREATE TABLE bpjs_sync_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service         ENUM('VCLAIM','SEP','ECLAIM','ANTROL','APLICARES','ICARE') NOT NULL,
  endpoint        VARCHAR(200),
  method          ENUM('GET','POST','PUT','DELETE') NOT NULL,
  encounter_id    BIGINT UNSIGNED,
  request_body    JSON,
  response_body   JSON,
  response_code   INT,
  status          ENUM('SUCCESS','FAILED') NOT NULL,
  error_message   TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service (service),
  INDEX idx_encounter (encounter_id)
);
```

### 4.2 Referensi Terminologi (Seed Data)

Data yang perlu di-seed:
1. **ICD-10 (Diagnosis)** — ~14.000 kode dari WHO ICD-10 2019
2. **ICD-9-CM (Prosedur)** — ~4.000 kode prosedur
3. **LOINC (Laboratorium)** — subset ~2.000 kode lab umum
4. **SNOMED-CT** — subset sesuai kebutuhan SATUSEHAT
5. **Kode Tarif INA-CBGs** — dari database BPJS
6. **Kode Wilayah** — Provinsi, Kabupaten, Kecamatan, Kelurahan

---

## 5. MODUL-MODUL SIMRS

### 5.1 Modul Front Office

| # | Modul | Prioritas | Estimasi | Dependencies |
|---|-------|-----------|----------|--------------|
| 1 | Registrasi & Admisi | Q1 | 4-6 minggu | Master Pasien, Antrean |
| 2 | Rawat Jalan | Q1 | 4-6 minggu | Registrasi, RME |
| 3 | IGD | Q2 | 4-6 minggu | Registrasi, RME |
| 4 | Rawat Inap | Q3 | 5-6 minggu | Bed Management, RME |
| 5 | Kamar Operasi | Q3 | 4-5 minggu | Rawat Inap |
| 6 | Farmasi/Apotek | Q2 | 5-6 minggu | E-Resep, Stok |
| 7 | Laboratorium | Q3 | 4-5 minggu | Order, Hasil |
| 8 | Radiologi | Q3 | 4-5 minggu | Order, PACS |
| 9 | Pendaftaran Online | Q1 | 3-4 minggu | Registrasi, Antrean |
| 10 | Manajemen Kepegawaian | Q4 | 4-5 minggu | Master Pegawai |
| 11 | Manajemen Logistik | Q4 | 4-5 minggu | Inventaris |

### 5.2 Modul Back Office

| # | Modul | Prioritas | Estimasi | Dependencies |
|---|-------|-----------|----------|--------------|
| 12 | Billing & Kasir | Q2 | 4-5 minggu | Encounter, Tarif |
| 13 | Keuangan & Akuntansi | Q4 | 5-6 minggu | Billing |
| 14 | Kepegawaian/SDM | Q4 | 4-5 minggu | Master Pegawai |
| 15 | Logistik & Inventaris | Q4 | 4-5 minggu | Master Barang |
| 16 | Manajemen Aset | Q4 | 3-4 minggu | - |
| 17 | Gizi/Dapur | Q3 | 3-4 minggu | Rawat Inap |
| 18 | Manajemen Antrean | Q1 | 3-4 minggu | Registrasi |
| 19 | Pelaporan SIRS | Q4 | 3-4 minggu | Semua modul |

### 5.3 Modul Integrasi & Cross-cutting

| # | Modul | Prioritas | Estimasi |
|---|-------|-----------|----------|
| 20 | RME Terstandarisasi | Q3 | 5-6 minggu |
| 21 | Integrasi SATUSEHAT | Q3 | 5-6 minggu |
| 22 | Bridging BPJS | Q2 | 5-6 minggu |
| 23 | Dashboard & Analitik | Q4 | 4-5 minggu |

### 5.4 Detail Fitur per Modul Kunci

#### Modul Registrasi & Admisi (Modul #1)

**Fitur:**
- Pencarian pasien (by No. RM, NIK, nama, No. BPJS)
- Registrasi pasien baru dengan auto-generate No. RM
- Pendaftaran kunjungan (rawat jalan, IGD)
- Pemilihan dokter + poli + jadwal
- Penerbitan SEP otomatis (jika BPJS)
- QR Code identifikasi pasien
- Integrasi antrean digital
- Riwayat kunjungan sebelumnya

**API Endpoints:**
```
POST   /api/patients                    # Registrasi pasien baru
GET    /api/patients/:id                # Detail pasien
GET    /api/patients/search             # Cari pasien
POST   /api/encounters                  # Daftarkan kunjungan
GET    /api/encounters/:id              # Detail kunjungan
PATCH  /api/encounters/:id/status       # Update status
GET    /api/schedules/:locationId       # Jadwal dokter per poli
POST   /api/bpjs/sep                    # Terbitkan SEP
```

#### Modul Rawat Jalan (Modul #2)

**Fitur:**
- Worklist pasien per dokter/per poli
- Asesmen awal digital
- Input SOAP terintegrasi
- E-Resep langsung dari layar poliklinik
- Order lab & radiologi
- Input diagnosis (ICD-10) dengan autocomplete
- Input tindakan (ICD-9-CM)
- CPPT (Catatan Perkembangan Pasien Terintegrasi)
- Rencana tindak lanjut (kontrol/rujuk/rawat inap)

**Alur Bisnis:**
```
Pasien Terdaftar → Dipanggil dari Antrean → Asesmen Awal (Perawat)
→ Pemeriksaan Dokter (SOAP) → Order Lab/Radiologi (jika perlu)
→ Input Diagnosis + Tindakan → E-Resep → Rencana Tindak Lanjut
→ Billing Auto-generate → Farmasi → Kasir → Selesai
→ [Background] Sync ke SATUSEHAT
```

---

## 6. INTEGRASI SATUSEHAT

### 6.1 Arsitektur Integrasi

SATUSEHAT menggunakan HL7 FHIR R4 dengan environment:
- **Development:** `https://api-satusehat-dev.dto.kemkes.go.id`
- **Staging:** `https://api-satusehat-stg.dto.kemkes.go.id`
- **Production:** `https://api-satusehat.kemkes.go.id`

### 6.2 Prasyarat Integrasi

1. Registrasi Organization di SATUSEHAT → Dapatkan `Organization IHS Number`
2. Mapping Location (poli, bangsal) → Dapatkan `Location IHS Number` per unit
3. Mapping Practitioner (dokter/nakes) → Dapatkan `Practitioner IHS Number`
4. Mapping Patient (via NIK) → Dapatkan `Patient IHS Number`

### 6.3 FHIR Resources yang Wajib Dikirim

#### Rawat Jalan:
```
1. Encounter (kunjungan)           — WAJIB
2. Condition (diagnosis ICD-10)    — WAJIB
3. Observation (tanda vital)       — WAJIB
4. Procedure (tindakan ICD-9-CM)   — Jika ada tindakan
5. MedicationRequest (resep)       — Jika ada resep
6. MedicationDispense (dispensing)  — Jika obat diberikan
7. ServiceRequest (order lab/rad)   — Jika ada order
8. DiagnosticReport (hasil lab/rad) — Jika ada hasil
9. AllergyIntolerance (alergi)      — Jika ada data alergi
10. ClinicalImpression (kesan klinis) — Opsional
11. Composition (resume medis)       — WAJIB
```

#### Rawat Inap (tambahan):
```
Semua resource rawat jalan, PLUS:
- Encounter dengan status history (arrived → in-progress → finished)
- Encounter.class = "IMP" (inpatient)
- serviceClass extension (kelas rawat)
- Medication (administrasi obat harian)
- CarePlan (rencana perawatan)
```

### 6.4 Contoh FHIR Mapper (TypeScript)

```typescript
// packages/fhir/resources/encounter.ts
export function buildFHIREncounter(encounter: EncounterData): FHIREncounter {
  return {
    resourceType: "Encounter",
    identifier: [{
      system: `http://sys-ids.kemkes.go.id/encounter/${ORG_IHS_NUMBER}`,
      value: encounter.no_rawat,
    }],
    status: mapEncounterStatus(encounter.status),
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: encounter.tipe === "RAWAT_JALAN" ? "AMB" : "IMP",
      display: encounter.tipe === "RAWAT_JALAN" ? "ambulatory" : "inpatient encounter",
    },
    subject: {
      reference: `Patient/${encounter.patient_satusehat_id}`,
      display: encounter.patient_nama,
    },
    participant: [{
      type: [{ coding: [{ 
        system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
        code: "ATND", display: "attender"
      }]}],
      individual: {
        reference: `Practitioner/${encounter.practitioner_satusehat_id}`,
        display: encounter.practitioner_nama,
      },
    }],
    period: {
      start: formatFHIRDateTime(encounter.tanggal_masuk),
      end: encounter.tanggal_keluar 
        ? formatFHIRDateTime(encounter.tanggal_keluar) 
        : undefined,
    },
    location: [{
      location: {
        reference: `Location/${encounter.location_satusehat_id}`,
        display: encounter.location_nama,
      },
    }],
    serviceProvider: {
      reference: `Organization/${ORG_IHS_NUMBER}`,
    },
    statusHistory: encounter.status_history.map(h => ({
      status: mapEncounterStatus(h.status),
      period: { start: formatFHIRDateTime(h.timestamp) },
    })),
  };
}
```

### 6.5 Background Sync Service

```typescript
// apps/api/src/modules/satusehat/satusehat-sync.service.ts
@Injectable()
export class SatusehatSyncService {
  // Queue-based async sync
  // 1. Encounter selesai → add to Bull Queue
  // 2. Worker picks up → build FHIR resources
  // 3. Send to SATUSEHAT API
  // 4. Log result → retry on failure (exponential backoff)
  // 5. Update local record with satusehat_id
}
```

---

## 7. BRIDGING BPJS KESEHATAN

### 7.1 Komponen BPJS yang Di-bridging

| Service | Fungsi | Endpoint Base |
|---------|--------|---------------|
| **VClaim** | Penerbitan SEP, cek kepesertaan | `/VClaim-rest/` |
| **SEP** | Surat Eligibilitas Peserta | via VClaim |
| **INA-CBGs** | Grouper klaim, tarif casemix | `/new-eclaim/` |
| **Antrol** | Antrean online, integrasi Mobile JKN | `/antreanrs/` |
| **Aplicares** | Ketersediaan tempat tidur | `/aplicaresrest/` |
| **ICare** | Monitoring klaim | via VClaim |

### 7.2 Autentikasi BPJS API

Semua request ke BPJS API memerlukan header:
```
X-cons-id: {Consumer ID}
X-timestamp: {Unix timestamp}
X-signature: {HMAC-SHA256(cons_id + "&" + timestamp, secret_key) → base64}
Content-Type: application/json
```

### 7.3 Alur Bridging Utama

```
Registrasi Pasien BPJS:
1. Input No. Peserta BPJS → VClaim: Cek Kepesertaan
2. Verifikasi aktif → VClaim: Cek Rujukan
3. Rujukan valid → VClaim: Terbitkan SEP
4. SEP terbit → Simpan di encounter.no_sep
5. Setelah selesai → E-Klaim: Kirim data klaim
6. Grouper INA-CBGs → Tarif casemix
7. Monitor → ICare: Status klaim
```

---

## 8. REKAM MEDIS ELEKTRONIK

### 8.1 Standar yang Diikuti

- **KMK No. HK.01.07/MENKES/1423/2022** — Pedoman Variabel dan Metadata RME
- **Permenkes No. 24 Tahun 2022** — Penyelenggaraan Rekam Medis

### 8.2 Format Dokumentasi

| Format | Digunakan Untuk | Fields |
|--------|-----------------|--------|
| **SOAP** | Rawat jalan umum | Subjective, Objective, Assessment, Plan |
| **ADIME** | Gizi klinik | Assessment, Diagnosis, Intervention, Monitoring, Evaluation |
| **SBAR** | Handover keperawatan | Situation, Background, Assessment, Recommendation |
| **CPPT** | Rawat inap (multidisiplin) | Profesi, SOAP, Instruksi, Verifikasi DPJP |

### 8.3 Fitur Digital Signature

Implementasi menggunakan hash-based signature:
```
signature_hash = SHA-256(practitioner_id + record_id + timestamp + content_hash)
```
Tersimpan di `medical_records.signature_hash`, tidak bisa diubah setelah ditandatangani.

---

## 9. DASHBOARD & ANALITIK

### 9.1 KPI Operasional RS (Real-time)

| KPI | Formula | Target |
|-----|---------|--------|
| BOR (Bed Occupancy Rate) | (Hari rawat / Bed tersedia × hari) × 100% | 60-85% |
| ALOS (Avg Length of Stay) | Total hari rawat / Total pasien keluar | 6-9 hari |
| BTO (Bed Turn Over) | Total pasien keluar / Total bed | 40-50x/tahun |
| TOI (Turn Over Interval) | (Bed × hari − Hari rawat) / Total pasien keluar | 1-3 hari |
| NDR (Net Death Rate) | Kematian >48jam / Total pasien keluar × 1000‰ | <25‰ |
| GDR (Gross Death Rate) | Total kematian / Total pasien keluar × 1000‰ | <45‰ |

### 9.2 Dashboard Komponen

1. **Dashboard Eksekutif** — KPI overview, trend kunjungan, pendapatan
2. **Dashboard Keuangan** — Revenue, klaim BPJS, piutang
3. **Dashboard Klinis** — 10 penyakit terbanyak, epidemiologi
4. **Dashboard SDM** — Ketersediaan dokter, jadwal, beban kerja
5. **Monitor Integrasi** — Status SATUSEHAT sync, BPJS bridging
6. **Pelaporan RL 1-6** — Auto-generate sesuai format Kemenkes

---

## 10. KEAMANAN & COMPLIANCE

### 10.1 Defense-in-Depth

| Layer | Mekanisme |
|-------|-----------|
| Network | Nginx (reverse proxy), firewall, fail2ban |
| Transport | TLS 1.2+ (Let's Encrypt SSL) |
| Application | JWT (15min access + 7d refresh), OAuth 2.0, MFA (TOTP) |
| Authorization | RBAC granular per modul + per aksi |
| Data | AES-256 at-rest (field-level encryption untuk PII), bcrypt (password) |
| Audit | Komprehensif audit trail (semua CUD + akses data sensitif) |
| Operational | Automated daily backup (MySQL dump + MinIO), disaster recovery plan |

### 10.2 Role-Based Access Control

| Role | Modul Akses |
|------|-------------|
| Admin Sistem | Semua modul + user management |
| Dokter | Rawat jalan, IGD, rawat inap, RME, e-resep, order lab/rad |
| Perawat | Asesmen, catatan keperawatan, tanda vital, CPPT |
| Apoteker | Farmasi, telaah resep, stok obat |
| Petugas Registrasi | Registrasi, admisi, antrean |
| Kasir | Billing, pembayaran |
| Lab Analis | Laboratorium, input hasil |
| Radiografer | Radiologi, upload hasil |
| Manajemen | Dashboard, laporan, approval |
| IT Staff | Monitoring sistem, user management |

---

## 11. MOBILE APPLICATION

### 11.1 Arsitektur

React Native (Expo) dengan Expo Router, sharing types dari `packages/shared`.

### 11.2 Portal

| Portal | Target User | Fitur Utama |
|--------|-------------|-------------|
| **Pasien** | Pasien & Keluarga | Daftar online, antrean, riwayat, hasil lab, tagihan |
| **Dokter** | Dokter & Nakes | Worklist, RME mobile, e-resep, notifikasi lab |
| **Manajemen** | Direktur & Manager | Dashboard KPI, approval, alert |

---

## 12. DEVOPS & DEPLOYMENT DI VPS

### 12.1 Spesifikasi VPS Minimum

| Komponen | Spesifikasi |
|----------|-------------|
| CPU | 8 vCPU (Intel Xeon / AMD EPYC) |
| RAM | 16 GB DDR4 |
| Storage | 100 GB NVMe SSD (OS + App) + 500 GB SSD (Database + Files) |
| OS | Ubuntu 22.04 LTS |
| Network | 100 Mbps dedicated |

### 12.2 Docker Compose Stack

```yaml
# docker/docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on: [web, api]

  web:
    build: { context: ../apps/web, dockerfile: ../../docker/Dockerfile.web }
    environment:
      - NEXT_PUBLIC_API_URL=https://api.simrs.rsudpetalabumi.riau.go.id
    expose: ["3000"]

  api:
    build: { context: ../apps/api, dockerfile: ../../docker/Dockerfile.api }
    environment:
      - DATABASE_URL=mysql://simrs:${DB_PASS}@mysql:3306/simrs_petala_bumi
      - REDIS_URL=redis://redis:6379
      - SATUSEHAT_BASE_URL=${SATUSEHAT_URL}
      - SATUSEHAT_CLIENT_ID=${SATUSEHAT_CLIENT_ID}
      - SATUSEHAT_CLIENT_SECRET=${SATUSEHAT_SECRET}
      - BPJS_CONS_ID=${BPJS_CONS_ID}
      - BPJS_SECRET_KEY=${BPJS_SECRET}
    expose: ["4000"]
    depends_on: [mysql, redis]

  mysql:
    image: mysql:8.0
    volumes: ["mysql_data:/var/lib/mysql"]
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
      - MYSQL_DATABASE=simrs_petala_bumi
    ports: ["3306:3306"]

  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
    expose: ["6379"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes: ["minio_data:/data"]
    environment:
      - MINIO_ROOT_USER=${MINIO_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_PASS}
    ports: ["9000:9000", "9001:9001"]

  prometheus:
    image: prom/prometheus
    volumes: ["./prometheus.yml:/etc/prometheus/prometheus.yml"]
    ports: ["9090:9090"]

  grafana:
    image: grafana/grafana
    volumes: ["grafana_data:/var/lib/grafana"]
    ports: ["3001:3000"]

volumes:
  mysql_data:
  redis_data:
  minio_data:
  grafana_data:
```

### 12.3 CI/CD Pipeline (GitHub Actions)

```
Push to main → Lint + Type Check → Unit Tests → Build Docker Images
→ Push to Registry → SSH Deploy to VPS → Docker Compose Up → Health Check
```

---

## 13. URUTAN DEVELOPMENT (ROADMAP)

### Phase 1: Foundation (Bulan 1-3)

```
Minggu 1-2:  Setup monorepo, Docker, database, CI/CD, auth system
Minggu 3-4:  Master data (Pasien, Dokter, Lokasi, Obat)
Minggu 5-8:  Modul Registrasi & Admisi + Manajemen Antrean
Minggu 9-12: Modul Rawat Jalan + Pendaftaran Online
```

### Phase 2: Core Clinical (Bulan 4-6)

```
Minggu 13-16: Modul Farmasi/Apotek + E-Resep
Minggu 17-18: Modul Billing & Kasir
Minggu 19-22: Bridging BPJS (VClaim, SEP, INA-CBGs, Antrol)
Minggu 23-24: Modul IGD
```

### Phase 3: Advanced Clinical (Bulan 7-9)

```
Minggu 25-28: Modul Rawat Inap + Bed Management
Minggu 29-32: Modul Laboratorium + Radiologi
Minggu 33-36: RME Terstandarisasi (SOAP, ADIME, CPPT)
              Integrasi SATUSEHAT (FHIR Engine)
```

### Phase 4: Finalization (Bulan 10-12)

```
Minggu 37-40: Dashboard Analitik + Pelaporan (RL 1-6)
Minggu 41-42: Modul Keuangan, Kepegawaian, Logistik, Aset
Minggu 43-44: Aplikasi Mobile (Pasien, Dokter, Manajemen)
Minggu 45-46: Migrasi Data Khanza + Pelatihan
Minggu 47-48: Stabilisasi, UAT, Bug Fixing, Serah Terima
```

---

## 14. CLAUDE CODE — INSTRUKSI TEKNIS

### 14.1 Setup Awal di VPS

```bash
# 1. Install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git docker.io docker-compose-plugin

# 2. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install pnpm (package manager)
npm install -g pnpm

# 4. Install Turborepo
npm install -g turbo

# 5. Clone & setup project
git clone <repo-url> simrs-petala-bumi
cd simrs-petala-bumi
pnpm install

# 6. Start infrastructure
docker compose -f docker/docker-compose.yml up -d mysql redis minio

# 7. Run migrations
cd apps/api && npx prisma migrate dev

# 8. Seed data
pnpm run seed
```

### 14.2 Perintah Claude Code yang Direkomendasikan

```bash
# Untuk generate modul baru:
"Buatkan modul [nama_modul] di NestJS (apps/api/src/modules/[nama])
dengan CRUD endpoints, Prisma schema, validasi Zod, dan RBAC guard.
Ikuti pattern dari modul registrasi yang sudah ada."

# Untuk generate halaman frontend:
"Buatkan halaman [nama_halaman] di Next.js (apps/web/app/[path])
dengan DataTable, form input, dan integrasi API.
Gunakan shadcn/ui components dan Tailwind CSS."

# Untuk FHIR mapping:
"Buatkan FHIR R4 resource mapper untuk [resource_type]
di packages/fhir/resources/[nama].ts
sesuai spesifikasi SATUSEHAT Indonesia."
```

### 14.3 Konvensi Koding

- **Bahasa:** TypeScript strict mode di semua package
- **API Pattern:** NestJS Controller → Service → Prisma Repository
- **Naming:** camelCase (TS), snake_case (database), kebab-case (routes)
- **Validation:** Zod schemas di `packages/shared/validators/`
- **Error Handling:** NestJS Exception Filters dengan format konsisten
- **Testing:** Jest (unit) + Supertest (e2e) — target coverage 80%

---

## 15. REFERENSI & SUMBER

### Regulasi
1. UU No. 17 Tahun 2023 — Kesehatan
2. UU No. 27 Tahun 2022 — Perlindungan Data Pribadi
3. Permenkes No. 82 Tahun 2013 — SIMRS
4. Permenkes No. 24 Tahun 2022 — Rekam Medis
5. KMK No. HK.01.07/MENKES/1423/2022 — Pedoman RME
6. SE No. HK.02.01/MENKES/1030/2023 — Sanksi Integrasi SATUSEHAT

### Teknis SATUSEHAT
- Portal Dokumentasi: https://satusehat.kemkes.go.id/platform/docs/
- FHIR Implementation Guide: https://simplifier.net/guide/satusehat-fhir-r4-implementation-guide
- Postman Collection: https://www.postman.com/satusehat/
- Playbook Rawat Jalan: https://satusehat.kemkes.go.id/platform/docs/id/interoperability/rme-rawat-jalan/
- Playbook Rawat Inap: https://satusehat.kemkes.go.id/platform/docs/id/interoperability/rawat-inap-new/

### Teknis BPJS
- VClaim Web Service documentation (dari Kantor Cabang BPJS)
- E-Klaim INA-CBGs API
- Antrol Web Service
- Aplicares REST API

### SIMRS Khanza (Referensi)
- Source Code: https://github.com/mas-elkhanza/SIMRS-Khanza
- Database Schema: MySQL dump dari instalasi Khanza existing di RSUD Petala Bumi

### Tech Stack Documentation
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- React Native / Expo: https://docs.expo.dev
- HL7 FHIR R4: https://www.hl7.org/fhir/R4/

---

*Blueprint ini adalah living document yang akan terus diperbarui seiring perkembangan proyek.*
