# SIMRS Petala Bumi

**Sistem Informasi Manajemen Rumah Sakit Terintegrasi**
RSUD Petala Bumi Provinsi Riau

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-ea2845)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-2D3748)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## Tentang Proyek

SIMRS Petala Bumi adalah sistem informasi rumah sakit berbasis web yang dibangun dari nol (*ground-up*) untuk menggantikan **SIMRS Khanza** (Java Swing/desktop). Sistem ini dirancang untuk memenuhi standar regulasi Kemenkes RI, terintegrasi penuh dengan **SATUSEHAT (HL7 FHIR R4)** dan **BPJS Kesehatan**.

Database schema dirancang **kompatibel dengan struktur database Khanza** untuk memudahkan proses migrasi data (ETL) dari sistem lama ke sistem baru.

| Item | Detail |
|------|--------|
| **Klien** | RSUD Petala Bumi Provinsi Riau (RS Kelas C, BLUD) |
| **Vendor** | CV Panda Global Teknologi, Pekanbaru |
| **Total Modul** | 23 modul (11 Front Office + 8 Back Office + 4 Integrasi) |
| **Kontrak** | 12 bulan, 4 fase development |
| **Migrasi** | ETL dari SIMRS Khanza (MySQL) ke schema baru |

---

## Arsitektur

```
CLIENT LAYER        Web Browser / Mobile App / Kiosk / Display
        |
PRESENTATION        Next.js 14 (App Router) + shadcn/ui + Tailwind CSS
        |
APPLICATION         NestJS 10 (TypeScript)
        |           ├── Auth (JWT + RBAC + MFA)
        |           ├── 23 Business Modules
        |           ├── FHIR Engine (SATUSEHAT)
        |           ├── BPJS Bridge Service
        |           └── Background Jobs (BullMQ + Redis)
        |
DATA LAYER          MySQL 8.0 (Prisma ORM) + Redis 7 + MinIO
        |
INTEGRATION         SATUSEHAT FHIR R4 | BPJS VClaim/SEP/INA-CBGs/Antrol
```

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, React Hook Form + Zod, Recharts |
| **Backend** | NestJS 10, TypeScript strict, Swagger/OpenAPI 3.0 |
| **Database** | MySQL 8.0, Prisma 5 ORM |
| **Cache/Queue** | Redis 7, BullMQ |
| **File Storage** | MinIO (S3-compatible) |
| **Mobile** | React Native (Expo) — Phase 4 |
| **Infra** | Docker, Nginx, GitHub Actions CI/CD |
| **Monitoring** | Prometheus, Grafana, Winston + Loki |

---

## Struktur Monorepo

```
simrs-petala-bumi/
├── apps/
│   ├── api/                    # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/        # 23 business modules
│   │   │   │   ├── auth/       # JWT + RBAC authentication
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── patients/   # Master pasien (Khanza: pasien)
│   │   │   │   ├── practitioners/ # Dokter & nakes (Khanza: dokter+petugas)
│   │   │   │   ├── locations/  # Lokasi/unit (Khanza: poliklinik+bangsal)
│   │   │   │   ├── pharmacy/   # Farmasi/obat (Khanza: databarang)
│   │   │   │   └── ...         # 17 modul lainnya
│   │   │   ├── common/         # Guards, interceptors, pipes, filters
│   │   │   ├── integrations/   # FHIR, BPJS, SIRS clients
│   │   │   ├── config/         # Prisma service, app config
│   │   │   └── database/       # Prisma schema, migrations, seeds
│   │   └── test/
│   │
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/login/   # Halaman login
│   │   │   ├── (dashboard)/    # Dashboard layout + semua modul
│   │   │   │   ├── dashboard/  # Dashboard utama
│   │   │   │   ├── admin/      # Master data (pasien, dokter, lokasi, obat, jadwal, users)
│   │   │   │   ├── registrasi/ # Registrasi & admisi
│   │   │   │   ├── rawat-jalan/ # Rawat jalan
│   │   │   │   └── ...
│   │   ├── components/         # UI components (DataTable, Modal, etc.)
│   │   ├── hooks/              # Zustand stores, custom hooks
│   │   └── lib/                # API client, utilities
│   │
│   └── mobile/                 # React Native (Expo) — Phase 4
│
├── packages/
│   ├── shared/                 # Types, Zod validators, constants, utils
│   ├── ui/                     # Design system components
│   ├── fhir/                   # FHIR R4 resource builders & mappers
│   └── eslint-config/          # Shared ESLint config
│
├── docker/                     # Docker Compose (dev & prod), Dockerfiles, Nginx
├── scripts/                    # ETL migration, seed scripts
├── blueprint/                  # Technical blueprint & specs
└── docs/                       # Documentation
    ├── DATABASE.md             # Schema documentation & Khanza mapping
    ├── API.md                  # API endpoints reference
    ├── DEVELOPMENT.md          # Development guide
    └── MIGRATION.md            # Khanza → new system migration guide
```

---

## Kompatibilitas Database Khanza

Schema database dirancang dengan **mapping langsung ke tabel Khanza** untuk memudahkan migrasi:

