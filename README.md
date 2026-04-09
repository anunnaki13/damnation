# SIMRS Petala Bumi

**Sistem Informasi Manajemen Rumah Sakit Terintegrasi**
RSUD Petala Bumi Provinsi Riau

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-ea2845)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-4479A1)](https://www.mysql.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%205-2D3748)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://www.typescriptlang.org/)

---

## Overview

SIMRS Petala Bumi adalah sistem informasi rumah sakit berbasis web modern yang dibangun dari nol untuk menggantikan **SIMRS Khanza** (Java Swing/desktop). Database schema dirancang **kompatibel langsung** dengan struktur Khanza untuk memudahkan migrasi data (ETL).

| Item | Detail |
|------|--------|
| **Klien** | RSUD Petala Bumi Provinsi Riau (RS Kelas C, BLUD) |
| **Vendor** | CV Panda Global Teknologi, Pekanbaru |
| **Total Modul** | 23 modul aktif |
| **Backend** | 17 NestJS modules, 32 services, 23 controllers, **126 API endpoints** |
| **Frontend** | 24 halaman, 7 reusable UI components |
| **Database** | 35+ models Prisma, 40+ enums, Khanza-compatible |
| **Integrasi** | SATUSEHAT (FHIR R4), BPJS (VClaim/Antrol/Aplicares) |

---

## Arsitektur

```
                          ┌──────────────────────┐
                          │    Web Browser        │
                          │    Mobile App         │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
              │  Next.js   │  │  NestJS API │  │  Swagger  │
              │  Port 3000 │  │  Port 3001  │  │  /api/docs│
              └────────────┘  └──────┬──────┘  └───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐
              │  MySQL 8.0 │  │  Redis 7    │  │  MinIO    │
              │  Port 3306 │  │  Port 6379  │  │  Port 9000│
              └────────────┘  └─────────────┘  └───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                                │
              ┌─────▼─────────┐            ┌────────▼────────┐
              │  SATUSEHAT    │            │  BPJS Kesehatan  │
              │  FHIR R4 API  │            │  VClaim/Antrol   │
              └───────────────┘            └──────────────────┘
```

---

## Modul & Status

### Pelayanan Klinis
| Modul | Backend | Frontend | Endpoints |
|-------|---------|----------|-----------|
| Registrasi & Admisi | Done | Done | 6 |
| Manajemen Antrean | Done | Done | 7 (incl. public display) |
| Rawat Jalan | Done | Done | 17 (SOAP, Dx, Rx, Order) |
| IGD | Done | Done | 5 (triase ESI, disposisi) |
| Rawat Inap + Bed | Done | Done | 10 (bed map, CPPT, transfer, discharge) |
| Kamar Operasi | Done | Done | 3 (jadwal, laporan) |
| Farmasi/Apotek | Done | Done | 14 (dispensing, stok, retur) |
| Laboratorium | Done | Done | 7 (order→hasil→validasi) |
| Radiologi | Done | Done | 5 (order→expertise) |
| Gizi/Dapur | Done | Done | 2 (ADIME) |

### Penunjang & Integrasi
| Modul | Backend | Frontend | Endpoints |
|-------|---------|----------|-----------|
| Billing & Kasir | Done | Done | 9 (auto-generate, multi-pay) |
| Bridging BPJS | Done | Done | 20 (VClaim, Antrol, Aplicares) |
| SATUSEHAT FHIR | Done | Done | 3 (sync, logs) |
| Dashboard Analitik | Done | Done | 4 (KPI, trend, top-10, revenue) |

### Master Data & Admin
| Modul | Backend | Frontend | Endpoints |
|-------|---------|----------|-----------|
| Master Pasien | Done | Done | 4 (CRUD + search) |
| Master Dokter/Nakes | Done | Done | 3 |
| Master Lokasi/Unit | Done | Done | 5 |
| Master Obat/Alkes | Done | Done | 7 (stock alerts, expiring) |
| Jadwal Dokter | Done | Done | 5 |
| User Management | Done | Done | 3 |
| Auth (JWT + RBAC) | Done | Done | 2 |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Zustand, Axios |
| **Backend** | NestJS 10, TypeScript, Swagger/OpenAPI |
| **Database** | MySQL 8.0, Prisma 5 ORM |
| **Cache/Queue** | Redis 7, BullMQ |
| **File Storage** | MinIO (S3-compatible) |
| **Infra** | Docker, Nginx, GitHub Actions |

---

## Kompatibilitas Khanza

Database dirancang dengan mapping langsung ke tabel SIMRS Khanza untuk migrasi:

| Khanza Table | New Model | Key Mapping |
|---|---|---|
| `pasien` | Patient | `no_rkm_medis`→`noRm`, `no_ktp`→`nik`, `no_peserta`→`noBpjs` |
| `dokter`+`petugas` | Practitioner | `kd_dokter`, `kd_sps`→Spesialis, unified |
| `poliklinik`+`bangsal` | Location | `kd_poli`→`kdPoliKhanza`, `kd_bangsal`→`kdBangsalKhanza` |
| `kamar` | Bed | `kd_kamar`→`nomorBed`, `trf_kamar`→`tarifPerHari` |
| `reg_periksa` | Encounter | `no_rawat` (YYYY/MM/DD/NNNNNN), `biaya_reg`, `stts_daftar` |
| `rawat_jl_dr/pr` | Procedure | Tarif breakdown: material, bhp, tarif_dr/pr, kso |
| `databarang` | Medicine | **7 tier harga**: ralan, kelas1-3, utama, vip, vvip |
| `resep_obat` | Prescription | `embalase`, `tuslah`, `no_batch` |
| `diagnosa_pasien` | Diagnosis | `kd_penyakit` (ICD-10), `prioritas` |
| `periksa_lab` | LabOrder | `id_template`, tarif breakdown |
| `bridging_sep` | BridgingSep | Full SEP: `no_sep`, `kd_dpjp`, `kls_rawat` |
| `penjab` | Penjab | `kd_pj`, `png_jawab` |
| `penyakit` | Penyakit | 40,802 ICD-10 codes (imported) |

ETL script: `scripts/migrate-khanza.ts` — migrasi otomatis semua data Khanza.

---

## Quick Start

```bash
# Clone & install
git clone https://github.com/anunnaki13/damnation.git
cd damnation && pnpm install

# Environment
cp .env.example .env

# Infrastructure (MySQL, Redis, MinIO)
docker compose -f docker/docker-compose.yml up -d

# Database
pnpm db:migrate && pnpm db:seed

# Start
pnpm dev
```

### Default Login
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Full access |

### URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |

---

## Halaman Frontend

| Path | Halaman |
|------|---------|
| `/login` | Login page |
| `/dashboard` | Dashboard utama (live stats, antrean, quick actions) |
| `/registrasi` | Registrasi & admisi pasien |
| `/rawat-jalan` | Worklist + clinical screen (SOAP, Dx, Rx) |
| `/igd` | IGD dengan triase ESI 1-5 |
| `/rawat-inap` | Bed map visual + CPPT + discharge |
| `/farmasi` | Worklist resep, dispensing, stok |
| `/laboratorium` | Order lab, input hasil, validasi |
| `/radiologi` | Order radiologi, input expertise |
| `/billing` | Tagihan, pembayaran multi-metode |
| `/antrean` | Monitor antrean per poli (auto-refresh) |
| `/kamar-operasi` | Jadwal operasi, laporan pembedahan |
| `/gizi` | Asesmen gizi ADIME |
| `/dashboard-analitik` | KPI (BOR, ALOS, BTO), trend, top-10 penyakit, revenue |
| `/satusehat` | Monitor sync SATUSEHAT FHIR |
| `/bpjs` | Cek peserta, SEP, sync log BPJS |
| `/admin` | Hub master data |
| `/admin/pasien` | CRUD pasien |
| `/admin/dokter` | CRUD dokter/nakes |
| `/admin/lokasi` | CRUD lokasi/poli/bangsal |
| `/admin/obat` | CRUD obat (7 tier harga) |
| `/admin/jadwal` | Jadwal praktik dokter |
| `/admin/users` | User & role management |

---

## UI Design

Premium dark health-tech SaaS design:
- **Color palette**: Deep navy (#0c0c1d), purple accent (#7c5cfc), teal (#2dd4bf)
- **Card system**: `card` (glass blur), `card-flat` (solid), `card-highlight` (accent)
- **Typography**: Inter font, 3-level hierarchy, uppercase tracking labels
- **Components**: DataTable, Modal, FormField, StatusBadge, SearchInput, PageHeader
- **Responsive**: Mobile-friendly layout, collapsible sidebar

---

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, ERD, Khanza mapping detail |
| [docs/API.md](docs/API.md) | 126 API endpoints reference |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development guide, conventions |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Khanza → new system ETL guide |
| [CLAUDE.md](CLAUDE.md) | Claude Code development instructions |
| [blueprint/](blueprint/) | Full technical blueprint |

---

## RBAC (10 Roles)

| Role | Akses |
|------|-------|
| ADMIN | Semua modul |
| DOKTER | Rawat jalan/inap, RME, e-resep, order lab/rad |
| PERAWAT | Catatan keperawatan, tanda vital, CPPT |
| APOTEKER | Farmasi, telaah resep, stok obat |
| REGISTRASI | Registrasi, admisi, antrean |
| KASIR | Billing, pembayaran |
| LAB_ANALIS | Laboratorium, input hasil |
| RADIOGRAFER | Radiologi, expertise |
| MANAJEMEN | Dashboard, laporan, analytics |
| IT | Admin sistem, monitoring integrasi |

---

## Keamanan

- JWT (15min access + 7d refresh)
- RBAC granular per endpoint
- Audit trail (semua CUD operations)
- Bcrypt password hashing
- Compliance: Permenkes 82/2013, Permenkes 24/2022, UU PDP 27/2022

---

**CV Panda Global Teknologi** — Pekanbaru, Riau, Indonesia