| Tabel Khanza | Model Baru | Mapping Kunci |
|---|---|---|
| `pasien` | `Patient` | `no_rkm_medis`→`noRm`, `no_ktp`→`nik`, `no_peserta`→`noBpjs` |
| `dokter` + `petugas` | `Practitioner` | `kd_dokter`→`kdDokter`, `kd_sps`→`Spesialis` |
| `pegawai` | `Employee` | `nik`→`nip`, `gapok`, `stts_aktif` |
| `poliklinik` + `bangsal` | `Location` | `kd_poli`→`kdPoliKhanza`, `kd_bangsal`→`kdBangsalKhanza` |
| `kamar` | `Bed` | `kd_kamar`→`nomorBed`, `trf_kamar`→`tarifPerHari` |
| `reg_periksa` | `Encounter` | `no_rawat` (format `YYYY/MM/DD/NNNNNN`), `biaya_reg`, `stts_daftar` |
| `rawat_jl_dr/pr/drpr` | `Procedure` | Tarif breakdown: `material`, `bhp`, `tarif_dr/pr`, `kso` |
| `databarang` | `Medicine` | 7 tier harga: `ralan`, `kelas1-3`, `utama`, `vip`, `vvip` |
| `resep_obat` + `detail_pemberian_obat` | `Prescription` + `PrescriptionItem` | `embalase`, `tuslah`, `no_batch` |
| `diagnosa_pasien` + `penyakit` | `Diagnosis` + `Penyakit` | `kd_penyakit` (ICD-10), `prioritas` |
| `periksa_lab` + `detail_periksa_lab` | `LabOrder` + `LabResult` | `id_template`, tarif breakdown |
| `periksa_radiologi` | `RadiologyOrder` | `proyeksi`, `kV`, `mAS`, dosis, tarif breakdown |
| `bridging_sep` | `BridgingSep` | Full SEP: `no_sep`, `kd_dpjp`, `kls_rawat`, `no_kartu` |
| `kamar_inap` | `KamarInap` | `tgl/jam_masuk/keluar`, `lama`, `stts_pulang` |
| `penjab` | `Penjab` | `kd_pj`, `png_jawab`, `nama_perusahaan` |

Lihat [docs/DATABASE.md](docs/DATABASE.md) untuk detail lengkap dan [docs/MIGRATION.md](docs/MIGRATION.md) untuk panduan ETL.

---

## Modul (23 Total)

### Front Office (11 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 1 | Registrasi & Admisi | Phase 1 | **In Progress** |
| 2 | Rawat Jalan | Phase 1 | Planned |
| 3 | IGD | Phase 2 | Planned |
| 4 | Rawat Inap | Phase 3 | Planned |
| 5 | Kamar Operasi | Phase 3 | Planned |
| 6 | Farmasi/Apotek | Phase 2 | Planned |
| 7 | Laboratorium | Phase 3 | Planned |
| 8 | Radiologi | Phase 3 | Planned |
| 9 | Pendaftaran Online | Phase 1 | Planned |
| 10 | Manajemen Antrean | Phase 1 | **In Progress** |
| 11 | Gizi/Dapur | Phase 3 | Planned |

### Back Office (8 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 12 | Billing & Kasir | Phase 2 | Planned |
| 13 | Keuangan & Akuntansi | Phase 4 | Planned |
| 14 | Kepegawaian/SDM | Phase 4 | Planned |
| 15 | Logistik & Inventaris | Phase 4 | Planned |
| 16 | Manajemen Aset | Phase 4 | Planned |
| 17 | Pelaporan SIRS | Phase 4 | Planned |

### Integrasi & Cross-cutting (4 Modul)
| # | Modul | Fase | Status |
|---|-------|------|--------|
| 18 | RME Terstandarisasi | Phase 3 | Planned |
| 19 | Integrasi SATUSEHAT (FHIR R4) | Phase 3 | Planned |
| 20 | Bridging BPJS Kesehatan | Phase 2 | Planned |
| 21 | Dashboard & Analitik | Phase 4 | Planned |

### Foundation (Selesai)
| Komponen | Status |
|----------|--------|
| Monorepo Turborepo | Done |
| Auth (JWT + RBAC) | Done |
| Prisma Schema (Khanza-compatible) | Done |
| Master Data CRUD (Pasien, Dokter, Lokasi, Obat, Jadwal, Users) | Done |
| Docker Compose (MySQL, Redis, MinIO) | Done |
| UI Components (DataTable, Modal, Form, etc.) | Done |

---

## Quick Start

### Prerequisites

- Node.js >= 18.x
- pnpm >= 9.x
- Docker & Docker Compose
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/anunnaki13/damnation.git simrs-petala-bumi
cd simrs-petala-bumi

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start infrastructure (MySQL, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# 5. Run database migrations
pnpm db:migrate

# 6. Seed master data
pnpm db:seed

# 7. Start development servers
pnpm dev
```

### Default Login

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ADMIN (full access) |

### Available Scripts

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps for production
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database (roles, locations, sample data)
pnpm db:studio        # Open Prisma Studio (DB browser)
pnpm clean            # Clean all build artifacts
```

### Access Points (Development)

| Service | URL |
|---------|-----|
| Frontend (Web) | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Prisma Studio | http://localhost:5555 |
| MinIO Console | http://localhost:9001 |

---

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [docs/DATABASE.md](docs/DATABASE.md) | Schema database, ERD, Khanza mapping detail |
| [docs/API.md](docs/API.md) | Referensi API endpoints per modul |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Panduan development, konvensi, cara menambah modul |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Panduan migrasi data Khanza → sistem baru |
| [blueprint/](blueprint/) | Blueprint teknis lengkap (23 modul) |

---

## Keamanan & Compliance

- JWT Authentication (15min access + 7d refresh token)
- RBAC granular per modul + per aksi (10 roles)
- MFA (TOTP) untuk akun sensitif
- Audit trail komprehensif (semua CUD + akses data sensitif)
- Compliance: Permenkes 82/2013, Permenkes 24/2022, UU PDP 27/2022

---

## Tim

**CV Panda Global Teknologi**
Pekanbaru, Riau, Indonesia

---

> *SIMRS Petala Bumi — Sistem informasi rumah sakit modern, terintegrasi, kompatibel Khanza, dan comply dengan regulasi Kemenkes RI.*
